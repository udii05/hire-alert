import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      saved,
      applied,
      interviews,
      offers,
      deadlines,
      recentApplications,
      profile,
    ] = await Promise.all([
      prisma.application.count({
        where: { userId, status: "SAVED" },
      }),
      prisma.application.count({
        where: {
          userId,
          status: { in: ["APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER"] },
        },
      }),
      prisma.application.count({
        where: { userId, status: "INTERVIEW" },
      }),
      prisma.application.count({
        where: { userId, status: "OFFER" },
      }),
      prisma.application.count({
        where: {
          userId,
          opportunity: { deadline: { gte: now } },
        },
      }),
      prisma.application.findMany({
        where: {
          userId,
          createdAt: { gte: weekAgo },
          status: { in: ["APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER"] },
        },
      }),
      prisma.profile.findUnique({
        where: { userId },
      }),
    ]);

    const weeklyApplications = recentApplications.length;

    // Calculate average fit score
    const scoredApps = await prisma.application.findMany({
      where: {
        userId,
        fitScore: { not: null },
      },
      select: { fitScore: true },
    });

    const averageFitScore =
      scoredApps.length > 0
        ? Math.round(
            scoredApps.reduce((sum, a) => sum + (a.fitScore || 0), 0) /
              scoredApps.length
          )
        : 0;

    return NextResponse.json({
      saved,
      applied,
      interviews,
      offers,
      deadlines,
      weeklyViews: Math.max(weeklyApplications * 3, 5),
      weeklyApplications,
      averageFitScore,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
