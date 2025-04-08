
/**
 * Hook para reproducción de audio
 */
import { useState, useEffect, useCallback, useRef } from 'react';

interface AudioPlayerOptions {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onPlayError?: (error: Error) => void;
  onAudioGenerated?: (audioUrl: string, duration: number) => void;
}

interface SpeakOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  onComplete?: () => void;
}

export const useAudioPlayer = (options: AudioPlayerOptions = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    
    if (utteranceRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    
    setIsPlaying(false);
  }, []);
  
  // Stop any playing audio
  const stopAudio = useCallback(() => {
    if (isPlaying) {
      cleanup();
      if (options.onPlayEnd) {
        options.onPlayEnd();
      }
    }
  }, [isPlaying, cleanup, options]);
  
  // Play audio from ArrayBuffer
  const playAudio = useCallback((audioData: ArrayBuffer) => {
    stopAudio();
    
    try {
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      // Set up event listeners
      const audio = audioRef.current;
      
      audio.onplay = () => {
        setIsPlaying(true);
        if (options.onPlayStart) {
          options.onPlayStart();
        }
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        if (options.onPlayEnd) {
          options.onPlayEnd();
        }
      };
      
      audio.onerror = (e) => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        if (options.onPlayError) {
          options.onPlayError(new Error(`Error playing audio: ${e}`));
        }
      };
      
      audio.onloadedmetadata = () => {
        if (options.onAudioGenerated) {
          options.onAudioGenerated(audioUrl, audio.duration);
        }
      };
      
      // Set source and play
      audio.src = audioUrl;
      audio.play().catch(error => {
        if (options.onPlayError) {
          options.onPlayError(error);
        }
        setIsPlaying(false);
      });
      
    } catch (error) {
      if (options.onPlayError) {
        options.onPlayError(error instanceof Error ? error : new Error(String(error)));
      }
      setIsPlaying(false);
    }
  }, [options, stopAudio]);
  
  // Speak text using Web Speech API
  const speakText = useCallback((text: string, speakOptions: SpeakOptions = {}) => {
    stopAudio();
    
    if (!('speechSynthesis' in window)) {
      if (options.onPlayError) {
        options.onPlayError(new Error('Web Speech API not supported in this browser'));
      }
      return;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Set options
      if (speakOptions.voice) {
        utterance.voice = speakOptions.voice;
      }
      
      utterance.rate = speakOptions.rate || 1;
      utterance.pitch = speakOptions.pitch || 1;
      
      // Set up event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        if (options.onPlayStart) {
          options.onPlayStart();
        }
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        if (options.onPlayEnd) {
          options.onPlayEnd();
        }
        if (speakOptions.onComplete) {
          speakOptions.onComplete();
        }
        utteranceRef.current = null;
      };
      
      utterance.onerror = (event) => {
        setIsPlaying(false);
        if (options.onPlayError) {
          options.onPlayError(new Error(`Speech synthesis error: ${event.error}`));
        }
        utteranceRef.current = null;
      };
      
      // Calculate estimated duration (approx 5 chars per second at rate 1)
      const estimatedDuration = text.length / (5 * (speakOptions.rate || 1));
      
      // Generate pseudo-audio URL for tracking
      const dummyAudioUrl = `data:audio/wav;base64,dummy-${Date.now()}`;
      if (options.onAudioGenerated) {
        options.onAudioGenerated(dummyAudioUrl, estimatedDuration);
      }
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      if (options.onPlayError) {
        options.onPlayError(error instanceof Error ? error : new Error(String(error)));
      }
      setIsPlaying(false);
    }
  }, [options, stopAudio]);
  
  // Get available voices for speech synthesis
  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    
    return window.speechSynthesis.getVoices();
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  return {
    isPlaying,
    playAudio,
    speakText,
    stopAudio,
    getVoices,
    cleanup
  };
};
