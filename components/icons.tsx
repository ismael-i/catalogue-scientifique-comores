// ── Icônes SVG ──────────────────────────────────────────────────────

import { FlaskConical } from "lucide-react";

interface IconProps {
  className?: string;
}

export function LabIcon({ className = "" }: IconProps) {
  return <FlaskConical className={className} />;
}

export function InstIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="10" width="18" height="11" rx="1" />
      <path d="M12 2l9 8H3l9-8z" />
      <rect x="9" y="14" width="2" height="4" />
      <rect x="13" y="14" width="2" height="4" />
    </svg>
  );
}