import { useState, useCallback } from 'react';

export const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      console.log('Starting TTS request for text:', text.substring(0, 50) + '...');
      
      // Stop any currently playing audio
      if (audio) {
        console.log('Stopping previous audio');
        audio.pause();
        audio.currentTime = 0;
      }

      console.log('Sending TTS request to server...');
      const response = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      console.log('Server response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('TTS Error Response:', errorData);
        throw new Error(errorData.details || 'Failed to convert text to speech');
      }

      // Get the audio data as a blob
      const contentType = response.headers.get('Content-Type');
      console.log('Response content type:', contentType);
      
      const audioBlob = await response.blob();
      console.log('Received audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      if (audioBlob.size === 0) {
        throw new Error('Received empty audio blob');
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Created audio URL:', audioUrl);
      
      const newAudio = new Audio(audioUrl);
      console.log('Created new Audio element');

      // Add error handling for audio loading
      newAudio.onerror = () => {
        console.error('Audio loading error');
        if (newAudio.error) {
          console.error('Audio error details:', {
            error: newAudio.error,
            networkState: newAudio.networkState,
            readyState: newAudio.readyState,
          });
        }
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      newAudio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      newAudio.onpause = () => {
        console.log('Audio paused');
        setIsPlaying(false);
      };

      newAudio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
      };

      // Wait for the audio to be loaded before playing
      console.log('Waiting for audio to load...');
      await new Promise((resolve, reject) => {
        newAudio.oncanplaythrough = () => {
          console.log('Audio loaded and ready to play');
          resolve(undefined);
        };
        newAudio.onerror = reject;
      });

      setAudio(newAudio);
      console.log('Starting audio playback');
      await newAudio.play();
    } catch (error) {
      console.error('Error in TTS process:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      setIsPlaying(false);
      throw error;
    }
  }, [audio]);

  const stop = useCallback(() => {
    if (audio) {
      console.log('Stopping audio playback');
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