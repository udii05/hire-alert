import Link from "next/link";
import { ArrowRight, Search, Zap, Shield, Check, Play, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2.5"><Logo /><span className="text-2xl font-extrabold font-sans tracking-tight">Hire Alert</span></div>
              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
                <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Demo</a>
              </nav>
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Sign In</Link>
                <Link href="/auth/register"><Button size="lg" className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button></Link>
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero - removed AI bubble, multi-color gradient text */}
          <section className="relative pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] animate-fade-up">
                Land your dream
                <br />
                <span className="text-gradient">career opportunity</span>
              </h1>
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto animate-fade-up-delay-1">
                AI agents discover, filter, and rank opportunities from 500+ sources —
                tailored precisely to your skills, education, and preferences.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
                <Link href="/auth/register">
                  <Button size="lg" className="rounded-full h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90">
                    Start for free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base border-border text-foreground hover:bg-secondary">Sign In</Button>
                </Link>
              </div>
            </div>

            {/* Dashboard Preview - hero stays as is */}
            <div className="relative max-w-5xl mx-auto mt-16 animate-fade-up-delay-3">
              <div className="rounded-2xl border border-border bg-card/80 shadow-violet overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-1.5 px-4 py-1 rounded-md bg-background/60 text-[10px] text-muted-foreground font-mono border border-border">
                      <span className="text-primary">⚡</span> app.hire-alert.com/dashboard
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-44 border-r border-border p-4 space-y-1 hidden sm:block">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"><TrendingUp className="h-3.5 w-3.5" /> Dashboard</div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground text-xs"><Search className="h-3.5 w-3.5" /> Opportunities</div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground text-xs"><Users className="h-3.5 w-3.5" /> Profile</div>
                  </div>
                  <div className="flex-1 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div><div className="h-4 w-40 bg-secondary rounded mb-2" /><div className="h-3 w-60 bg-secondary/60 rounded" /></div>
                      <div className="h-8 w-24 bg-primary/20 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ label: "Saved", val: "24", color: "bg-primary/10 text-primary" }, { label: "Applied", val: "12", color: "bg-green-500/10 text-green-400" }, { label: "Offers", val: "3", color: "bg-amber-500/10 text-amber-400" }].map((s) => (
                        <div key={s.label} className="rounded-xl border border-border p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="h-2.5 w-14 bg-secondary rounded" />
                            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}><TrendingUp className="h-4 w-4" /></div>
                          </div>
                          <div className="text-2xl font-bold font-heading">{s.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section id="features" className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-xs font-mono-label text-primary mb-3">Features</p>
                <h2 className="text-4xl font-bold font-heading tracking-tight">Everything you need</h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">A complete platform to discover, track, and land your next career opportunity.</p>
              </div>

              {/* Feature 1 */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-5"><Search className="h-6 w-6" /></div>
                  <h3 className="text-2xl font-bold font-heading mb-3">Multi-source AI discovery</h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">AI agents scan LinkedIn, Naukri, Internshala, GitHub, Kaggle, Unstop, and more — 500+ sources, all day, every day.</p>
                  <ul className="space-y-2.5">
                    {["500+ job boards & platforms", "Real-time opportunity detection", "Automatic deduplication", "Daily freshness validation"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" /> {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rainbow-border rounded-2xl">
                  <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono ml-2">hire-alert — zsh</span>
                    </div>
                    <div className="p-5 font-mono text-sm space-y-0.5">
                      <p className="terminal-line px-2 py-1 text-muted-foreground">$ hire-alert scan --sources all</p>
                      <button className="terminal-line w-full text-left px-2 py-1 text-primary hover:bg-primary/5 rounded transition-colors">→ Scanning LinkedIn... <span className="text-muted-foreground">142 found</span></button>
                      <button className="terminal-line w-full text-left px-2 py-1 text-primary hover:bg-primary/5 rounded transition-colors">→ Scanning Naukri... <span className="text-muted-foreground">89 found</span></button>
                      <button className="terminal-line w-full text-left px-2 py-1 text-primary hover:bg-primary/5 rounded transition-colors">→ Scanning Internshala... <span className="text-muted-foreground">67 found</span></button>
                      <button className="terminal-line w-full text-left px-2 py-1 text-primary hover:bg-primary/5 rounded transition-colors">→ Scanning GitHub... <span className="text-muted-foreground">34 found</span></button>
                      <p className="terminal-line px-2 py-1 text-muted-foreground">────────────────────</p>
                      <button className="terminal-line w-full text-left px-2 py-1 text-green-400 hover:bg-green-500/5 rounded transition-colors font-medium">✓ 344 opportunities discovered</button>
                      <button className="terminal-line w-full text-left px-2 py-1 text-green-400 hover:bg-green-500/5 rounded transition-colors">✓ Deduplication: 38 removed</button>
                      <button className="terminal-line w-full text-left px-2 py-1 text-green-400 hover:bg-green-500/5 rounded transition-colors">✓ Freshness: 282 valid</button>
                      <p className="terminal-line px-2 py-1 text-muted-foreground">$ <span className="blink text-primary">▋</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                <div className="order-2 lg:order-1">
                  <div className="rainbow-border rounded-2xl">
                    <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono ml-2">AI Fit Analysis</span>
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="text-center">
                          <div className="text-5xl font-extrabold font-sans text-white">94%</div>
                          <p className="text-xs text-muted-foreground mt-1">Overall match</p>
                          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: "94%" }} /></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-mono-label text-green-400 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Matched</p>
                          <div className="flex flex-wrap gap-1.5">
                            {["React", "TypeScript", "Node.js", "Python"].map((s) => (
                              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-colors">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-mono-label text-amber-400 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Learning</p>
                          <div className="flex flex-wrap gap-1.5">
                            {["Kubernetes", "GraphQL"].map((s) => (
                              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-colors">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-5"><Zap className="h-6 w-6" /></div>
                  <h3 className="text-2xl font-bold font-heading mb-3">AI-powered fit scores</h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">Every opportunity is scored 0-100% based on your profile and Only opportunities scoring 75% or higher are shown.</p>
                  <ul className="space-y-2.5">
                    {["Detailed match breakdown", "Matched & missing skills", "Personalized ranking", "Fit explanations"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" /> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-5"><Shield className="h-6 w-6" /></div>
                  <h3 className="text-2xl font-bold font-heading mb-3">Application tracking</h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">Track every application from saved to offer. Pipeline view, deadline alerts, and weekly analytics.</p>
                  <ul className="space-y-2.5">
                    {["Full pipeline tracking", "Deadline reminders", "Weekly insights", "Visual analytics"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" /> {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rainbow-border rounded-2xl">
                  <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono ml-2">Pipeline</span>
                    </div>
                    <div className="p-4 bg-card grid grid-cols-3 gap-3">
                      {[
                        { title: "Saved", count: 3, color: "bg-primary/10 border-primary/20" },
                        { title: "Applied", count: 2, color: "bg-green-500/10 border-green-500/20" },
                        { title: "Interview", count: 1, color: "bg-amber-500/10 border-amber-500/20" },
                      ].map((col) => (
                        <div key={col.title} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{col.title}</span>
                            <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-1.5">{col.count}</span>
                          </div>
                          {Array.from({ length: col.count }).map((_, i) => (
                            <button key={i} className="w-full text-left rounded-lg border p-2.5 bg-card hover:bg-secondary/50 transition-colors">
                              <div className="h-2 w-full bg-secondary/60 rounded mb-1.5" />
                              <div className="h-1.5 w-2/3 bg-secondary/40 rounded mb-1.5" />
                              <div className="flex items-center gap-1">
                                <div className="w-4 h-4 rounded bg-secondary/40" />
                                <div className="h-1.5 w-14 bg-secondary/40 rounded" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How it works - fixed padding to prevent cutoff */}
          <section id="how-it-works" className="py-24 px-4 bg-secondary/20">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <p className="text-xs font-mono-label text-primary mb-3">How it works</p>
                <h2 className="text-4xl font-bold font-heading tracking-tight">Get started in minutes</h2>
                <p className="mt-4 text-muted-foreground text-lg">Three simple steps to your next opportunity.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 pt-4">
                {[
                  { num: "01", title: "Create your profile", desc: "Add your skills, education, and preferences. Takes just 2 minutes.", icon: Users, steps: ["Fill in education", "Add your skills", "Set preferences"] },
                  { num: "02", title: "AI finds matches", desc: "Our agents scan 500+ sources and rank opportunities by fit.", icon: Zap, steps: ["Agents discover", "AI scores each match", "Ranked results"] },
                  { num: "03", title: "Apply & track", desc: "Apply with one click and track your entire pipeline.", icon: TrendingUp, steps: ["Review matches", "Track applications", "Get alerts"] },
                ].map((item) => (
                  <div key={item.num} className="rainbow-border rounded-2xl">
                    <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-soft-lg transition-all">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-mono-label w-fit mb-4">
                        <Play className="h-3 w-3" /> Step {item.num}
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div>
                        <h3 className="text-lg font-semibold font-heading">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                      <div className="space-y-2">
                        {item.steps.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Check className="h-2.5 w-2.5 text-primary" /></div>
                            <span className="text-muted-foreground">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Demo Video */}
          <section id="demo" className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-mono-label text-primary mb-3">See it in action</p>
                <h2 className="text-4xl font-bold font-heading tracking-tight">Watch how it works</h2>
                <p className="mt-4 text-muted-foreground text-lg">A quick tour of the Hire Alert experience.</p>
              </div>
              <div className="rainbow-border rounded-2xl">
                <div className="rounded-2xl border border-border bg-card shadow-violet overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                      <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                      <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                    </div>
                    <div className="flex-1 flex justify-center"><span className="text-[10px] text-muted-foreground font-mono">Hire Alert Demo — Quick Tour</span></div>
                  </div>
                  <div className="relative aspect-video bg-[#0a0a0f] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
                    <div className="w-full max-w-lg space-y-6 px-8">
                      {[{ n: "1", title: "Create profile in 2 min", sub: "Skills, education, preferences" }, { n: "2", title: "AI discovers 500+ opportunities", sub: "Scans LinkedIn, Naukri, GitHub & more" }, { n: "3", title: "Get ranked matches with fit scores", sub: "Know exactly how good each fit is" }, { n: "4", title: "Apply & track your pipeline", sub: "From saved to offer, all in one place" }].map((item, i) => (
                        <div key={item.n} className={`flex items-start gap-4 animate-fade-up-delay-${i + 1}`}>
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary-foreground">{item.n}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors group">
                        <Play className="h-6 w-6 text-primary-foreground ml-1 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA - dark/black background */}
          <section className="py-24 px-4">
            <div className="max-w-5xl mx-auto">
              <div className="rainbow-border rounded-3xl">
                <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0f] px-8 py-16 text-center border border-border">
                  <div className="absolute inset-0 bg-grid opacity-5" />
                  <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[80px]" />
                  <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px]" />
                  <div className="relative">
                    <h2 className="text-4xl font-bold font-heading text-gradient tracking-tight">Ready to find your next opportunity?</h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">Join thousands of students and professionals discovering better career matches, every day.</p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link href="/auth/register">
                        <Button size="lg" className="rounded-full h-12 px-10 text-base bg-primary text-primary-foreground hover:bg-primary/90">Get started free <ArrowRight className="ml-2 h-5 w-5" /></Button>
                      </Link>
                      <Link href="/auth/login">
                        <Button size="lg" variant="ghost" className="rounded-full h-12 px-8 text-base text-muted-foreground hover:bg-secondary">Sign in</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 px-4 bg-secondary/20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Hire Alert · All Rights Reserved</p>
            <span className="inline-flex items-center gap-2 text-xs text-primary font-medium px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Beta Testing in Progress
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}