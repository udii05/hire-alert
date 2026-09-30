"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle,
  ExternalLink,
  XCircle,
  RefreshCw,
  MapPin,
  Building2,
  Clock,
  Target,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Opportunity, ApplicationStatus } from "@/lib/types";

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
    <Card glass className={cn("group hover:shadow-soft-lg transition-all duration-300 overflow-hidden min-h-[280px]", priorityOutline[priority])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] font-medium rounded-full px-2 py-0.5", getTypeColor(opportunity.type))}>
              {formatType(opportunity.type)}
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

export default function RecommendedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityWithApp[]>([]);

  const fetchRecommendedOpportunities = useCallback(async () => {
    try {
      const res = await fetch(`/api/opportunities?minFitScore=${MIN_FIT_SCORE}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommended opportunities:", error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRecommendedOpportunities();
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router, fetchRecommendedOpportunities]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/opportunities/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        toast.success("AI agents triggered! Scanning sources...");
      }
    } catch (error) {
      console.error("Failed to trigger refresh:", error);
    }
    await fetchRecommendedOpportunities();
    setIsRefreshing(false);
  };

  async function handleApply(opportunityId: string) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: "APPLIED" }),
      });
      if (res.ok) {
        toast.success("Marked as applied");
        setOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
      }
    } catch (error) {
      toast.error("Failed to update application status");
    }
  }

  async function handleReject(opportunityId: string) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: "REJECTED" }),
      });
      if (res.ok) {
        toast.success("Marked as rejected");
        setOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
      }
    } catch (error) {
      toast.error("Failed to update application status");
    }
  }

  async function handleSave(opportunityId: string) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: "SAVED" }),
      });
      if (res.ok) {
        toast.success("Saved for later");
        setOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
      }
    } catch (error) {
      toast.error("Failed to save");
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Recommended For You</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-curated opportunities with {">="}{MIN_FIT_SCORE}% profile match
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Target className="h-3 w-3 mr-1" />
            {opportunities.length} matches
          </Badge>
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

      {opportunities.length === 0 ? (
        <Card glass>
          <CardContent className="py-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No recommendations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure your profile is complete and click Scan Jobs to run the AI agents
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} onApply={handleApply} onReject={handleReject} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
