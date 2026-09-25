"use client";

import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const requestServiceSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم لازم يكون حرفين على الأقل").max(100),
  phone: z
    .string()
    .trim()
    .min(9, "رقم الهاتف غير صحيح")
    .max(20, "رقم الهاتف غير صحيح")
    .regex(/^[0-9+\s-]+$/, "رقم الهاتف غير صحيح"),
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صحيح"),
  serviceId: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type RequestServiceInput = z.infer<typeof requestServiceSchema>;

interface RequestServiceResponse {
  success: boolean;
  message: string;
  data: { requestId: string; whatsappLink: string };
}

export function useRequestService() {
  return useMutation({
    mutationFn: async (input: RequestServiceInput) => {
      const payload = {
        ...input,
        serviceId: input.serviceId || undefined,
        notes: input.notes || undefined,
      };
      const { data } = await api.post<RequestServiceResponse>("/requests", payload);
      return data;
    },
  });
}
