"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const schema = z
  .object({
    fullName: z.string().trim().min(2, "الاسم لازم يكون حرفين على الأقل"),
    email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صحيح"),
    password: z
      .string()
      .min(8, "٨ أحرف على الأقل")
      .regex(/[A-Z]/, "حرف كبير على الأقل")
      .regex(/[a-z]/, "حرف صغير على الأقل")
      .regex(/[0-9]/, "رقم على الأقل")
      .regex(/[^A-Za-z0-9]/, "رمز خاص على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  });

type RegisterInput = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: RegisterInput) => {
    setApiError("");
    try {
      await api.post("/auth/register", {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(message ?? "حدث خطأ، يرجى المحاولة مجدداً");
    }
  };

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
        إنشاء حساب جديد
      </h1>
      <p className="mt-1 text-sm text-fog-400">سجّل للوصول إلى خدماتنا ومتابعة طلباتك</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fog-400">
            الاسم الكامل <span className="text-cyan-400">*</span>
          </label>
          <input
            {...register("fullName")}
            autoComplete="name"
            placeholder="محمد أحمد"
            className={cn(
              "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
              errors.fullName ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
            )}
          />
          {errors.fullName && <span className="text-xs text-red-400">{errors.fullName.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fog-400">
            البريد الإلكتروني <span className="text-cyan-400">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="example@company.com"
            className={cn(
              "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
              errors.email ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
            )}
          />
          {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fog-400">
            كلمة المرور <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              dir="ltr"
              placeholder="••••••••"
              className={cn(
                "w-full border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                errors.password ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fog-400 hover:text-frost-white"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
          <p className="text-xs text-fog-600">٨ أحرف على الأقل، حرف كبير، رقم، ورمز خاص.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fog-400">
            تأكيد كلمة المرور <span className="text-cyan-400">*</span>
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            dir="ltr"
            placeholder="••••••••"
            className={cn(
              "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
              errors.confirmPassword ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
            )}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-red-400">{errors.confirmPassword.message}</span>
          )}
        </div>

        {apiError && (
          <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex items-center justify-center gap-2 bg-cyan-400 py-3.5 text-sm font-bold text-ink-950 transition-all hover:bg-cyan-300 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "جارٍ إنشاء الحساب…" : "إنشاء الحساب"}
        </button>
      </form>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-fog-400">
        لديك حساب بالفعل؟{" "}
        <Link href="/auth/login" className="font-medium text-cyan-400 hover:text-cyan-300">
          سجّل دخولك
        </Link>
      </p>
    </>
  );
}
