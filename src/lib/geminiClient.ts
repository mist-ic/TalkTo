import { z } from 'zod';

interface ChatRequest {
  message: string;
  context: string;
  characterId?: string;
}

interface GenerationConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  stopSequences?: string[];
  candidateCount?: number;
}

interface SafetySetting {
  category: string;
  threshold: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
  temperature: 0.9,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
  candidateCount: 1,
};

const DEFAULT_SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  }
];

export class GeminiClient {
  private apiKey: string;
  private baseUrl: string;
  private generationConfig: GenerationConfig;
  private safetySettings: SafetySetting[];
  private retryCount: number;
  private retryDelay: number;

  constructor(
    apiKey: string,
    config?: {
      baseUrl?: string;
      generationConfig?: Partial<GenerationConfig>;
      safetySettings?: SafetySetting[];
      retryCount?: number;
      retryDelay?: number;
    }
  ) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.apiKey = apiKey;
    this.baseUrl = config?.baseUrl || process.env.NEXT_PUBLIC_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.generationConfig = {
      ...DEFAULT_GENERATION_CONFIG,
      ...config?.generationConfig
    };
    this.safetySettings = config?.safetySettings || DEFAULT_SAFETY_SETTINGS;
    this.retryCount = config?.retryCount || 3;
    this.retryDelay = config?.retryDelay || 1000;
  }

  private formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryCount) {
        throw error;
      }

      console.warn(`Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
      await this.delay(this.retryDelay);
      return this.retryOperation(operation, attempt + 1);
    }
  }

  public updateConfig(config: Partial<GenerationConfig>): void {
    this.generationConfig = {
      ...this.generationConfig,
      ...config
    };
  }

  public updateSafetySettings(settings: SafetySetting[]): void {
    this.safetySettings = settings;
  }

  async streamChat({ message, context, characterId }: ChatRequest): Promise<Response> {
    const makeRequest = async () => {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: context }]
            },
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: this.generationConfig,
          safetySettings: this.safetySettings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Gemini API error (${response.status}): ${
            errorData?.error?.message || response.statusText
          }${characterId ? ` for character ${characterId}` : ''}`
        );
      }

      return response;
    };

    try {
      return await this.retryOperation(makeRequest);
    } catch (error) {
      const errorMessage = this.formatErrorMessage(error);
      throw new Error(`Failed to communicate with Gemini API: ${errorMessage}`);
    }
  }

  public async validateResponse(response: unknown): Promise<GeminiResponse> {
    const schema = z.object({
      candidates: z.array(
        z.object({
          content: z.object({
            parts: z.array(
              z.object({
                text: z.string()
              })
            )
          })
        })
      )
    });

    try {
      return schema.parse(response);
    } catch (error) {
      throw new Error('Invalid response format from Gemini API');
    }
  }
} 