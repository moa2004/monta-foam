import type { Service } from "@/types";

/**
 * Fallback/placeholder service catalog — mirrors the backend seed data
 * (prisma/seed.ts) so the frontend renders correctly even before the
 * API is connected. Once /services is live, components should prefer
 * the fetched data and fall back to this only on error.
 */
export const FALLBACK_SERVICES: Service[] = [
  {
    id: "cold-storage-rooms",
    slug: "cold-storage-rooms",
    title: "غرف التخزين البارد",
    description:
      "غرف تخزين بارد مصممة خصيصًا لكل عميل، توفر تحكمًا دقيقًا في درجة الحرارة وكفاءة عالية في استهلاك الطاقة، مناسبة للأغذية والأدوية والاستخدامات الصناعية.",
    image: null,
    isActive: true,
  },
  {
    id: "freezing-rooms",
    slug: "freezing-rooms",
    title: "غرف التجميد",
    description:
      "غرف تجميد عالية الأداء مصممة هندسيًا للحفظ العميق للمواد القابلة للتلف عند درجات حرارة تحت الصفر.",
    image: null,
    isActive: true,
  },
  {
    id: "industrial-cooling-systems",
    slug: "industrial-cooling-systems",
    title: "أنظمة التبريد الصناعي",
    description:
      "حلول تبريد صناعية واسعة النطاق مصممة خصيصًا للمستودعات والمصانع ومراكز التوزيع.",
    image: null,
    isActive: true,
  },
  {
    id: "maintenance-services",
    slug: "maintenance-services",
    title: "خدمات الصيانة",
    description:
      "صيانة دورية وطارئة لأنظمة التبريد والتجميد لضمان استمرارية التشغيل بكفاءة وموثوقية.",
    image: null,
    isActive: true,
  },
  {
    id: "installation-services",
    slug: "installation-services",
    title: "خدمات التركيب",
    description:
      "تركيب احترافي شامل لمعدات التبريد والتجميد على يد مهندسين معتمدين، من التصميم حتى التشغيل.",
    image: null,
    isActive: true,
  },
];
