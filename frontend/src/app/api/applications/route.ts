import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { userId: session.user.id };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { updatedAt: "desc" },
        include: {
          opportunity: true,
        },
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({ applications, total });
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { opportunityId, status, notes } = await request.json();

    if (!opportunityId || !status) {
      return NextResponse.json(
        { error: "Opportunity ID and status are required" },
        { status: 400 }
      );
    }

    const application = await prisma.application.upsert({
      where: {
        userId_opportunityId: {
          userId: session.user.id,
          opportunityId,
        },
      },
      update: {
        status,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        opportunityId,
        status,
        notes,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Failed to create application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
