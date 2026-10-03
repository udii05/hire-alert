import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ — Hire Alert" };

const faqs = [
  {
    q: "How does the 75% match threshold work?",
    a: "Every opportunity is scored 0–100 against your profile across six weighted components: skills (40), role alignment (25), education (15), location (10), experience (10), and domain interest (5). Only matches at or above 75% appear on your \"For You\" board, so you never waste time on roles that were never for you.",
  },
  {
    q: "Where do the opportunities come from?",
    a: "Our agents aggregate listings from 13+ public sources including LinkedIn, Remotive, Jobicy, Arbeitnow, Devpost, MLH, Unstop, Kaggle, GitHub, and more — then deduplicate them across overlapping platforms so you see each opportunity once.",
  },
  {
    q: "Is Hire Alert free?",
    a: "Yes — everything is free during beta. See the pricing page for how paid tiers will work once they launch.",
  },
  {
    q: "How do alerts work?",
    a: "Opportunities are bucketed by deadline: HIGH (under 7 days), MEDIUM (7–15 days), and LOW (15+ days). When something you saved enters the HIGH zone, you get an in-app notification immediately and an email digest if alerts are enabled. The system re-checks deadlines every two hours.",
  },
  {
    q: "Do I need to upload my resume?",
    a: "No — the matching engine works from your profile (skills, education, preferences). The resume and portfolio fields are for your own tracking and future parsing features.",
  },
  {
    q: "What happens to my data?",
    a: "Your profile data is used only to score opportunities for you. We never sell it or share it with employers. You can update or remove your data any time from your profile page. See the privacy policy for details.",
  },
  {
    q: "Can I track applications outside Hire Alert?",
    a: "Yes. Marking an opportunity as Saved, Applied, or Not Interested keeps your pipeline current. Full stage tracking (Interview → Offer) is on the roadmap.",
  },
  {
    q: "How do I get support or report a bug?",
    a: "Use the contact page, or open an issue on our GitHub repository. We read everything during beta.",
  },
];

export default function FaqPage() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono-label text-primary mb-3">FAQ</p>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading tracking-tight">
            Frequently asked <span className="text-gradient">questions</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything about matching, sources, alerts, and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border bg-card px-5 py-4 open:shadow-soft"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-sm font-medium">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none shrink-0">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Still stuck? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> — or check the{" "}
          <Link href="/docs" className="text-primary hover:underline">docs</Link>.
        </p>
      </div>
    </section>
  );
}
