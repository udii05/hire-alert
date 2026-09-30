"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  RefreshCw,
  MapPin,
  Building2,
  Sparkles,
  Target,
  CheckCircle,
  XCircle,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Opportunity, ApplicationStatus, DashboardStats } from "@/lib/types";
import { AgentBox } from "@/components/dashboard/agent-box";

const MIN_FIT_SCORE = 75;

type Priority = "HIGH" | "MEDIUM" | "LOW";

interface OpportunityWithApp extends Opportunity {
  applicationStatus?: ApplicationStatus | null;
  applicationId?: string;
  priority?: Priority;
  url?: string;
}

const priorityOutline: Record<Priority, string> = {
  HIGH: "border-red-500/70 ring-1 ring-red-500/30 shadow-[0_0_18px_-6px_rgba(239,68,68,0.45)]",
  MEDIUM: "border-yellow-500/70 ring-1 ring-yellow-500/30 shadow-[0_0_18px_-6px_rgba(234,179,8,0.4)]",
  LOW: "border-green-500/70 ring-1 ring-green-500/30 shadow-[0_0_18px_-6px_rgba(34,197,94,0.4)]",
};

const priorityBadge: Record<Priority, string> = {
  HIGH: "bg-red-500/10 text-red-400 border-red-500/30",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  LOW: "bg-green-500/10 text-green-400 border-green-500/30",
};

const priorityLabel: Record<Priority, string> = {
  HIGH: "High Priority",
  MEDIUM: "Medium Priority",
  LOW: "Low Priority",
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 30 * 1000) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function OpportunityCard({ opportunity, onApply, onReject, onSave }: { opportunity: OpportunityWithApp; onApply?: (id: string) => void; onReject?: (id: string) => void; onSave?: (id: string) => void }) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      JOB: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      INTERNSHIP: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      HACKATHON: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      SCHOLARSHIP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      EVENT: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      OPEN_SOURCE: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      FREELANCING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      COMPETITION: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    };
    return colors[type] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const formatType = (type: string) => type.replace(/_/g, " ");

  const daysLeft = opportunity.deadline
    ? Math.max(0, Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const priority = opportunity.priority || (daysLeft !== null
    ? daysLeft < 7 ? "HIGH" : daysLeft <= 15 ? "MEDIUM" : "LOW"
    : "LOW");

  const isPaid = opportunity.salary || opportunity.stipend;

  return (
    <Card className={cn("group hover:shadow-soft-lg transition-all duration-300 overflow-hidden min-h-[280px]", priorityOutline[priority])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] font-medium rounded-full px-2 py-0.5", getTypeColor(opportunity.type))}>
              {formatType(opportunity.type)}
            </Badge>
            <Badge variant="outline" className={cn("text-[10px] rounded-full px-2 py-0.5", priorityBadge[priority])}>
              {priorityLabel[priority]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {opportunity.fitScore && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0.5">
                <Target className="h-2.5 w-2.5 mr-0.5" />
                {opportunity.fitScore}%
              </Badge>
            )}
            {daysLeft !== null && (
              <Badge variant="outline" className={cn("text-[10px] rounded-full px-1.5 py-0.5", daysLeft <= 3 ? "bg-red-500/10 text-red-400 border-red-500/20" : daysLeft <= 7 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-muted text-muted-foreground")}>
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                {daysLeft === 0 ? "Today" : `${daysLeft}d`}
              </Badge>
            )}
          </div>
        </div>

        <h3 className="font-sans font-bold text-sm mb-1 line-clamp-1">{opportunity.title}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Building2 className="h-3 w-3" />
          <span>{opportunity.company}</span>
        </div>

        {opportunity.shortDescription && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{opportunity.shortDescription}</p>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          {opportunity.location && (
            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
              <MapPin className="h-2 w-2" />
              {opportunity.location}
            </span>
          )}
          <span className={cn("inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full", isPaid ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground")}>
            {isPaid ? "Paid" : "Unpaid"}
          </span>
        </div>

        {opportunity.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {opportunity.skills.slice(0, 4).map((skill) => (
              <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80">
                {skill}
              </span>
            ))}
            {opportunity.skills.length > 4 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{opportunity.skills.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-3 border-t border-border/50">
          <Button size="sm" variant="outline" className="flex-1 rounded-lg text-amber-400 border-amber-400/20 hover:bg-amber-400/10 text-xs h-8" onClick={() => onSave?.(opportunity.id)}>
            <Bookmark className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" className="flex-1 rounded-lg text-red-400 border-red-400/20 hover:bg-red-400/10 text-xs h-8" onClick={() => onReject?.(opportunity.id)}>
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
        <Button size="sm" className="w-full rounded-lg text-xs h-8 mt-2" onClick={() => onApply?.(opportunity.id)}>
          <ExternalLink className="h-3 w-3 mr-1" />
          Apply
        </Button>
      </CardContent>
    </Card>
  );
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    saved: 0,
    applied: 0,
    interviews: 0,
    offers: 0,
    weeklyViews: 0,
    weeklyApplications: 0,
    deadlines: 0,
    averageFitScore: 0,
  });
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<OpportunityWithApp[]>([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState<OpportunityWithApp[]>([]);
  const [rejectedOpportunities, setRejectedOpportunities] = useState<OpportunityWithApp[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null);
  const [refreshLabel, setRefreshLabel] = useState("");

  const fetchRecommendedOpportunities = useCallback(async (category = "ALL") => {
    try {
      const params = new URLSearchParams({ minFitScore: MIN_FIT_SCORE.toString(), limit: "20" });
      if (category !== "ALL") params.set("type", category);
      const res = await fetch(`/api/opportunities?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendedOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {
          saved: 0,
          applied: 0,
          interviews: 0,
          offers: 0,
          weeklyViews: 0,
          weeklyApplications: 0,
          deadlines: 0,
          averageFitScore: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  const fetchAppliedOpportunities = useCallback(async () => {
    try {
      const res = await fetch("/api/applications?status=APPLIED");
      if (res.ok) {
        const data = await res.json();
        setAppliedOpportunities(
          data.applications?.map((a: any) => ({ ...a.opportunity, applicationStatus: a.status })) || []
        );
      }
    } catch (error) {
      console.error("Failed to fetch applied opportunities:", error);
    }
  }, []);

  const fetchRejectedOpportunities = useCallback(async () => {
    try {
      const res = await fetch("/api/applications?status=REJECTED");
      if (res.ok) {
        const data = await res.json();
        setRejectedOpportunities(
          data.applications?.map((a: any) => ({ ...a.opportunity, applicationStatus: a.status })) || []
        );
      }
    } catch (error) {
      console.error("Failed to fetch rejected opportunities:", error);
    }
  }, []);

  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileData(data.profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }

    async function init() {
      await Promise.all([
        fetchRecommendedOpportunities(),
        fetchStats(),
        fetchAppliedOpportunities(),
        fetchRejectedOpportunities(),
        checkProfile(),
      ]);
      setIsLoading(false);
      setLastRefreshedAt(Date.now());
    }

    if (status === "authenticated") {
      init();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router, fetchRecommendedOpportunities, fetchStats, fetchAppliedOpportunities, fetchRejectedOpportunities]);

  useEffect(() => {
    if (lastRefreshedAt) {
      const interval = setInterval(() => {
        setRefreshLabel(formatRelativeTime(lastRefreshedAt));
      }, 30000);
      setRefreshLabel(formatRelativeTime(lastRefreshedAt));
      return () => clearInterval(interval);
    }
  }, [lastRefreshedAt]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchRecommendedOpportunities(),
      fetchStats(),
      fetchAppliedOpportunities(),
      fetchRejectedOpportunities(),
    ]);
    setLastRefreshedAt(Date.now());
    setIsRefreshing(false);
    toast.success("Dashboard refreshed! Found new opportunities.");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: "Opportunities", value: stats.saved + stats.applied, icon: Briefcase, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Recommended", value: recommendedOpportunities.length, icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Applied", value: appliedOpportunities.length, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Rejected", value: rejectedOpportunities.length, icon: XCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
            Good evening, <span className="text-gradient-animated">{session?.user?.name?.split(" ")[0] || "User"}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Your AI-powered career command center
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshedAt && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Refreshed {refreshLabel}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl border-primary/20 text-primary hover:bg-primary/10"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Agents scanning..." : "Scan Jobs"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card glass key={stat.label} className="hover:shadow-soft transition-shadow overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold font-sans mt-1">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent */}
      <AgentBox context={{
        name: session?.user?.name ?? undefined,
        email: session?.user?.email ?? undefined,
        profile: profileData,
        stats,
        appliedJobs: appliedOpportunities.map((o) => o.title).filter(Boolean),
        recommendedCount: recommendedOpportunities.length,
        rejectedCount: rejectedOpportunities.length,
      }} />
    </div>
  );
}
