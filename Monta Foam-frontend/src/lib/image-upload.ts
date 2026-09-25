const MAX_DATA_URL_LENGTH = 1_750_000;
const MAX_EDGE = 1400;

const loadImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error("تعذر قراءة ملف الصورة."));
  };
  image.src = url;
});

export async function optimizeImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("اختَر ملف صورة صالحًا.");
  if (file.size > 12 * 1024 * 1024) throw new Error("حجم الصورة الأصلية يجب ألا يزيد عن 12 ميجابايت.");

  const source = await loadImage(file);
  const ratio = Math.min(1, MAX_EDGE / Math.max(source.naturalWidth, source.naturalHeight));
  const width = Math.max(1, Math.round(source.naturalWidth * ratio));
  const height = Math.max(1, Math.round(source.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("المتصفح لا يدعم تجهيز الصورة.");
  context.drawImage(source, 0, 0, width, height);

  for (const quality of [0.82, 0.72, 0.62, 0.52]) {
    const result = canvas.toDataURL("image/webp", quality);
    if (result.length <= MAX_DATA_URL_LENGTH) return result;
  }
  throw new Error("الصورة كبيرة جدًا بعد الضغط. استخدم صورة بأبعاد أصغر.");
}
