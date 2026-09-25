"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, FileText, Package, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiResponse, DashboardStats, ServiceRequest } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "في الانتظار", color: "text-yellow-400 bg-yellow-400/10" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "text-blue-400 bg-blue-400/10" },
  COMPLETED: { label: "مكتمل", color: "text-green-400 bg-green-400/10" },
  CANCELLED: { label: "ملغي", color: "text-red-400 bg-red-400/10" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  growth,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  growth?: string | null;
}) {
  const isPositive = growth ? parseFloat(growth) >= 0 : null;
  return (
    <div className="flex flex-col gap-4 border border-steel-700/60 bg-steel-900/20 p-6">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-cyan-400" strokeWidth={1.6} />
        {growth !== undefined && growth !== null && (
          <span className={cn("flex items-center gap-1 text-xs font-medium", isPositive ? "text-green-400" : "text-red-400")}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(parseFloat(growth))}%
          </span>
        )}
      </div>
      <div>
        <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-frost-white">
          {value}
        </p>
        <p className="mt-1 text-sm text-fog-400">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardStats>>("/analytics/stats");
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 border border-steel-700/60 bg-steel-900/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
          لوحة التحكم
        </h1>
        <p className="mt-1 text-sm text-fog-400">نظرة عامة على نشاط المنصة</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="إجمالي المستخدمين" value={data?.totalUsers ?? 0} growth={data?.userGrowth} />
        <StatCard icon={FileText} label="إجمالي الطلبات" value={data?.totalRequests ?? 0} growth={data?.requestGrowth} />
        <StatCard icon={Package} label="الخدمات النشطة" value={data?.totalServices ?? 0} />
        <StatCard icon={Clock} label="طلبات معلّقة" value={data?.pendingRequests ?? 0} />
      </div>

      {/* Monthly highlights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-steel-700/60 bg-steel-900/20 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-frost-white">
            هذا الشهر
          </h2>
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-2xl font-bold text-cyan-400">{data?.newRequestsThisMonth ?? 0}</p>
              <p className="text-xs text-fog-400">طلب جديد</p>
            </div>
            <div className="thermal-gauge" />
            <div>
              <p className="text-2xl font-bold text-cyan-400">{data?.newUsersThisMonth ?? 0}</p>
              <p className="text-xs text-fog-400">مستخدم جديد</p>
            </div>
          </div>
        </div>

        {/* Recent requests */}
        <div className="border border-steel-700/60 bg-steel-900/20 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-base font-bold text-frost-white">
            آخر الطلبات
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {(data?.recentRequests ?? []).slice(0, 4).map((req: ServiceRequest) => {
              const status = STATUS_LABELS[req.status];
              return (
                <div key={req.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-frost-white">{req.fullName}</p>
                    <p className="text-xs text-fog-600">{req.service?.title ?? "خدمة غير محددة"}</p>
                  </div>
                  <span className={cn("shrink-0 px-2.5 py-1 text-xs font-medium", status.color)}>
                    {status.label}
                  </span>
                </div>
              );
            })}
            {(!data?.recentRequests?.length) && (
              <p className="text-sm text-fog-600">لا توجد طلبات بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
