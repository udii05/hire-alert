import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Code, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Contact — Hire Alert" };

const channels = [
  {
    icon: Mail,
    title: "Email",
    desc: "For support, partnerships, or pricing questions.",
    action: { label: "hello@hire-alert.com", href: "mailto:hello@hire-alert.com" },
  },
  {
    icon: Code,
    title: "GitHub",
    desc: "Report bugs or request features on the public repository.",
    action: { label: "Open an issue", href: "https://github.com/udii05/hire-alert/issues" },
  },
  {
    icon: MessageSquare,
    title: "In-app feedback",
    desc: "Spotted something wrong on your board? Tell us from the dashboard.",
    action: { label: "Go to dashboard", href: "/dashboard" },
  },
];

export default function ContactPage() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono-label text-primary mb-3">Company</p>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading tracking-tight">
            Get in <span className="text-gradient">touch</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            We read everything during beta. Most messages get a reply within one business day.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {channels.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 flex flex-col">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                <c.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold font-heading mb-1">{c.title}</h2>
              <p className="text-sm text-muted-foreground flex-1 mb-4">{c.desc}</p>
              <Link href={c.action.href} className="text-sm font-medium text-primary hover:underline break-words">
                {c.action.label}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Team is distributed (IST) · Typical response time: &lt; 24h
        </div>
      </div>
    </section>
  );
}
