"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ExternalLink,
  Loader2,
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

function SavedCard({ opportunity, onApply }: { opportunity: OpportunityWithApp; onApply: (id: string) => void }) {
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
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0.5">
              <Bookmark className="h-2.5 w-2.5 mr-0.5" />
              Saved
            </Badge>
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

        <Button size="sm" className="w-full rounded-lg text-xs h-8 mt-auto" onClick={() => onApply(opportunity.id)}>
          <ExternalLink className="h-3 w-3 mr-1" />
          Apply now
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SavedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [savedOpportunities, setSavedOpportunities] = useState<OpportunityWithApp[]>([]);

  const fetchSavedOpportunities = useCallback(async () => {
    try {
      const res = await fetch("/api/applications?status=SAVED");
      if (res.ok) {
        const data = await res.json();
        setSavedOpportunities(
          data.applications?.map((a: any) => ({ ...a.opportunity, applicationStatus: a.status })) || []
        );
      }
    } catch (error) {
      console.error("Failed to fetch saved opportunities:", error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSavedOpportunities().then(() => setIsLoading(false));
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router, fetchSavedOpportunities]);

  async function handleApply(opportunityId: string) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: "APPLIED" }),
      });
      if (res.ok) {
        toast.success("Applied! Moved from saved to applied.");
        setSavedOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
      }
    } catch (error) {
      toast.error("Failed to apply");
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
          <h1 className="text-2xl font-bold font-heading tracking-tight">Saved Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jobs you've saved for later
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSavedOpportunities}
          className="rounded-xl border-primary/20 text-primary hover:bg-primary/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {savedOpportunities.length === 0 ? (
        <Card glass>
          <CardContent className="py-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No saved jobs</p>
            <p className="text-sm text-muted-foreground mt-1">
              Save jobs from your search or recommendations to review them later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savedOpportunities.map((opp) => (
            <SavedCard key={opp.id} opportunity={opp} onApply={handleApply} />
          ))}
        </div>
      )}
    </div>
  );
}
