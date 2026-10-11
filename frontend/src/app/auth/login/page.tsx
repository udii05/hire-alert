"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { toast.error("Invalid email or password"); return; }
      router.push("/dashboard");
      router.refresh();
    } catch { toast.error("Something went wrong"); } finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Grid */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.02]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
        <div className="relative flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-xl font-extrabold font-sans">Hire Alert</span>
          </Link>
          <div className="space-y-8">
            <h2 className="text-4xl font-bold font-heading leading-tight">Your AI-powered career discovery platform</h2>
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
      <div className="flex-1 flex flex-col bg-background relative z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <Logo />
            <span className="text-lg font-extrabold font-sans">Hire Alert</span>
          </Link>
          <Link href="/auth/register" className="text-sm font-medium text-primary hover:text-primary/80 ml-auto">Create account</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold font-heading tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">Sign in to your Hire Alert account</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="h-11 rounded-xl" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account? <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}