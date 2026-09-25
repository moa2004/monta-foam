"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import { useServices } from "@/hooks/useServices";
import { getServiceIcon } from "@/lib/service-icons";

export default function ServicesPreview() {
  const { data: services = [] } = useServices();
  const preview = services.slice(0, 4);

  return (
    <section className="relative border-b border-steel-700/60 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
              خدماتنا
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-frost-white sm:text-5xl">
              حلول تبريد متكاملة من التصميم حتى الصيانة
            </h2>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 border border-steel-700 px-6 py-3.5 text-sm font-semibold text-frost-white transition-colors hover:border-cyan-400/50"
          >
            عرض جميع الخدمات
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((service, i) => {
            const Icon = getServiceIcon(service.slug);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/services#${service.slug}`}
                  className="group flex h-full flex-col overflow-hidden border border-steel-700/60 bg-steel-900/30 transition-all hover:border-cyan-400/40 hover:bg-steel-900/60"
                >
                  {service.image && <div className="aspect-[16/10] overflow-hidden"><ContentImage src={service.image} alt={service.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>}
                  <div className="flex flex-1 flex-col p-7">
                    {!service.image && <div className="flex h-12 w-12 items-center justify-center border border-steel-700 text-cyan-400 transition-colors group-hover:border-cyan-400/50"><Icon className="h-6 w-6" strokeWidth={1.5} /></div>}
                    <h3 className={`${service.image ? "" : "mt-6"} font-[family-name:var(--font-display)] text-lg font-bold text-frost-white`}>{service.title}</h3>
                    <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-fog-400">{service.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400">اطلب الخدمة<ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" /></span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
