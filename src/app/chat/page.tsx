'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useChatStream } from '@/hooks/useChatStream';
import type { Character, ToneType, ChatMessage } from '@/types/character';
import Image from 'next/image';

// Dynamically import components
const ChatStream = dynamic(() => import('@/components/ChatStream').then(mod => mod.ChatStream), {
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl p-6" />
});

// Interface for chat histories
interface ChatHistories {
  [characterId: string]: ChatMessage[];
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse bg-gray-800 rounded-xl p-6">Loading...</div>
    </div>}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('original');
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showCharacterSelect, setShowCharacterSelect] = useState(true);

  // Get chat stream for current character
  const { messages, isLoading: chatIsLoading, sendMessage: sendStreamMessage, clearMessages } = useChatStream(
    selectedCharacter,
    selectedTone
  );

  // Load characters and initialize chat
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const characterUrls = [
          '/characters/gandhi.json',
          '/characters/bhagat.json',
          '/characters/laxmibai.json',
          '/characters/tesla.json',
          '/characters/newton.json',
          '/characters/einstein.json',
          '/characters/shivaji.json',
          '/characters/genghis.json',
          '/characters/napolean.json'
        ];

        const responses = await Promise.all(
          characterUrls.map(url => 
            fetch(url).catch(error => {
              console.error(`Failed to fetch ${url}:`, error);
              return null;
            })
          )
        );
        
        const validResponses = responses.filter((res): res is Response => res !== null);
        const characterData = await Promise.all(
          validResponses.map(res => 
            res.json().catch(error => {
              console.error('Failed to parse character data:', error);
              return null;
            })
          )
        );
        
        const validCharacters = characterData.filter((char): char is Character => char !== null);
        setCharacters(validCharacters);

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(new Set(JSON.parse(savedFavorites)));
        }

        // Check for character in URL
        const characterId = searchParams.get('character');
        if (characterId) {
          const character = validCharacters.find(c => c.id === characterId);
          if (character) {
            setSelectedCharacter(character);
          }
        }
      } catch (error) {
        console.error('Failed to load characters:', error);
      }
    };
    
    loadCharacters();
  }, [searchParams]);

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
  }, [characters, chatHistories]);

  useEffect(() => {
    if (selectedCharacter) {
      // Only update when selectedCharacter is not null
      setChatHistories((prev) => ({
        ...prev,
        [selectedCharacter.id]: prev[selectedCharacter.id] || [],
      }));
    }
  }, [selectedCharacter]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setShowCharacterSelect(false);
    router.push(`/chat?character=${character.id}`);
  };

  const handleToneSelect = (tone: ToneType) => {
    setSelectedTone(tone);
  };

  const handleStartNewChat = () => {
    clearMessages();
    setShowCharacterSelect(true);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedCharacter) return;
    
    try {
      // Send message and get response using the chat stream
      await sendStreamMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

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

  if (!selectedCharacter && !showCharacterSelect) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">Start a New Chat</h1>
          <button
            onClick={handleStartNewChat}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Choose a Character
          </button>
        </div>
      </div>
    );
  }

  if (showCharacterSelect) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Choose a Character</h1>
          
          {/* Search Box */}
          <div className="mb-8">
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
          {favoriteCharacters.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">Favorites</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteCharacters.map(character => (
                  <div
                    key={character.id}
                    onClick={() => handleCharacterSelect(character)}
                    className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <Image
                      src={character.imageUrl || ''}
                      alt={character.name || 'Character'}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-white font-medium">{character.name}</h3>
                      <p className="text-gray-400 text-sm">{character.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Characters */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">All Characters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterCharacters(characters).map(character => (
                <div
                  key={character.id}
                  onClick={() => handleCharacterSelect(character)}
                  className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <Image
                    src={character.imageUrl || ''}
                    alt={character.name || 'Character'}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-white font-medium">{character.name}</h3>
                    <p className="text-gray-400 text-sm">{character.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {selectedCharacter && (
        <ChatStream
          messages={messages}
          character={selectedCharacter}
          isLoading={chatIsLoading}
          onSendMessage={handleSendMessage}
          onClose={() => router.push('/')}
          tone={selectedTone}
          onToneChange={handleToneSelect}
          onStartNewChat={handleStartNewChat}
        />
      )}
    </div>
  );
} 