package mailer

import (
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"html"
	"net"
	"net/smtp"
	"strings"
	"time"
)

// Config holds SMTP configuration (Hostinger defaults to smtp.hostinger.com:465).
type Config struct {
	Host        string
	Port        string
	User        string
	Pass        string
	From        string
	FrontendURL string
}

// Mailer dispatches transactional emails over SMTP (supports implicit TLS on 465 and STARTTLS on 587).
type Mailer struct {
	cfg Config
}

// New creates a new Mailer instance.
func New(cfg Config) *Mailer {
	if strings.TrimSpace(cfg.Port) == "" {
		cfg.Port = "465"
	}
	if strings.TrimSpace(cfg.From) == "" && strings.TrimSpace(cfg.User) != "" {
		cfg.From = fmt.Sprintf("Kingshouse Learning Centre <%s>", strings.TrimSpace(cfg.User))
	}
	if strings.TrimSpace(cfg.FrontendURL) == "" {
		cfg.FrontendURL = "https://khlc.onrender.com"
	}
	cfg.FrontendURL = strings.TrimRight(strings.TrimSpace(cfg.FrontendURL), "/")
	return &Mailer{cfg: cfg}
}

// IsConfigured reports whether SMTP credentials are present.
func (m *Mailer) IsConfigured() bool {
	return m != nil &&
		strings.TrimSpace(m.cfg.Host) != "" &&
		strings.TrimSpace(m.cfg.User) != "" &&
		strings.TrimSpace(m.cfg.Pass) != ""
}

// StudentCredential represents an auto-generated student login to include in the confirmation email.
type StudentCredential struct {
	FullName  string
	Level     string
	ClassName string
	ExamCode  string
	PinCode   string
}

// EvolveRegistrationEmailData holds details for the Evolve 8.0 coordinator confirmation email.
type EvolveRegistrationEmailData struct {
	ReferenceID     string
	SchoolName      string
	CoordinatorName string
	RecipientEmail  string
	Track           string
	ProjectPath     string
	ProjectTheme    string
	Students        []StudentCredential
}

// SendEvolveRegistrationEmail sends a branded HTML + plain-text email with Reference ID and student Exam IDs/PINs.
func (m *Mailer) SendEvolveRegistrationEmail(ctx context.Context, data EvolveRegistrationEmailData) error {
	if !m.IsConfigured() {
		return fmt.Errorf("SMTP mailer is not configured")
	}
	to := strings.TrimSpace(data.RecipientEmail)
	if to == "" || !strings.Contains(to, "@") {
		return fmt.Errorf("invalid recipient email")
	}

	subject := fmt.Sprintf("Evolve 8.0 Registration Confirmed (%s) — %s", data.ReferenceID, data.SchoolName)
	quizURL := m.cfg.FrontendURL + "/evolve/quiz"
	projectsURL := fmt.Sprintf("%s/evolve/projects?ref=%s", m.cfg.FrontendURL, data.ReferenceID)
	resultsURL := m.cfg.FrontendURL + "/evolve/results"

	plainBody := buildPlainText(data, quizURL, projectsURL, resultsURL)
	htmlBody := buildHTML(data, quizURL, projectsURL, resultsURL)

	return m.sendMultipart(ctx, to, subject, plainBody, htmlBody)
}

func (m *Mailer) sendMultipart(ctx context.Context, to, subject, plainBody, htmlBody string) error {
	boundary := fmt.Sprintf("khlc-ev8-%d", time.Now().UnixNano())
	var msg bytes.Buffer

	msg.WriteString(fmt.Sprintf("From: %s\r\n", m.cfg.From))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", to))
	msg.WriteString(fmt.Sprintf("Reply-To: %s\r\n", m.cfg.User))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", sanitizeHeader(subject)))
	msg.WriteString(fmt.Sprintf("Date: %s\r\n", time.Now().UTC().Format(time.RFC1123Z)))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString(fmt.Sprintf("Content-Type: multipart/alternative; boundary=\"%s\"\r\n", boundary))
	msg.WriteString("\r\n")

	// Plain text part
	msg.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	msg.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n")
	msg.WriteString("Content-Transfer-Encoding: 8bit\r\n\r\n")
	msg.WriteString(strings.ReplaceAll(plainBody, "\n", "\r\n"))
	msg.WriteString("\r\n\r\n")

	// HTML part
	msg.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	msg.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	msg.WriteString("Content-Transfer-Encoding: 8bit\r\n\r\n")
	msg.WriteString(strings.ReplaceAll(htmlBody, "\n", "\r\n"))
	msg.WriteString("\r\n\r\n")

	msg.WriteString(fmt.Sprintf("--%s--\r\n", boundary))

	addr := net.JoinHostPort(m.cfg.Host, m.cfg.Port)
	auth := smtp.PlainAuth("", m.cfg.User, m.cfg.Pass, m.cfg.Host)
	tlsCfg := &tls.Config{
		ServerName: m.cfg.Host,
		MinVersion: tls.VersionTLS12,
	}

	dialer := &net.Dialer{Timeout: 12 * time.Second}
	rawConn, err := dialer.DialContext(ctx, "tcp", addr)
	if err != nil {
		return fmt.Errorf("smtp dial %s: %w", addr, err)
	}
	if deadline, ok := ctx.Deadline(); ok {
		_ = rawConn.SetDeadline(deadline)
	} else {
		_ = rawConn.SetDeadline(time.Now().Add(15 * time.Second))
	}

	var client *smtp.Client
	if m.cfg.Port == "465" {
		// Implicit SSL/TLS (Hostinger recommended port 465)
		tlsConn := tls.Client(rawConn, tlsCfg)
		if err := tlsConn.HandshakeContext(ctx); err != nil {
			_ = rawConn.Close()
			return fmt.Errorf("smtp tls handshake: %w", err)
		}
		client, err = smtp.NewClient(tlsConn, m.cfg.Host)
		if err != nil {
			_ = tlsConn.Close()
			return fmt.Errorf("smtp client init: %w", err)
		}
	} else {
		// STARTTLS (port 587)
		client, err = smtp.NewClient(rawConn, m.cfg.Host)
		if err != nil {
			_ = rawConn.Close()
			return fmt.Errorf("smtp client init: %w", err)
		}
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(tlsCfg); err != nil {
				_ = client.Close()
				return fmt.Errorf("smtp starttls: %w", err)
			}
		}
	}
	defer client.Close()

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp auth: %w", err)
	}
	if err := client.Mail(m.cfg.User); err != nil {
		return fmt.Errorf("smtp MAIL FROM: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("smtp RCPT TO: %w", err)
	}
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp DATA: %w", err)
	}
	if _, err := w.Write(msg.Bytes()); err != nil {
		_ = w.Close()
		return fmt.Errorf("smtp write: %w", err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("smtp close data: %w", err)
	}
	_ = client.Quit()
	return nil
}

func sanitizeHeader(v string) string {
	v = strings.ReplaceAll(v, "\r", " ")
	v = strings.ReplaceAll(v, "\n", " ")
	return strings.TrimSpace(v)
}

func buildPlainText(data EvolveRegistrationEmailData, quizURL, projectsURL, resultsURL string) string {
	var b strings.Builder
	b.WriteString(fmt.Sprintf("Dear %s,\n\n", data.CoordinatorName))
	b.WriteString(fmt.Sprintf("Thank you for registering %s for Evolve 8.0 (Kingshouse Learning Centre)!\n\n", data.SchoolName))
	b.WriteString(fmt.Sprintf("School Reference ID: %s\n", data.ReferenceID))
	b.WriteString(fmt.Sprintf("Participation Track: %s\n", strings.ToUpper(data.Track)))
	if data.ProjectPath != "" {
		b.WriteString(fmt.Sprintf("Project Track: %s — %s\n", data.ProjectPath, data.ProjectTheme))
	}
	b.WriteString("\n")

	if len(data.Students) > 0 {
		b.WriteString("PHASE 1 NATIONAL ONLINE TEST — STUDENT LOGIN CREDENTIALS\n")
		b.WriteString("--------------------------------------------------------\n")
		for i, s := range data.Students {
			classSuffix := ""
			if s.ClassName != "" {
				classSuffix = " (" + s.ClassName + ")"
			}
			b.WriteString(fmt.Sprintf("%d. %s%s [%s]\n   Exam ID: %s  |  PIN: %s\n",
				i+1, s.FullName, classSuffix, strings.ToUpper(s.Level), s.ExamCode, s.PinCode))
		}
		b.WriteString("\nStudent Timed Exam Portal: " + quizURL + "\n")
		b.WriteString("Official National Results: " + resultsURL + "\n\n")
	}

	if data.Track == "both" || data.Track == "project" {
		b.WriteString("PHASE 2 PROJECT TRACK PORTAL\n")
		b.WriteString("Submit your 6-section proposal and 3-minute demo video using your Reference ID:\n")
		b.WriteString(projectsURL + "\n\n")
	}

	b.WriteString("Need assistance? Call or WhatsApp 0913 938 6220 / 0913 938 6175.\n")
	b.WriteString("— Kingshouse Learning Centre (Evolve 8.0 Competition Desk)\n")
	return b.String()
}

func buildHTML(data EvolveRegistrationEmailData, quizURL, projectsURL, resultsURL string) string {
	var rows strings.Builder
	for _, s := range data.Students {
		rows.WriteString(fmt.Sprintf(`
			<tr>
				<td style="padding:10px 12px;border-bottom:1px solid #ece8f8;font-weight:700;color:#0d002b;">%s<br/><span style="font-size:11px;font-weight:400;color:#6b7280;">%s</span></td>
				<td style="padding:10px 12px;border-bottom:1px solid #ece8f8;text-transform:uppercase;font-size:11px;font-weight:700;color:#3b00b3;">%s</td>
				<td style="padding:10px 12px;border-bottom:1px solid #ece8f8;font-family:monospace;font-size:13px;font-weight:800;color:#3b00b3;">%s</td>
				<td style="padding:10px 12px;border-bottom:1px solid #ece8f8;font-family:monospace;font-size:13px;font-weight:800;color:#0d002b;">%s</td>
			</tr>`,
			html.EscapeString(s.FullName),
			html.EscapeString(s.ClassName),
			html.EscapeString(s.Level),
			html.EscapeString(s.ExamCode),
			html.EscapeString(s.PinCode),
		))
	}

	studentBlock := ""
	if len(data.Students) > 0 {
		studentBlock = fmt.Sprintf(`
			<h2 style="margin:24px 0 8px;font-size:16px;color:#0d002b;">Student Exam Login Credentials</h2>
			<p style="margin:0 0 12px;font-size:13px;color:#4b5563;">Share each pupil's <strong>Exam ID</strong> and <strong>6-Digit PIN</strong> with them before their scheduled sitting at <a href="%s" style="color:#3b00b3;font-weight:700;">%s</a>.</p>
			<table width="100%%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e0f5;border-radius:12px;overflow:hidden;font-size:13px;">
				<thead>
					<tr style="background:#faf6ff;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;">
						<th style="padding:10px 12px;">Pupil</th>
						<th style="padding:10px 12px;">Level</th>
						<th style="padding:10px 12px;">Exam ID</th>
						<th style="padding:10px 12px;">6-Digit PIN</th>
					</tr>
				</thead>
				<tbody>%s</tbody>
			</table>
		`, html.EscapeString(quizURL), html.EscapeString(quizURL), rows.String())
	}

	projectCTA := ""
	if data.Track == "both" || data.Track == "project" {
		projectCTA = fmt.Sprintf(`
			<a href="%s" style="display:inline-block;margin:8px 8px 0 0;background:#100038;color:#9dff13;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:800;">Submit Project Proposal / Video &rarr;</a>
		`, html.EscapeString(projectsURL))
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f4f3fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0d002b;">
	<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 35px rgba(16,0,56,0.12);">
		<div style="background:#100038;padding:28px 32px;color:#ffffff;">
			<span style="display:inline-block;background:rgba(157,255,19,0.18);color:#9dff13;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">Kingshouse Learning Centre &middot; Evolve 8.0</span>
			<h1 style="margin:12px 0 4px;font-size:22px;line-height:1.25;">School Registration Confirmed</h1>
			<p style="margin:0;font-size:13px;color:rgba(255,255,255,0.78);">Reference ID: <strong style="color:#9dff13;font-family:monospace;">%s</strong></p>
		</div>
		<div style="padding:28px 32px;">
			<p style="margin:0 0 12px;font-size:14px;">Dear <strong>%s</strong>,</p>
			<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
				<strong>%s</strong> is officially registered for <strong>Evolve 8.0</strong> (%s track). Please keep your Reference ID safe for all Phase 1 and Phase 2 competition communications.
			</p>
			%s
			<div style="margin-top:24px;">
				<a href="%s" style="display:inline-block;margin:8px 8px 0 0;background:#3b00b3;color:#ffffff;text-decoration:none;padding:11px 18px;border-radius:10px;font-size:13px;font-weight:800;">Open Student Exam Portal &rarr;</a>
				%s
				<a href="%s" style="display:inline-block;margin:8px 0 0 0;border:1px solid #d1d5db;color:#0d002b;text-decoration:none;padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;">View Official Results</a>
			</div>
			<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #f3f4f6;font-size:12px;color:#6b7280;">
				Pass Mark: 700 / 1,000 (70%%) &middot; Ties are broken by faster completion time.<br/>
				Need assistance? Call or WhatsApp <strong>0913 938 6220</strong> / <strong>0913 938 6175</strong>.
			</p>
		</div>
	</div>
</body>
</html>`,
		html.EscapeString(data.ReferenceID),
		html.EscapeString(data.CoordinatorName),
		html.EscapeString(data.SchoolName),
		html.EscapeString(strings.ToUpper(data.Track)),
		studentBlock,
		html.EscapeString(quizURL),
		projectCTA,
		html.EscapeString(resultsURL),
	)
}
