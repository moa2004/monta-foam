"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FALLBACK_PROJECTS } from "@/lib/fallback-projects";
import type { ApiResponse, Project } from "@/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>("/projects");
      return data.data;
    },
    placeholderData: FALLBACK_PROJECTS,
    retry: 1,
  });
}
