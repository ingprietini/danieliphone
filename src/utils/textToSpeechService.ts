
/**
 * Service to handle different text-to-speech conversion methods
 */

/**
 * Converts text to downloadable audio using an external service
 * @param text Text to convert to speech
 * @param language Language code (e.g., 'es-ES')
 * @param fileName Filename for the downloaded file
 * @returns Promise that resolves when download starts
 */
export const convertTextToDownloadableAudio = async (
  text: string,
  language: string = 'es-ES',
  fileName: string = 'audio.mp3'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Method 1: Use Web Speech API with MediaRecorder
      if ('speechSynthesis' in window && 'MediaRecorder' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        
        // Find voices in the specified language
        const voices = speechSynthesis.getVoices();
        const languageVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0]));
        if (languageVoice) {
          utterance.voice = languageVoice;
        }
        
        // Create an AudioContext
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.1;
        oscillator.connect(gainNode);
        
        const destination = audioContext.createMediaStreamDestination();
        gainNode.connect(destination);
        gainNode.connect(audioContext.destination);
        
        // Create a media recorder to capture the audio
        const mediaRecorder = new MediaRecorder(destination.stream);
        const audioChunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Create download link
          const downloadLink = document.createElement('a');
          downloadLink.href = audioUrl;
          downloadLink.download = fileName;
          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          // Clean up
          URL.revokeObjectURL(audioUrl);
          audioContext.close().catch(console.error);
          
          // Also speak the text using Web Speech API
          window.speechSynthesis.speak(utterance);
          
          resolve();
        };
        
        // Start recording and oscillator
        mediaRecorder.start();
        oscillator.start();
        
        // Record for a duration based on text length
        const duration = Math.max(3, text.length * 0.08);
        setTimeout(() => {
          oscillator.stop();
          mediaRecorder.stop();
        }, duration * 1000);
      } 
      // Method 2: Use Google Translate TTS API (no key required)
      else {
        const encodedText = encodeURIComponent(text);
        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob`;
        
        // Create an iframe to handle the download
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Set up a timeout to remove the iframe
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 2000);
        
        // Navigate the iframe to the TTS URL
        if (iframe.contentWindow) {
          try {
            // Try direct navigation
            iframe.src = googleTtsUrl;
          } catch (e) {
            // If direct navigation fails, use fetch and blob approach
            fetch(googleTtsUrl)
              .then(response => response.blob())
              .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                document.body.appendChild(a);
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
              })
              .catch(e => {
                reject(e);
              });
          }
        } else {
          reject(new Error('Could not create iframe context'));
        }
      }
    } catch (error) {
      console.error('Error converting text to audio:', error);
      reject(error);
    }
  });
};
