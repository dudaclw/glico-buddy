type MascotProps = {
  size?: number;
  mood?: "happy" | "sad" | "worried";
  className?: string;
};

// Cute blood-drop mascot named "Gotinha"
export function Mascot({ size = 96, mood = "happy", className }: MascotProps) {
  const eyeY = mood === "sad" ? 58 : 54;
  const mouth =
    mood === "happy"
      ? "M40 72 Q50 82 60 72"
      : mood === "worried"
      ? "M40 76 Q50 70 60 76"
      : "M40 78 Q50 70 60 78";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      className={className}
      role="img"
      aria-label="Mascote Gotinha"
    >
      <defs>
        <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.16 25)" />
          <stop offset="100%" stopColor="oklch(0.62 0.22 18)" />
        </linearGradient>
      </defs>
      {/* drop body */}
      <path
        d="M50 4 C50 4 86 48 86 72 A36 36 0 0 1 14 72 C14 48 50 4 50 4 Z"
        fill="url(#dropGrad)"
      />
      {/* shine */}
      <ellipse cx="34" cy="48" rx="7" ry="12" fill="white" opacity="0.35" />
      {/* cheeks */}
      <circle cx="28" cy="68" r="5" fill="oklch(0.88 0.12 20)" opacity="0.55" />
      <circle cx="72" cy="68" r="5" fill="oklch(0.88 0.12 20)" opacity="0.55" />
      {/* eyes */}
      <circle cx="40" cy={eyeY} r="3.2" fill="#1a0f10" />
      <circle cx="60" cy={eyeY} r="3.2" fill="#1a0f10" />
      <circle cx="41" cy={eyeY - 1} r="1" fill="white" />
      <circle cx="61" cy={eyeY - 1} r="1" fill="white" />
      {/* mouth */}
      <path d={mouth} stroke="#1a0f10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
