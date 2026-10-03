import type { Metadata } from "next";
import Link from "next/link";
import { DocsShell, CodeBlock } from "@/components/layout/docs-shell";

export const metadata: Metadata = { title: "CLI Reference — Hire Alert" };

export default function CliDocsPage() {
  return (
    <DocsShell active="/docs/cli" eyebrow="Developer" title="CLI Reference">
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-muted-foreground mb-6">
        <span className="font-medium text-primary">Early preview.</span> The Hire Alert CLI is
        in development. The commands below reflect the planned interface and may change before
        release.
      </div>

      <h2 className="text-xl font-semibold font-heading mt-6 mb-3">Installation</h2>
      <CodeBlock>{`npm install -g hire-alert-cli
hire-alert auth login`}</CodeBlock>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Commands</h2>
      <div className="rounded-xl border border-border overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Command</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-muted-foreground">
            {[
              ["hire-alert scan", "Run the discovery pipeline for your profile"],
              ["hire-alert scan --sources all", "Scan every configured source"],
              ["hire-alert list --priority HIGH", "List opportunities by priority tier"],
              ["hire-alert save <id>", "Save an opportunity to your pipeline"],
              ["hire-alert status", "Show your profile completeness and match stats"],
              ["hire-alert auth login", "Sign in with your Hire Alert account"],
            ].map(([cmd, desc]) => (
              <tr key={cmd}>
                <td className="px-4 py-2.5 font-mono text-foreground text-xs">{cmd}</td>
                <td className="px-4 py-2.5">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Example</h2>
      <CodeBlock>{`$ hire-alert scan --sources all

→ Scanning LinkedIn...     142 found
→ Scanning Remotive...      89 found
→ Scanning Devpost...       67 found
────────────────────
✓ 344 opportunities discovered
✓ 38 duplicates removed
✓ 28 results above your 75% threshold`}</CodeBlock>

      <p className="text-sm text-muted-foreground mt-6">
        Want early access? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.
      </p>
    </DocsShell>
  );
}
