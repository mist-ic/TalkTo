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
  <div className="flex-1 p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-800 rounded w-3/4" />
      <div className="h-4 bg-gray-800 rounded w-1/2" />
      <div className="h-4 bg-gray-800 rounded w-2/3" />
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
        // Fetch all character JSON files
        const responses = await Promise.all([
          // Freedom Fighters
          fetch('/characters/gandhi.json'),
          fetch('/characters/bhagat.json'),
          fetch('/characters/laxmibai.json'),
          // Scientists
          fetch('/characters/tesla.json'),
          fetch('/characters/newton.json'),
          fetch('/characters/einstein.json'),
          // Military Leaders
          fetch('/characters/shivaji.json'),
          fetch('/characters/genghis.json'),
          fetch('/characters/napolean.json')
        ]);
        
        const characterData = await Promise.all(
          responses.map(res => res.json())
        );
        
        // Group characters by their expertise/field
        const [
          // Freedom Fighters
          gandhi, bhagat, laxmibai,
          // Scientists
          tesla, newton, einstein,
          // Military Leaders
          shivaji, genghis, napolean
        ] = characterData;
        
        // Set characters in a meaningful order
        setCharacters([
          // Freedom Fighters Group
          gandhi, bhagat, laxmibai,
          // Scientists Group
          einstein, tesla, newton,
          // Military Leaders Group
          shivaji, genghis, napolean
        ]);
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
        <div className="grid gap-8">
          {/* Freedom Fighters Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Freedom Fighters</h2>
            <div className="grid gap-6">
              {characters.slice(0, 3).map((character) => (
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

          {/* Scientists Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Scientists</h2>
            <div className="grid gap-6">
              {characters.slice(3, 6).map((character) => (
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

          {/* Military Leaders Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Military Leaders</h2>
            <div className="grid gap-6">
              {characters.slice(6, 9).map((character) => (
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
