"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, KeyboardEvent, ChangeEvent, Suspense } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { ApiResponse, User } from "@/types";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const { login } = useAuth();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const submit = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post<ApiResponse<{ accessToken: string; user: User }>>(
        "/auth/verify-email",
        { email, code },
      );
      login(
        res.data.data.accessToken,
        res.data.data.user ?? { id: "", fullName: "", email, role: "USER", isVerified: true },
      );
      router.replace("/");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? "رمز التحقق غير صحيح، حاول مجدداً");
      setDigits(["", "", "", "", "", ""]);
      refs[0]?.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs[i + 1]?.current?.focus();
    if (next.every((d) => d !== "")) submit(next.join(""));
  };

  const handleKey = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1]?.current?.focus();
  };

  const resend = async () => {
    setResending(true);
    setResendMsg("");
    setError("");
    try {
      await api.post("/auth/resend-otp", { email });
      setResendMsg("تم إرسال رمز جديد إلى بريدك الإلكتروني.");
    } catch {
      setError("فشل في إعادة الإرسال، حاول مجدداً.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-center">
        <MailCheck className="h-12 w-12 text-cyan-400" strokeWidth={1.5} />
      </div>
      <h1 className="text-center font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
        تحقق من بريدك الإلكتروني
      </h1>
      <p className="mt-2 text-center text-sm text-fog-400">
        أرسلنا رمز تحقق مكوّن من ٦ أرقام إلى{" "}
        <span className="font-medium text-frost-white" dir="ltr">
          {email}
        </span>
      </p>

      <div className="mt-8 flex justify-center gap-3" dir="ltr">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            value={d}
            onChange={handleChange(i)}
            onKeyDown={handleKey(i)}
            maxLength={1}
            inputMode="numeric"
            autoFocus={i === 0}
            className={cn(
              "h-14 w-11 border bg-steel-900/40 text-center text-xl font-bold text-frost-white transition-colors focus:outline-none",
              error
                ? "border-red-500/60"
                : "border-steel-700 focus:border-cyan-400/60",
            )}
          />
        ))}
      </div>

      {loading && (
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-fog-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          جارٍ التحقق…
        </div>
      )}

      {error && (
        <div className="mt-4 border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {resendMsg && (
        <p className="mt-4 text-center text-sm text-cyan-400">{resendMsg}</p>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={resend}
          disabled={resending}
          className="flex items-center gap-1.5 text-sm text-fog-400 transition-colors hover:text-frost-white disabled:opacity-60"
        >
          {resending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          لم تصلك الرسالة؟ إعادة الإرسال
        </button>
      </div>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
