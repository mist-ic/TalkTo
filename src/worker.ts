import { NextResponse } from 'next/server';

export default {
  async fetch(request: Request, env: any, ctx: any) {
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
      } catch (error) {
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