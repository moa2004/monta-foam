"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/constants";

export default function WhatsAppButton() {
  const link = buildWhatsAppLink("مرحباً، أرغب في الاستفسار عن خدمات التخزين البارد.");

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="group fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_24px_rgba(37,211,102,0.4)] transition-transform hover:scale-110 focus-visible:scale-110"
    >
      <MessageCircle className="h-7 w-7 fill-white text-white" strokeWidth={0} />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30 group-hover:opacity-0" />
    </a>
  );
}
