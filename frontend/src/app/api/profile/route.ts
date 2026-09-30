import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { projects: true },
    });

    if (!profile) {
      return NextResponse.json({ profile: null, user });
    }

    return NextResponse.json({ profile, user });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper: convert "8.5" / 8.5 to number or null
function toNumber(value: any): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function toBool(value: any): boolean | null {
  if (value === null || value === undefined || value === "") return null;
  return value === true || value === "true";
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Basic Info (name comes from the user record)
    if (body.name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: body.name },
      });
    }

    const data: Prisma.ProfileUpdateInput = {
      // Education
      college: body.college || null,
      degree: body.degree || null,
      branch: body.branch || null,
      university: body.university || null,
      specialization: body.specialization || null,
      graduationYear: toNumber(body.graduationYear),
      cgpa: toNumber(body.cgpa),
      relevantCoursework: body.relevantCoursework || [],

      // Skills (legacy aggregated list for the matching agent)
      skills: body.skills || [],
      preferredRoles: body.preferredRoles || [],
      preferredLocations: body.preferredLocations || [],
      preferredCompanies: body.preferredCompanies || [],
      interests: body.interests || [],

      // Basic Information
      phone: body.phone || null,
      city: body.city || null,
      country: body.country || null,
      timeZone: body.timeZone || null,
      nationality: body.nationality || null,
      workAuthorization: body.workAuthorization || null,
      visaSponsorshipRequired: toBool(body.visaSponsorshipRequired),

      // Job Preferences
      jobType: body.jobType || null,
      workMode: body.workMode || null,
      minSalary: toNumber(body.minSalary),
      targetSalary: toNumber(body.targetSalary),
      noticePeriod: body.noticePeriod || null,
      earliestJoining: body.earliestJoining || null,
      willingToRelocate: toBool(body.willingToRelocate),

      // Experience
      currentStatus: body.currentStatus || null,
      yearsOfExperience: toNumber(body.yearsOfExperience),
      currentCompany: body.currentCompany || null,
      previousCompanies: body.previousCompanies || [],
      hasInternships: toBool(body.hasInternships),
      hasFreelancing: toBool(body.hasFreelancing),
      hasResearch: toBool(body.hasResearch),
      hasTeaching: toBool(body.hasTeaching),
      hasOpenSource: toBool(body.hasOpenSource),
      experienceEntries: body.experienceEntries || undefined,

      // Technical Skills (structured)
      programmingLanguages: body.programmingLanguages || [],
      frameworks: body.frameworks || [],
      libraries: body.libraries || [],
      databases: body.databases || [],
      cloudPlatforms: body.cloudPlatforms || [],
      devopsTools: body.devopsTools || [],
      aiMlTechnologies: body.aiMlTechnologies || [],
      dataAnalysisTools: body.dataAnalysisTools || [],
      designTools: body.designTools || [],
      softSkills: body.softSkills || [],
      skillProficiency: body.skillProficiency || undefined,

      // Resume & Portfolio
      resumeUrl: body.resumeUrl || null,
      portfolioUrl: body.portfolioUrl || null,
      githubUrl: body.githubUrl || null,
      linkedinUrl: body.linkedinUrl || null,
      leetcodeUrl: body.leetcodeUrl || null,
      codechefUrl: body.codechefUrl || null,
      hackerrankUrl: body.hackerrankUrl || null,
      kaggleUrl: body.kaggleUrl || null,
      personalWebsite: body.personalWebsite || null,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: {
        userId: session.user.id,
        ...(data as any),
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
