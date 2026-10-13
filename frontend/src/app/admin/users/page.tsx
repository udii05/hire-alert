import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, CalendarDays, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#a78bfa" /><stop offset="0.5" stopColor="#22d3ee" /><stop offset="1" stopColor="#ec4899" /></linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11" stroke="url(#g)" strokeWidth="2" />
      <line x1="24" y1="24" x2="32" y2="32" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="11" y="12" width="10" height="8" rx="1.5" fill="#a78bfa" />
      <rect x="13" y="14" width="6" height="1.5" rx="0.5" fill="white" opacity="0.8" />
      <rect x="13" y="17" width="4" height="1.5" rx="0.5" fill="white" opacity="0.5" />
    </svg>
  );
}

const providerBadge: Record<string, { label: string; className: string }> = {
  CREDENTIALS: { label: "Email", className: "border-violet-500/40 bg-violet-500/10 text-violet-300" },
  GOOGLE: { label: "Google", className: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300" },
  GITHUB: { label: "GitHub", className: "border-pink-500/40 bg-pink-500/10 text-pink-300" },
};

export default async function AdminUsersPage() {
  // --- Access control (fail-closed) ---
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if (!isAdminEmail(session.user.email)) notFound(); // 404, not 403 — don't advertise the route exists

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      authProvider: true,
      emailVerified: true,
      createdAt: true,
      profile: { select: { college: true, skills: true } },
    },
  });

  const now = Date.now();
  const last7days = users.filter((u) => now - u.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000).length;

  const stats = [
    { icon: Users, label: "Total users", value: String(users.length) },
    { icon: CalendarDays, label: "Signed up (last 7 days)", value: String(last7days) },
    { icon: Mail, label: "Emails verified", value: String(users.filter((u) => u.emailVerified).length) },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background - same treatment as landing/auth pages */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-xl font-jetbrains font-bold uppercase tracking-tight">Hire Alert</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Admin &middot; {session.user.email}</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold font-heading tracking-tight text-gradient">User Registry</h1>
          <p className="mt-2 text-muted-foreground">Everyone who has signed up for Hire Alert, newest first.</p>

          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rainbow-border rounded-2xl">
                <div className="rounded-2xl bg-card/80 backdrop-blur-xl p-5 shadow-violet flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/25">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-heading">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Users table */}
          <div className="mt-8 rainbow-border rounded-3xl">
            <div className="rounded-3xl bg-card/80 backdrop-blur-xl shadow-violet overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-6 py-4 font-mono-label text-xs">Name</th>
                      <th className="px-6 py-4 font-mono-label text-xs">Email</th>
                      <th className="px-6 py-4 font-mono-label text-xs">Provider</th>
                      <th className="px-6 py-4 font-mono-label text-xs">Verified</th>
                      <th className="px-6 py-4 font-mono-label text-xs">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No users yet — signups will appear here in real time.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const p = providerBadge[u.authProvider ?? "CREDENTIALS"] ?? providerBadge.CREDENTIALS;
                        return (
                          <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/40 transition-colors">
                            <td className="px-6 py-4 font-medium">{u.name ?? <span className="text-muted-foreground">—</span>}</td>
                            <td className="px-6 py-4 text-muted-foreground font-mono">{u.email ?? "—"}</td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={p.className}>{p.label}</Badge>
                            </td>
                            <td className="px-6 py-4">
                              {u.emailVerified
                                ? <span className="text-green-400">Yes</span>
                                : <span className="text-muted-foreground">No</span>}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                              {u.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
