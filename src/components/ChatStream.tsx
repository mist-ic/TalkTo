'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedMessage } from '@/components/ui/AnimatedMessage';
import { PhoneContainer } from '@/components/ui/PhoneContainer';
import type { ChatMessage, Character, ToneType } from '@/types/character';

interface ChatStreamProps {
  messages: ChatMessage[];
  character: Character;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  tone: ToneType;
  onToneChange: (tone: ToneType) => void;
}

export const ChatStream = ({ 
  messages, 
  character, 
  isLoading, 
  onSendMessage,
  onClose,
  tone,
  onToneChange
}: ChatStreamProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
    
    const message = inputRef.current.value.trim();
    if (message && !isLoading) {
      onSendMessage(message);
      inputRef.current.value = '';
    }
  };

  // Handle tone change
  const handleToneChange = (newTone: ToneType) => {
    console.log('Changing tone to:', newTone); // Debug log
    onToneChange(newTone);
  };

  return (
    <PhoneContainer onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="flex flex-col px-4 pb-2 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden relative mr-3">
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h3 className="font-bold text-white">{character.name}</h3>
                <p className="text-sm text-gray-400">{character.title}</p>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tone Selector */}
          <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
            {(['original', 'millennial', 'genZ'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleToneChange(t)}
                className={`
                  px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors
                  ${tone === t 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}
                `}
              >
                {t === 'original' ? 'Original' : t === 'millennial' ? 'Millennial' : 'Gen Z'}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`
                    max-w-[80%] rounded-2xl p-3
                    ${message.role === 'user'
                      ? 'bg-blue-600 text-white ml-12'
                      : 'bg-gray-800/50 text-gray-100 mr-12'}
                  `}
                >
                  {message.role === 'assistant' ? (
                    <AnimatedMessage content={message.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <span className="text-xs opacity-50 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-gray-400"
            >
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="px-4 pt-2 pb-4 border-t border-gray-800/50">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              className="flex-1 bg-gray-800/50 text-white rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Type your message..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`
                px-4 rounded-xl bg-blue-600 text-white font-medium
                hover:bg-blue-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </PhoneContainer>
  );
}; 