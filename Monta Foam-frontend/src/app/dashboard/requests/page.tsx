"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse, ServiceRequest, RequestStatus } from "@/types";

const STATUS_LABELS: Record<RequestStatus, { label: string; color: string }> = {
  PENDING: { label: "في الانتظار", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  COMPLETED: { label: "مكتمل", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED: { label: "ملغي", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

const ALL_STATUSES: RequestStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function RequestsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests", page, statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await api.get<ApiResponse<ServiceRequest[]>>(`/requests?${params}`);
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
      await api.patch(`/requests/${id}/status`, { status });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-requests"] }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
          إدارة الطلبات
        </h1>
        <p className="mt-1 text-sm text-fog-400">عرض وتحديث حالة طلبات الخدمة</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-600" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ابحث بالاسم أو الهاتف…"
            className="w-full border border-steel-700 bg-steel-900/40 py-2.5 pr-10 pl-4 text-sm text-frost-white placeholder:text-fog-600 focus:border-cyan-400/60 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as RequestStatus | ""); setPage(1); }}
          className="border border-steel-700 bg-steel-900/40 px-4 py-2.5 text-sm text-frost-white focus:outline-none"
        >
          <option value="">كل الحالات</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-steel-700/60">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-steel-700/60 bg-steel-900/40">
            <tr>
              {["الاسم", "الهاتف", "الخدمة", "الحالة", "التاريخ", "تغيير الحالة"].map((h) => (
                <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-fog-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-fog-600">جارٍ التحميل…</td>
              </tr>
            )}
            {!isLoading && data?.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-fog-600">لا توجد طلبات</td>
              </tr>
            )}
            {data?.data?.map((req) => {
              const s = STATUS_LABELS[req.status];
              return (
                <tr key={req.id} className="border-b border-steel-700/30 hover:bg-steel-900/30">
                  <td className="px-4 py-3.5 font-medium text-frost-white">{req.fullName}</td>
                  <td className="px-4 py-3.5 text-fog-400" dir="ltr">{req.phone}</td>
                  <td className="px-4 py-3.5 text-fog-400">{req.service?.title ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("border px-2.5 py-1 text-xs font-medium", s.color)}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-fog-600">
                    {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative">
                      <select
                        value={req.status}
                        onChange={(e) => updateStatus.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                        className="appearance-none border border-steel-700 bg-steel-900/40 py-1.5 pl-7 pr-3 text-xs text-frost-white focus:outline-none"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute left-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fog-400" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-fog-400">
            {data.pagination.total} طلب — صفحة {page} من {data.pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="border border-steel-700 px-3 py-1.5 text-fog-400 transition-colors hover:border-cyan-400/40 hover:text-frost-white disabled:opacity-40"
            >
              السابق
            </button>
            <button
              disabled={page === data.pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="border border-steel-700 px-3 py-1.5 text-fog-400 transition-colors hover:border-cyan-400/40 hover:text-frost-white disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
