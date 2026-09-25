"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL, api, setAccessToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ApiResponse, User } from "@/types";

const errorMessages: Record<string, string> = {
  access_denied: "تم إلغاء تسجيل الدخول من Google.",
  invalid_state: "انتهت جلسة تسجيل الدخول أو تعذر التحقق منها. حاول مرة أخرى.",
  account_suspended: "هذا الحساب موقوف. تواصل مع الإدارة للمساعدة.",
  password_login_required: "حساب المدير الرئيسي يستخدم البريد الإلكتروني وكلمة المرور فقط.",
  oauth_failed: "تعذر إكمال تسجيل الدخول من Google. حاول مرة أخرى.",
};

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const completeLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error");
      if (oauthError) {
        await Promise.resolve();
        setError(errorMessages[oauthError] ?? errorMessages.oauth_failed);
        return;
      }

      try {
        const refresh = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
        const token = refresh.data.data.accessToken;
        if (!token) throw new Error("Missing access token");

        setAccessToken(token);
        const me = await api.get<ApiResponse<User>>("/auth/me");
        login(token, me.data.data);
        router.replace(
          me.data.data.role === "ADMIN" || me.data.data.role === "MASTER_ADMIN"
            ? "/dashboard"
            : "/",
        );
      } catch (err: unknown) {
        setAccessToken(null);
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(message ?? errorMessages.oauth_failed);
      }
    };

    void completeLogin();
  }, [login, router]);

  if (error) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h1 className="mt-4 text-xl font-bold text-frost-white">لم يكتمل تسجيل الدخول</h1>
        <p className="mt-3 text-sm leading-6 text-fog-400">{error}</p>
        <a
          href={`${API_BASE_URL}/auth/google/start`}
          className="mt-6 inline-flex bg-cyan-400 px-6 py-3 text-sm font-bold text-ink-950 hover:bg-cyan-300"
        >
          المحاولة مرة أخرى
        </a>
        <div className="mt-4">
          <Link href="/auth/login" className="text-sm text-cyan-400 hover:text-cyan-300">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 text-center" role="status" aria-live="polite">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-400" />
      <h1 className="mt-5 text-xl font-bold text-frost-white">جارٍ إكمال تسجيل الدخول…</h1>
      <p className="mt-2 text-sm text-fog-400">لحظات وسيتم تحويلك تلقائيًا.</p>
    </div>
  );
}
