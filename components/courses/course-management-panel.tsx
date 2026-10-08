"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { CourseDto, EnrollmentDto } from "@/types/api";

export function CourseManagementPanel({ course: initialCourse, enrollments: initialEnrollments }: { course: CourseDto; enrollments: EnrollmentDto[] }) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialCourse.name);
  const [description, setDescription] = useState(initialCourse.description ?? "");
  const [maxStudents, setMaxStudents] = useState(String(initialCourse.maxStudents));
  const [status, setStatus] = useState(initialCourse.status);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function saveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError(undefined);
    try {
      const updated = await clientApis.courses.update(course.id, { name, description: description || null, maxStudents: Number(maxStudents), status });
      setCourse(updated); setEditing(false); router.refresh();
    } catch (caught) { setError(caught instanceof ApiError ? caught.detail : "Unable to update course."); } finally { setPending(false); }
  }

  async function removeCourse() {
    if (!window.confirm("Delete this course? It will be soft-deleted.")) return;
    setPending(true); setError(undefined);
    try { await clientApis.courses.remove(course.id); router.push("/courses"); router.refresh(); } catch (caught) { setError(caught instanceof ApiError ? caught.detail : "Unable to delete course."); setPending(false); }
  }

  async function transition(enrollment: EnrollmentDto, action: "accept" | "reject" | "revoke") {
    setPending(true); setError(undefined);
    try {
      const updated = await clientApis.enrollments[action](enrollment.id);
      setEnrollments((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (caught) { setError(caught instanceof ApiError ? caught.detail : "Unable to update enrollment."); } finally { setPending(false); }
  }

  return <div className="space-y-6"><div className="flex flex-wrap gap-3"><button type="button" onClick={() => setEditing((current) => !current)} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted">{editing ? "Close editor" : "Edit course"}</button><button type="button" onClick={removeCourse} disabled={pending} className="border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50">Delete course</button></div>{editing ? <form onSubmit={saveCourse} className="max-w-xl space-y-3 border border-border bg-card p-4"><input required value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full border border-input bg-background px-3 text-sm" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full border border-input bg-background px-3 py-2 text-sm" /><div className="grid gap-3 sm:grid-cols-2"><input required min="1" type="number" value={maxStudents} onChange={(event) => setMaxStudents(event.target.value)} className="h-10 border border-input bg-background px-3 text-sm" /><select value={status} onChange={(event) => setStatus(event.target.value as CourseDto["status"])} className="h-10 border border-input bg-background px-3 text-sm"><option value="Open">Open</option><option value="Closed">Closed</option></select></div><button type="submit" disabled={pending} className="h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{pending ? "Saving..." : "Save changes"}</button></form> : null}{error ? <p className="text-sm text-destructive">{error}</p> : null}<section className="max-w-3xl space-y-4"><div><h2 className="text-lg font-semibold">Enrollment requests</h2><p className="mt-1 text-sm text-muted-foreground">Review students requesting access to this course.</p></div>{!enrollments.length ? <p className="border border-dashed border-border p-5 text-sm text-muted-foreground">No enrollment records yet.</p> : <div className="divide-y divide-border border-y border-border">{enrollments.map((enrollment) => <div key={enrollment.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{enrollment.student?.fullName ?? enrollment.studentId}</p><p className="text-sm text-muted-foreground">{enrollment.student?.email ?? "Student"} · {enrollment.status}</p></div><div className="flex gap-2">{enrollment.status === "Waiting" ? <><button type="button" onClick={() => transition(enrollment, "accept")} disabled={pending} className="border border-emerald-600/30 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-500/10 disabled:opacity-50">Accept</button><button type="button" onClick={() => transition(enrollment, "reject")} disabled={pending} className="border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50">Reject</button></> : null}{enrollment.status === "Accepted" ? <button type="button" onClick={() => transition(enrollment, "revoke")} disabled={pending} className="border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50">Revoke</button> : null}</div></div>)}</div>}</section></div>;
}