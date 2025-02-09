import { Handler } from '@netlify/functions';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  return key.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
};

export const handler: Handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const privateKey = formatPrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY);
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    // Log credential presence
    console.log('Checking credentials:', {
      hasPrivateKey: !!privateKey,
      hasClientEmail: !!clientEmail,
      hasProjectId: !!projectId,
      privateKeyLength: privateKey?.length || 0,
    });

    if (!privateKey || !clientEmail || !projectId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Missing credentials',
          details: {
            hasPrivateKey: !!privateKey,
            hasClientEmail: !!clientEmail,
            hasProjectId: !!projectId,
          },
        }),
      };
    }

    const client = new TextToSpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: projectId,
    });

    // Test the client by listing voices
    const [result] = await client.listVoices({});
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'TTS client initialized successfully',
        voicesCount: result.voices?.length || 0,
      }),
    };
  } catch (error) {
    console.error('TTS test error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to initialize TTS client',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };
  }
}; 