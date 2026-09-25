"use client";

import { useState, type ChangeEvent } from "react";
import { ImagePlus, Link as LinkIcon, LoaderCircle, Trash2 } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import { optimizeImage } from "@/lib/image-upload";

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export default function ImageField({ value, onChange, label = "الصورة", required = false }: ImageFieldProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      onChange(await optimizeImage(file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر تجهيز الصورة.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-frost-white">
        {label}{required ? " *" : ""}
      </label>
      {value && (
        <div className="relative mb-3 aspect-[16/9] max-w-md overflow-hidden border border-steel-700 bg-ink-950">
          <ContentImage src={value} alt="معاينة الصورة" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center bg-ink-950/90 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
            aria-label="حذف الصورة"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/20">
          {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {processing ? "جارٍ تجهيز الصورة" : "رفع صورة"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} disabled={processing} className="sr-only" />
        </label>
        <div className="relative">
          <LinkIcon className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-fog-600" />
          <input
            value={value.startsWith("data:") ? "" : value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={value.startsWith("data:") ? "تم رفع الصورة من الجهاز" : "أو ضع رابط الصورة"}
            className="w-full border border-steel-700 bg-ink-950 py-3 pl-3 pr-10 text-sm text-frost-white placeholder:text-fog-600 focus:border-cyan-400/60 focus:outline-none"
          />
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-fog-600">يتم ضغط الصور تلقائيًا قبل الحفظ. الحد الأقصى للملف الأصلي 12 ميجابايت.</p>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
