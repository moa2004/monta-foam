"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Gauge, Wrench, Award } from "lucide-react";

const REASONS = [
  {
    icon: Award,
    title: "خبرة هندسية",
    description: "فريق متخصص في تصميم وتنفيذ وصيانة غرف التبريد والتجميد وحلول النقل المبرد.",
  },
  {
    icon: ShieldCheck,
    title: "جودة موثوقة",
    description: "نستخدم عوازل ومعدات معتمدة دوليًا، مع التزام صارم بمعايير السلامة الغذائية والدوائية.",
  },
  {
    icon: Gauge,
    title: "تنفيذ سريع",
    description: "خطط تنفيذ مدروسة تقلل وقت التوقف عن العمل وتُسلّم المشروع في الموعد المتفق عليه.",
  },
  {
    icon: Wrench,
    title: "دعم وصيانة دائمة",
    description: "عقود صيانة دورية وفريق طوارئ جاهز للاستجابة السريعة في حال أي عطل تشغيلي.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="seam-line relative border-b border-steel-700/60 bg-steel-900/20 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
            لماذا نحن
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-frost-white sm:text-5xl">
            معايير تشغيل لا تساوم على الجودة
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden border border-steel-700/60 bg-steel-700/60 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-ink-950 p-8 transition-colors hover:bg-steel-900/60"
            >
              <reason.icon className="h-7 w-7 text-cyan-400 transition-transform group-hover:scale-110" strokeWidth={1.5} />
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold text-frost-white">
                {reason.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-fog-400">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
