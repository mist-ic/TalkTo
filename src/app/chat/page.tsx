'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useChatStream } from '@/hooks/useChatStream';
import type { Character, ToneType, ChatMessage } from '@/types/character';

// Dynamically import components
const CharacterCard = dynamic(() => import('@/components/CharacterCard').then(mod => mod.CharacterCard), {
  loading: () => <CharacterCardSkeleton />
});

const ChatStream = dynamic(() => import('@/components/ChatStream').then(mod => mod.ChatStream), {
  loading: () => <ChatStreamSkeleton />
});

// Loading skeletons
const CharacterCardSkeleton = () => (
  <div className="animate-pulse bg-gray-800 rounded-xl aspect-[3/4] w-64" />
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

// Interface for chat histories
interface ChatHistories {
  [characterId: string]: ChatMessage[];
}

export default function ChatPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('original');
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Get chat stream for current character
  const { messages, isLoading: chatIsLoading, sendMessage: sendStreamMessage } = useChatStream(
    selectedCharacter || characters[0],
    selectedTone
  );

  // Initialize chat histories for all characters
  useEffect(() => {
    if (characters.length > 0) {
      const initialHistories: ChatHistories = {};
      characters.forEach(char => {
        if (!chatHistories[char.id]) {
          initialHistories[char.id] = [];
        }
      });
      if (Object.keys(initialHistories).length > 0) {
        setChatHistories(prev => ({ ...prev, ...initialHistories }));
      }
    }
  }, [characters]);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const responses = await Promise.all([
          fetch('/characters/gandhi.json'),
          fetch('/characters/bhagat.json'),
          fetch('/characters/laxmibai.json'),
          fetch('/characters/tesla.json'),
          fetch('/characters/newton.json'),
          fetch('/characters/einstein.json'),
          fetch('/characters/shivaji.json'),
          fetch('/characters/genghis.json'),
          fetch('/characters/napolean.json')
        ]);
        
        const characterData = await Promise.all(
          responses.map(res => res.json())
        );
        
        const [
          gandhi, bhagat, laxmibai,
          tesla, newton, einstein,
          shivaji, genghis, napolean
        ] = characterData;
        
        const allCharacters = [
          gandhi, bhagat, laxmibai,
          einstein, tesla, newton,
          shivaji, genghis, napolean
        ];
        
        setCharacters(allCharacters);
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
    // Don't open chat yet, wait for tone selection
  };

  const handleToneSelect = (tone: ToneType) => {
    setSelectedTone(tone);
    setIsChatOpen(true); // Only open chat after tone is selected
  };

  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
  };

  const handleCloseChatModal = () => {
    setIsChatOpen(false);
    setSelectedCharacter(null);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedCharacter) return;
    
    // Create and add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    // Update chat history with user message
    setChatHistories(prev => ({
      ...prev,
      [selectedCharacter.id]: [...(prev[selectedCharacter.id] || []), userMessage]
    }));

    try {
      // Send message and get response
      const response = await sendStreamMessage(message);
      
      if (response) {
        // Update chat history with assistant message
        setChatHistories(prev => ({
          ...prev,
          [selectedCharacter.id]: [...(prev[selectedCharacter.id] || []), response]
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message to chat history
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setChatHistories(prev => ({
        ...prev,
        [selectedCharacter.id]: [...(prev[selectedCharacter.id] || []), errorMessage]
      }));
    }
  };

  // Group characters by category
  const freedomFighters = characters.slice(0, 3);
  const scientists = characters.slice(3, 6);
  const militaryLeaders = characters.slice(6, 9);

  // Filter characters based on search
  const filterCharacters = (chars: Character[]) => {
    if (!searchQuery) return chars;
    const query = searchQuery.toLowerCase();
    return chars.filter(char => 
      char.name.toLowerCase().includes(query) || 
      char.title.toLowerCase().includes(query) ||
      char.expertise.some(exp => exp.toLowerCase().includes(query))
    );
  };

  // Get favorite characters
  const favoriteCharacters = characters.filter(char => favorites.has(char.id));

  // Toggle favorite
  const toggleFavorite = (characterId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(characterId)) {
        newFavorites.delete(characterId);
      } else {
        newFavorites.add(characterId);
      }
      return newFavorites;
    });
  };

  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-[90rem] mx-auto">
        <div className="flex gap-8">
          {/* Left Section - Character Categories */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-12">TalkToAI</h1>
            
            {/* Dashboard Layout */}
            <div className="space-y-16">
              {/* Freedom Fighters */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-8">Freedom Fighters</h2>
                <div className="flex gap-8 overflow-x-auto pb-6 snap-x scrollbar-hide">
                  {filterCharacters(freedomFighters).map((character) => (
                    <div key={character.id} className="flex-none snap-start">
                      <CharacterCard
                        character={character}
                        isSelected={selectedCharacter?.id === character.id}
                        onClick={handleCharacterSelect}
                        onToneSelect={handleToneSelect}
                        selectedTone={selectedTone}
                        messageCount={chatHistories[character.id]?.length || 0}
                        isFavorite={favorites.has(character.id)}
                        onFavoriteToggle={() => toggleFavorite(character.id)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Scientists */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-8">Scientists</h2>
                <div className="flex gap-8 overflow-x-auto pb-6 snap-x scrollbar-hide">
                  {filterCharacters(scientists).map((character) => (
                    <div key={character.id} className="flex-none snap-start">
                      <CharacterCard
                        character={character}
                        isSelected={selectedCharacter?.id === character.id}
                        onClick={handleCharacterSelect}
                        onToneSelect={handleToneSelect}
                        selectedTone={selectedTone}
                        messageCount={chatHistories[character.id]?.length || 0}
                        isFavorite={favorites.has(character.id)}
                        onFavoriteToggle={() => toggleFavorite(character.id)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Military Leaders */}
              <section>
                <h2 className="text-2xl font-semibold text-white mb-8">Military Leaders</h2>
                <div className="flex gap-8 overflow-x-auto pb-6 snap-x scrollbar-hide">
                  {filterCharacters(militaryLeaders).map((character) => (
                    <div key={character.id} className="flex-none snap-start">
                      <CharacterCard
                        character={character}
                        isSelected={selectedCharacter?.id === character.id}
                        onClick={handleCharacterSelect}
                        onToneSelect={handleToneSelect}
                        selectedTone={selectedTone}
                        messageCount={chatHistories[character.id]?.length || 0}
                        isFavorite={favorites.has(character.id)}
                        onFavoriteToggle={() => toggleFavorite(character.id)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Section - Search & Favorites */}
          <div className="w-80 shrink-0">
            {/* Search Box */}
            <div className="bg-gray-900 rounded-xl p-4 mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Favorites Section */}
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Favorites</h2>
              <div className="space-y-4">
                {favoriteCharacters.length === 0 ? (
                  <p className="text-gray-400 text-sm">No favorites yet</p>
                ) : (
                  favoriteCharacters.map(character => (
                    <div
                      key={character.id}
                      onClick={() => handleCharacterSelect(character)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <img
                          src={character.imageUrl}
                          alt={character.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{character.name}</h3>
                        <p className="text-gray-400 text-sm">{character.title}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {isChatOpen && selectedCharacter && (
        <ChatStream
          messages={messages}
          character={selectedCharacter}
          isLoading={chatIsLoading}
          onSendMessage={handleSendMessage}
          onClose={handleCloseChatModal}
          tone={selectedTone}
          onToneChange={handleToneChange}
        />
      )}
    </main>
  );
} 