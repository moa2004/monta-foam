"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { ApiResponse, User, Role } from "@/types";

const ROLE_LABELS: Record<Role, { label: string; color: string }> = {
  MASTER_ADMIN: { label: "المدير الرئيسي", color: "text-purple-400 bg-purple-400/10" },
  ADMIN: { label: "مدير", color: "text-cyan-400 bg-cyan-400/10" },
  USER: { label: "مستخدم", color: "text-fog-400 bg-fog-400/10" },
};

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      const res = await api.get<ApiResponse<User[]>>(`/users?${params}`);
      return res.data;
    },
  });

  const toggleSuspend = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/users/${id}/suspend`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      await api.patch(`/users/${id}/role`, { role });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const canModify = (target: User) =>
    target.role !== "MASTER_ADMIN" && target.id !== me?.id;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
          إدارة المستخدمين
        </h1>
        <p className="mt-1 text-sm text-fog-400">عرض وإدارة حسابات المستخدمين</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog-600" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="ابحث بالاسم أو الإيميل…"
          className="w-full border border-steel-700 bg-steel-900/40 py-2.5 pr-10 pl-4 text-sm text-frost-white placeholder:text-fog-600 focus:border-cyan-400/60 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto border border-steel-700/60">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-steel-700/60 bg-steel-900/40">
            <tr>
              {["المستخدم", "الإيميل", "الدور", "الحالة", "تاريخ الانضمام", "إجراءات"].map((h) => (
                <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-fog-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-fog-600">جارٍ التحميل…</td></tr>
            )}
            {!isLoading && data?.data?.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-fog-600">لا يوجد مستخدمون</td></tr>
            )}
            {data?.data?.map((u) => {
              const r = ROLE_LABELS[u.role];
              const modifiable = canModify(u);
              return (
                <tr key={u.id} className="border-b border-steel-700/30 hover:bg-steel-900/30">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-cyan-400/10 text-xs font-bold text-cyan-400">
                        {u.fullName[0]}
                      </div>
                      <span className="font-medium text-frost-white">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-fog-400" dir="ltr">{u.email}</td>
                  <td className="px-4 py-3.5">
                    {modifiable && me?.role === "MASTER_ADMIN" ? (
                      <select
                        value={u.role}
                        onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as Role })}
                        className="border border-steel-700 bg-steel-900/40 px-2 py-1 text-xs text-frost-white focus:outline-none"
                      >
                        {(["USER", "ADMIN"] as Role[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r].label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={cn("px-2.5 py-1 text-xs font-medium", r.color)}>{r.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      "px-2.5 py-1 text-xs font-medium",
                      u.isSuspended ? "text-red-400 bg-red-400/10" : "text-green-400 bg-green-400/10",
                    )}>
                      {u.isSuspended ? "موقوف" : "نشط"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-fog-600">
                    {new Date(u.createdAt ?? "").toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-4 py-3.5">
                    {modifiable ? (
                      <button
                        onClick={() => toggleSuspend.mutate(u.id)}
                        disabled={toggleSuspend.isPending}
                        className={cn(
                          "flex items-center gap-1.5 text-xs transition-colors",
                          u.isSuspended ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300",
                        )}
                      >
                        {u.isSuspended ? (
                          <><ShieldCheck className="h-3.5 w-3.5" /> رفع الإيقاف</>
                        ) : (
                          <><ShieldAlert className="h-3.5 w-3.5" /> إيقاف</>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-fog-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-fog-400">{data.pagination.total} مستخدم</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="border border-steel-700 px-3 py-1.5 text-fog-400 hover:border-cyan-400/40 hover:text-frost-white disabled:opacity-40">
              السابق
            </button>
            <button disabled={page === data.pagination.pages} onClick={() => setPage((p) => p + 1)}
              className="border border-steel-700 px-3 py-1.5 text-fog-400 hover:border-cyan-400/40 hover:text-frost-white disabled:opacity-40">
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
