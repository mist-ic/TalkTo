# TalkToAi

TalkToAi is an interactive web application that lets you chat with AI-powered digital personalities—bringing history and culture to life through engaging conversations.

## Overview

TalkToAi transforms learning about notable figures into a fun, interactive experience. Users select animated character cards and engage in real-time conversations that mimic the personalities of historical or cultural icons. Every response is context-aware and delivered with low latency—thanks to Cloudflare's global edge network.

## Features

- **Real-Time AI Chat:** Instantly interact with digital personas
- **Engaging Animations:** Smooth, GPU-accelerated animations with Framer Motion
- **Optimized Performance:** Global edge delivery with Cloudflare
- **Text-to-Speech:** Natural voice synthesis for character responses

## Tech Stack

- Next.js 15
- React 19
- Framer Motion
- SWR
- Tailwind CSS
- Google Cloud Text-to-Speech

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file with:
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_CLIENT_EMAIL=your_client_email
   GOOGLE_CLOUD_PRIVATE_KEY=your_private_key
   ```

3. **Start Production Server**
   ```bash
   npm run build
   npm start
   ```

## Character Profiles

Character profiles are stored in `public/characters/` as JSON files. Each profile includes:
- Name and title
- Historical background
- Expertise areas
- Profile image URL
- Conversation style preferences

## API Endpoints

- `/api/chat`: Main chat endpoint for character interactions
- `/api/tts`: Text-to-speech synthesis for character voices

## Security

- CORS headers configured for API endpoints
- Content security policies enabled
- Rate limiting on API routes
- Secure environment variable handling

For detailed technical documentation, see `Doc.md`.

---

## Developer Notes

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/mist-ic/TalkToAi.git
   cd TalkToAi
   ```

2. **Development Server**
   ```bash
   npm run dev
   ```

### Project Structure
```plaintext
TalkToAi/
├── public/
│   └── characters/          # Character JSON profiles
│       ├── gandhi.json
│       └── [other].json
├── src/
│   ├── components/          # React components
│   │   ├── CharacterCard.tsx
│   │   └── ChatStream.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useTextToSpeech.ts
│   ├── app/               # Next.js app router
│   │   ├── page.tsx
│   │   └── api/
│   │       ├── chat/
│   │       └── tts/
│   └── lib/               # Utility functions
│       └── geminiClient.ts
├── .env.local             # Local environment variables
└── next.config.mjs        # Next.js configuration
```

### Testing and Development Tools
- Run tests: `npm run test`
- Lint code: `npm run lint`
- Format code: `npm run format`

### Environment Setup
Development environment requires:
- Node.js 20+
- npm or yarn
- Google Cloud Platform account with Text-to-Speech API enabled
- Environment variables in `.env.local`

### Deployment Pipeline
1. Push to main branch
2. Automatic build and deployment via Cloudflare Pages
3. API endpoints deployed to Cloudflare Workers

### Future Development
- User authentication integration
- Dynamic content management system
- Enhanced analytics and monitoring
- Voice customization options 