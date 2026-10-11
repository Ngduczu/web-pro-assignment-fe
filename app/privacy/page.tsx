import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how SFIT Study handles account data, course information, authentication cookies, assessment records, and student privacy in the LMS platform.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | SFIT Study",
    description:
      "Privacy and data handling information for SFIT Study, including account, learning, and assessment data practices.",
    url: "https://sfit-study.ducvu.site/privacy",
    siteName: "SFIT Study",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | SFIT Study",
    description:
      "Privacy and data handling information for SFIT Study, including account, learning, and assessment data practices.",
  },
};

const sections = [
  {
    id: "overview",
    title: "Overview",
    body:
      "SFIT Study is a learning management platform designed to support student learning, course delivery, assessment, and communication between learners, teachers, and administrators. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you while using the platform.",
  },
  {
    id: "information-collected",
    title: "Information we collect",
    body:
      "We may collect account information such as your name, email address, profile details, role, and login status. We also process course-related information such as enrollments, assignments, assessment submissions, exam attempts, question-bank activity, feedback, and progress records necessary to operate the learning experience. If you contact support or participate in platform communication, we may also retain the information you provide for service and security purposes.",
  },
  {
    id: "how-we-use-data",
    title: "How we use your data",
    body:
      "We use personal and learning data to authenticate access, manage accounts, provide course content, grade assignments and exams, support teacher workflows, improve teaching and learning operations, and maintain the security and reliability of the platform. Data is used only for legitimate educational and operational purposes related to the SFIT Study service.",
  },
  {
    id: "cookies-session",
    title: "Cookies and session information",
    body:
      "SFIT Study uses secure session cookies to keep you signed in and to maintain the language preference of your interface. Authentication cookies are used to validate access to protected pages and API requests. We also use cookies for basic session continuity and platform usability. These cookies do not sell your personal information to third parties and are not used for advertising purposes.",
  },
  {
    id: "data-sharing",
    title: "Data sharing and third parties",
    body:
      "We do not sell personal data. Information may be shared only with authorized educational and operational personnel who need it to provide the service, such as teachers managing courses or administrators maintaining platform security. When required by law or to protect the safety and integrity of the platform, we may disclose data to appropriate authorities or service providers operating under strict privacy and security controls.",
  },
  {
    id: "retention",
    title: "Retention and deletion",
    body:
      "We retain data for as long as needed to deliver education services, maintain account records, satisfy compliance obligations, resolve disputes, and support legitimate operational needs. If an account is closed or a user requests account removal in accordance with applicable policy, we will take reasonable steps to delete or restrict data when no longer required for business or legal reasons.",
  },
  {
    id: "security",
    title: "Security measures",
    body:
      "We use reasonable technical, administrative, and organizational safeguards to protect account and learning data against unauthorized access, misuse, alteration, or disclosure. These measures include encrypted communication, session controls, role-based access, and access restrictions for administrative functions. No system is completely risk-free, so we continually review our security practices and improve protections where needed.",
  },
  {
    id: "your-rights",
    title: "Your rights and choices",
    body:
      "You may be able to update personal information from your profile, change notification preferences, or manage session access within the platform. If you believe your data is inaccurate or you wish to request access, correction, or deletion, contact the platform administrator or support team using the official contact information provided by your institution or service owner.",
  },
  {
    id: "changes",
    title: "Policy updates",
    body:
      "This Privacy Policy may be updated from time to time to reflect product changes, new legal requirements, or improvements to how we protect user information. The latest version will be published on this page with an updated revision date so that users can review the current practices.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy | SFIT Study",
            description:
              "Privacy and data handling information for SFIT Study, including account, learning, and assessment data practices.",
            url: "https://sfit-study.ducvu.site/privacy",
            inLanguage: "en",
            publisher: {
              "@type": "Organization",
              name: "SFIT Study",
            },
          }),
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">SFIT Study</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
          </div>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            Back to home
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <nav aria-label="Privacy policy sections" className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Contents
              </p>
              <ul className="space-y-2 text-sm">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-muted-foreground transition hover:text-primary">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <p className="text-base leading-8 text-muted-foreground">
                This Privacy Policy describes how SFIT Study collects, uses, stores, and protects information
                in connection with the learning platform. By using the platform, you agree to the practices described
                here and to any applicable institutional or educational policies.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">Last updated: October 11, 2026</p>
            </section>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">{section.body}</p>
              </section>
            ))}

            <section id="contact" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                If you have questions about this Privacy Policy or would like to request information about your data,
                please contact the system administrator or institution responsible for the SFIT Study service.
              </p>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
