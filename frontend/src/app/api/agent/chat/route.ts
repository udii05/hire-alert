import { NextRequest } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

function buildSystemPrompt(context: any): string {
  const p = context.profile;
  const s = context.stats;
  const name = context.name || "User";

  const parts: string[] = [];

  parts.push(`You are career-copilot, a helpful AI assistant for the HireAlert platform.`);
  parts.push(`You help ${name} with career-related questions, profile information, and general advice.`);
  parts.push(`Be concise, friendly, and professional. Use markdown for formatting when helpful.`);

  // Identity
  parts.push(`\n## User Identity`);
  parts.push(`- Name: ${name}`);
  if (context.email) parts.push(`- Email: ${context.email}`);

  // Stats
  if (s) {
    parts.push(`\n## Dashboard Stats`);
    parts.push(`- Saved jobs: ${s.saved || 0}`);
    parts.push(`- Applied: ${s.applied || 0}`);
    parts.push(`- Interviews: ${s.interviews || 0}`);
    parts.push(`- Offers: ${s.offers || 0}`);
    parts.push(`- Average fit score: ${s.averageFitScore || 0}%`);
    parts.push(`- Upcoming deadlines: ${s.deadlines || 0}`);
    parts.push(`- Weekly views: ${s.weeklyViews || 0}`);
    parts.push(`- Weekly applications: ${s.weeklyApplications || 0}`);
  }

  // Applied jobs
  if (context.appliedJobs?.length) {
    parts.push(`\n## Applied Jobs`);
    context.appliedJobs.forEach((job: string, i: number) => {
      parts.push(`- ${job}`);
    });
  }

  // Recommendations
  if (context.recommendedCount !== undefined) {
    parts.push(`\n## Recommendations`);
    parts.push(`- ${context.recommendedCount} recommended opportunities available`);
  }
  if (context.rejectedCount !== undefined) {
    parts.push(`- ${context.rejectedCount} rejected`);
  }

  // Profile details
  if (p) {
    parts.push(`\n## Profile Details`);

    // Education
    const edu: string[] = [];
    if (p.college) edu.push(p.college);
    if (p.degree) edu.push(p.degree);
    if (p.branch) edu.push(p.branch);
    if (p.graduationYear) edu.push(`Class of ${p.graduationYear}`);
    if (p.cgpa) edu.push(`CGPA: ${p.cgpa}`);
    if (edu.length) parts.push(`- Education: ${edu.join(", ")}`);

    // Experience
    const exp: string[] = [];
    if (p.currentStatus) exp.push(`Status: ${p.currentStatus}`);
    if (p.yearsOfExperience) exp.push(`${p.yearsOfExperience} years experience`);
    if (p.currentCompany) exp.push(`Current: ${p.currentCompany}`);
    if (p.previousCompanies?.length) exp.push(`Previous: ${p.previousCompanies.join(", ")}`);
    if (exp.length) parts.push(`- Experience: ${exp.join(" | ")}`);

    // Skills
    const skills: string[] = [];
    if (p.programmingLanguages?.length) skills.push(`Languages: ${p.programmingLanguages.join(", ")}`);
    if (p.frameworks?.length) skills.push(`Frameworks: ${p.frameworks.join(", ")}`);
    if (p.libraries?.length) skills.push(`Libraries: ${p.libraries.join(", ")}`);
    if (p.databases?.length) skills.push(`Databases: ${p.databases.join(", ")}`);
    if (p.cloudPlatforms?.length) skills.push(`Cloud: ${p.cloudPlatforms.join(", ")}`);
    if (p.aiMlTechnologies?.length) skills.push(`AI/ML: ${p.aiMlTechnologies.join(", ")}`);
    if (p.devopsTools?.length) skills.push(`DevOps: ${p.devopsTools.join(", ")}`);
    if (p.dataAnalysisTools?.length) skills.push(`Data: ${p.dataAnalysisTools.join(", ")}`);
    if (p.designTools?.length) skills.push(`Design: ${p.designTools.join(", ")}`);
    if (p.softSkills?.length) skills.push(`Soft: ${p.softSkills.join(", ")}`);
    if (p.skills?.length && skills.length === 0) skills.push(`Skills: ${p.skills.join(", ")}`);
    if (skills.length) {
      parts.push(`- Skills:`);
      skills.forEach((s) => parts.push(`  ${s}`));
    }

    // Job preferences
    const prefs: string[] = [];
    if (p.preferredRoles?.length) prefs.push(`Roles: ${p.preferredRoles.join(", ")}`);
    if (p.preferredLocations?.length) prefs.push(`Locations: ${p.preferredLocations.join(", ")}`);
    if (p.preferredCompanies?.length) prefs.push(`Companies: ${p.preferredCompanies.join(", ")}`);
    if (p.jobType) prefs.push(`Type: ${p.jobType}`);
    if (p.workMode) prefs.push(`Mode: ${p.workMode}`);
    if (p.willingToRelocate !== undefined) prefs.push(`Relocate: ${p.willingToRelocate ? "Yes" : "No"}`);
    if (prefs.length) parts.push(`- Job Preferences: ${prefs.join(" | ")}`);

    // Location
    const loc: string[] = [];
    if (p.city) loc.push(p.city);
    if (p.country) loc.push(p.country);
    if (p.nationality) loc.push(p.nationality);
    if (loc.length) parts.push(`- Location: ${loc.join(", ")}`);

    // Interests
    if (p.interests?.length) parts.push(`- Interests: ${p.interests.join(", ")}`);

    // Links
    const links: string[] = [];
    if (p.githubUrl) links.push(`GitHub: ${p.githubUrl}`);
    if (p.linkedinUrl) links.push(`LinkedIn: ${p.linkedinUrl}`);
    if (p.portfolioUrl) links.push(`Portfolio: ${p.portfolioUrl}`);
    if (p.personalWebsite) links.push(`Website: ${p.personalWebsite}`);
    if (p.resumeUrl) links.push(`Resume: ${p.resumeUrl}`);
    if (links.length) parts.push(`- Links: ${links.join(" | ")}`);
  }

  parts.push(`\n## Instructions`);
  parts.push(`- Answer questions naturally, like a helpful career coach`);
  parts.push(`- When asked about the user's profile, refer to the data above`);
  parts.push(`- If asked about something not in the profile, say so honestly`);
  parts.push(`- For general/career questions, provide helpful advice`);
  parts.push(`- Keep responses concise unless asked for detail`);
  parts.push(`- If the user asks follow-up questions, maintain context from the conversation`);

  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Messages array is required" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(context || {});

    const ollamaMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "agent" ? "assistant" : m.role,
        content: m.content,
      })),
    ];

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: true,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error("Ollama error:", errorText);
      return Response.json(
        { error: `Ollama returned ${ollamaResponse.status}: ${errorText}` },
        { status: 502 }
      );
    }

    // Stream the response back
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`)
                  );
                }
                if (parsed.done) {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
