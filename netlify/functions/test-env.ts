import { Handler } from '@netlify/functions';

// Helper function to safely format private key for display
const formatKeyForDisplay = (key: string | undefined) => {
  if (!key) return 'undefined';
  const lines = key.split('\n');
  if (lines.length <= 2) {
    return `Single line key of length: ${key.length}`;
  }
  return `Multi-line key with ${lines.length} lines:\n` +
    `First line: ${lines[0]}\n` +
    `Last line: ${lines[lines.length - 1]}\n` +
    `Total length: ${key.length}`;
};

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  
  // Remove any surrounding quotes
  let formattedKey = key.replace(/^["']|["']$/g, '');
  
  // Replace escaped newlines with actual newlines
  formattedKey = formattedKey.replace(/\\n/g, '\n');
  
  // Ensure the key has the correct header and footer
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    formattedKey = '-----BEGIN PRIVATE KEY-----\n' + formattedKey;
  }
  if (!formattedKey.includes('-----END PRIVATE KEY-----')) {
    formattedKey = formattedKey + '\n-----END PRIVATE KEY-----';
  }
  
  return formattedKey;
};

export const handler: Handler = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Get raw environment variables
    const rawPrivateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

    // Format private key
    const formattedKey = formatPrivateKey(rawPrivateKey);

    // Prepare debug info
    const debugInfo = {
      environment: {
        hasPrivateKey: !!rawPrivateKey,
        hasClientEmail: !!clientEmail,
        hasProjectId: !!projectId,
        privateKeyInfo: formatKeyForDisplay(rawPrivateKey),
        formattedKeyInfo: formatKeyForDisplay(formattedKey),
        clientEmailPreview: clientEmail ? `${clientEmail.substring(0, 5)}...${clientEmail.substring(clientEmail.length - 10)}` : undefined,
        projectIdPreview: projectId,
      },
      keyAnalysis: {
        rawKey: {
          length: rawPrivateKey?.length || 0,
          containsBeginMarker: rawPrivateKey?.includes('-----BEGIN PRIVATE KEY-----') || false,
          containsEndMarker: rawPrivateKey?.includes('-----END PRIVATE KEY-----') || false,
          containsEscapedNewlines: rawPrivateKey?.includes('\\n') || false,
          containsActualNewlines: rawPrivateKey?.includes('\n') || false,
          startsWithQuote: rawPrivateKey?.startsWith('"') || false,
          endsWithQuote: rawPrivateKey?.endsWith('"') || false,
        },
        formattedKey: {
          length: formattedKey?.length || 0,
          containsBeginMarker: formattedKey?.includes('-----BEGIN PRIVATE KEY-----') || false,
          containsEndMarker: formattedKey?.includes('-----END PRIVATE KEY-----') || false,
          containsActualNewlines: formattedKey?.includes('\n') || false,
          lineCount: formattedKey?.split('\n').length || 0,
        },
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(debugInfo, null, 2),
    };
  } catch (error) {
    console.error('Environment test error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to test environment',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}; 