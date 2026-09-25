"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import LogoMark from "./LogoMark";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "خدماتنا" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "اتصل بنا" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MASTER_ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-steel-700/60 bg-ink-950/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-frost-white">
          <LogoMark className="text-cyan-400" />
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative font-[family-name:var(--font-body)] text-sm font-medium transition-colors",
                  active ? "text-cyan-400" : "text-fog-400 hover:text-frost-white",
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-2 left-0 right-0 h-px bg-cyan-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {!loading && (user ? (
            isAdmin ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-medium text-fog-400 transition-colors hover:text-frost-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                لوحة التحكم
              </Link>
            ) : (
              <button
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 text-sm font-medium text-fog-400 transition-colors hover:text-frost-white"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            )
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-fog-400 transition-colors hover:text-frost-white"
            >
              تسجيل الدخول
            </Link>
          ))}
          <Link
            href="/services"
            className="border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-all hover:bg-cyan-400/20 hover:border-cyan-400"
          >
            اطلب خدمة
          </Link>
        </div>

        <button
          className="text-frost-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-steel-700/60 bg-ink-950 px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-base font-medium",
                  pathname === link.href ? "text-cyan-400" : "text-fog-400",
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-steel-700/60" />
            {!loading && (user ? (
              isAdmin ? (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-base font-medium text-fog-400">
                  لوحة التحكم
                </Link>
              ) : (
                <button onClick={() => { setOpen(false); void logout(); }} className="text-right text-base font-medium text-fog-400">
                  تسجيل الخروج
                </button>
              )
            ) : (
              <Link href="/auth/login" onClick={() => setOpen(false)} className="text-base font-medium text-fog-400">
                تسجيل الدخول
              </Link>
            ))}
            <Link
              href="/services"
              onClick={() => setOpen(false)}
              className="w-fit border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-300"
            >
              اطلب خدمة
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
