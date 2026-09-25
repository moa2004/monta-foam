"use client";

import { motion } from "framer-motion";
import { ClipboardCheck, MessagesSquare, Wrench } from "lucide-react";

const TESTIMONIALS = [
  {
    icon: ClipboardCheck,
    quote: "نبدأ بفهم السعة ودرجات الحرارة وطبيعة التشغيل قبل اقتراح مكونات المشروع.",
    name: "دراسة دقيقة",
    company: "حل مناسب للاحتياج الفعلي",
  },
  {
    icon: MessagesSquare,
    quote: "نوضح نطاق العمل ومراحل التنفيذ ونبقى على تواصل طوال فترة تجهيز المشروع.",
    name: "تواصل واضح",
    company: "من المعاينة حتى التسليم",
  },
  {
    icon: Wrench,
    quote: "نوفر خدمات الصيانة الدورية والتعامل مع الأعطال للحفاظ على استقرار التشغيل.",
    name: "دعم بعد التنفيذ",
    company: "صيانة ومتابعة تشغيلية",
  },
];

export default function Testimonials() {
  return (
    <section className="border-b border-steel-700/60 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
            التزامنا
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-frost-white sm:text-5xl">
            ما نقدمه في كل مشروع
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden border border-steel-700/60 bg-steel-700/60 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col bg-ink-950 p-8"
            >
              <t.icon className="h-6 w-6 text-cyan-400/60" />
              <p className="mt-5 flex-1 text-sm leading-relaxed text-fog-400">
                {t.quote}
              </p>
              <div className="mt-6 border-t border-steel-700/60 pt-5">
                <p className="text-sm font-semibold text-frost-white">{t.name}</p>
                <p className="mt-0.5 text-xs text-fog-600">{t.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
