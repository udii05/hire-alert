export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa" /><stop offset="0.5" stopColor="#22d3ee" /><stop offset="1" stopColor="#ec4899" /></linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11" stroke="url(#g)" strokeWidth="2" />
      <line x1="24" y1="24" x2="32" y2="32" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="11" y="12" width="10" height="8" rx="1.5" fill="#a78bfa" />
      <rect x="13" y="14" width="6" height="1.5" rx="0.5" fill="white" opacity="0.8" />
      <rect x="13" y="17" width="4" height="1.5" rx="0.5" fill="white" opacity="0.5" />
    </svg>
  );
}
