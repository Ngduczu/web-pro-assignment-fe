"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, UserRound } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { clientApis } from "@/lib/api/client-apis";
import type { AccountStatus, Role, UserProfileDto } from "@/types/api";

export function UserManagement({ initialUsers, total, search, embedded = false }: { initialUsers: UserProfileDto[]; total: number; search: string; embedded?: boolean }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfileDto>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Student");

  function startCreate() { setEditing(undefined); setFullName(""); setEmail(""); setPhone(""); setPassword(""); setRole("Student"); setError(undefined); setOpen(true); }
  function startEdit(user: UserProfileDto) { setEditing(user); setFullName(user.fullName); setEmail(user.email); setPhone(user.phone ?? ""); setRole(user.role); setError(undefined); setOpen(true); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(undefined);
    try {
      if (editing) {
        const updated = await clientApis.users.update(editing.id, { fullName, phone: phone || null, role });
        setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      } else {
        const created = await clientApis.users.create({ email, fullName, phone: phone || null, password, role });
        setUsers((current) => [created, ...current]);
      }
      setOpen(false); router.refresh();
    } catch (caught) { setError(caught instanceof ApiError ? caught.detail : "Unable to save user."); } finally { setBusy(false); }
  }

  async function updateStatus(user: UserProfileDto, status: AccountStatus) {
    setBusy(true); setError(undefined);
    try { const updated = await clientApis.users.updateStatus(user.id, { status }); setUsers((current) => current.map((item) => item.id === updated.id ? updated : item)); } catch (caught) { setError(caught instanceof ApiError ? caught.detail : "Unable to update account status."); } finally { setBusy(false); }
  }

  return <>
    {!embedded ? <button type="button" onClick={startCreate} className="inline-flex h-10 items-center justify-center gap-2 border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Add user</button> : <div className="space-y-4"><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold tracking-tight">Directory</h2><p className="mt-1 text-sm text-muted-foreground">{total} account{total === 1 ? "" : "s"} found{search ? ` for "${search}"` : ""}.</p></div><button type="button" onClick={startCreate} className="inline-flex h-10 items-center gap-2 border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"><Plus className="size-4" />Add user</button></div>{error ? <p className="border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}{!users.length ? <p className="border border-dashed border-border p-6 text-sm text-muted-foreground">No users found.</p> : <div className="overflow-x-auto border border-border"><table className="w-full min-w-[50rem] text-left text-sm"><thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-border">{users.map((user) => <tr key={user.id} className="hover:bg-muted/20"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center bg-primary/10 text-sm font-semibold text-primary">{user.fullName.slice(0, 1).toUpperCase()}</span><div><p className="font-medium">{user.fullName}</p><p className="text-xs text-muted-foreground">{user.email}</p></div></div></td><td className="px-4 py-4">{user.role}</td><td className="px-4 py-4"><span className={user.status === "Active" ? "text-emerald-700" : "text-muted-foreground"}>{user.status}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => startEdit(user)} className="border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">Edit</button><button type="button" disabled={busy || user.role === "Admin"} onClick={() => updateStatus(user, user.status === "Active" ? "Inactive" : "Active")} className="border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">{user.status === "Active" ? "Disable" : "Activate"}</button></div></td></tr>)}</tbody></table></div>}</div>}
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div className="absolute inset-0 bg-foreground/30 backdrop-blur-[3px]" /><form onSubmit={submit} role="dialog" aria-modal="true" className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto border border-border bg-card p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><UserRound className="size-5 text-primary" /><h2 className="mt-3 text-xl font-semibold">{editing ? "Edit user" : "Add user"}</h2><p className="mt-1 text-sm text-muted-foreground">{editing ? "Update account details and role." : "Create an active account."}</p></div><button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Close</button></div><div className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-medium">Full name<input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label>{!editing ? <label className="grid gap-2 text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label> : null}{!editing ? <label className="grid gap-2 text-sm font-medium">Temporary password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label> : null}<label className="grid gap-2 text-sm font-medium">Phone <span className="font-normal text-muted-foreground">(optional)</span><input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-10 border border-input bg-background px-3 font-normal" /></label><label className="grid gap-2 text-sm font-medium">Role<select value={role} onChange={(event) => setRole(event.target.value as Role)} className="h-10 border border-input bg-background px-3 font-normal"><option value="Student">Student</option><option value="Teacher">Teacher</option><option value="Admin">Admin</option></select></label>{error ? <p className="text-sm text-destructive">{error}</p> : null}</div><div className="mt-6 flex justify-end gap-3 border-t border-border pt-4"><button type="button" onClick={() => setOpen(false)} className="border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button><button type="submit" disabled={busy} className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{busy ? "Saving..." : editing ? "Save changes" : "Create user"}</button></div></form></div> : null}
  </>;
}
