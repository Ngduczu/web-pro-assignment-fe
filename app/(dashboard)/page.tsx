import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { StudentHome } from "@/components/dashboard/student-home";
import { TeacherHome } from "@/components/dashboard/teacher-home";
import { AdminHome } from "@/components/dashboard/admin-home";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const { user } = await requireAuth();

  if (user.role === "Admin") return <AdminHome />;
  if (user.role === "Teacher") return <TeacherHome />;
  return <StudentHome />;
}
