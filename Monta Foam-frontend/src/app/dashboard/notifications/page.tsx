"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS_QUERY_KEY, useNotifications } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useNotifications();

  const markRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });

  const markAll = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });

  const deleteN = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });

  const notifications = data?.data ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
            الإشعارات
          </h1>
          <p className="mt-1 text-sm text-fog-400">
            {unread > 0 ? `${unread} إشعار غير مقروء` : "كل الإشعارات مقروءة"}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="flex items-center gap-2 border border-steel-700 px-4 py-2 text-sm text-fog-400 transition-colors hover:border-cyan-400/40 hover:text-frost-white"
          >
            <CheckCheck className="h-4 w-4" />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="flex flex-col gap-px overflow-hidden border border-steel-700/60 bg-steel-700/60">
        {isLoading && (
          <div className="bg-ink-950 py-12 text-center text-sm text-fog-600">جارٍ التحميل…</div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 bg-ink-950 py-16">
            <Bell className="h-10 w-10 text-fog-600" strokeWidth={1.2} />
            <p className="text-sm text-fog-600">لا توجد إشعارات</p>
          </div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex items-start justify-between gap-4 bg-ink-950 p-5 transition-colors hover:bg-steel-900/30",
              !n.isRead && "border-r-2 border-cyan-400",
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className={cn(
                "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                n.isRead ? "bg-fog-600" : "bg-cyan-400",
              )} />
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", n.isRead ? "text-fog-400" : "text-frost-white")}>
                  {n.title}
                </p>
                <p className="mt-0.5 text-xs text-fog-600">{n.message}</p>
                <p className="mt-1.5 font-[family-name:var(--font-mono)] text-xs text-fog-600">
                  {new Date(n.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!n.isRead && (
                <button
                  onClick={() => markRead.mutate(n.id)}
                  className="p-1 text-fog-400 transition-colors hover:text-cyan-400"
                  title="تحديد كمقروء"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => deleteN.mutate(n.id)}
                className="p-1 text-fog-400 transition-colors hover:text-red-400"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
