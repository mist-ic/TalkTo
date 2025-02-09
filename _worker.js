export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Serve static assets from the bucket
    if (url.pathname.startsWith('/static/')) {
      return env.ASSETS.fetch(request);
    }

    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        return new Response('API endpoint not found', { status: 404 });
      }
      return response;
    }

    // Default to serving the Next.js application
    return env.ASSETS.fetch(request);
  },
}; 