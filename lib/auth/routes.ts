import type { Role } from "@/types/api";

export function roleHome(_role?: Role) {
  void _role;
  return "/";
}
