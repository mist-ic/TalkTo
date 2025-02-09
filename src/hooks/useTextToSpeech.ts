import { useState, useCallback } from 'react';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      // Stop any currently playing audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);

      newAudio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      newAudio.onpause = () => {
        setIsPlaying(false);
      };

      newAudio.onplay = () => {
        setIsPlaying(true);
      };

      setAudio(newAudio);
      await newAudio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  }, [audio]);

  const stop = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [audio]);

  return {
    speak,
    stop,
    isPlaying,
  };
}; 