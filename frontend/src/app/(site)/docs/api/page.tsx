import type { Metadata } from "next";
import { DocsShell, CodeBlock } from "@/components/layout/docs-shell";

export const metadata: Metadata = { title: "API Reference — Hire Alert" };

export default function ApiDocsPage() {
  return (
    <DocsShell active="/docs/api" eyebrow="Developer" title="API Reference">
      <p className="text-muted-foreground leading-relaxed mb-6">
        Hire Alert exposes a REST API for opportunity data and agent workflows. The public
        API is being stabilized during beta — interactive docs (OpenAPI/Swagger) ship with
        the production launch.
      </p>

      <h2 className="text-xl font-semibold font-heading mt-6 mb-3">Base URL</h2>
      <CodeBlock>{`https://api.hire-alert.com`}</CodeBlock>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Authentication</h2>
      <p className="text-sm text-muted-foreground mb-3">
        All requests require an API key in the <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-xs">X-API-Key</code> header.
        Keys are issued per account (beta access by request).
      </p>
      <CodeBlock>{`curl https://api.hire-alert.com/api/opportunities \\
  -H "X-API-Key: <your-key>"`}</CodeBlock>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Endpoints</h2>
      <div className="rounded-xl border border-border overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium">Method</th>
              <th className="px-4 py-2.5 font-medium">Path</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-muted-foreground">
            {[
              ["GET", "/api/opportunities", "List active opportunities (filter: type, limit, offset)"],
              ["GET", "/api/opportunities/{id}", "Fetch a single opportunity"],
              ["POST", "/api/agents/trigger", "Run the discovery pipeline for a user"],
              ["GET", "/api/agents/status/{job_id}", "Poll pipeline execution status"],
              ["GET", "/health", "Service health check"],
            ].map(([m, p, d]) => (
              <tr key={p}>
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{m}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">{p}</td>
                <td className="px-4 py-2.5">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Example response</h2>
      <CodeBlock>{`{
  "opportunities": [
    {
      "id": "cm9x...",
      "title": "Machine Learning Engineer",
      "company": "Acme AI",
      "type": "JOB",
      "location": "Remote",
      "deadline": "2026-10-20T23:59:00Z",
      "source": "remotive",
      "skills": ["python", "pytorch", "ml"]
    }
  ],
  "total": 282,
  "limit": 20,
  "offset": 0
}`}</CodeBlock>

      <h2 className="text-xl font-semibold font-heading mt-8 mb-3">Rate limits</h2>
      <p className="text-sm text-muted-foreground">
        30 requests per minute per key on beta access. Production limits will be published
        with the launch.
      </p>
    </DocsShell>
  );
}
