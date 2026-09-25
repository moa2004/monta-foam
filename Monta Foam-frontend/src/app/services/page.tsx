"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PageHeader from "@/components/PageHeader";
import RequestServiceModal from "@/components/RequestServiceModal";
import { useServices } from "@/hooks/useServices";
import { getServiceIcon } from "@/lib/service-icons";
import { ArrowLeft } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import type { Service } from "@/types";

export default function ServicesPage() {
  const { data: services = [] } = useServices();
  const [selected, setSelected] = useState<Service | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (service: Service) => {
    setSelected(service);
    setModalOpen(true);
  };

  return (
    <>
      <Header />
      <main>
        <PageHeader
          eyebrow="خدماتنا"
          title="حلول تبريد متكاملة لكل احتياجاتك الصناعية"
          description="من التصميم والتصنيع وحتى التركيب والصيانة — نوفر منظومة متكاملة لأنظمة التخزين البارد والتجميد والتبريد الصناعي."
        />

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, i) => {
                const Icon = getServiceIcon(service.slug);
                return (
                  <motion.article
                    key={service.id}
                    id={service.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="group flex flex-col overflow-hidden border border-steel-700/60 bg-steel-900/20 transition-all hover:border-cyan-400/30 hover:bg-steel-900/50"
                  >
                    {service.image && <div className="aspect-[16/10] overflow-hidden"><ContentImage src={service.image} alt={service.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>}
                    <div className="flex flex-1 flex-col p-8">
                      {!service.image && <div className="flex h-14 w-14 items-center justify-center border border-steel-700 text-cyan-400 transition-colors group-hover:border-cyan-400/50"><Icon className="h-7 w-7" strokeWidth={1.5} /></div>}
                      <h2 className={`${service.image ? "" : "mt-6"} font-[family-name:var(--font-display)] text-xl font-bold text-frost-white`}>{service.title}</h2>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-fog-400">{service.description}</p>
                      <button onClick={() => openModal(service)} className="group/btn mt-8 inline-flex items-center gap-2 self-start border border-cyan-400/40 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-400/20">اطلب الخدمة<ArrowLeft className="h-4 w-4 transition-transform group-hover/btn:-translate-x-1" /></button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process section */}
        <section className="border-t border-steel-700/60 bg-steel-900/20 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-16 max-w-xl">
              <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
                كيف نعمل
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-frost-white">
                من الاستشارة حتى التسليم
              </h2>
            </div>

            <div className="relative grid grid-cols-1 gap-px overflow-hidden border border-steel-700/60 bg-steel-700/60 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "01", title: "استشارة مجانية", desc: "نحلل احتياجاتك ونقيّم المساحة المتاحة لتحديد الحل الأمثل." },
                { step: "02", title: "تصميم وتخطيط", desc: "فريقنا الهندسي يُعد مخططات تفصيلية وعرض سعر شفاف." },
                { step: "03", title: "تنفيذ وتركيب", desc: "تنفيذ دقيق بمواد عازلة معتمدة وفق المواصفات الدولية." },
                { step: "04", title: "تشغيل وصيانة", desc: "اختبار شامل قبل التسليم وعقود صيانة دورية تضمن الاستمرارية." },
              ].map(({ step, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-ink-950 p-8"
                >
                  <span className="font-[family-name:var(--font-mono)] text-3xl font-medium text-steel-700">
                    {step}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-frost-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fog-400">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />

      <RequestServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedService={selected}
        services={services}
      />
    </>
  );
}
