# 🎬 DubTranslate: Real-time translation for both Audio and Video

An a web application that allows real-time translation of an audio/video file into four different languages (kor, eng, spn, jpn), where users can retrieve a dubbed version of their original file.

Users can upload **audio or video**, select a target language, and receive an automatically generated **dubbed output**.

This project demonstrates a **complete AI media pipeline** built using modern web technologies.

DubTranslate는 오디오 및 비디오 파일을 자동으로 번역하고 더빙까지 생성하는 AI 기반 미디어 파이프라인 웹 애플리케이션입니다.

사용자는 미디어 파일을 업로드하고 원하는 언어를 선택하면, 음성 인식 → 번역 → AI 음성 생성 → 더빙된 결과물 생성의 과정을 자동으로 수행하여 새로운 언어의 콘텐츠를 빠르게 얻을 수 있습니다.

Project Link: **https://dubtranslate.vercel.app/**

---

# 📌 Overview

The application automates the entire dubbing workflow:

1. Upload media
2. Extract speech
3. Translate content
4. Generate AI voice
5. Merge audio with video

This enables fast localization of media content across languages.

---

# 🚀 Features

• Upload **audio or video files**

• **Speech transcription**

• **AI translation**

• **AI voice generation**

• **Automatic video dubbing**

• **Google authentication**

• Supports **multiple languages**

• Works with both **audio and video inputs**

---

## System Pipeline

```mermaid
flowchart TD
A[Upload Media] --> B[Speech Transcription]
B --> C[Translation]
C --> D[AI Voice Generation]
D --> E[Video + Audio Merge]
E --> F[Dubbed Media Output]
```

---

# 🛠 Tech Stack

## Frontend

- **Next.js**
- **React**
- **TypeScript**
- **NextAuth**

## Backend

- **Next.js API Routes**
- **Node.js**

## AI Services

- **OpenAI API**
- **Speech-to-Text**
- **AI Translation**
- **Text-to-Speech**

## Media Processing

- **FFmpeg**

## Authentication

- **Google OAuth**

---

## 📂 Project Structure

```
app/
├─ api/
│  ├─ auth/
│  ├─ transcribe/
│  │  └─ route.ts
│  ├─ translate/
│  │  └─ route.ts
│  └─ dub/
│     └─ route.ts
│
├─ page.tsx
├─ layout.tsx
└─ providers.tsx

lib/
├─ allowed-users.ts
└─ db.ts
```

---

# ⚙️ Installation

```
## 1. Clone the repository
`git clone https://github.com/YOUR_USERNAME/ai-dubbing-service.git`
`cd ai-dubbing-service`

## 2. Install dependencies
`npm install`
`npm install lucide-react`


## 3. Install FFmpeg
Mac: `brew install ffmpeg`
```

# 🔑 Environment Variables

Create a `.env.local` file in the root directory.

```
`OPENAI_API_KEY=your_openai_api_key`

`NEXTAUTH_SECRET=your_secret`

`GOOGLE_CLIENT_ID=your_google_client_id`
`GOOGLE_CLIENT_SECRET=your_google_client_secret`
```

---

# ▶️ Running the Project

Start the development server:


`npm run dev`


Open the application:


`http://localhost:3000`


---

# 🖥 Usage

1. Login with **Google**
2. Upload an **audio or video file**
3. Select a **target language**
4. Click **Generate Dub**

The system will process the media and return a dubbed result.

| Input | Output |
|------|------|
Audio | Dubbed audio file |
Video | Dubbed MP4 video |

---

# 🔮 Future Improvements

Potential future features:

• Lip-sync alignment

• Subtitle generation

• Multi-speaker detection

• Voice cloning

• Real-time dubbing

• Streaming support

---

# 👨‍💻 Author

Chris Yunho Song  
Carnegie Mellon University 28'
Major: Computer Science and Information Systems