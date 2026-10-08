"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import { useLanguage } from "@/lib/i18n";
import type { MaterialDto } from "@/types/api";

const copy = {
  en: { title: "Materials", description: "Files attached to this lesson.", upload: "Upload material", uploading: "Uploading...", empty: "No materials are attached yet.", working: "Working...", download: "Download", remove: "Remove", removeConfirm: "Remove this material?", downloadError: "Unable to download this material.", uploadError: "Unable to upload this material.", removeError: "Unable to remove this material.", fileTooLarge: "The material must be 20 MB or smaller." },
  vi: { title: "Tài liệu", description: "Các tệp được đính kèm vào bài học này.", upload: "Tải tài liệu lên", uploading: "Đang tải lên...", empty: "Bài học chưa có tài liệu đính kèm.", working: "Đang xử lý...", download: "Tải xuống", remove: "Xóa", removeConfirm: "Xóa tài liệu này?", downloadError: "Không thể tải tài liệu này xuống.", uploadError: "Không thể tải tài liệu này lên.", removeError: "Không thể xóa tài liệu này.", fileTooLarge: "Tài liệu không được vượt quá 20 MB." },
};

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
    <section className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">{text.title}</h2><p className="mt-1 text-sm text-muted-foreground">{text.description}</p></div>{canManage ? <label className="cursor-pointer border border-border px-3 py-2 text-sm font-medium hover:bg-muted"><input type="file" className="sr-only" onChange={upload} disabled={uploading} />{uploading ? text.uploading : text.upload}</label> : null}</div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!materials.length ? <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">{text.empty}</div> : <div className="divide-y divide-border border-y border-border">{materials.map((material) => <div key={material.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-medium">{material.fileName}</p><p className="text-xs text-muted-foreground">{material.contentType} · {fileSize(material.fileSize)}</p></div><div className="flex items-center gap-3"><button type="button" onClick={() => download(material)} disabled={busyId === material.id} className="text-sm font-medium text-primary hover:underline disabled:opacity-50">{busyId === material.id ? text.working : text.download}</button>{canManage ? <button type="button" onClick={() => remove(material)} disabled={busyId === material.id} className="text-sm text-destructive hover:underline disabled:opacity-50">{text.remove}</button> : null}</div></div>)}</div>}
    </section>
  );
}
