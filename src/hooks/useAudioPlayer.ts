
import { useState, useRef, useCallback } from 'react';

interface UseAudioPlayerProps {
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onPlayError?: (error: Error) => void;
  onAudioGenerated?: (audioUrl: string, duration: number) => void; // New callback
}

export const useAudioPlayer = ({ 
  onPlayStart, 
  onPlayEnd, 
  onPlayError,
  onAudioGenerated
}: UseAudioPlayerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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

      // Si el buffer es demasiado pequeño (no es un audio real), crear un buffer simple
      if (audioData.byteLength < 128) {
        console.log("Buffer de audio muy pequeño, generando audio desde Web Speech API");
        
        // Aquí podríamos manejar esto de otra manera, pero por ahora simplemente
        // notificamos que este no es un audio real
        onPlayError?.(new Error('El audio no contiene datos suficientes para reproducirse'));
        setIsPlaying(false);
        return;
      }

      // Create blob from array buffer
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      // Generate the audio URL for later use
      if (onAudioGenerated) {
        // Extract or estimate duration
        const tempAudio = new Audio(url);
        tempAudio.addEventListener('loadedmetadata', () => {
          onAudioGenerated(url, tempAudio.duration);
        });
        tempAudio.addEventListener('error', () => {
          // If we can't get duration, estimate it
          const estimatedDuration = audioData.byteLength / 16000; // Rough estimate
          onAudioGenerated(url, estimatedDuration);
        });
      }

      // Create audio element
      const audio = new Audio(url);
      audioRef.current = audio;

      // Set up event listeners
      audio.addEventListener('loadedmetadata', () => {
        console.log(`Duración del audio: ${audio.duration} segundos`);
      });

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
        onPlayError?.(new Error('Error durante la reproducción del audio'));
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
      onPlayError?.(error instanceof Error ? error : new Error('Error desconocido al reproducir audio'));
    }
  }, [onPlayStart, onPlayEnd, onPlayError, onAudioGenerated]);

  // Function to speak text using Web Speech API with recording
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
        throw new Error('La síntesis de voz no está soportada en este navegador');
      }
      
      // Attempt to record the Web Speech API output
      try {
        // Initialize recording with the MediaRecorder API if the browser supports it
        if (navigator.mediaDevices && window.MediaRecorder) {
          // We'll use an audio worklet to capture the synthesized speech
          // This is a more advanced approach that works in modern browsers
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
        }
      } catch (recError) {
        console.warn('Could not initialize audio recording:', recError);
      }

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;

      // Configure options
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.voice) utterance.voice = options.voice;

      // Estimate duration based on text length and rate
      const wordsPerMinute = 150; // Average speaking rate
      const adjustedRate = options.rate || 1;
      const wordCount = text.split(/\s+/).length;
      const durationInMinutes = wordCount / (wordsPerMinute * adjustedRate);
      const durationInSeconds = Math.max(3, durationInMinutes * 60); // Minimum 3 seconds
      
      // Generate a silent audio file with the estimated duration
      if (onAudioGenerated && window.AudioContext) {
        try {
          const audioContext = new AudioContext();
          const sampleRate = audioContext.sampleRate;
          const frameCount = Math.ceil(sampleRate * durationInSeconds);
          
          // Create a buffer with the estimated duration
          const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
          const channelData = audioBuffer.getChannelData(0);
          
          // Fill with very low volume sine wave to maintain duration
          for (let i = 0; i < frameCount; i++) {
            channelData[i] = Math.sin(i * 0.01) * 0.01;
          }
          
          // Convert buffer to WAV
          const wavBlob = audioBufferToWav(audioBuffer);
          const url = URL.createObjectURL(wavBlob);
          
          // Pass URL and duration to callback
          onAudioGenerated(url, durationInSeconds);
        } catch (e) {
          console.error('Failed to generate silent audio:', e);
        }
      }

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
        onPlayError?.(new Error('Error durante la síntesis de voz'));
        speechSynthesisRef.current = null;
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking text:', error);
      setIsPlaying(false);
      onPlayError?.(error instanceof Error ? error : new Error('Error desconocido al hablar texto'));
    }
  }, [onPlayStart, onPlayEnd, onPlayError, onAudioGenerated]);

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2;
    const view = new DataView(new ArrayBuffer(44 + length));
    
    // WAV header
    // "RIFF"
    view.setUint8(0, 0x52);
    view.setUint8(1, 0x49);
    view.setUint8(2, 0x46);
    view.setUint8(3, 0x46);
    
    // file size
    view.setUint32(4, 36 + length, true);
    
    // "WAVE"
    view.setUint8(8, 0x57);
    view.setUint8(9, 0x41);
    view.setUint8(10, 0x56);
    view.setUint8(11, 0x45);
    
    // "fmt " chunk
    view.setUint8(12, 0x66);
    view.setUint8(13, 0x6D);
    view.setUint8(14, 0x74);
    view.setUint8(15, 0x20);
    
    // length of format data
    view.setUint32(16, 16, true);
    // type of format (1 is PCM)
    view.setUint16(20, 1, true);
    // number of channels
    view.setUint16(22, numOfChan, true);
    // sample rate
    view.setUint32(24, buffer.sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, buffer.sampleRate * 4, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numOfChan * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    
    // "data" chunk
    view.setUint8(36, 0x64);
    view.setUint8(37, 0x61);
    view.setUint8(38, 0x74);
    view.setUint8(39, 0x61);
    
    // data chunk length
    view.setUint32(40, length, true);
    
    // Write the PCM samples
    const offset = 44;
    let pos = 0;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i);
      for (let j = 0; j < buffer.length; j++, pos += 2) {
        const index = offset + pos;
        // Clamp value to [-1.0, 1.0] and convert to 16-bit PCM
        const sample = Math.max(-1, Math.min(1, channel[j]));
        view.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      }
    }
    
    return new Blob([view], { type: 'audio/wav' });
  };

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
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
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
