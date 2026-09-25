"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CheckCircle, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { requestServiceSchema, type RequestServiceInput, useRequestService } from "@/hooks/useRequestService";
import { cn } from "@/lib/utils";
import type { Service } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedService?: Service | null;
  services?: Service[];
}

export default function RequestServiceModal({ open, onClose, selectedService, services = [] }: Props) {
  const mutation = useRequestService();
  const resetMutation = mutation.reset;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestServiceInput>({
    resolver: zodResolver(requestServiceSchema),
    defaultValues: { serviceId: selectedService?.id ?? "" },
  });

  useEffect(() => {
    if (open) {
      resetMutation();
      reset({ serviceId: selectedService?.id ?? "" });
    }
  }, [open, selectedService, reset, resetMutation]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onSubmit = (data: RequestServiceInput) => {
    mutation.mutate(data);
  };

  const handleWhatsApp = () => {
    if (mutation.data?.data?.whatsappLink) {
      window.open(mutation.data.data.whatsappLink, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25 }}
            className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto border border-steel-700 bg-ink-950 p-8 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-service-title"
          >
            <button
              onClick={onClose}
              className="absolute left-5 top-5 text-fog-400 transition-colors hover:text-frost-white"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>

            {mutation.isSuccess ? (
              <div className="flex flex-col items-center gap-5 py-6 text-center">
                <CheckCircle className="h-14 w-14 text-cyan-400" strokeWidth={1.5} />
                <div>
                  <h3 id="request-service-title" className="font-[family-name:var(--font-display)] text-xl font-bold text-frost-white">
                    تم إرسال طلبك بنجاح
                  </h3>
                  <p className="mt-2 text-sm text-fog-400">
                    سيتواصل معك فريقنا الهندسي في أقرب وقت. يمكنك أيضًا التواصل معنا مباشرة عبر واتساب.
                  </p>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  فتح واتساب
                </button>
              </div>
            ) : (
              <>
                <h2 id="request-service-title" className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
                  اطلب الخدمة
                </h2>
                {selectedService && (
                  <p className="mt-1 text-sm text-cyan-400">{selectedService.title}</p>
                )}
                <p className="mt-1 text-sm text-fog-400">
                  سيتواصل معك أحد مهندسينا خلال ٢٤ ساعة.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-fog-400">
                      الاسم الكامل <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      {...register("fullName")}
                      placeholder="محمد أحمد"
                      className={cn(
                        "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                        errors.fullName ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
                      )}
                    />
                    {errors.fullName && (
                      <span className="text-xs text-red-400">{errors.fullName.message}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-fog-400">
                      رقم الهاتف <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      {...register("phone")}
                      placeholder="+20 1XX XXX XXXX"
                      dir="ltr"
                      className={cn(
                        "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                        errors.phone ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
                      )}
                    />
                    {errors.phone && (
                      <span className="text-xs text-red-400">{errors.phone.message}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-fog-400">
                      البريد الإلكتروني <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="example@company.com"
                      dir="ltr"
                      className={cn(
                        "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                        errors.email ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
                      )}
                    />
                    {errors.email && (
                      <span className="text-xs text-red-400">{errors.email.message}</span>
                    )}
                  </div>

                  {/* Service select (only shown if not pre-selected) */}
                  {!selectedService && services.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-fog-400">الخدمة المطلوبة</label>
                      <select
                        {...register("serviceId")}
                        className="border border-steel-700 bg-steel-900/40 px-4 py-3 text-sm text-frost-white focus:border-cyan-400/60 focus:outline-none"
                      >
                        <option value="">اختر الخدمة</option>
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-fog-400">ملاحظات إضافية</label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      placeholder="اذكر أي تفاصيل تتعلق بالمشروع أو المساحة أو متطلبات التخزين…"
                      className="border border-steel-700 bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:border-cyan-400/60 focus:outline-none"
                    />
                  </div>

                  {mutation.isError && (
                    <p className="text-sm text-red-400">
                      {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                        "حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً."}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="mt-1 flex items-center justify-center gap-2 bg-cyan-400 py-3.5 text-sm font-bold text-ink-950 transition-all hover:bg-cyan-300 disabled:opacity-60"
                  >
                    {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mutation.isPending ? "جارٍ الإرسال…" : "إرسال الطلب"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
