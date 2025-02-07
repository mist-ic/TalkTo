'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useChatStream } from '@/hooks/useChatStream';
import type { Character, ToneType } from '@/types/character';

// Dynamically import components
const CharacterCard = dynamic(() => import('@/components/CharacterCard').then(mod => mod.CharacterCard), {
  loading: () => <CharacterCardSkeleton />
});

const ChatStream = dynamic(() => import('@/components/ChatStream').then(mod => mod.ChatStream), {
  loading: () => <ChatStreamSkeleton />
});

// Loading skeletons
const CharacterCardSkeleton = () => (
  <div className="animate-pulse bg-gray-800 rounded-xl aspect-[3/4] w-full max-w-sm" />
);

const ChatStreamSkeleton = () => (
  <div className="flex-1 animate-pulse bg-gray-900 p-4">
    <div className="h-4 bg-gray-800 rounded w-1/4 mb-4" />
    <div className="space-y-3">
      <div className="h-10 bg-gray-800 rounded w-3/4" />
      <div className="h-10 bg-gray-800 rounded w-1/2" />
    </div>
  </div>
);

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('original');
  const [isLoading, setIsLoading] = useState(true);

  const { messages, isLoading: chatIsLoading, sendMessage } = useChatStream(
    selectedCharacter || characters[0],
    selectedTone
  );

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const gandhi = (await import('../../public/characters/gandhi.json')).default;
        setCharacters([gandhi]);
      } catch (error) {
        console.error('Failed to load characters:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCharacters();
  }, []);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    // Reset tone to original when selecting a new character
    setSelectedTone('original');
  };

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
              onClick={handleCharacterSelect}
              onToneSelect={setSelectedTone}
              selectedTone={selectedTone}
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
              isLoading={chatIsLoading}
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
