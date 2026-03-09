"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateSpeech = async () => {
    setError("");
    setAudioUrl("");
  
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
      <p style={{ marginBottom: "24px" }}>
        텍스트를 입력하면 ElevenLabs를 통해 음성을 생성합니다.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 더빙할 텍스트를 입력하세요."
        rows={8}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "16px",
        }}
      />

      <button
        onClick={handleGenerateSpeech}
        disabled={loading}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "생성 중..." : "음성 생성"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "16px" }}>
          {error}
        </p>
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