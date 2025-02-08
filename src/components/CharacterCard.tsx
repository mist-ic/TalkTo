'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { StarBorder } from './ui/star-border';
import type { CharacterCardProps, ToneType } from '@/types/character';

export const CharacterCard = ({ 
  character, 
  onClick, 
  isSelected, 
  onToneSelect, 
  selectedTone,
  messageCount,
  isFavorite,
  onFavoriteToggle
}: CharacterCardProps) => {
  const handleToneSelect = (e: React.MouseEvent, tone: ToneType) => {
    e.stopPropagation();
    onToneSelect?.(tone);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle();
  };

  const CardContent = (
    <motion.div
      onClick={() => onClick(character)}
      className="relative w-72 h-96 rounded-xl cursor-pointer bg-gradient-to-b from-gray-800 to-gray-900 hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Character Image Container */}
      <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src={character.imageUrl}
            alt={character.name}
            fill
            className="object-cover opacity-80"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        </div>
      </div>

      {/* Top Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        {/* Message Count Badge */}
        {messageCount > 0 && (
          <div className="bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {messageCount} messages
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`
            p-2 rounded-full transition-colors
            ${isFavorite 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'}
          `}
        >
          <svg
            className="w-4 h-4"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      </div>

      {/* Character Info */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-6 text-white z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold mb-2">{character.name}</h2>
        <p className="text-sm text-gray-300 mb-2">{character.title}</p>
        <p className="text-xs text-gray-400">{character.era}</p>
        
        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {character.expertise.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 text-xs bg-gray-800/80 rounded-full text-gray-300"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Tone Selection */}
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            <p className="text-sm font-medium text-gray-300">Choose tone:</p>
            <div className="flex gap-2">
              {(['original', 'millennial', 'genZ'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={(e) => handleToneSelect(e, tone)}
                  className={`
                    px-3 py-1 text-xs rounded-full transition-colors
                    ${selectedTone === tone 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'}
                  `}
                >
                  {tone === 'original' ? 'Original' : tone === 'millennial' ? 'Millennial' : 'Gen Z'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  return isSelected ? (
    <StarBorder as="div" className="w-full" color="hsl(217, 91%, 60%)" speed="4s">
      {CardContent}
    </StarBorder>
  ) : CardContent;
}; 