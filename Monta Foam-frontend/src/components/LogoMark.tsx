import { cn } from "@/lib/utils";

/**
 * Brand mark: a stylized thermal gauge — a vertical capsule with a
 * frost-cyan fill rising from the base, echoing a cold-room thermometer.
 * Stands in until a confirmed logo file is provided.
 */
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="13" y="3" width="6" height="20" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="26" r="5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14.5" y="9" width="3" height="14" rx="1.5" className="fill-cyan-400" />
      <circle cx="16" cy="26" r="2.5" className="fill-cyan-400" />
    </svg>
  );
}
