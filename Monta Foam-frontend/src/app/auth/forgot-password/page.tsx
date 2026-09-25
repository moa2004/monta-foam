"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صحيح"),
});

const resetSchema = z
  .object({
    code: z.string().length(6, "الرمز يجب أن يكون ٦ أرقام").regex(/^\d+$/),
    newPassword: z
      .string()
      .min(8, "٨ أحرف على الأقل")
      .regex(/[A-Z]/, "حرف كبير")
      .regex(/[a-z]/, "حرف صغير")
      .regex(/[0-9]/, "رقم")
      .regex(/[^A-Za-z0-9]/, "رمز خاص"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  });

type ForgotInput = z.infer<typeof forgotSchema>;
type ResetInput = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [apiError, setApiError] = useState("");

  const forgotForm = useForm<ForgotInput>({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  const onForgot = async (data: ForgotInput) => {
    setApiError("");
    try {
      await api.post("/auth/forgot-password", data);
      setEmail(data.email);
      setStep("reset");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(message ?? "حدث خطأ، يرجى المحاولة مجدداً");
    }
  };

  const onReset = async (data: ResetInput) => {
    setApiError("");
    try {
      await api.post("/auth/reset-password", { email, code: data.code, newPassword: data.newPassword });
      router.replace("/auth/login");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(message ?? "حدث خطأ، يرجى المحاولة مجدداً");
    }
  };

  if (step === "email") {
    return (
      <>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
          نسيت كلمة المرور
        </h1>
        <p className="mt-1 text-sm text-fog-400">سنرسل لك رمز إعادة تعيين على بريدك الإلكتروني</p>
        <form onSubmit={forgotForm.handleSubmit(onForgot)} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-fog-400">البريد الإلكتروني</label>
            <input
              {...forgotForm.register("email")}
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder="example@company.com"
              className={cn(
                "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                forgotForm.formState.errors.email ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
              )}
            />
            {forgotForm.formState.errors.email && (
              <span className="text-xs text-red-400">{forgotForm.formState.errors.email.message}</span>
            )}
          </div>
          {apiError && (
            <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{apiError}</div>
          )}
          <button
            type="submit"
            disabled={forgotForm.formState.isSubmitting}
            className="flex items-center justify-center gap-2 bg-cyan-400 py-3.5 text-sm font-bold text-ink-950 hover:bg-cyan-300 disabled:opacity-60"
          >
            {forgotForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            إرسال رمز التحقق
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-fog-400">
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">
            ← العودة لتسجيل الدخول
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
        إعادة تعيين كلمة المرور
      </h1>
      <p className="mt-1 text-sm text-fog-400">
        أرسلنا رمزاً إلى <span dir="ltr" className="font-medium text-frost-white">{email}</span>
      </p>
      <form onSubmit={resetForm.handleSubmit(onReset)} className="mt-8 flex flex-col gap-5">
        {[
          { name: "code" as const, label: "رمز التحقق", placeholder: "123456", dir: "ltr" as const, autoComplete: "one-time-code" },
          { name: "newPassword" as const, label: "كلمة المرور الجديدة", placeholder: "••••••••", dir: "ltr" as const, type: "password", autoComplete: "new-password" },
          { name: "confirmPassword" as const, label: "تأكيد كلمة المرور", placeholder: "••••••••", dir: "ltr" as const, type: "password", autoComplete: "new-password" },
        ].map(({ name, label, placeholder, dir, type, autoComplete }) => (
          <div key={name} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-fog-400">{label}</label>
            <input
              {...resetForm.register(name)}
              type={type ?? "text"}
              autoComplete={autoComplete}
              dir={dir}
              placeholder={placeholder}
              className={cn(
                "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                resetForm.formState.errors[name] ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
              )}
            />
            {resetForm.formState.errors[name] && (
              <span className="text-xs text-red-400">{resetForm.formState.errors[name]?.message}</span>
            )}
          </div>
        ))}
        {apiError && (
          <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{apiError}</div>
        )}
        <button
          type="submit"
          disabled={resetForm.formState.isSubmitting}
          className="flex items-center justify-center gap-2 bg-cyan-400 py-3.5 text-sm font-bold text-ink-950 hover:bg-cyan-300 disabled:opacity-60"
        >
          {resetForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          إعادة تعيين كلمة المرور
        </button>
      </form>
    </>
  );
}
