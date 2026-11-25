package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
)

// TokenClaims represents signed session claims for admin or student sessions.
type TokenClaims struct {
	Sub  string `json:"sub"`
	Role string `json:"role"` // admin | student
	Exp  int64  `json:"exp"`
}

// SignToken creates a compact HMAC-SHA256 signed token.
func SignToken(secret, sub, role string, ttl time.Duration) (string, error) {
	claims := TokenClaims{
		Sub:  sub,
		Role: role,
		Exp:  time.Now().UTC().Add(ttl).Unix(),
	}
	raw, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	payload := base64.RawURLEncoding.EncodeToString(raw)
	sig := computeHMAC(secret, payload)
	return "khlc." + payload + "." + sig, nil
}

// VerifyToken validates an HMAC-SHA256 signed token and checks role + expiry.
func VerifyToken(secret, token, expectedRole string) (*TokenClaims, error) {
	parts := strings.Split(strings.TrimSpace(token), ".")
	if len(parts) != 3 || parts[0] != "khlc" {
		return nil, errors.New("malformed token")
	}
	expectedSig := computeHMAC(secret, parts[1])
	if !hmac.Equal([]byte(parts[2]), []byte(expectedSig)) {
		return nil, errors.New("invalid token signature")
	}
	raw, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("invalid token encoding")
	}
	var claims TokenClaims
	if err := json.Unmarshal(raw, &claims); err != nil {
		return nil, errors.New("invalid token claims")
	}
	if time.Now().UTC().Unix() > claims.Exp {
		return nil, errors.New("token expired")
	}
	if expectedRole != "" && claims.Role != expectedRole {
		return nil, errors.New("insufficient role")
	}
	return &claims, nil
}

// ExtractBearer pulls the bearer token from Authorization header.
func ExtractBearer(r *http.Request) string {
	auth := strings.TrimSpace(r.Header.Get("Authorization"))
	if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
		return strings.TrimSpace(auth[7:])
	}
	return ""
}

// RequireAdmin guards an http.HandlerFunc with a valid signed admin bearer token.
func RequireAdmin(secret string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := ExtractBearer(r)
		if token == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "admin authentication required"})
			return
		}
		if _, err := VerifyToken(secret, token, "admin"); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid or expired admin session"})
			return
		}
		next(w, r)
	}
}

func computeHMAC(secret, message string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(message))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
