'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterCard } from '@/components/CharacterCard';
import { ChatStream } from '@/components/ChatStream';
import { useChatStream } from '@/hooks/useChatStream';
import type { Character } from '@/types/character';

// Import character data
import gandhi from '../../public/characters/gandhi.json';

// For now, we'll use a static list of characters
const characters: Character[] = [gandhi];

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const { messages, isLoading, sendMessage } = useChatStream(selectedCharacter || characters[0]);

  return (
    <main className="flex min-h-screen bg-gray-950">
      {/* Character Selection */}
      <div className="w-full md:w-1/3 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-6">TalkToAI</h1>
        <div className="grid gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={selectedCharacter?.id === character.id}
              onClick={setSelectedCharacter}
            />
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <AnimatePresence mode="wait">
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 md:block border-l border-gray-800"
          >
            <ChatStream
              messages={messages}
              character={selectedCharacter}
              isLoading={isLoading}
              onSendMessage={sendMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Screen */}
      {!selectedCharacter && (
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome to TalkToAI
            </h2>
            <p className="text-gray-400">
              Select a character from the left to start a conversation and explore
              their unique perspectives and experiences.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
