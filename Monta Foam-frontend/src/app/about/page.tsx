import { CheckCircle2, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PageHeader from "@/components/PageHeader";
import { SITE } from "@/lib/constants";

const STATS = [
  { value: "٥", label: "سنوات منذ تأسيس الشركة" },
  { value: "٢٨", label: "عامًا من الخبرة في المجال" },
  { value: "٣", label: "مراحل: تصميم وتنفيذ وصيانة" },
  { value: "٧", label: "مشروعات بارزة بعد التأسيس" },
];

const COMPLETED_PROJECTS = [
  "مخازن التبريد بجمرك ٦ أكتوبر بمدينة السادس من أكتوبر",
  "المستودعات الاستراتيجية لوزارة التموين والتجارة بمدينة السويس",
  "عنابر التجميد بمركز الغردقة للتجميد والتبريد",
  "مصنع الأجبان بمزرعة ميلكز بالكيلو ٧١ طريق الإسكندرية الصحراوي",
  "غرف التجميد بمجزرة جزارة أنس بالجيزة",
  "عنابر التجميد وأنفاق التجميد ومحطة فرز وتعبئة الفواكه والخضروات بشركة فارو التبريد بالدقهلية",
  "أبواب خلايا التكييف بمزارع المهندس عمر عبد الظاهر بالطريق الصحراوي الإسكندرية",
];

const TEAM = [
  { name: "التصميم والتخطيط", title: "حساب الأحمال واختيار مكونات المنظومة" },
  { name: "التنفيذ والتركيب", title: "تجهيز الغرف والوحدات وتشغيلها" },
  { name: "الصيانة والدعم", title: "فحص الأعطال والصيانة الدورية" },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader
          eyebrow="من نحن"
          title="خبرة هندسية في خدمة صناعتك"
          description="تأسست الشركة منذ ٥ سنوات بخبرة تمتد إلى ٢٨ عامًا في مجال غرف التبريد والتجميد، من التصميم إلى التنفيذ والصيانة."
        />

        {/* Story + Mission */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
              <div>
                <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
                  قصتنا
                </span>
                <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-frost-white">
                  بُنيت على الخبرة الهندسية الحقيقية
                </h2>
                <div className="mt-5 flex flex-col gap-4 text-sm leading-7 text-fog-400">
                  <p>
                    تأسست مونتا فوم منذ ٥ سنوات، مستندة إلى خبرة تمتد إلى ٢٨ عامًا في مجال غرف التبريد والتجميد، وتقدم حلولًا متكاملة تبدأ من التصميم وتصل إلى التنفيذ والصيانة.
                  </p>
                  <p>
                    نؤمن أن التبريد الصناعي الموثوق ليس رفاهية بل ضرورة تشغيلية — لذلك نضع الدقة الهندسية والموثوقية في صدارة كل مشروع نتولى تنفيذه.
                  </p>
                  <p>
                    نخدم احتياجات المنشآت الغذائية واللوجستية والصناعية بحلول تُصمم بحسب المساحة ودرجة الحرارة وطبيعة التشغيل المطلوبة.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-8">
                {[
                  {
                    eyebrow: "رسالتنا",
                    body: "توفير حلول تبريد وتجميد صناعية متكاملة وموثوقة تخدم الصناعة المصرية بأعلى مستويات الجودة الهندسية وأفضل نسب كفاءة الطاقة.",
                  },
                  {
                    eyebrow: "رؤيتنا",
                    body: "أن نكون الشريك الهندسي الأول لمنشآت التخزين البارد والتجميد في مصر والمنطقة، من خلال الابتكار المستمر والخدمة المتميزة.",
                  },
                ].map(({ eyebrow, body }) => (
                  <div
                    key={eyebrow}
                    className="border-r-2 border-cyan-400/40 bg-steel-900/20 py-6 pr-6"
                  >
                    <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
                      {eyebrow}
                    </span>
                    <p className="mt-3 text-sm leading-7 text-fog-400">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-steel-700/60 bg-steel-900/20 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-steel-700/60 bg-steel-700/60 lg:grid-cols-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center bg-ink-950 px-8 py-12 text-center">
                  <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold text-cyan-400">
                    {value}
                  </span>
                  <span className="mt-3 text-sm text-fog-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Completed projects */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="max-w-3xl">
              <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
                سابقة أعمالنا
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-frost-white">
                أعمال تم إنجازها بعد تأسيس الشركة
              </h2>
              <p className="mt-4 text-sm leading-7 text-fog-400">
                نفّذ فريقنا مشروعات متنوعة في التخزين المبرد والتجميد وتجهيز المنشآت بعدة محافظات مصرية.
              </p>
            </div>

            <ul className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {COMPLETED_PROJECTS.map((project) => (
                <li
                  key={project}
                  className="flex items-start gap-4 border border-steel-700/60 bg-steel-900/20 p-6 text-sm leading-7 text-fog-400"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-400" strokeWidth={1.5} />
                  <span>{project}</span>
                </li>
              ))}
            </ul>

            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-400 hover:bg-cyan-400/20"
            >
              تابع أحدث أعمالنا على فيسبوك
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Team */}
        <section className="border-t border-steel-700/60 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-14">
              <span className="font-[family-name:var(--font-mono)] text-xs tracking-widest text-cyan-400">
                فريقنا
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-frost-white">
                تخصصات فريق العمل
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map(({ name, title }) => (
                <div
                  key={name}
                  className="border border-steel-700/60 bg-steel-900/20 p-8 transition-colors hover:border-cyan-400/30"
                >
                  <div className="flex h-16 w-16 items-center justify-center border border-steel-700 font-[family-name:var(--font-display)] text-xl font-bold text-cyan-400">
                    {name.split(" ")[1]?.[0] ?? "م"}
                  </div>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-base font-bold text-frost-white">
                    {name}
                  </h3>
                  <p className="mt-1 text-sm text-fog-400">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
