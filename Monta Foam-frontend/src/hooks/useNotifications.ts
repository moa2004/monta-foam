"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, NotificationItem } from "@/types";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<ApiResponse<NotificationItem[]>>("/notifications?limit=50");
      return response.data;
    },
    enabled,
    refetchInterval: 30_000,
  });
}

export function useNotificationsSocket(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const refresh = () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [enabled, queryClient]);
}
