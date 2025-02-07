import { NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/geminiClient';

// Initialize Gemini client
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY || '');

// Cache configuration
const CACHE_CONTROL_HEADERS = {
  'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=59',
  'CDN-Cache-Control': 'max-age=60',
};

export async function POST(request: Request) {
  try {
    const { message, characterId, context } = await request.json();

    if (!message || !characterId || !context) {
      return new NextResponse('Missing required fields', { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store'
        }
      });
    }

    // Get the response from Gemini
    const response = await geminiClient.streamChat({
      message,
      context,
    });

    // Get the response data
    const data = await response.json();

    // Return response with caching headers
    return NextResponse.json(data, {
      headers: {
        ...CACHE_CONTROL_HEADERS,
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new NextResponse('Internal server error', { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}

// Configure Cloudflare specific headers
export const runtime = 'edge';
export const preferredRegion = 'auto';

// Add revalidation configuration
export const revalidate = 60; // Revalidate every 60 seconds