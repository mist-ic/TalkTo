'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedMessage } from '@/components/ui/AnimatedMessage';
import type { ChatMessage, Character, ToneType } from '@/types/character';

interface ChatStreamProps {
  messages: ChatMessage[];
  character: Character;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  tone: ToneType;
  onToneChange: (tone: ToneType) => void;
  onStartNewChat?: () => void;
}

// Tabs for the sidebar
type SidebarTab = 'chat' | 'characters';

export const ChatStream = ({ 
  messages, 
  character, 
  isLoading, 
  onSendMessage,
  onClose,
  tone,
  onToneChange,
  onStartNewChat
}: ChatStreamProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('chat');

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

  return (
    <div className="fixed inset-0 bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Current Chat
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'characters'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Characters
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chat' && (
            <div className="p-6 space-y-6">
              {/* New Chat Button */}
              <button
                onClick={onStartNewChat}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Chat</span>
              </button>

              {/* Current Character */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{character.name}</h3>
                    <p className="text-gray-400 text-sm">{character.title}</p>
                  </div>
                </div>

                {/* Tone Selection */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Conversation Style:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['original', 'millennial', 'genZ'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => onToneChange(t)}
                        className={`
                          px-3 py-2 rounded text-sm transition-colors
                          ${tone === t 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                        `}
                      >
                        {t === 'original' ? 'Original' : t === 'millennial' ? 'Millennial' : 'Gen Z'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat History */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">Chat History</p>
                <div className="flex items-center justify-between text-sm text-gray-400 hover:bg-gray-800 p-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Current Session</span>
                  </div>
                  <span className="text-xs">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="p-4">
              <button
                onClick={onStartNewChat}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 mb-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Choose New Character</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`
                  flex items-start gap-4 
                  ${message.role === 'assistant' ? 'bg-gray-900' : 'bg-gray-800'} 
                  rounded-lg p-4
                `}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">
                      {message.role === 'assistant' ? character.name : 'You'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {message.role === 'assistant' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AnimatedMessage content={message.content} />
                    </motion.div>
                  ) : (
                    <div className="text-white whitespace-pre-wrap break-words">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <textarea
              ref={inputRef}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 resize-none h-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                px-4 rounded-lg font-medium transition-colors
                ${isLoading 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'}
              `}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 