import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell, CodeBlock } from "@/components/layout/docs-shell";

export const metadata: Metadata = { title: "Docs — Hire Alert" };

export default function DocsPage() {
  return (
    <DocsShell active="/docs" eyebrow="Documentation" title="Welcome to Hire Alert">
      <p className="text-muted-foreground leading-relaxed mb-6">
        Hire Alert is an AI-driven opportunity discovery platform. A pipeline of agents scans
        public sources, deduplicates listings, evaluates each one against your profile, and
        surfaces only opportunities scoring 75% or higher — prioritized by deadline.
      </p>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Quick start</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm mb-6">
        <li><span className="text-foreground font-medium">Create an account</span> — email or Google/GitHub sign-in.</li>
        <li><span className="text-foreground font-medium">Complete your profile</span> — skills, education, preferences. This drives every match score.</li>
        <li><span className="text-foreground font-medium">Run your first scan</span> — hit "Scan Jobs" on the dashboard to trigger the agent pipeline.</li>
        <li><span className="text-foreground font-medium">Review your board</span> — curated matches with fit scores and deadline tiers.</li>
      </ol>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">The agent pipeline</h2>
      <CodeBlock>{`Discovery → Database Update → Deduplication → Eligibility
    → Fit Scoring → Recommendation (≥ 75%) → Notification`}</CodeBlock>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
        Discovery agents fetch by category (jobs, internships, hackathons, scholarships,
        freelance). Eligibility filters against hard constraints (location, work
        authorization, education). The matching agent computes a 0–100 fit score, and only
        results above your threshold are recommended.
      </p>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Fit score components</h2>
      <div className="rounded-xl border border-border overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Component</th>
              <th className="px-4 py-2.5 font-medium">Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-muted-foreground">
            {[["Skills", "40"], ["Role alignment", "25"], ["Education", "15"], ["Location", "10"], ["Experience", "10"], ["Domain interest", "5"]].map(([k, v]) => (
              <tr key={k}><td className="px-4 py-2.5 text-foreground">{k}</td><td className="px-4 py-2.5">{v}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Priority tiers</h2>
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        {[
          { tier: "HIGH", desc: "Deadline within 7 days", cls: "border-red-500/30 bg-red-500/5 text-red-400" },
          { tier: "MEDIUM", desc: "Deadline in 7–15 days", cls: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
          { tier: "LOW", desc: "Deadline beyond 15 days", cls: "border-green-500/30 bg-green-500/5 text-green-400" },
        ].map((t) => (
          <div key={t.tier} className={`rounded-xl border p-4 ${t.cls}`}>
            <p className="font-mono-label text-xs mb-1">{t.tier}</p>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Next steps</h2>
      <ul className="space-y-2 text-sm">
        <li>→ <Link href="/docs/guides" className="text-primary hover:underline">Guides</Link> — profile setup, alerts, and application tracking</li>
        <li>→ <Link href="/docs/api" className="text-primary hover:underline">API Reference</Link> — programmatic access to opportunities</li>
        <li>→ <Link href="/docs/cli" className="text-primary hover:underline">CLI Reference</Link> — command-line scanning (coming soon)</li>
      </ul>
    </DocsShell>
  );
}
