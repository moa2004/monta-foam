/**
 * Central source of truth for company/brand info.
 * Public company details are sourced from deployment variables where possible.
 * Only the name, Facebook page, and configured WhatsApp line are confirmed.
 */
export const SITE = {
  name: "Monta Foam",
  nameAr: "مونتا فوم",
  nameEn: "Monta Foam",
  taglineAr: "حلول تخزين بارد متكاملة لصناعتك",
  taglineEn: "Complete Cold Storage Solutions",
  descriptionAr:
    "تصميم وتنفيذ وصيانة غرف التبريد والتجميد والأنظمة الصناعية للتبريد، بخبرة هندسية وجودة تشغيل تثق فيها المصانع والمنشآت الغذائية والدوائية.",
  descriptionEn:
    "Engineering, installation, and maintenance of cold storage rooms, freezing rooms, and industrial cooling systems for food, pharma, and industrial facilities.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "+201129437175",
  phoneDisplay: process.env.NEXT_PUBLIC_COMPANY_PHONE_DISPLAY ?? "011 29437175",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "201129437175",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? "مصر",
  social: {
    facebook: "https://www.facebook.com/share/1EF8EQP5nQ/",
    instagram: "",
    linkedin: "",
  },
  workingHours: process.env.NEXT_PUBLIC_WORKING_HOURS ?? "",
} as const;

export const WHATSAPP_BASE_URL = `https://wa.me/${SITE.whatsappNumber}`;

export const buildWhatsAppLink = (message: string) =>
  `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
