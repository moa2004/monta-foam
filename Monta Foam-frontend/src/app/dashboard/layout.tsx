"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Users, FileText, Bell, Images, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import LogoMark from "@/components/LogoMark";
import { SITE } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNotifications, useNotificationsSocket } from "@/hooks/useNotifications";

const NAV = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/content", label: "محتوى الموقع", icon: Images },
  { href: "/dashboard/requests", label: "الطلبات", icon: FileText },
  { href: "/dashboard/users", label: "المستخدمون", icon: Users },
  { href: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN" || user?.role === "MASTER_ADMIN";
  const { data: notificationsData } = useNotifications(Boolean(isAdmin));
  useNotificationsSocket(Boolean(isAdmin));
  const unreadCount = notificationsData?.unreadCount ?? 0;

  useEffect(() => {
    if (!loading && (!user || (user.role !== "ADMIN" && user.role !== "MASTER_ADMIN"))) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const handleLogout = async () => { await logout(); router.replace("/"); };

  const renderSidebar = (mobile = false) => (
    <aside className={cn(
      "flex h-full flex-col border-r border-steel-700/60 bg-steel-900/40",
      mobile ? "w-full" : "w-64",
    )}>
      <div className="flex h-16 items-center gap-3 border-b border-steel-700/60 px-5">
        <LogoMark className="h-7 w-7 text-cyan-400" />
        <span className="font-[family-name:var(--font-display)] text-base font-bold text-frost-white">
          {SITE.name}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-cyan-400/10 text-cyan-300 border-l-2 border-cyan-400"
                  : "text-fog-400 hover:bg-steel-900/60 hover:text-frost-white",
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.6} />
              {label}
              {href === "/dashboard/notifications" && unreadCount > 0 && (
                <span className="mr-auto min-w-5 rounded-full bg-cyan-400 px-1.5 py-0.5 text-center text-[10px] font-bold text-ink-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-steel-700/60 p-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-cyan-400/20 text-xs font-bold text-cyan-400">
            {user.fullName[0]}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-frost-white">{user.fullName}</p>
            <p className="text-xs text-fog-600">{user.role === "MASTER_ADMIN" ? "المدير الرئيسي" : "مدير"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-fog-400 transition-colors hover:text-red-400"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.6} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {renderSidebar()}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-950/80" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72">
            {renderSidebar(true)}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-16 items-center justify-between border-b border-steel-700/60 px-5 md:hidden">
          <Link href="/" className="font-[family-name:var(--font-display)] text-base font-bold text-frost-white">
            {SITE.name}
          </Link>
          <button onClick={() => setSidebarOpen((v) => !v)} className="text-frost-white">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
