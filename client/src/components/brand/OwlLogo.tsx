export type OwlMood = "happy" | "thinking" | "sleepy";

const INK = "#1e293b";

function Eyes({ mood }: { mood: OwlMood }) {
  if (mood === "sleepy") {
    return (
      <g fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round">
        <path d="M19.5 35.5q4.5 3.5 9 0" />
        <path d="M35.5 35.5q4.5 3.5 9 0" />
      </g>
    );
  }
  // Thinking: pupils glance up and to the side.
  const [dx, dy] = mood === "thinking" ? [1.8, -2] : [0.5, 0.5];
  return (
    <g>
      <circle cx="24" cy="35" r="6" fill="#fff" />
      <circle cx="40" cy="35" r="6" fill="#fff" />
      <circle cx={24 + dx} cy={35 + dy} r="3.6" fill={INK} />
      <circle cx={40 + dx} cy={35 + dy} r="3.6" fill={INK} />
      <circle cx={25.3 + dx} cy={33.6 + dy} r="1.2" fill="#fff" />
      <circle cx={41.3 + dx} cy={33.6 + dy} r="1.2" fill="#fff" />
    </g>
  );
}

/** Σοφούλα, the Study Buddy owl, wearing a graduation cap. */
export function OwlLogo({
  size = 40,
  mood = "happy",
  title,
  className = "",
}: {
  size?: number;
  mood?: OwlMood;
  /** Accessible label; omit for decorative use. */
  title?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {/* wings */}
      <path d="M15 36c-5 6-4 15 3 20-1-6-1-13-3-20z" fill="#7a5230" />
      <path d="M49 36c5 6 4 15-3 20 1-6 1-13 3-20z" fill="#7a5230" />
      {/* body and belly */}
      <ellipse cx="32" cy="41" rx="18" ry="19" fill="#9a6b3f" />
      <ellipse cx="32" cy="48" rx="10.5" ry="10" fill="#f3d9b1" />
      <path
        d="M27 45l2 2 2-2M33 45l2 2 2-2M30 50.5l2 2 2-2"
        fill="none"
        stroke="#d6ad78"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* face */}
      <circle cx="24" cy="35" r="8.5" fill="#f8e7cb" />
      <circle cx="40" cy="35" r="8.5" fill="#f8e7cb" />
      <Eyes mood={mood} />
      <path d="M29.5 40.5h5L32 45z" fill="#f59e0b" />
      {/* feet */}
      <ellipse cx="26" cy="59.5" rx="3.2" ry="1.6" fill="#f59e0b" />
      <ellipse cx="38" cy="59.5" rx="3.2" ry="1.6" fill="#f59e0b" />
      {/* graduation cap */}
      <path d="M21 18.5V24c0 2.5 22 2.5 22 0v-5.5L32 22.5z" fill="#334155" />
      <path d="M32 7l23 8-23 8-23-8z" fill={INK} />
      <path d="M32 15l19 1.5V25" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="51" cy="26.5" r="2" fill="#f59e0b" />
      <circle cx="32" cy="15" r="1.5" fill="#f59e0b" />
    </svg>
  );
}
