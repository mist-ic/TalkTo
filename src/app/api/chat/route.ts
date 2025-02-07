import { NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/geminiClient';

// Initialize Gemini client
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message, characterId, context } = await request.json();

    if (!message || !characterId || !context) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get the response from Gemini
    const response = await geminiClient.streamChat({
      message,
      context,
    });

    // Get the response data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

// Configure Cloudflare specific headers
export const runtime = 'edge';
export const preferredRegion = 'auto'; 