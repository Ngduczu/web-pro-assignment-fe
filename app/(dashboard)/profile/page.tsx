import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { ProfileSettingsWorkspace } from "@/components/profile/profile-settings-workspace";

export const instant = false;

export default async function ProfilePage() {
  await connection();
  const { user } = await requireAuth();

  return (
    <ProfileSettingsWorkspace user={user} />
  );
}
