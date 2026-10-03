import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SiteFooter } from "@/components/layout/site-footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo />
              <span className="text-xl font-extrabold font-sans tracking-tight">Hire Alert</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Sign In</Link>
              <Link href="/auth/register">
                <button className="h-9 px-5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}
