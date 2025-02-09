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
    `Middle line sample length: ${lines[1]?.length || 0}\n` +
    `Last line: ${lines[lines.length - 1]}\n` +
    `Total length: ${key.length}`;
};

// Helper function to format private key
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  
  try {
    // Remove any surrounding quotes and whitespace
    let formattedKey = key.trim().replace(/^["']|["']$/g, '');
    
    // Split by escaped newlines and filter out empty lines
    const lines = formattedKey.split('\\n').filter(line => line.trim());
    
    // Reconstruct the key with proper formatting
    formattedKey = lines.join('\n');
    
    // Ensure proper header and footer
    if (!formattedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      formattedKey = '-----BEGIN PRIVATE KEY-----\n' + formattedKey;
    }
    if (!formattedKey.endsWith('-----END PRIVATE KEY-----')) {
      formattedKey = formattedKey + '\n-----END PRIVATE KEY-----';
    }
    
    return formattedKey;
  } catch (error) {
    console.error('Error formatting private key:', error);
    throw error;
  }
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

    // Analyze key structure
    const rawLines = rawPrivateKey?.split('\\n') || [];
    const formattedLines = formattedKey?.split('\n') || [];

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
          lineCount: rawLines.length,
          containsBeginMarker: rawPrivateKey?.includes('-----BEGIN PRIVATE KEY-----') || false,
          containsEndMarker: rawPrivateKey?.includes('-----END PRIVATE KEY-----') || false,
          containsEscapedNewlines: rawPrivateKey?.includes('\\n') || false,
          containsActualNewlines: rawPrivateKey?.includes('\n') || false,
          startsWithQuote: rawPrivateKey?.startsWith('"') || false,
          endsWithQuote: rawPrivateKey?.endsWith('"') || false,
          hasEmptyLines: rawLines.some(line => !line.trim()),
          firstLineLength: rawLines[0]?.length || 0,
          lastLineLength: rawLines[rawLines.length - 1]?.length || 0,
        },
        formattedKey: {
          length: formattedKey?.length || 0,
          lineCount: formattedLines.length,
          containsBeginMarker: formattedKey?.includes('-----BEGIN PRIVATE KEY-----') || false,
          containsEndMarker: formattedKey?.includes('-----END PRIVATE KEY-----') || false,
          containsActualNewlines: formattedKey?.includes('\n') || false,
          firstLine: formattedLines[0] || '',
          lastLine: formattedLines[formattedLines.length - 1] || '',
          middleLineSampleLength: formattedLines[1]?.length || 0,
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