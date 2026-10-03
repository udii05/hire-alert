import Link from "next/link";

const docsLinks = [
  { label: "Overview", href: "/docs" },
  { label: "CLI Reference", href: "/docs/cli" },
  { label: "API Reference", href: "/docs/api" },
  { label: "Guides", href: "/docs/guides" },
];

export function DocsNav({ active }: { active: string }) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <nav className="sticky top-24 space-y-1">
        <p className="text-xs font-mono-label text-muted-foreground mb-3">Documentation</p>
        {docsLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block text-sm rounded-lg px-3 py-2 transition-colors ${
              active === link.href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function DocsShell({
  active,
  eyebrow,
  title,
  children,
}: {
  active: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto flex gap-12">
        <DocsNav active={active} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono-label text-primary mb-3">{eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight mb-4">{title}</h1>
          {children}
        </div>
      </div>
    </section>
  );
}

export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="rounded-xl border border-border bg-[#0a0a0f] p-4 text-sm font-mono text-muted-foreground overflow-x-auto my-4">
      {children}
    </pre>
  );
}
