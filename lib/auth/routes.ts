import type { Role } from "@/types/api";

export function roleHome(role: Role) {
  if (role === "Admin") return "/admin";
  if (role === "Teacher") return "/teacher";
  return "/student";
}
