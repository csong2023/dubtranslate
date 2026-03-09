import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: "Text is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing ELEVENLABS_API_KEY." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice example

    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      }
    );

    if (!elevenResponse.ok) {
      const errorText = await elevenResponse.text();
      return new Response(
        JSON.stringify({
          error: "ElevenLabs API request failed.",
          details: errorText,
        }),
        {
          status: elevenResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const audioBuffer = await elevenResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error("TTS route error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}