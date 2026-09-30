"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { toast } from "sonner";

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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); setIsLoading(false); return; }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) { const data = await response.json(); toast.error(data.error || "Registration failed"); return; }
      toast.success("Account created successfully");
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.ok) { router.push("/profile"); router.refresh(); }
    } catch { toast.error("Something went wrong"); } finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1a1035 100%)" }}>
        <div className="absolute inset-0 bg-grid opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />

        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-xl font-extrabold font-sans">Hire Alert</span>
          </Link>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold font-heading leading-tight">
              Start your personalized career discovery journey
            </h2>
            <div className="space-y-4">
              {[
                { icon: Sparkles, text: "AI agents scan 500+ sources daily" },
                { icon: Zap, text: "Smart matching with fit scores" },
                { icon: Target, text: "Personalized recommendations" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <item.icon className="h-5 w-5 text-violet-300" />
                  </div>
                  <span className="text-white/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/40">&copy; 2026 Hire Alert. All Rights Reserved. | July 2026</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <Logo />
            <span className="text-lg font-extrabold font-sans">Hire Alert</span>
          </Link>
          <Link href="/auth/login" className="text-sm font-medium text-primary hover:text-primary/80 ml-auto">
            Sign in
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-heading tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">Get started with personalized career discovery</p>
            </div>

            <div className="mb-6 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
              Only jobs with a <span className="font-semibold text-primary">75% or higher AI match score</span> are shown, sourced from 500+ verified platforms.
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => signIn("google", { callbackUrl: "/profile" })} disabled={isLoading}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => signIn("github", { callbackUrl: "/profile" })} disabled={isLoading}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-3 text-muted-foreground">Or register with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="h-11 rounded-xl" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}