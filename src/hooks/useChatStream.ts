import { useState, useCallback, useEffect } from 'react';
import type { Character, ChatMessage, ToneType } from '@/types/character';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useChatStream = (character: Character | null, tone: ToneType = 'original') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Clear messages when character changes
  useEffect(() => {
    if (character) {
      setMessages([]);
    }
  }, [character]);

  const makeApiCall = useCallback(async (content: string, contextWithTone: string, attempt: number = 1): Promise<GeminiResponse> => {
    if (!character) {
      throw new Error('No character selected');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          characterId: character.id,
          context: contextWithTone,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format');
      }

      return data;
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        console.log(`Attempt ${attempt} failed, retrying...`);
        await sleep(RETRY_DELAY);
        return makeApiCall(content, contextWithTone, attempt + 1);
      }
      throw error;
    }
  }, [character]);

  const sendMessage = useCallback(async (content: string): Promise<ChatMessage | null> => {
    if (!character) {
      console.error('No character selected');
      return null;
    }

    setIsLoading(true);

    try {
      // Add user message to messages state
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);

      const toneModifier = character.toneModifiers?.[tone] || '';
      const contextWithTone = `${character.chat_context}\n\n${toneModifier}`;

      const data = await makeApiCall(content, contextWithTone);
      const responseText = data.candidates[0].content.parts[0].text;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (error) {
      console.error('Chat error after all retries:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while trying to respond. Please try again later.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [character, tone, makeApiCall]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}; 