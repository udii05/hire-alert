"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle,
  ExternalLink,
  XCircle,
  Search,
  Loader2,
  MapPin,
  Building2,
  Clock,
  Target,
  ShieldCheck,
  RefreshCw,
  Bookmark,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<OpportunityWithApp[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [experienceFilter, setExperienceFilter] = useState("ALL");
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await handleSearch();
    setIsRefreshing(false);
  };

  async function handleSearch() {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({ limit: "50", excludeApplied: "true" });
      if (searchQuery) params.set("q", searchQuery);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (locationFilter !== "ALL") params.set("location", locationFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
      if (experienceFilter !== "ALL") params.set("experienceLevel", experienceFilter);
      const res = await fetch(`/api/opportunities?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.opportunities || []);
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleApply(opportunityId: string) {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: "APPLIED" }),
      });
      if (res.ok) {
        toast.success("Marked as applied");
        setSearchResults((prev) => prev.filter((o) => o.id !== opportunityId));
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
        setSearchResults((prev) => prev.filter((o) => o.id !== opportunityId));
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
        setSearchResults((prev) => prev.filter((o) => o.id !== opportunityId));
      }
    } catch (error) {
      toast.error("Failed to save");
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

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
          <h1 className="text-2xl font-bold font-heading tracking-tight">Search Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search and filter through all opportunities
          </p>
        </div>
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

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3 mb-4">
            <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Only opportunities with a <span className="font-semibold text-foreground">{MIN_FIT_SCORE}%+</span> profile match are shown to help you find the best-fit roles.
            </p>
          </div>

          {/* Single-row: Search + Location + Button */}
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, company, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 rounded-xl"
                />
              </div>
            </div>

            <div className="w-48 space-y-2">
              <Label>Location</Label>
              <Select value={locationFilter} onValueChange={(value) => value && setLocationFilter(value)}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All locations</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} className="rounded-xl" disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Filters sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Left sidebar filters */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                Filters
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select value={typeFilter} onValueChange={(value) => value && setTypeFilter(value)}>
                  <SelectTrigger className="rounded-none text-xs h-9">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>
                    <SelectItem value="JOB">Jobs</SelectItem>
                    <SelectItem value="INTERNSHIP">Internships</SelectItem>
                    <SelectItem value="HACKATHON">Hackathons</SelectItem>
                    <SelectItem value="SCHOLARSHIP">Scholarships</SelectItem>
                    <SelectItem value="COMPETITION">Competitions</SelectItem>
                    <SelectItem value="EVENT">Events</SelectItem>
                    <SelectItem value="FREELANCING">Freelancing</SelectItem>
                    <SelectItem value="OPEN_SOURCE">Open source</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Priority (deadline)</Label>
                <Select value={priorityFilter} onValueChange={(value) => value && setPriorityFilter(value)}>
                  <SelectTrigger className="rounded-none text-xs h-9">
                    <SelectValue placeholder="Any priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any priority</SelectItem>
                    <SelectItem value="HIGH">High (under 7 days)</SelectItem>
                    <SelectItem value="MEDIUM">Medium (7-15 days)</SelectItem>
                    <SelectItem value="LOW">Low (15+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Experience Level</Label>
                <Select value={experienceFilter} onValueChange={(value) => value && setExperienceFilter(value)}>
                  <SelectTrigger className="rounded-none text-xs h-9">
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Any experience</SelectItem>
                    <SelectItem value="FRESHER">Fresher</SelectItem>
                    <SelectItem value="JUNIOR">Junior (0-3 yrs)</SelectItem>
                    <SelectItem value="MID">Mid (3-6 yrs)</SelectItem>
                    <SelectItem value="SENIOR">Senior (6+ yrs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results area */}
        <div>
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : searchResults.length === 0 ? (
            <Card glass>
              <CardContent className="py-12 text-center">
                <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No results found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {searchResults.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} onApply={handleApply} onReject={handleReject} onSave={handleSave} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
