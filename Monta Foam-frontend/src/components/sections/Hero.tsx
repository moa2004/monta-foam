"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Phone } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import { useProjects } from "@/hooks/useProjects";
import ThermalReadout from "../ThermalReadout";
import { SITE } from "@/lib/constants";

export default function Hero() {
  const { data: projects = [] } = useProjects();
  const featuredProject = projects[0];

  return (
    <section className="frost-grain relative flex min-h-screen items-center overflow-hidden border-b border-steel-700/60 pt-20">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[600px] w-[600px] rounded-full bg-frost-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[140px]" />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 border border-cyan-400/30 bg-cyan-400/5 px-4 py-1.5"
          >
            <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-300">
              هندسة التبريد الصناعي
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-[family-name:var(--font-display)] text-5xl font-extrabold leading-[1.1] tracking-tight text-frost-white sm:text-6xl lg:text-7xl"
          >
            نبني البرودة
            <br />
            <span className="text-cyan-400">التي تثق بها صناعتك</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-fog-400"
          >
            {SITE.descriptionAr}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 bg-cyan-400 px-7 py-4 text-sm font-bold text-ink-950 transition-all hover:bg-cyan-300"
            >
              اطلب خدمة الآن
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
            <a
              href={`tel:${SITE.phone}`}
              className="inline-flex items-center gap-2 border border-steel-700 px-7 py-4 text-sm font-semibold text-frost-white transition-colors hover:border-cyan-400/50"
            >
              <Phone className="h-4 w-4" />
              تواصل معنا
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12"
          >
            <ThermalReadout />
          </motion.div>
        </div>

        {featuredProject && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden aspect-square overflow-hidden border border-steel-700/60 lg:block"
          >
            <ContentImage
              src={featuredProject.image}
              alt={featuredProject.imageAlt}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-sm font-semibold text-frost-white">{featuredProject.title}</p>
              <p className="mt-1 text-xs text-fog-400">{featuredProject.subtitle}</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
