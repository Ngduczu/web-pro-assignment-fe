import { Suspense } from "react";
import { connection } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { serverApis } from "@/lib/api/server-apis";
import { QuestionBankWorkspace } from "@/components/questions/question-bank-workspace";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { getServerLanguage, translate } from "@/lib/i18n-server";
import { AlertBanner, PageHeader } from "@/components/ui/page-chrome";

async function QuestionBanksContent() {
  await connection();
  const { user } = await requireRole("Teacher", "Admin", "System");
  const language = await getServerLanguage();
  const text = (value: string) => translate(language, value);

  let banks;
  let items;

  try {
    banks = await serverApis.questions.listBanks(user.role === "Teacher" ? user.id : undefined);
    items = await Promise.all(
      banks.map(async (bank) => ({ bank, questions: await serverApis.questions.listQuestions(bank.id) })),
    );
  } catch {
    return <AlertBanner>{text("Question banks could not be loaded.")}</AlertBanner>;
  }

  const role = user.role === "Teacher" ? "Teacher" : user.role === "System" ? "System" : "Admin";

  return (
    <section className="space-y-8">
      <PageHeader
        title={text("Question banks")}
        description={text("Build reusable multiple-choice and fill-in-the-blank questions for examinations.")}
        mascotSrc="/assets/owlie/code.webp"
      />
      <QuestionBankWorkspace initialItems={items} userId={user.id} role={role} />
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
