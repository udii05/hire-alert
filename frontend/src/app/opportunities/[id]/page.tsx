"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Calendar,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const APPLICATION_STATUSES = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "ARCHIVED", label: "Archived" },
];

function formatType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    JOB: "bg-teal-100 text-teal-700",
    INTERNSHIP: "bg-emerald-100 text-emerald-700",
    HACKATHON: "bg-violet-100 text-violet-700",
    SCHOLARSHIP: "bg-amber-100 text-amber-700",
    EVENT: "bg-rose-100 text-rose-700",
    OPEN_SOURCE: "bg-cyan-100 text-cyan-700",
    FREELANCING: "bg-orange-100 text-orange-700",
    COMPETITION: "bg-pink-100 text-pink-700",
  };
  return colors[type] || "bg-gray-100 text-gray-700";
}

function OpportunityDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string>("SAVED");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && params.id) {
      fetchOpportunity();
    }
  }, [status, params.id]);

  async function fetchOpportunity() {
    try {
      const response = await fetch(`/api/opportunities/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunity(data);
        setApplicationStatus(data.applicationStatus || "SAVED");
      } else {
        router.push("/dashboard/opportunities");
      }
    } catch (error) {
      console.error("Failed to fetch opportunity:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(status: string) {
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: params.id,
          status,
        }),
      });

      if (response.ok) {
        setApplicationStatus(status);
        toast.success("Application status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Opportunity not found</p>
        <Button
          variant="outline"
          className="mt-4 rounded-xl"
          onClick={() => router.push("/dashboard/opportunities")}
        >
          Back to opportunities
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4 rounded-xl"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main info card */}
          <Card>
            <CardContent className="p-6">
              <Badge
                variant="secondary"
                className={cn("text-xs font-normal mb-3 rounded-full", getTypeColor(opportunity.type))}
              >
                {formatType(opportunity.type)}
              </Badge>
              <h1 className="text-2xl font-bold font-heading tracking-tight mb-4">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {opportunity.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {opportunity.location || opportunity.locationType || "Remote"}
                </span>
                {(opportunity.salary || opportunity.stipend) && (
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    {opportunity.salary || opportunity.stipend}
                  </span>
                )}
                {opportunity.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="text-xs text-muted-foreground pt-3 border-t border-border/50">
                Source: {opportunity.source} | Posted:{" "}
                {opportunity.postedDate
                  ? new Date(opportunity.postedDate).toLocaleDateString()
                  : "N/A"}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold font-heading mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {opportunity.description || "No description available."}
              </p>

              {opportunity.eligibility && (
                <>
                  <Separator className="my-4" />
                  <h3 className="font-semibold font-heading mb-2">Eligibility</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {opportunity.eligibility}
                  </p>
                </>
              )}

              {opportunity.responsibilities?.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="font-semibold font-heading mb-2">Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {opportunity.responsibilities.map((resp: string, i: number) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          {opportunity.skills?.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold font-heading mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill: string) => {
                    const matched = opportunity.matchedSkills?.includes(skill);
                    const missing = opportunity.missingSkills?.includes(skill);
                    return (
                      <Badge
                        key={skill}
                        variant={matched ? "default" : missing ? "destructive" : "secondary"}
                        className={cn(
                          "text-sm py-1.5 px-3 rounded-full",
                          matched && "bg-emerald-100 text-emerald-700",
                          missing && "bg-red-100 text-red-700"
                        )}
                      >
                        {skill}
                        {matched && <CheckCircle2 className="ml-1 h-3 w-3" />}
                        {missing && <XCircle className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Apply button */}
          {opportunity.url && (
            <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full h-12 rounded-xl text-base">
                <ExternalLink className="mr-2 h-4 w-4" />
                Apply on {opportunity.source}
              </Button>
            </a>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Application Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold font-heading mb-4">Application Status</h3>
              <Select
                value={applicationStatus}
                onValueChange={(value) => value && handleStatusChange(value)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Fit Score */}
          {opportunity.fitScore && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold font-heading mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Fit Score
                </h3>
                <div className="text-center mb-3">
                  <div className="text-4xl font-bold font-heading text-primary">
                    {opportunity.fitScore}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Overall match</p>
                </div>
                <Progress value={opportunity.fitScore} className="h-2 mb-4" />

                {opportunity.matchedSkills?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.matchedSkills.map((skill: string) => (
                        <Badge key={skill} className="bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {opportunity.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.missingSkills.map((skill: string) => (
                        <Badge key={skill} className="bg-red-100 text-red-700 text-xs rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {opportunity.fitExplanation && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {opportunity.fitExplanation}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deadline */}
          {opportunity.deadline && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-amber-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OpportunityDetailPage() {
  return (
    <SessionProvider>
      <DashboardLayout>
        <OpportunityDetail />
      </DashboardLayout>
    </SessionProvider>
  );
}