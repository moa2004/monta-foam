"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PageHeader from "@/components/PageHeader";
import { SITE, buildWhatsAppLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().trim().min(2, "الاسم لازم يكون حرفين على الأقل"),
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صحيح"),
  phone: z.string().trim().min(9, "رقم الهاتف غير صحيح"),
  message: z.string().trim().min(10, "الرسالة لازم تكون ١٠ أحرف على الأقل").max(2000),
});

type ContactInput = z.infer<typeof contactSchema>;

const INFO = [
  { icon: Phone, label: "الهاتف", value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
  { icon: Mail, label: "البريد الإلكتروني", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: MapPin, label: "العنوان", value: SITE.address, href: undefined },
  { icon: Clock, label: "ساعات العمل", value: SITE.workingHours, href: undefined },
].filter((item) => item.value);

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    setLoading(true);
    // Send via WhatsApp (no dedicated contact endpoint in PRD)
    const msg = `رسالة من موقع الشركة:\n\nالاسم: ${data.name}\nالهاتف: ${data.phone}\nالإيميل: ${data.email}\n\nالرسالة:\n${data.message}`;
    window.open(buildWhatsAppLink(msg), "_blank", "noopener,noreferrer");
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <Header />
      <main>
        <PageHeader
          eyebrow="اتصل بنا"
          title="نحن هنا لمساعدتك"
          description="فريقنا جاهز للرد على استفساراتك وتقديم الاستشارة المناسبة لمشروعك."
        />

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.4fr]">

              {/* Info column */}
              <div className="flex flex-col gap-10">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">
                    تواصل معنا مباشرة
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-fog-400">
                    يمكنك التواصل معنا عبر أي من القنوات التالية، وسيتولى أحد مهندسينا الرد في أقرب وقت ممكن.
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  {INFO.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-steel-700 text-cyan-400">
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-fog-600">{label}</p>
                        {href ? (
                          <a
                            href={href}
                            className="mt-0.5 text-sm text-frost-white transition-colors hover:text-cyan-300"
                            dir={href.startsWith("tel") || href.startsWith("mailto") ? "ltr" : undefined}
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="mt-0.5 text-sm text-frost-white">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href={buildWhatsAppLink("مرحباً، أرغب في الاستفسار عن خدماتكم.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2.5 bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  تواصل عبر واتساب
                </a>

                {/* Social */}
                <div>
                  <p className="mb-3 text-xs font-medium text-fog-600">تابعنا</p>
                  <a
                    href={SITE.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center border border-steel-700 text-fog-400 transition-colors hover:border-cyan-400 hover:text-cyan-400"
                    aria-label="فيسبوك"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M13.5 21v-7.8h2.6l.4-3h-3v-1.9c0-.87.24-1.46 1.49-1.46h1.6V4.14C16.3 4.1 15.32 4 14.18 4 11.8 4 10.18 5.44 10.18 8.08v2.12H7.5v3h2.68V21h3.32Z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Form column */}
              <div className="border border-steel-700/60 bg-steel-900/20 p-8">
                {submitted ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                    <CheckCircle className="h-14 w-14 text-cyan-400" strokeWidth={1.5} />
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-frost-white">
                      تم تجهيز رسالتك على واتساب
                    </h3>
                    <p className="text-sm text-fog-400">أكمل الإرسال من نافذة واتساب، وسنرد عليك في أقرب وقت.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-frost-white">
                      أرسل لنا رسالة
                    </h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-5">
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-fog-400">
                            الاسم <span className="text-cyan-400">*</span>
                          </label>
                          <input
                            {...register("name")}
                            placeholder="اسمك الكامل"
                            className={cn(
                              "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                              errors.name ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
                            )}
                          />
                          {errors.name && (
                            <span className="text-xs text-red-400">{errors.name.message}</span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-fog-400">
                            الهاتف <span className="text-cyan-400">*</span>
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
                      </div>

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

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-fog-400">
                          الرسالة <span className="text-cyan-400">*</span>
                        </label>
                        <textarea
                          {...register("message")}
                          rows={5}
                          placeholder="اكتب رسالتك هنا…"
                          className={cn(
                            "border bg-steel-900/40 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:outline-none",
                            errors.message ? "border-red-500/60" : "border-steel-700 focus:border-cyan-400/60",
                          )}
                        />
                        {errors.message && (
                          <span className="text-xs text-red-400">{errors.message.message}</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-cyan-400 py-3.5 text-sm font-bold text-ink-950 transition-all hover:bg-cyan-300 disabled:opacity-60"
                      >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "جارٍ الإرسال…" : "إرسال الرسالة"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
