import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        applications: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    // Get user profile for fit score
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    const application = opportunity.applications[0] || null;

    return NextResponse.json({
      ...opportunity,
      applicationStatus: application?.status || null,
      fitScore: application?.fitScore || null,
      fitExplanation: application?.fitExplanation || null,
      matchedSkills: application?.matchedSkills || [],
      missingSkills: application?.missingSkills || [],
    });
  } catch (error) {
    console.error("Failed to fetch opportunity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
