"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { SITE, buildWhatsAppLink } from "@/lib/constants";

export default function ContactCta() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-frost-600/20 blur-[160px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400"
        >
          ابدأ مشروعك معنا
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-frost-white sm:text-5xl"
        >
          جاهزون لتبريد منشأتك بأعلى معايير الجودة
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-fog-400"
        >
          تواصل مع فريقنا الهندسي اليوم للحصول على استشارة مجانية ومعاينة لاحتياجات التخزين البارد في منشأتك.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-cyan-400 px-7 py-4 text-sm font-bold text-ink-950 transition-all hover:bg-cyan-300"
          >
            تواصل معنا
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
          <a
            href={buildWhatsAppLink("مرحباً، أرغب في استشارة بخصوص خدمات التخزين البارد.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-steel-700 px-7 py-4 text-sm font-semibold text-frost-white transition-colors hover:border-cyan-400/50"
          >
            <MessageCircle className="h-4 w-4" />
            واتساب مباشر
          </a>
        </motion.div>

        <p className="mt-8 text-xs text-fog-600" dir="ltr">
          {SITE.phoneDisplay} · {SITE.email}
        </p>
      </div>
    </section>
  );
}
