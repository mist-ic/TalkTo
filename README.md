# TalkToAi

**For Professionals! Consult Doc.md for detailed developer documentation.**

TalkToAi is an interactive web application that lets you chat with AI-powered digital personalities—bringing history and culture to life through engaging conversations.

## Overview

TalkToAi transforms learning about notable figures into a fun, interactive experience. Users select animated character cards and engage in real-time conversations that mimic the personalities of historical or cultural icons. Powered by the Gemini 2.0 Flash API, every response is context-aware and delivered with low latency—thanks to Cloudflare's global edge network.

## Features

- **Real-Time AI Chat:** Instantly interact with digital personas.
- **Engaging Animations:** Smooth, GPU-accelerated animations with Framer Motion.
- **Optimized Performance:** Utilizes Cloudflare Pages and Workers for rapid global delivery.
- **Modular Architecture:** Built using Next.js, making it scalable and maintainable.
- **Robust Testing:** Ensured quality with Jest and React Testing Library.

## Tech Stack

- Next.js
- Framer Motion
- SWR
- Tailwind CSS
- Cloudflare Workers
- Jest with React Testing Library

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/mist-ic/TalkToAi.git
   cd TalkToAi
   ```

2. **Install Dependencies**

   Using npm:
   ```bash
   npm install
   ```
   
   Or using yarn:
   ```bash
   yarn install
   ```

3. **Configuration**

   Create a `.env` file in the root of the project with the following content:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   CLOUDFLARE_ANALYTICS_TOKEN=your_analytics_token_here
   ```

## Local Development

- **Start the Development Server (Next.js):**
  
  ```bash
  npm run dev
  ```

- **Run Cloudflare Workers Locally:**
  
  ```bash
  wrangler dev
  ```

- **Run Tests:**
  
  ```bash
  npm run test
  ```

## Directory Structure

```plaintext
TalkToAi/
├── public/
│   └── characters/
│       ├── gandhi.json         # Character profile example
│       └── [other-character].json
├── src/
│   ├── components/
│   │   ├── CharacterCard.js    # Animated character cards
│   │   └── ChatStream.js       # Live chat response display
│   │   └── useChatStream.js    # Custom hook for streaming responses
│   │   └── index.js            # Homepage with character grid
│   │   └── api/
│   │       └── chat.js         # API endpoint for proxying Gemini API requests
│   │   └── lib/
│   │       └── geminiClient.js     # Helper for Gemini API calls
│   │   └── styles/
│   │       └── tailwind.css        # Tailwind CSS configuration and styles
│   ├── docs/                      # Developer documentation
│   ├── package.json               # Project configuration and dependencies
│   └── wrangler.toml              # Cloudflare Workers configuration
```

## Deployment

- **Static Site:**  
  Deployed automatically via Cloudflare Pages for seamless updates.

- **API Endpoints:**  
  Powered by Cloudflare Workers. Automated deployment is supported via GitHub Actions and the Wrangler CLI.

## Future Enhancements

- **User Authentication:** Integration with third-party providers.
- **Dynamic Content Management:** Transition from local JSON files to a Headless CMS.
- **Enhanced Analytics & Monitoring:** Implement advanced metrics and monitoring tools. 