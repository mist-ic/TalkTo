import { z } from 'zod';

// Character schema using Zod for validation
export const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  era: z.string(),
  expertise: z.array(z.string()),
  personality: z.object({
    traits: z.array(z.string()),
    speaking_style: z.string(),
    background_context: z.string()
  }),
  chat_context: z.string()
});

// TypeScript type derived from the Zod schema
export type Character = z.infer<typeof characterSchema>;

// Type for the character card component props
export interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  isSelected: boolean;
}

// Type for the chat message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
} 