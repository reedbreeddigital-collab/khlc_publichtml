import React from "react";

interface KhlcLogoProps {
  className?: string;
  variant?: "dark" | "light";
}

export default function KhlcLogo({
  className = "h-12 w-auto",
  variant = "dark",
}: KhlcLogoProps) {
  // On dark backgrounds (navbar/footer), use crisp white or cyan for outer rays/primary wordmark so it pops clearly,
  // or on light backgrounds use deep purple (#3b00b3) + lime (#9dff13) from color.jpg.
  const primaryColor = variant === "dark" ? "#ffffff" : "#3b00b3";
  const outerRayColor = variant === "dark" ? "#38e0ff" : "#3b00b3";
  const accentColor = "#9dff13";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 205"
      fill="none"
      className={className}
      aria-label="Kingshouse Learning Centre"
    >
      {/* Open Book / Sunburst Fan Icon */}
      <g transform="translate(300, 82)">
        {/* Left 4 Outer Rays */}
        <g fill={outerRayColor}>
          <path d="M -22 0 L -96 -2 L -96 -9 L -22 -3 Z" />
          <path d="M -21 -2 L -91 -16 L -89 -23 L -20 -5 Z" />
          <path d="M -19 -4 L -79 -30 L -75 -36 L -17 -7 Z" />
          <path d="M -16 -6 L -60 -43 L -55 -48 L -13 -9 Z" />
        </g>

        {/* Right 4 Outer Rays */}
        <g fill={outerRayColor}>
          <path d="M 22 0 L 96 -2 L 96 -9 L 22 -3 Z" />
          <path d="M 21 -2 L 91 -16 L 89 -23 L 20 -5 Z" />
          <path d="M 19 -4 L 79 -30 L 75 -36 L 17 -7 Z" />
          <path d="M 16 -6 L 60 -43 L 55 -48 L 13 -9 Z" />
        </g>

        {/* Center 5 Rays + Rising Sun Semicircle Base */}
        <g fill={accentColor}>
          <path d="M -12 -8 L -43 -53 L -36 -57 L -8 -10 Z" />
          <path d="M -6 -10 L -23 -59 L -16 -61 L -2 -11 Z" />
          <path d="M -3.5 -11 L -3.5 -63 L 3.5 -63 L 3.5 -11 Z" />
          <path d="M 2 -11 L 16 -61 L 23 -59 L 6 -10 Z" />
          <path d="M 8 -10 L 36 -57 L 43 -53 L 12 -8 Z" />
          <path d="M -25 0 A 25 22 0 0 1 25 0 Z" />
        </g>
      </g>

      {/* KINGSHOUSE Primary Wordmark */}
      <text
        x="300"
        y="138"
        textAnchor="middle"
        fill={primaryColor}
        fontFamily="Dropa"
        fontSize="52"
        fontWeight="800"
        letterSpacing="3"
        textLength="510"
        lengthAdjust="spacingAndGlyphs"
      >
        KINGSHOUSE
      </text>

      {/* LEARNING CENTRE Secondary Wordmark */}
      <text
        x="300"
        y="174"
        textAnchor="middle"
        fill={accentColor}
        fontFamily="Dropa"
        fontSize="26"
        fontWeight="700"
        letterSpacing="8.5"
        textLength="506"
        lengthAdjust="spacingAndGlyphs"
      >
        LEARNING CENTRE
      </text>
    </svg>
  );
}
