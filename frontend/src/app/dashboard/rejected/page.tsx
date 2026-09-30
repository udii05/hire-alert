"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle,
  ExternalLink,
  XCircle,
  RotateCcw,
  MapPin,
  Building2,
  Clock,
  Target,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Opportunity, ApplicationStatus } from "@/lib/types";

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

function OpportunityCard({ opportunity, onUnReject }: { opportunity: OpportunityWithApp; onUnReject: (id: string) => void }) {
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

        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
          {opportunity.url ? (
            <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              <ExternalLink className="h-3 w-3" />
              View application link
            </a>
          ) : (
            <span className="text-muted-foreground/60">No external link</span>
          )}
        </div>

        <Button size="sm" variant="outline" className="w-full rounded-lg mt-3 h-8" onClick={() => onUnReject(opportunity.id)}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Bring Back
        </Button>
      </CardContent>
    </Card>
  );
}

export default function RejectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [rejectedOpportunities, setRejectedOpportunities] = useState<OpportunityWithApp[]>([]);

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

  const fetchRecommendedOpportunities = useCallback(async () => {
    try {
      const res = await fetch(`/api/opportunities?minFitScore=75&limit=20`);
      if (res.ok) {
        const data = await res.json();
        return data.opportunities || [];
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRejectedOpportunities();
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router, fetchRejectedOpportunities]);

  async function handleUnReject(opportunityId: string) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: "SAVED" }),
      });
      if (res.ok) {
        toast.success("Brought back to your recommendations");
        setRejectedOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
        await fetchRecommendedOpportunities();
      }
    } catch (error) {
      toast.error("Failed to restore opportunity");
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
          <h1 className="text-2xl font-bold font-heading tracking-tight">Rejected Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Opportunities you&apos;ve passed on — un-reject any you want back
          </p>
        </div>
        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
          <XCircle className="h-3 w-3 mr-1" />
          {rejectedOpportunities.length} rejected
        </Badge>
      </div>

      {rejectedOpportunities.length === 0 ? (
        <Card glass>
          <CardContent className="py-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No rejected opportunities</p>
            <p className="text-sm text-muted-foreground mt-1">
              Opportunities you reject will appear here for reference
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {rejectedOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} onUnReject={handleUnReject} />
          ))}
        </div>
      )}
    </div>
  );
}
