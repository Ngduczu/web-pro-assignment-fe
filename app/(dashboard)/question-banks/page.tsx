import { Suspense } from "react";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { QuestionBankWorkspace } from "@/components/questions/question-bank-workspace";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import type { UserProfileDto } from "@/types/api";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import { AlertBanner, PageHeader } from "@/components/ui/page-chrome";

async function QuestionBanksContent() {
  await connection();
  const { user } = await requireRole("Teacher", "Admin");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);

  let banks;
  let teachers: UserProfileDto[];
  let items;

  try {
    [banks, teachers] = await Promise.all([
      serverApis.questions.listBanks(user.role === "Teacher" ? user.id : undefined),
      user.role === "Admin"
        ? serverApis.users.list({ pageSize: 100 }).then((result) =>
            result.items.filter((item) => item.role === "Teacher" && item.status === "Active"),
          )
        : Promise.resolve([] as UserProfileDto[]),
    ]);
    items = await Promise.all(
      banks.map(async (bank) => ({ bank, questions: await serverApis.questions.listQuestions(bank.id) })),
    );
  } catch {
    return <AlertBanner>{text("Question banks could not be loaded.")}</AlertBanner>;
  }

  const role = user.role === "Teacher" ? "Teacher" : "Admin";

  return (
    <section className="space-y-8">
      <PageHeader
        title={text("Question banks")}
        description={text("Build reusable multiple-choice and fill-in-the-blank questions for examinations.")}
      />
      <QuestionBankWorkspace initialItems={items} userId={user.id} role={role} teachers={teachers} />
    </section>
  );
}

export const instant = false;

export default function QuestionBanksPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <QuestionBanksContent />
    </Suspense>
  );
}
