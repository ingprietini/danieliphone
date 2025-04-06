
import { useState, useRef, useCallback } from 'react';

interface UseAudioPlayerProps {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onPlayError?: (error: Error) => void;
}

export const useAudioPlayer = ({ 
  onPlayStart, 
  onPlayEnd, 
  onPlayError 
}: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to create and play audio from ArrayBuffer
  const playAudioFromArrayBuffer = useCallback((audioData: ArrayBuffer) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }

      // Stop any currently speaking synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Create blob from array buffer
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Create audio element
      const audio = new Audio(url);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        onPlayStart?.();
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        onPlayEnd?.();
      });

      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        onPlayEnd?.();
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        onPlayError?.(new Error('Error during audio playback'));
        URL.revokeObjectURL(url);
      });

      // Play the audio
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
        onPlayError?.(error);
      });
    } catch (error) {
      console.error('Error creating audio:', error);
      setIsPlaying(false);
      onPlayError?.(error instanceof Error ? error : new Error('Unknown error playing audio'));
    }
  }, [onPlayStart, onPlayEnd, onPlayError]);

  // Function to speak text using Web Speech API
  const speakText = useCallback((text: string, options: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice } = {}) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }

      // Stop any currently speaking synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      if (!window.speechSynthesis) {
        throw new Error('Speech synthesis is not supported in this browser');
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;

      // Configure options
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.voice) utterance.voice = options.voice;

      // Set up event listeners
      utterance.onstart = () => {
        setIsPlaying(true);
        onPlayStart?.();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        onPlayEnd?.();
        speechSynthesisRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        onPlayError?.(new Error('Error during speech synthesis'));
        speechSynthesisRef.current = null;
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsPlaying(false);
      onPlayError?.(error instanceof Error ? error : new Error('Unknown error speaking text'));
    }
  }, [onPlayStart, onPlayEnd, onPlayError]);

  // Get available voices
  const getVoices = useCallback(() => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return [];
    }
    return window.speechSynthesis.getVoices();
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if (window.speechSynthesis && speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  // Clean up resources when component unmounts
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    isPlaying,
    playAudio: playAudioFromArrayBuffer,
    speakText,
    getVoices,
    stopAudio,
    cleanup,
  };
};

export default useAudioPlayer;
