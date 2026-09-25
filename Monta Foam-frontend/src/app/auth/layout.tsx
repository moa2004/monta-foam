import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { SITE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="frost-grain relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-frost-600/20 blur-[160px]" />

      <Link href="/" className="relative mb-10 flex items-center gap-3">
        <LogoMark className="h-9 w-9 text-cyan-400" />
        <span className="font-[family-name:var(--font-display)] text-xl font-bold text-frost-white">
          {SITE.name}
        </span>
      </Link>

      <div className="relative w-full max-w-md border border-steel-700/60 bg-steel-900/30 p-8 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
