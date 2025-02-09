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

      console.log('Sending TTS request...');
      const response = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('TTS Error:', errorData);
        throw new Error(errorData.details || 'Failed to convert text to speech');
      }

      // Get the audio data directly as a blob
      const audioBlob = await response.blob();
      console.log('Received audio blob:', audioBlob.size, 'bytes');

      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);

      // Add error handling for audio loading
      newAudio.onerror = (e) => {
        console.error('Audio loading error:', e);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

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

      // Wait for the audio to be loaded before playing
      await new Promise((resolve, reject) => {
        newAudio.oncanplaythrough = resolve;
        newAudio.onerror = reject;
      });

      setAudio(newAudio);
      await newAudio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      throw error;
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