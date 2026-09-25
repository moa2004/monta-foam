export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="frost-grain relative border-b border-steel-700/60 pb-20 pt-40">
      <div className="pointer-events-none absolute -top-20 right-[-10%] h-[400px] w-[400px] rounded-full bg-frost-600/15 blur-[120px]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-10">
        <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
          {eyebrow}
        </span>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-frost-white sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-fog-400">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
