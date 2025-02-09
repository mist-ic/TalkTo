import { NextResponse } from 'next/server';

interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      try {
        // Forward to Next.js API routes
        const response = await env.ASSETS.fetch(request);
        if (response.status === 404) {
          return new Response('API endpoint not found', { status: 404 });
        }
        return response;
      } catch (err) {
        console.error('API route error:', err);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }

    // Default to serving the Next.js application
    return env.ASSETS.fetch(request);
  }
};

export default worker; 