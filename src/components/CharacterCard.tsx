'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { CharacterCardProps, ToneType } from '@/types/character';

export const CharacterCard = ({ character, onClick, isSelected, onToneSelect, selectedTone }: CharacterCardProps) => {
  const handleToneSelect = (e: React.MouseEvent, tone: ToneType) => {
    e.stopPropagation();
    onToneSelect?.(tone);
  };

  return (
    <motion.div
      onClick={() => onClick(character)}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        w-full max-w-sm aspect-[3/4] bg-gradient-to-b from-gray-800 to-gray-900
        hover:shadow-xl transition-shadow
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Character Image */}
      <div className="absolute inset-0">
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

      {/* Character Info */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-6 text-white"
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
}; 