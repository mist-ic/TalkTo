import { TextToSpeechClient } from '@google-cloud/text-to-speech';

async function testTTSAccess() {
  try {
    const client = new TextToSpeechClient({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });

    // Try to list available voices
    const [result] = await client.listVoices({});
    console.log('Successfully connected to Text-to-Speech API');
    console.log(`Available voices: ${result.voices?.length ?? 0}`);
    return true;
  } catch (error) {
    console.error('Error testing Text-to-Speech API access:', error);
    return false;
  }
}

export { testTTSAccess }; 