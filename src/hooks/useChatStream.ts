import { useState, useCallback } from 'react';
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

export const useChatStream = (character: Character, tone: ToneType = 'original') => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const makeApiCall = async (content: string, contextWithTone: string, attempt: number = 1): Promise<GeminiResponse> => {
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
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const toneModifier = character.toneModifiers?.[tone] || '';
      const contextWithTone = `${character.chat_context}\n\n${toneModifier}`;

      const data = await makeApiCall(content, contextWithTone);

      setMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error('Chat error after all retries:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I encountered multiple errors while trying to respond. Please try again later.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [character, tone]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
}; 