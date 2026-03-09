"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAllowedUser, setIsAllowedUser] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const userEmail = session?.user?.email ?? "";

  useEffect(() => {
    const checkAccess = async () => {
      if (!session || !userEmail) {
        setIsAllowedUser(false);
        return;
      }

      try {
        setCheckingAccess(true);

        const response = await fetch("/api/check-access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });

        const data = await response.json();
        setIsAllowedUser(Boolean(data.allowed));
      } catch (err) {
        console.error("Access check failed:", err);
        setIsAllowedUser(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [session, userEmail]);

  const handleGenerateSpeech = async () => {
    setError("");
    setAudioUrl("");

    if (!session) {
      setError("먼저 로그인해주세요.");
      return;
    }

    if (!isAllowedUser) {
      setError("허용된 사용자만 이 서비스를 이용할 수 있습니다.");
      return;
    }

    if (!text.trim()) {
      setError("텍스트를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error("음성 생성에 실패했습니다.");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      setError("음성 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "40px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "12px" }}>
        AI Dubbing Service
      </h1>

      <div style={{ marginBottom: "24px" }}>
        {status === "loading" ? (
          <p>로그인 상태 확인 중...</p>
        ) : session ? (
          <div>
            <p style={{ marginBottom: "8px" }}>
              로그인됨: {session.user?.email}
            </p>

            {checkingAccess ? (
              <p style={{ color: "#666", marginBottom: "12px" }}>
                접근 권한 확인 중...
              </p>
            ) : isAllowedUser ? (
              <p style={{ color: "green", marginBottom: "12px" }}>
                허용된 사용자입니다. 서비스를 이용할 수 있습니다.
              </p>
            ) : (
              <p style={{ color: "red", marginBottom: "12px" }}>
                허용 리스트에 없는 계정입니다. 접근이 제한됩니다.
              </p>
            )}

            <button
              onClick={() => signOut()}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Google로 로그인
          </button>
        )}
      </div>

      <p style={{ marginBottom: "24px" }}>
        텍스트를 입력하면 ElevenLabs를 통해 음성을 생성합니다.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 더빙할 텍스트를 입력하세요."
        rows={8}
        disabled={!session || !isAllowedUser || checkingAccess}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "16px",
          backgroundColor:
            !session || !isAllowedUser || checkingAccess ? "#f3f3f3" : "white",
        }}
      />

      <button
        onClick={handleGenerateSpeech}
        disabled={loading || !session || !isAllowedUser || checkingAccess}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          cursor:
            loading || !session || !isAllowedUser || checkingAccess
              ? "not-allowed"
              : "pointer",
          opacity:
            loading || !session || !isAllowedUser || checkingAccess ? 0.6 : 1,
        }}
      >
        {loading ? "생성 중..." : "음성 생성"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "16px" }}>{error}</p>
      )}

      {audioUrl && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ marginBottom: "12px" }}>생성된 음성</h2>
          <audio controls src={audioUrl} style={{ width: "100%" }} />
        </div>
      )}
    </main>
  );
}