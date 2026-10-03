import type { Metadata } from "next";
import { DocsShell } from "@/components/layout/docs-shell";

export const metadata: Metadata = { title: "Guides — Hire Alert" };

const guides = [
  {
    id: "profile",
    title: "Set up a profile that gets matched",
    desc: "Your fit scores are only as good as your profile. What to fill first and what matters most.",
    body: "Start with skills — they carry 40% of every match score. Add languages, frameworks, databases, and tools under their real names (\"React\", not \"web stuff\"). Then set preferred roles and locations: role alignment is worth 25%. Education and experience fill the remaining 35%. A fully completed profile typically surfaces 3–5× more matches than a partial one.",
  },
  {
    id: "scores",
    title: "Understanding fit scores",
    desc: "Why an opportunity scored what it did — and how to raise your numbers.",
    body: "Every score is a weighted sum: skills (40), role alignment (25), education (15), location (10), experience (10), domain interest (5). Opportunity detail pages show matched and missing skills, so you can see exactly what pushed a score below your 75% threshold. Adding a missing skill to your profile re-scores opportunities on the next scan.",
  },
  {
    id: "alerts",
    title: "Never miss a deadline",
    desc: "How priority tiers and email alerts work, and how to tune them.",
    body: "Opportunities enter HIGH priority when their deadline is within 7 days. The system re-checks every two hours and sends an in-app notification plus an email digest for saved HIGH-priority items. Filter your board by priority, or sort by deadline to work the closest first.",
  },
  {
    id: "tracking",
    title: "Track your application pipeline",
    desc: "From saved to offer — keeping your job hunt organized.",
    body: "Save anything interesting, mark Applied when you submit, and Not Interested to remove noise permanently. Your Applied and Saved views give you per-stage counts, and deadline alerts fire only for opportunities still in play.",
  },
];

export default function GuidesPage() {
  return (
    <DocsShell active="/docs/guides" eyebrow="Developer" title="Guides">
      <p className="text-muted-foreground leading-relaxed mb-8">
        Practical walkthroughs for getting the most out of Hire Alert.
      </p>

      <div className="space-y-6">
        {guides.map((g) => (
          <article key={g.id} id={g.id} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold font-heading mb-1">{g.title}</h2>
            <p className="text-sm text-primary mb-3">{g.desc}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{g.body}</p>
          </article>
        ))}
      </div>
    </DocsShell>
  );
}
