import { cn } from "@/lib/utils";

export default function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.49-1.46h1.6V4.14C16.3 4.1 15.32 4 14.18 4 11.8 4 10.18 5.44 10.18 8.08v2.12H7.5v3h2.68V21h3.32Z" />
    </svg>
  );
}
