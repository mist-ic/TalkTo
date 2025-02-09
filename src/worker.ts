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
    try {
      const response = await env.ASSETS.fetch(request);
      return response;
    } catch (err) {
      console.error('Application error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

export default worker; 