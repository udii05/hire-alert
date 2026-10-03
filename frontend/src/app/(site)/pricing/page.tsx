import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Pricing — Hire Alert" };

const tiers = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Everything you need to find your next opportunity.",
    cta: { label: "Start for free", href: "/auth/register" },
    features: [
      "Complete profile & skill tracking",
      "AI fit scores on every opportunity",
      "75%+ curated \"For You\" board",
      "Application pipeline tracking",
      "In-app deadline alerts",
      "Email alerts for HIGH-priority roles",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "Coming soon",
    period: "",
    tagline: "For power users who want every edge.",
    cta: { label: "Join the waitlist", href: "/contact" },
    features: [
      "Everything in Free",
      "Unlimited scans & instant refresh",
      "Advanced match explanations",
      "Priority source coverage",
      "Weekly analytics digest",
      "Early access to new agents",
    ],
    highlight: true,
  },
  {
    name: "Team / Campus",
    price: "Custom",
    period: "",
    tagline: "For clubs, cells, and placement offices.",
    cta: { label: "Talk to us", href: "/contact" },
    features: [
      "Everything in Pro",
      "Shared dashboards & analytics",
      "Bulk onboarding",
      "Custom source configuration",
      "Dedicated support",
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-mono-label text-primary mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading tracking-tight">
            Simple, honest <span className="text-gradient">pricing</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Hire Alert is free during beta. Paid tiers are being planned — your feedback shapes them.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div key={tier.name} className={tier.highlight ? "rainbow-border rounded-2xl" : ""}>
              <div
                className={`rounded-2xl border p-6 flex flex-col h-full ${
                  tier.highlight ? "border-border bg-card shadow-violet" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold font-heading">{tier.name}</h2>
                  {tier.highlight && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Sparkles className="h-3 w-3" /> Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-5">{tier.tagline}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold font-sans">{tier.price}</span>
                  {tier.period && <span className="text-sm text-muted-foreground ml-2">/ {tier.period}</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.cta.href}
                  className={`block text-center rounded-xl h-11 leading-[2.75rem] text-sm font-medium transition-colors ${
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  {tier.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Questions about pricing? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> or read the{" "}
          <Link href="/faq" className="text-primary hover:underline">FAQ</Link>.
        </p>
      </div>
    </section>
  );
}
