"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  RefreshCw,
  Target,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  locationType: string;
  salary?: string;
  stipend?: string;
  deadline?: string;
  postedDate?: string;
  shortDescription?: string;
  source: string;
  skills: string[];
  fitScore: number | null;
  applicationStatus: string | null;
  isApplied: boolean;
}

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

export default function OpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOpportunities();
    }
  }, [status, typeFilter]);

  async function fetchOpportunities() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (typeFilter) params.set("type", typeFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/opportunities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOpportunities();
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/opportunities/refresh", {
        method: "POST",
      });
      if (response.ok) {
        await fetchOpportunities();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} opportunities found
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-xl"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or skill..."
            className="pl-11 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <Select value={typeFilter} onValueChange={(value) => value && setTypeFilter(value)}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Types</SelectItem>
            <SelectItem value="JOB">Jobs</SelectItem>
            <SelectItem value="INTERNSHIP">Internships</SelectItem>
            <SelectItem value="HACKATHON">Hackathons</SelectItem>
            <SelectItem value="SCHOLARSHIP">Scholarships</SelectItem>
            <SelectItem value="EVENT">Events</SelectItem>
            <SelectItem value="OPEN_SOURCE">Open Source</SelectItem>
            <SelectItem value="FREELANCING">Freelancing</SelectItem>
            <SelectItem value="COMPETITION">Competitions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex p-4 rounded-2xl bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No opportunities found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or complete your profile for better recommendations
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              href={`/opportunities/${opp.id}`}
              className="group block bg-card rounded-2xl p-5 ring-1 ring-border/60 hover:ring-primary/30 hover:shadow-soft-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge
                  variant="secondary"
                  className={cn("text-xs font-normal rounded-full", getTypeColor(opp.type))}
                >
                  {formatType(opp.type)}
                </Badge>
                <div className="flex items-center gap-2">
                  {opp.fitScore && (
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {opp.fitScore}%
                    </span>
                  )}
                  {opp.applicationStatus && (
                    <Badge variant="outline" className="text-xs rounded-full">
                      {opp.applicationStatus.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-base mb-1.5 leading-snug group-hover:text-primary transition-colors">
                {opp.title}
              </h3>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>{opp.company}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {opp.shortDescription || "No description available"}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {opp.location || opp.locationType || "Remote"}
                </span>
                {(opp.salary || opp.stipend) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {opp.salary || opp.stipend}
                  </span>
                )}
                {opp.deadline && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(opp.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              {opp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {opp.skills.slice(0, 4).map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-xs font-normal rounded-full bg-muted"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {opp.skills.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{opp.skills.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                Source: {opp.source}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}