"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Bell, User, Settings, LogOut, Sparkles, Clock, ChevronRight } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message?: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

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

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Recommended", href: "/dashboard/recommended" },
  { label: "Search", href: "/dashboard/search" },
  { label: "Saved", href: "/dashboard/saved" },
  { label: "Applied", href: "/dashboard/applied" },
  { label: "Rejected", href: "/dashboard/rejected" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const notifs: Notification[] = data.notifications || [];
        setNotifications(notifs.slice(0, 20));
        setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      }
    } catch {
      // silently fail
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: true }) });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      <div>
        <header className="sticky top-0 z-30 glass border-b border-border/50">
          <div className="flex items-center justify-between h-16 px-6 lg:px-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Logo />
              <span className="text-lg font-extrabold font-sans tracking-tight">Hire Alert</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("#")[0]));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-xl hover:bg-secondary/50"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent align="end" sideOffset={8} className="w-80 max-h-[420px] overflow-y-auto p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] text-muted-foreground">{unreadCount} unread</span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        When high-priority jobs match your profile, you'll see them here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={async () => {
                            if (!notif.read) await markAsRead(notif.id);
                            if (notif.link) router.push(notif.link);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex items-start gap-3",
                            !notif.read && "bg-primary/5"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 p-1.5 rounded-lg shrink-0",
                            notif.type === "DEADLINE"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-violet-500/10 text-violet-400"
                          )}>
                            {notif.type === "DEADLINE" ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-xs leading-snug",
                              !notif.read ? "font-semibold text-foreground" : "text-foreground/80"
                            )}>
                              {notif.title}
                            </p>
                            {notif.message && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.read && (
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Account dropdown */}
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl hover:bg-secondary/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <PopoverContent align="end" sideOffset={8} className="w-56 p-0">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium truncate">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session?.user?.email || ""}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                  </div>
                  <div className="border-t border-border p-1">
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/login" })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        <main className="px-6 lg:px-16 py-6 max-w-7xl mx-auto relative z-10">{children}</main>
      </div>
    </div>
  );
}
