import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  // Replace literal '\n' with actual newlines and handle double-escaped newlines
  return key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
};

// Initialize client with better error handling
const getClient = () => {
  try {
    const privateKey = formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY);
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      console.error('Missing credentials:', {
        hasPrivateKey: !!privateKey,
        hasClientEmail: !!clientEmail,
        hasProjectId: !!projectId
      });
      throw new Error('Missing required Google Cloud credentials');
    }

    return new TextToSpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: projectId,
    });
  } catch (error) {
    console.error('Error initializing TTS client:', error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('Initializing TTS client...');
    const client = getClient();
    console.log('TTS client initialized successfully');

    console.log('Sending TTS request...');
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    });
    console.log('TTS request completed successfully');

    const audioContent = response.audioContent;
    if (!audioContent) {
      throw new Error('No audio content received');
    }

    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    // More detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to convert text to speech',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 