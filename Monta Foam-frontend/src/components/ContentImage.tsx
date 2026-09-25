import type { ImgHTMLAttributes } from "react";

type ContentImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string;
  alt: string;
};

export default function ContentImage({ src, alt, ...props }: ContentImageProps) {
  // Content managers may use a local path, a remote URL, or an optimized uploaded data URL.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />;
}
