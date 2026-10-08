"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { ExerciseDto, SubmissionDto } from "@/types/api";

export function ExerciseWorkspace({ exercise: initialExercise, submission: initialSubmission, submissions: initialSubmissions, canManage }: { exercise: ExerciseDto; submission?: SubmissionDto; submissions: SubmissionDto[]; canManage: boolean }) {
  const [exercise, setExercise] = useState(initialExercise);
  const [submission, setSubmission] = useState(initialSubmission);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [grade, setGrade] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  async function upload(file: File) {
    setBusy(true);
    setError(undefined);
    try {
      setSubmission(await clientApis.assignments.uploadSubmission(exercise.id, file));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to upload submission.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!submission) return;
    setBusy(true);
    setError(undefined);
    try {
      setSubmission(await clientApis.assignments.submit(submission.id));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to submit this assignment.");
    } finally {
      setBusy(false);
    }
  }

  async function unsubmit() {
    if (!submission) return;
    setBusy(true);
    setError(undefined);
    try {
      setSubmission(await clientApis.assignments.unsubmit(submission.id));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to reopen this assignment.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(action: "publish" | "close") {
    setBusy(true);
    setError(undefined);
    try {
      setExercise(await clientApis.assignments[action](exercise.id));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to update exercise status.");
    } finally {
      setBusy(false);
    }
  }

  async function gradeSubmission(item: SubmissionDto) {
    const value = Number(grade[item.id]);
    if (!Number.isFinite(value)) {
      setError("Enter a numeric grade.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const updated = await clientApis.assignments.grade(item.id, { grade: value, feedback: feedback[item.id] || null });
      setSubmissions((current) => current.map((candidate) => candidate.id === updated.id ? updated : candidate));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.detail : "Unable to grade this submission.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-8">
    {error ? <p className="border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{error}</p> : null}
    {canManage ? <div className="flex flex-wrap gap-3">{exercise.status === "Draft" ? <button type="button" onClick={() => changeStatus("publish")} disabled={busy} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">Publish exercise</button> : null}{exercise.status === "Published" ? <button type="button" onClick={() => changeStatus("close")} disabled={busy} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">Close exercise</button> : null}</div> : <div className="max-w-2xl space-y-4 border-y border-border py-5"><h2 className="font-semibold">Your submission</h2>{submission ? <div className="space-y-3"><p className="text-sm text-muted-foreground">Status: {submission.status}{submission.grade !== null ? ` · Grade: ${submission.grade}/10` : ""}</p>{submission.feedback ? <p className="text-sm text-muted-foreground">Feedback: {submission.feedback}</p> : null}<div className="flex flex-wrap gap-3">{submission.status === "Draft" ? <button type="button" onClick={submit} disabled={busy} className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Submit assignment</button> : null}{submission.status === "Submitted" && (!exercise.dueAt || new Date(exercise.dueAt) > new Date()) ? <button type="button" onClick={unsubmit} disabled={busy} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">Unsubmit</button> : null}</div></div> : <p className="text-sm text-muted-foreground">Upload a file to create your draft submission.</p>}<label className="inline-flex cursor-pointer border border-border px-4 py-2 text-sm font-medium hover:bg-muted"><input type="file" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file); }} disabled={busy || exercise.status !== "Published"} />{busy ? "Working..." : "Upload submission"}</label></div>}
    {canManage ? <div className="max-w-3xl space-y-4"><h2 className="text-lg font-semibold">Submissions</h2>{!submissions.length ? <p className="border border-dashed border-border p-5 text-sm text-muted-foreground">No submitted work yet.</p> : <div className="divide-y divide-border border-y border-border">{submissions.map((item) => <div key={item.id} className="space-y-3 py-4"><p className="text-sm text-muted-foreground">Student {item.studentId} · {item.status}{item.grade !== null ? ` · ${item.grade}/10` : ""}</p><div className="grid gap-3 sm:grid-cols-[8rem_1fr_auto]"><input type="number" min="0" max="10" step="0.1" value={grade[item.id] ?? item.grade ?? ""} onChange={(event) => setGrade((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Grade" className="h-10 border border-input bg-background px-3 text-sm" /><input value={feedback[item.id] ?? item.feedback ?? ""} onChange={(event) => setFeedback((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Feedback" className="h-10 border border-input bg-background px-3 text-sm" /><button type="button" onClick={() => gradeSubmission(item)} disabled={busy} className="border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">Save grade</button></div></div>)}</div>}</div> : null}
  </div>;
}
