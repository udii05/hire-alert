import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Trigger the AI agent workflow on the FastAPI backend
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const apiKey = process.env.BACKEND_API_KEY;

    const response = await fetch(`${backendUrl}/api/agents/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey || "",
      },
      body: JSON.stringify({
        user_id: session.user.id,
        workflow_type: "full_refresh",
      }),
    });

    if (!response.ok) {
      console.error("Backend agent trigger failed:", await response.text());
      // Even if backend fails, return success to avoid blocking the UI
    }

    return NextResponse.json({
      success: true,
      message: "Refresh initiated",
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Failed to initiate refresh" },
      { status: 500 }
    );
  }
}
