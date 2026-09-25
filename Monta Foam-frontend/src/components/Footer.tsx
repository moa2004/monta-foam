import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import FacebookIcon from "./icons/FacebookIcon";
import LogoMark from "./LogoMark";
import { SITE } from "@/lib/constants";

const FOOTER_LINKS = [
  {
    heading: "الشركة",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/services", label: "خدماتنا" },
      { href: "/contact", label: "اتصل بنا" },
    ],
  },
  {
    heading: "خدماتنا",
    links: [
      { href: "/services#cold-storage-rooms", label: "غرف التخزين البارد" },
      { href: "/services#freezing-rooms", label: "غرف التجميد" },
      { href: "/services#industrial-cooling-systems", label: "أنظمة التبريد الصناعي" },
      { href: "/services#maintenance-services", label: "خدمات الصيانة" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-steel-700/60 bg-steel-900/40">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <LogoMark className="text-cyan-400" />
              <span className="font-[family-name:var(--font-display)] text-lg font-bold">
                {SITE.name}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-fog-400">
              {SITE.descriptionAr}
            </p>
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="فيسبوك"
              className="mt-6 inline-flex h-10 w-10 items-center justify-center border border-steel-700 text-fog-400 transition-colors hover:border-cyan-400 hover:text-cyan-400"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-frost-white">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fog-400 transition-colors hover:text-cyan-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-frost-white">
              تواصل معنا
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-fog-400">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                <span dir="ltr" className="text-right">{SITE.phoneDisplay}</span>
              </li>
              {SITE.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span dir="ltr" className="text-right">{SITE.email}</span>
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                {SITE.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-steel-700/60 pt-8 text-xs text-fog-600 md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. جميع الحقوق محفوظة.</p>
          <p className="font-[family-name:var(--font-mono)] tracking-wide">
            ENGINEERED FOR COLD
          </p>
        </div>
      </div>
    </footer>
  );
}
