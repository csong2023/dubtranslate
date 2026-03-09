import { NextRequest } from "next/server";
import { isEmailAllowed } from "../../lib/allowed-users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.trim();

    if (!email) {
      return Response.json(
        { allowed: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const allowed = await isEmailAllowed(email);

    return Response.json({ allowed });
  } catch (error) {
    console.error("check-access route error:", error);

    return Response.json(
      {
        allowed: false,
        error: "Internal server error.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}