import type { Role } from "@/types/api";

export function isAdministratorRole(role: Role): role is "Admin" | "System" {
  return role === "Admin" || role === "System";
}