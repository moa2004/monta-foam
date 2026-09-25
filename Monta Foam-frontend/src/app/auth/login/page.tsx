"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { ApiResponse, User } from "@/types";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const res = await api.post<ApiResponse<{ accessToken: string; user: User }>>("/auth/login", data);
      login(res.data.data.accessToken, res.data.data.user);
      const user = res.data.data.user;
      if (user.role === "MASTER_ADMIN" || user.role === "ADMIN") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? "حدث خطأ، يرجى المحاولة مجدداً");
    }
  };

  return (
    <>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
        تسجيل الدخول
      </h1>
      <p className="mt-1 text-sm text-fog-400">أهلاً بعودتك</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fog-400">
            البريد الإلكتروني <span className="text-cyan-400">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="username"
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-fog-400">
              كلمة المرور <span className="text-cyan-400">*</span>
            </label>
            <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fog-400 hover:text-fog-400"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex items-center justify-center gap-2 bg-cyan-400 py-3.5 text-sm font-bold text-ink-950 transition-all hover:bg-cyan-300 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>

      <GoogleSignInButton />

      <p className="mt-6 text-center text-sm text-fog-400">
        ليس لديك حساب؟{" "}
        <Link href="/auth/register" className="font-medium text-cyan-400 hover:text-cyan-300">
          إنشاء حساب
        </Link>
      </p>
    </>
  );
}
