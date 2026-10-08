"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { Role, UserProfileDto } from "@/types/api";

export function CourseCreateForm({ role, teacherId, teachers }: { role: Role; teacherId?: string; teachers: UserProfileDto[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxStudents, setMaxStudents] = useState("30");
  const [selectedTeacher, setSelectedTeacher] = useState(teacherId ?? teachers[0]?.id ?? "");
  const [status, setStatus] = useState<"Open" | "Closed">("Open");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      await clientApis.courses.create({ name, description: description || null, teacherId: selectedTeacher, maxStudents: Number(maxStudents), status });
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to create course.");
    } finally {
      setPending(false);
    }
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center justify-center border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">Create course</button>;
  return <form onSubmit={submit} className="w-full border border-border bg-card p-4 shadow-sm sm:max-w-xl"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Create course</h2><button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button></div><div className="mt-4 grid gap-3"><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Course name" className="h-10 border border-input bg-background px-3 text-sm" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" rows={3} className="border border-input bg-background px-3 py-2 text-sm" /><div className="grid gap-3 sm:grid-cols-2"><input required min="1" type="number" value={maxStudents} onChange={(event) => setMaxStudents(event.target.value)} placeholder="Maximum students" className="h-10 border border-input bg-background px-3 text-sm" /><select value={status} onChange={(event) => setStatus(event.target.value as "Open" | "Closed")} className="h-10 border border-input bg-background px-3 text-sm"><option value="Open">Open</option><option value="Closed">Closed</option></select></div>{role === "Admin" ? <select required value={selectedTeacher} onChange={(event) => setSelectedTeacher(event.target.value)} className="h-10 border border-input bg-background px-3 text-sm"><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName} · {teacher.email}</option>)}</select> : null}{error ? <p className="text-sm text-destructive">{error}</p> : null}<button type="submit" disabled={pending || !selectedTeacher} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{pending ? "Creating..." : "Create course"}</button></div></form>;
}