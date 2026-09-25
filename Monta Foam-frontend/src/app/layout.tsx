import type { Metadata } from "next";
import { Cairo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import Providers from "@/components/Providers";

const display = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-readout",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nameAr} | حلول غرف التبريد والتجميد`,
    template: `%s | ${SITE.nameAr}`,
  },
  description: SITE.descriptionAr,
  keywords: ["غرف تبريد", "غرف تجميد", "تبريد صناعي", "مونتا فوم", "صيانة غرف التبريد"],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    siteName: SITE.name,
    title: `${SITE.nameAr} | حلول غرف التبريد والتجميد`,
    description: SITE.descriptionAr,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.nameAr,
    description: SITE.descriptionAr,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-ink-950 text-frost-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
