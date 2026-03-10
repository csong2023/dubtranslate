import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAllowedEmail } from "../../lib/allowed-users";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File must be 4.5MB or smaller." },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
    });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch {
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}