import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";
import { isAllowedEmail } from "../../lib/allowed-users";

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed = await isAllowedEmail(email);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
            allowedContentTypes: [
                "audio/mpeg",
                "audio/mp3",
                "audio/wav",
                "audio/x-wav",
                "audio/mp4",
                "audio/aac",
                "audio/webm",
                "audio/m4a",
                "audio/x-m4a",
                "video/mp4",
                "video/quicktime",
                "video/webm",
                "video/x-matroska",
              ],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            email,
            pathname,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("blob upload route error:", error);
    return NextResponse.json(
      { error: "Upload token generation failed" },
      { status: 500 }
    );
  }
}