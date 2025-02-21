import { NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/geminiClient';

// Initialize Gemini client
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY || '');

// Cache configuration
// const CACHE_CONTROL_HEADERS = {
//   'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//   'Pragma': 'no-cache',
//   'Expires': '0',
// };

export async function POST(request: Request) {
  try {
    const { message, characterId, context } = await request.json();

    if (!message || !characterId || !context) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Get the response from Gemini
    const response = await geminiClient.streamChat({
      message,
      context,
      characterId,
    });

    // Get the response data
    const data = await response.json();

    // Validate response format
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    // Return formatted response
    return NextResponse.json({
      candidates: [{
        content: {
          parts: [{
            text: data.candidates[0].content.parts[0].text
          }]
        }
      }]
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get response from AI',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// Configure for edge runtime
export const runtime = 'edge';

// Add revalidation configuration
export const revalidate = 60; // Revalidate every 60 seconds