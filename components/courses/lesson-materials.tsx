"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, Eye, X } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import { useLanguage } from "@/lib/i18n";
import type { MaterialDto } from "@/types/api";

const copy = {
  en: { title: "Materials", description: "Files attached to this lesson.", upload: "Upload material", uploading: "Uploading...", empty: "No materials are attached yet.", working: "Working...", preview: "Preview", closePreview: "Close preview", download: "Download", remove: "Remove", removeConfirm: "Remove this material?", downloadError: "Unable to download this material.", uploadError: "Unable to upload this material.", removeError: "Unable to remove this material.", fileTooLarge: "The material must be 20 MB or smaller." },
  vi: { title: "Tài liệu", description: "Các tệp được đính kèm vào bài học này.", upload: "Tải tài liệu lên", uploading: "Đang tải lên...", empty: "Bài học chưa có tài liệu đính kèm.", working: "Đang xử lý...", preview: "Xem trước", closePreview: "Đóng bản xem trước", download: "Tải xuống", remove: "Xóa", removeConfirm: "Xóa tài liệu này?", downloadError: "Không thể tải tài liệu này xuống.", uploadError: "Không thể tải tài liệu này lên.", removeError: "Không thể xóa tài liệu này.", fileTooLarge: "Tài liệu không được vượt quá 20 MB." },
};

type MaterialPreview = { name: string; contentType: string; url: string };

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LessonMaterials({ lessonId, materials: initialMaterials, canManage }: { lessonId: string; materials: MaterialDto[]; canManage: boolean }) {
  const { language } = useLanguage();
  const text = copy[language];
  const [materials, setMaterials] = useState(initialMaterials);
  const [busyId, setBusyId] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [preview, setPreview] = useState<MaterialPreview>();

  useEffect(() => {
    const url = preview?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [preview]);

  function canPreview(material: MaterialDto) {
    return material.contentType === "application/pdf" || material.contentType.startsWith("image/");
  }

  async function openPreview(material: MaterialDto) {
    setBusyId(material.id);
    setError(undefined);
    try {
      const blob = await clientApis.lessons.getMaterialContent(material.id);
      setPreview({ name: material.fileName, contentType: material.contentType, url: URL.createObjectURL(blob) });
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.downloadError);
    } finally {
      setBusyId(undefined);
    }
  }

  async function download(material: MaterialDto) {
    setBusyId(material.id);
    setError(undefined);
    try {
      const blob = await clientApis.lessons.getMaterialContent(material.id, true);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = material.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.downloadError);
    } finally {
      setBusyId(undefined);
    }
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size >= 20_000_000) {
      setError(text.fileTooLarge);
      return;
    }
    setUploading(true);
    setError(undefined);
    try {
      const material = await clientApis.lessons.uploadMaterial(lessonId, file);
      setMaterials((current) => [...current, material]);
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.uploadError);
    } finally {
      setUploading(false);
    }
  }

  async function remove(material: MaterialDto) {
    if (!window.confirm(text.removeConfirm)) return;
    setBusyId(material.id);
    setError(undefined);
    try {
      await clientApis.lessons.removeMaterial(material.id);
      setMaterials((current) => current.filter((item) => item.id !== material.id));
    } catch (caught) {
      setError(language === "en" && caught instanceof ApiError ? caught.detail : text.removeError);
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <>
      <section className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-sm font-semibold">{text.title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{text.description}</p></div>
          {canManage ? <label className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-border px-3 text-xs font-semibold transition-colors hover:bg-muted"><input type="file" className="sr-only" onChange={upload} disabled={uploading} />{uploading ? text.uploading : text.upload}</label> : null}
        </div>
        {error ? <p role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}
        {!materials.length ? <div className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{text.empty}</div> : <ul className="mt-4 space-y-2">{materials.map((material) => <li key={material.id} className="min-w-0 rounded-xl border border-border/80 p-3">
          <p className="wrap-break-word text-sm font-medium">{material.fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{material.contentType} · {fileSize(material.fileSize)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {canPreview(material) ? <button type="button" onClick={() => openPreview(material)} disabled={busyId === material.id} className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:opacity-50"><Eye className="size-3.5" />{busyId === material.id ? text.working : text.preview}</button> : null}
            <button type="button" onClick={() => download(material)} disabled={busyId === material.id} className="inline-flex min-h-8 items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"><Download className="size-3.5" />{text.download}</button>
            {canManage ? <button type="button" onClick={() => remove(material)} disabled={busyId === material.id} className="min-h-8 text-xs text-destructive hover:underline disabled:opacity-50">{text.remove}</button> : null}
          </div>
        </li>)}</ul>}
      </section>

      {preview ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-2 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="lesson-material-preview-title">
        <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
            <h2 id="lesson-material-preview-title" className="min-w-0 wrap-break-word text-sm font-semibold">{preview.name}</h2>
            <button type="button" onClick={() => setPreview(undefined)} aria-label={text.closePreview} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-muted"><X className="size-5" /></button>
          </header>
          <div className="relative min-h-[55vh] flex-1 bg-muted/30 sm:min-h-[70vh]">
            {preview.contentType === "application/pdf" ? <iframe title={preview.name} src={preview.url} className="absolute inset-0 size-full border-0" /> : <Image src={preview.url} alt={preview.name} fill unoptimized sizes="(max-width: 768px) 100vw, 90vw" className="object-contain p-3" />}
          </div>
        </div>
      </div> : null}
    </>
  );
}
