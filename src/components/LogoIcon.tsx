export default function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="10" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M9 9H23M9 16H19M9 23H15"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="23" r="2.5" fill="var(--color-frost)" />
    </svg>
  );
}
