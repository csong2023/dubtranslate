"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Upload,
  Languages,
  Sparkles,
  LogOut,
  PlayCircle,
  Download,
  FileAudio,
  FileVideo,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const MAX_FILE_SIZE = 4.5 * 1024 * 1024;

export default function Home() {
  const { data: session, status } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState("Korean");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultType, setResultType] = useState<"audio" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAccess() {
      if (!session?.user?.email) return;
      setAccessLoading(true);
      try {
        const res = await fetch("/api/check-access");
        const data = await res.json();
        setIsAllowed(Boolean(data.allowed));
      } catch {
        setIsAllowed(false);
      } finally {
        setAccessLoading(false);
      }
    }

    if (session) checkAccess();
  }, [session]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function validateFile(selectedFile: File) {
    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File must be 4.5MB or smaller.";
    }
    return "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const errorMessage = validateFile(selectedFile);
    if (errorMessage) {
      setFile(null);
      setError(errorMessage);
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError("");
  }

  async function handleGenerate() {
    if (!file) {
      alert("Upload a file first");
      return;
    }

    const errorMessage = validateFile(file);
    if (errorMessage) {
      setError(errorMessage);
      alert(errorMessage);
      return;
    }

    setLoading(true);
    setError("");

    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setResultType(null);

    try {
      const transcribeForm = new FormData();
      transcribeForm.append("file", file);

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: transcribeForm,
      });

      if (!transcribeRes.ok) {
        alert(`Transcribe failed (${transcribeRes.status})`);
        return;
      }

      const transcribeData = await transcribeRes.json();
      const text = transcribeData.text?.trim();

      if (!text) {
        alert("Transcription returned empty text");
        return;
      }

      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          targetLang,
        }),
      });

      if (!translateRes.ok) {
        alert(`Translate failed (${translateRes.status})`);
        return;
      }

      const translateData = await translateRes.json();
      const translated = translateData.translatedText?.trim();

      if (!translated) {
        alert("Translation returned empty text");
        return;
      }

      const dubForm = new FormData();
      dubForm.append("file", file);
      dubForm.append("text", translated);

      const dubRes = await fetch("/api/dub", {
        method: "POST",
        body: dubForm,
      });

      if (!dubRes.ok) {
        alert(`Dub generation failed (${dubRes.status})`);
        return;
      }

      const outputBlob = await dubRes.blob();

      if (!outputBlob.size) {
        alert("Dub returned empty result");
        return;
      }

      const url = URL.createObjectURL(outputBlob);
      setResultUrl(url);
      setResultType(file.type.startsWith("video/") ? "video" : "audio");
    } catch {
      alert("Error generating dub");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading session...</span>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
          <div className="grid w-full gap-10 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4" />
                AI-powered video → translation → dubbing
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                DubTranslate
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                Upload audio or video, transcribe speech, translate it into your
                target language, and generate a dubbed output in one streamlined
                workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => signIn("google")}
                  className="rounded-2xl bg-white px-6 py-3 font-medium text-black transition hover:scale-[1.02] hover:bg-zinc-200"
                >
                  Login with Google
                </button>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-zinc-300">
                  Max file size: 4.5MB
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/20 via-cyan-500/10 to-blue-500/20 blur-3xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                <div className="space-y-5">
                  <FeatureRow
                    icon={<Upload className="h-5 w-5" />}
                    title="Upload media"
                    desc="Supports audio and video input."
                  />
                  <FeatureRow
                    icon={<PlayCircle className="h-5 w-5" />}
                    title="Transcribe speech"
                    desc="Extracts spoken text from the uploaded file."
                  />
                  <FeatureRow
                    icon={<Languages className="h-5 w-5" />}
                    title="Translate instantly"
                    desc="Converts text into your selected target language."
                  />
                  <FeatureRow
                    icon={<Sparkles className="h-5 w-5" />}
                    title="Generate dubbed output"
                    desc="Returns a playable audio or video result."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (accessLoading || isAllowed === null) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
          </div>
          <h1 className="text-2xl font-semibold">Checking access</h1>
          <p className="mt-2 text-zinc-400">
            Verifying whether your account is allowed to use this service.
          </p>
        </div>
      </main>
    );
  }

  if (!isAllowed) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-red-400/20 bg-white/5 p-8 text-center shadow-xl backdrop-blur">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <ShieldAlert className="h-7 w-7 text-red-300" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>

          <p className="mt-3 text-zinc-400">
            Your account is signed in, but this email is not on the allowed user
            list.
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/70 p-4 text-sm text-zinc-300">
            Signed in as{" "}
            <span className="font-medium text-white">
              {session.user?.email}
            </span>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI Dubbing Studio
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create dubbed audio and video in minutes
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Upload media, translate speech, and generate a dubbed result from
              one clean workflow.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="text-sm text-zinc-400">
              Logged in as{" "}
              <span className="font-medium text-white">
                {session.user?.email}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Upload your media</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Supports audio and video files up to 4.5MB.
              </p>
            </div>

            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-zinc-900/60 px-6 py-12 text-center transition hover:border-cyan-400/40 hover:bg-zinc-900">
              <Upload className="mb-4 h-10 w-10 text-zinc-400 group-hover:text-cyan-300" />
              <span className="text-lg font-medium">
                Click to choose an audio or video file
              </span>
              <span className="mt-2 text-sm text-zinc-400">
                MP3, WAV, MP4, MOV and more
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                Maximum file size: 4.5MB
              </span>
              <input
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {file && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
                {file.type.startsWith("video/") ? (
                  <FileVideo className="h-5 w-5 text-cyan-300" />
                ) : (
                  <FileAudio className="h-5 w-5 text-cyan-300" />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-sm text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "Unknown type"}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Target Language
                </label>
                <div className="relative">
                  <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-zinc-900 px-10 py-3 text-white outline-none transition focus:border-cyan-400/50"
                  >
                    <option>Korean</option>
                    <option>English</option>
                    <option>Japanese</option>
                    <option>Spanish</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !file}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.01] hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Dub
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MiniStat title="Step 1" desc="Transcribe speech" />
              <MiniStat title="Step 2" desc="Translate text" />
              <MiniStat title="Step 3" desc="Generate dub" />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Result Preview</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Your dubbed output will appear here when generation completes.
              </p>
            </div>

            {!resultUrl && (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-900/60 text-center">
                <PlayCircle className="mb-4 h-12 w-12 text-zinc-500" />
                <p className="text-lg font-medium text-zinc-300">No generated result yet</p>
                <p className="mt-2 max-w-sm text-sm text-zinc-500">
                  Upload a file, choose a language, and run dub generation to preview the output here.
                </p>
              </div>
            )}

            {resultUrl && resultType === "audio" && (
              <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileAudio className="h-5 w-5 text-cyan-300" />
                  <h3 className="font-semibold">Dubbed Audio</h3>
                </div>
                <audio controls src={resultUrl} className="w-full" />
                <a
                  href={resultUrl}
                  download="dubbed-audio.mp3"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  <Download className="h-4 w-4" />
                  Download Audio
                </a>
              </div>
            )}

            {resultUrl && resultType === "video" && (
              <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileVideo className="h-5 w-5 text-cyan-300" />
                  <h3 className="font-semibold">Dubbed Video</h3>
                </div>
                <video
                  controls
                  src={resultUrl}
                  className="w-full rounded-2xl border border-white/10"
                />
                <a
                  href={resultUrl}
                  download="dubbed-video.mp4"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                >
                  <Download className="h-4 w-4" />
                  Download Video
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
      <div className="rounded-xl bg-white/10 p-2 text-cyan-300">{icon}</div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{desc}</p>
      </div>
    </div>
  );
}

function MiniStat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-1 font-medium text-zinc-200">{desc}</p>
    </div>
  );
}