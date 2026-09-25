"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Images, Pencil, Plus, Save, Trash2, Wrench, X } from "lucide-react";
import ContentImage from "@/components/ContentImage";
import ImageField from "@/components/dashboard/ImageField";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ApiResponse, Project, Service } from "@/types";

type Tab = "projects" | "services";
type ProjectDraft = Pick<Project, "title" | "subtitle" | "image" | "imageAlt" | "sortOrder" | "isActive"> & { id?: string; linkUrl: string };
type ServiceDraft = Pick<Service, "title" | "description" | "isActive"> & { id?: string; image: string };

const emptyProject = (): ProjectDraft => ({
  title: "",
  subtitle: "",
  image: "",
  imageAlt: "",
  linkUrl: "",
  sortOrder: 0,
  isActive: true,
});
const emptyService = (): ServiceDraft => ({ title: "", description: "", image: "", isActive: true });

const errorMessage = (error: unknown) => {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "تعذر حفظ التغييرات. حاول مرة أخرى.";
};

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("projects");
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => (await api.get<ApiResponse<Project[]>>("/projects/admin/all")).data.data,
  });
  const servicesQuery = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => (await api.get<ApiResponse<Service[]>>("/services/admin/all")).data.data,
  });

  const refresh = async (kind: Tab) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [kind === "projects" ? "admin-projects" : "admin-services"] }),
      queryClient.invalidateQueries({ queryKey: [kind] }),
    ]);
  };

  const saveProject = useMutation({
    mutationFn: async (draft: ProjectDraft) => draft.id
      ? api.patch(`/projects/${draft.id}`, draft)
      : api.post("/projects", draft),
    onSuccess: async () => {
      await refresh("projects");
      setProjectDraft(null);
      setError("");
      setMessage("تم حفظ المشروع بنجاح.");
    },
    onError: (caught) => setError(errorMessage(caught)),
  });
  const saveService = useMutation({
    mutationFn: async (draft: ServiceDraft) => draft.id
      ? api.patch(`/services/${draft.id}`, draft)
      : api.post("/services", draft),
    onSuccess: async () => {
      await refresh("services");
      setServiceDraft(null);
      setError("");
      setMessage("تم حفظ الخدمة بنجاح.");
    },
    onError: (caught) => setError(errorMessage(caught)),
  });
  const removeItem = useMutation({
    mutationFn: async ({ kind, id }: { kind: Tab; id: string }) => api.delete(`/${kind}/${id}`),
    onSuccess: async (_, { kind }) => {
      await refresh(kind);
      setError("");
      setMessage(kind === "projects" ? "تم حذف المشروع." : "تم حذف الخدمة.");
    },
    onError: (caught) => setError(errorMessage(caught)),
  });

  const startProjectEdit = (project?: Project) => {
    setMessage("");
    setError("");
    setProjectDraft(project ? {
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      image: project.image,
      imageAlt: project.imageAlt,
      linkUrl: project.linkUrl ?? "",
      sortOrder: project.sortOrder,
      isActive: project.isActive,
    } : emptyProject());
  };
  const startServiceEdit = (service?: Service) => {
    setMessage("");
    setError("");
    setServiceDraft(service ? {
      id: service.id,
      title: service.title,
      description: service.description,
      image: service.image ?? "",
      isActive: service.isActive,
    } : emptyService());
  };

  const confirmDelete = (kind: Tab, id: string) => {
    const label = kind === "projects" ? "المشروع" : "الخدمة";
    if (window.confirm(`هل تريد حذف ${label} نهائيًا؟`)) removeItem.mutate({ kind, id });
  };

  const submitProject = (event: FormEvent) => {
    event.preventDefault();
    if (!projectDraft) return;
    if (!projectDraft.image) {
      setError("أضف صورة المشروع أولًا.");
      return;
    }
    saveProject.mutate({ ...projectDraft, imageAlt: projectDraft.imageAlt.trim() || projectDraft.title.trim() });
  };
  const submitService = (event: FormEvent) => {
    event.preventDefault();
    if (serviceDraft) saveService.mutate(serviceDraft);
  };

  const inputClass = "w-full border border-steel-700 bg-ink-950 px-4 py-3 text-sm text-frost-white placeholder:text-fog-600 focus:border-cyan-400/60 focus:outline-none";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-frost-white">إدارة محتوى الموقع</h1>
        <p className="mt-1 text-sm text-fog-400">أضف الصور والعناوين والوصف، وستظهر التغييرات مباشرة في الموقع.</p>
      </div>

      <div className="flex w-fit border border-steel-700">
        <button onClick={() => setTab("projects")} className={cn("flex items-center gap-2 px-5 py-3 text-sm font-semibold", tab === "projects" ? "bg-cyan-400 text-ink-950" : "text-fog-400 hover:text-white")}>
          <Images className="h-4 w-4" /> آخر الأعمال
        </button>
        <button onClick={() => setTab("services")} className={cn("flex items-center gap-2 px-5 py-3 text-sm font-semibold", tab === "services" ? "bg-cyan-400 text-ink-950" : "text-fog-400 hover:text-white")}>
          <Wrench className="h-4 w-4" /> الخدمات
        </button>
      </div>

      {message && <div className="border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>}
      {error && <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {tab === "projects" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-frost-white">مشروعات آخر الأعمال</h2>
              <p className="mt-1 text-xs text-fog-400">ترتيب أقل يظهر أولًا، وأول مشروع ظاهر يُستخدم أيضًا في صورة الواجهة الرئيسية.</p>
            </div>
            <button onClick={() => startProjectEdit()} className="inline-flex shrink-0 items-center gap-2 bg-cyan-400 px-4 py-3 text-sm font-bold text-ink-950 hover:bg-cyan-300">
              <Plus className="h-4 w-4" /> مشروع جديد
            </button>
          </div>

          {projectDraft && (
            <form onSubmit={submitProject} className="space-y-5 border border-cyan-400/30 bg-steel-900/30 p-5 lg:p-7">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-frost-white">{projectDraft.id ? "تعديل المشروع" : "إضافة مشروع"}</h3>
                <button type="button" onClick={() => setProjectDraft(null)} className="text-fog-400 hover:text-white" aria-label="إغلاق"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <label className="text-sm text-fog-400">العنوان *<input required minLength={2} maxLength={120} value={projectDraft.title} onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })} className={cn(inputClass, "mt-2")} /></label>
                <label className="text-sm text-fog-400">العنوان الفرعي / الوصف المختصر *<input required minLength={2} maxLength={240} value={projectDraft.subtitle} onChange={(e) => setProjectDraft({ ...projectDraft, subtitle: e.target.value })} className={cn(inputClass, "mt-2")} /></label>
                <label className="text-sm text-fog-400">النص البديل للصورة<input maxLength={180} value={projectDraft.imageAlt} onChange={(e) => setProjectDraft({ ...projectDraft, imageAlt: e.target.value })} placeholder="يُستخدم العنوان تلقائيًا إذا تركته فارغًا" className={cn(inputClass, "mt-2")} /></label>
                <label className="text-sm text-fog-400">رابط تفاصيل المشروع<input type="url" value={projectDraft.linkUrl} onChange={(e) => setProjectDraft({ ...projectDraft, linkUrl: e.target.value })} placeholder="https://... (اختياري)" className={cn(inputClass, "mt-2")} /></label>
                <label className="text-sm text-fog-400">الترتيب<input type="number" min={-9999} max={9999} value={projectDraft.sortOrder} onChange={(e) => setProjectDraft({ ...projectDraft, sortOrder: Number(e.target.value) })} className={cn(inputClass, "mt-2")} /></label>
                <label className="flex items-center gap-3 self-end border border-steel-700 px-4 py-3 text-sm text-fog-400"><input type="checkbox" checked={projectDraft.isActive} onChange={(e) => setProjectDraft({ ...projectDraft, isActive: e.target.checked })} className="h-4 w-4 accent-cyan-400" /> إظهار المشروع في الموقع</label>
              </div>
              <ImageField required value={projectDraft.image} onChange={(image) => setProjectDraft({ ...projectDraft, image })} label="صورة المشروع" />
              <button disabled={saveProject.isPending} className="inline-flex items-center gap-2 bg-cyan-400 px-6 py-3 text-sm font-bold text-ink-950 disabled:opacity-60"><Save className="h-4 w-4" />{saveProject.isPending ? "جارٍ الحفظ..." : "حفظ المشروع"}</button>
            </form>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(projectsQuery.data ?? []).map((project) => (
              <article key={project.id} className="overflow-hidden border border-steel-700/60 bg-steel-900/20">
                <div className="relative aspect-[4/3] bg-ink-950"><ContentImage src={project.image} alt={project.imageAlt} className="h-full w-full object-cover" /><span className={cn("absolute right-3 top-3 flex items-center gap-1 px-2 py-1 text-[11px] font-semibold", project.isActive ? "bg-green-500/90 text-white" : "bg-ink-950/90 text-fog-400")}>{project.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{project.isActive ? "ظاهر" : "مخفي"}</span></div>
                <div className="p-5"><h3 className="font-bold text-frost-white">{project.title}</h3><p className="mt-2 line-clamp-2 text-sm text-fog-400">{project.subtitle}</p><p className="mt-3 text-xs text-fog-600">الترتيب: {project.sortOrder}</p><div className="mt-5 flex gap-2"><button onClick={() => startProjectEdit(project)} className="inline-flex flex-1 items-center justify-center gap-2 border border-steel-700 px-3 py-2 text-sm text-frost-white hover:border-cyan-400/50"><Pencil className="h-4 w-4" /> تعديل</button><button onClick={() => confirmDelete("projects", project.id)} className="inline-flex items-center justify-center border border-red-500/30 px-3 py-2 text-red-400 hover:bg-red-500/10" aria-label="حذف"><Trash2 className="h-4 w-4" /></button></div></div>
              </article>
            ))}
          </div>
          {!projectsQuery.isLoading && !projectsQuery.data?.length && <p className="border border-dashed border-steel-700 p-8 text-center text-sm text-fog-400">لا توجد مشروعات. أضف أول مشروع الآن.</p>}
        </section>
      )}

      {tab === "services" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-frost-white">الخدمات</h2><p className="mt-1 text-xs text-fog-400">يمكنك إضافة صورة لكل خدمة أو تركها لتظهر بالأيقونة الحالية.</p></div><button onClick={() => startServiceEdit()} className="inline-flex shrink-0 items-center gap-2 bg-cyan-400 px-4 py-3 text-sm font-bold text-ink-950 hover:bg-cyan-300"><Plus className="h-4 w-4" /> خدمة جديدة</button></div>
          {serviceDraft && (
            <form onSubmit={submitService} className="space-y-5 border border-cyan-400/30 bg-steel-900/30 p-5 lg:p-7">
              <div className="flex items-center justify-between"><h3 className="font-bold text-frost-white">{serviceDraft.id ? "تعديل الخدمة" : "إضافة خدمة"}</h3><button type="button" onClick={() => setServiceDraft(null)} className="text-fog-400 hover:text-white" aria-label="إغلاق"><X className="h-5 w-5" /></button></div>
              <label className="block text-sm text-fog-400">العنوان *<input required minLength={2} maxLength={120} value={serviceDraft.title} onChange={(e) => setServiceDraft({ ...serviceDraft, title: e.target.value })} className={cn(inputClass, "mt-2")} /></label>
              <label className="block text-sm text-fog-400">الوصف *<textarea required minLength={10} maxLength={1000} rows={4} value={serviceDraft.description} onChange={(e) => setServiceDraft({ ...serviceDraft, description: e.target.value })} className={cn(inputClass, "mt-2 resize-y")} /></label>
              <ImageField value={serviceDraft.image} onChange={(image) => setServiceDraft({ ...serviceDraft, image })} label="صورة الخدمة" />
              <label className="flex items-center gap-3 text-sm text-fog-400"><input type="checkbox" checked={serviceDraft.isActive} onChange={(e) => setServiceDraft({ ...serviceDraft, isActive: e.target.checked })} className="h-4 w-4 accent-cyan-400" /> إظهار الخدمة في الموقع</label>
              <button disabled={saveService.isPending} className="inline-flex items-center gap-2 bg-cyan-400 px-6 py-3 text-sm font-bold text-ink-950 disabled:opacity-60"><Save className="h-4 w-4" />{saveService.isPending ? "جارٍ الحفظ..." : "حفظ الخدمة"}</button>
            </form>
          )}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(servicesQuery.data ?? []).map((service) => (
              <article key={service.id} className="overflow-hidden border border-steel-700/60 bg-steel-900/20">
                {service.image ? <div className="aspect-[16/9] bg-ink-950"><ContentImage src={service.image} alt={service.title} className="h-full w-full object-cover" /></div> : <div className="flex aspect-[16/9] items-center justify-center bg-ink-950 text-fog-600"><Wrench className="h-10 w-10" /></div>}
                <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-frost-white">{service.title}</h3><span className={cn("text-[11px]", service.isActive ? "text-green-400" : "text-fog-600")}>{service.isActive ? "ظاهرة" : "مخفية"}</span></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-fog-400">{service.description}</p><div className="mt-5 flex gap-2"><button onClick={() => startServiceEdit(service)} className="inline-flex flex-1 items-center justify-center gap-2 border border-steel-700 px-3 py-2 text-sm text-frost-white hover:border-cyan-400/50"><Pencil className="h-4 w-4" /> تعديل</button><button onClick={() => confirmDelete("services", service.id)} className="inline-flex items-center justify-center border border-red-500/30 px-3 py-2 text-red-400 hover:bg-red-500/10" aria-label="حذف"><Trash2 className="h-4 w-4" /></button></div></div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
