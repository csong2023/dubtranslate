# AI Dubbing Service

A web-based AI dubbing service built with Next.js, Google OAuth, ElevenLabs, and Turso.

## Overview

This project is an AI dubbing web service developed for the Perso AI DevRel assignment.  
Users can sign in with Google, and only users registered in the whitelist database are allowed to access the service.  
Once authenticated, approved users can enter text and generate spoken audio using the ElevenLabs Text-to-Speech API.

## Live Demo

[Deployment URL here]

## Features

- Google OAuth login
- Whitelist-based access control
- Turso database integration for allowed user management
- Text-to-speech generation using ElevenLabs API
- Audio playback directly in the browser
- Restricted access for non-whitelisted users

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Authentication:** Auth.js / NextAuth with Google OAuth
- **Database:** Turso (libSQL)
- **AI API:** ElevenLabs Text-to-Speech API
- **Deployment:** Vercel

## Project Structure

```bash
app
├─ api
│  ├─ auth
│  │  └─ [...nextauth]
│  │     └─ route.ts
│  ├─ check-access
│  │  └─ route.ts
│  └─ tts
│     └─ route.ts
├─ page.tsx
├─ layout.tsx
├─ providers.tsx
auth.ts