"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FALLBACK_SERVICES } from "@/lib/fallback-services";
import type { ApiResponse, Service } from "@/types";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Service[]>>("/services");
      return data.data;
    },
    placeholderData: FALLBACK_SERVICES,
    retry: 1,
  });
}
