import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Priority buckets by days until deadline
// HIGH: less than 7 days, MEDIUM: 7-15 days, LOW: 15+ days
export function priorityFromDeadline(deadline: string | Date | null | undefined): "HIGH" | "MEDIUM" | "LOW" {
  if (!deadline) return "LOW";
  const days = Math.max(
    0,
    Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  if (days < 7) return "HIGH";
  if (days <= 15) return "MEDIUM";
  return "LOW";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const company = searchParams.get("company");
    const location = searchParams.get("location");
    const locationType = searchParams.get("locationType"); // Remote | Hybrid | On-site
    const experienceLevel = searchParams.get("experienceLevel"); // FRESHER | JUNIOR | MID | SENIOR | ANY
    const skill = searchParams.get("skill");
    const sort = searchParams.get("sort") || "createdAt"; // createdAt, fitScore, deadline
    const excludeApplied = searchParams.get("excludeApplied") === "true";
    const minFitScore = searchParams.get("minFitScore");
    const priority = searchParams.get("priority"); // HIGH | MEDIUM | LOW

    const where: Prisma.OpportunityWhereInput = {
      isActive: true,
    };

    // Get user's application status for each opportunity
    const userApplications = await prisma.application.findMany({
      where: { userId: session.user.id },
      select: { opportunityId: true, status: true, fitScore: true },
    });

    const appliedOrRejectedIds = userApplications
      .filter((a) => a.status === "APPLIED" || a.status === "REJECTED" || a.status === "SAVED")
      .map((a) => a.opportunityId);

    const savedIds = userApplications
      .filter((a) => a.status === "SAVED")
      .map((a) => a.opportunityId);

    const excludedIds = userApplications
      .filter(
        (a) =>
          a.status === "NOT_INTERESTED" || a.status === "ARCHIVED"
      )
      .map((a) => a.opportunityId);

    // For "For You" recommendations, exclude already applied/rejected opportunities
    if (excludeApplied && appliedOrRejectedIds.length > 0) {
      where.id = { notIn: appliedOrRejectedIds };
    } else if (excludedIds.length > 0) {
      where.id = { notIn: excludedIds };
    }

    // Match threshold: only show opportunities the user's profile scores >= N
    // (filter at the database level so pagination/ordering can't skip them)
    if (minFitScore) {
      const threshold = parseFloat(minFitScore);
      where.applications = {
        some: {
          userId: session.user.id,
          fitScore: { gte: threshold },
        },
      };
    }

    if (type) {
      where.type = type as any;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { skills: { has: search } },
      ];
    }

    if (company) {
      where.company = { contains: company, mode: "insensitive" };
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (locationType) {
      where.locationType = locationType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel as any;
    }

    if (skill) {
      where.skills = { has: skill };
    }

    // Priority buckets are deadline ranges — filter at the DB level so
    // pagination can't skip them (HIGH < 7d, MEDIUM 7-15d, LOW 15d+)
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const now = Date.now();
      const DAY = 24 * 60 * 60 * 1000;
      let deadlineFilter: Prisma.DateTimeNullableFilter | Prisma.DateTimeFilter = {};
      if (priority === "HIGH") {
        deadlineFilter = { lt: new Date(now + 7 * DAY), gt: new Date(now) };
        where.deadline = deadlineFilter;
      } else if (priority === "MEDIUM") {
        where.deadline = { gte: new Date(now + 7 * DAY), lte: new Date(now + 15 * DAY) };
      } else {
        // LOW: deadline more than 15 days away OR no deadline at all
        const lowCondition = [
          { deadline: { gt: new Date(now + 15 * DAY) } },
          { deadline: null },
        ];
        if (where.OR) {
          const existingOr = where.OR;
          delete where.OR;
          where.AND = [{ OR: existingOr }, { OR: lowCondition }];
        } else {
          where.OR = lowCondition;
        }
      }
    }

    // Build orderBy based on sort parameter
    let orderBy: Prisma.OpportunityOrderByWithRelationInput = { createdAt: "desc" };

    if (sort === "deadline") {
      orderBy = { deadline: "asc" };
    }

    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy,
        include: {
          applications: {
            where: { userId: session.user.id },
            select: { status: true, fitScore: true, matchedSkills: true, missingSkills: true, fitExplanation: true },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    // Calculate priority: combines fitScore and deadline urgency
    const calculatePriority = (opp: any) => {
      const fitScore = opp.applications[0]?.fitScore || 0;
      const deadline = opp.deadline ? new Date(opp.deadline).getTime() : Date.now() + 30 * 24 * 60 * 60 * 1000;
      const daysUntilDeadline = Math.max(0, (deadline - Date.now()) / (1000 * 60 * 60 * 24));
      const deadlineUrgency = Math.max(0, 100 - (daysUntilDeadline / 30 * 100));
      const priority = (fitScore * 0.6) + (deadlineUrgency * 0.4);
      return { priority, daysUntilDeadline };
    };

    let formatted = opportunities.map((opp) => {
      const { priority: priorityScore, daysUntilDeadline } = calculatePriority(opp);
      const app = opp.applications[0];
      return {
        id: opp.id,
        title: opp.title,
        company: opp.company,
        type: opp.type,
        location: opp.location,
        locationType: opp.locationType,
        salary: opp.salary,
        stipend: opp.stipend,
        deadline: opp.deadline,
        postedDate: opp.postedDate,
        shortDescription: opp.shortDescription,
        description: opp.description,
        source: opp.source,
        url: opp.url,
        skills: opp.skills,
        fitScore: app?.fitScore || null,
        fitExplanation: app?.fitExplanation || null,
        matchedSkills: app?.matchedSkills || [],
        missingSkills: app?.missingSkills || [],
        applicationStatus: app?.status || null,
        isApplied: appliedOrRejectedIds.includes(opp.id),
        isSaved: savedIds.includes(opp.id),
        priority: priorityFromDeadline(opp.deadline),
        priorityScore,
        daysUntilDeadline,
      };
    });

    // Filter by min fit score (e.g., >= 75 for curated recommendations)
    if (minFitScore) {
      const threshold = parseFloat(minFitScore);
      formatted = formatted.filter((o) => o.fitScore !== null && o.fitScore >= threshold);
    }

    // Sort by priority if requested
    if (sort === "fitScore" || sort === "priority") {
      formatted = formatted.sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
        return (b.fitScore || 0) - (a.fitScore || 0);
      });
    }

    // Filter out expired opportunities (deadline passed)
    formatted = formatted.filter((opp) => opp.daysUntilDeadline > 0);

    return NextResponse.json({
      opportunities: formatted,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Failed to fetch opportunities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
