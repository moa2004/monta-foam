"use client";

import { motion } from "framer-motion";
import ContentImage from "@/components/ContentImage";
import { useProjects } from "@/hooks/useProjects";

export default function Gallery() {
  const { data: projects = [] } = useProjects();

  return (
    <section className="border-b border-steel-700/60 bg-steel-900/20 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 max-w-2xl">
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
            آخر أعمالنا
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-frost-white sm:text-5xl">
            مشاريع نفخر بتنفيذها
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`group relative aspect-[4/3] overflow-hidden border border-steel-700/60 bg-gradient-to-br from-steel-900 to-ink-950 ${i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
            >
              {project.linkUrl ? (
                <a href={project.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
                  <ContentImage src={project.image} alt={project.imageAlt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent p-6 pt-16">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-frost-white">{project.title}</h3>
                    <p className="mt-1.5 text-sm text-fog-400">{project.subtitle}</p>
                  </div>
                </a>
              ) : (
                <>
                  <ContentImage src={project.image} alt={project.imageAlt} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/85 to-transparent p-6 pt-16">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-frost-white">{project.title}</h3>
                    <p className="mt-1.5 text-sm text-fog-400">{project.subtitle}</p>
                  </div>
                </>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
