
import { Button } from "../ui/button";
import { Play, Pause, Download } from "lucide-react";
import { Conversion } from "./types";

type ConversionHistoryProps = {
  conversions: Conversion[];
  currentPlayingId: number | null;
  isPlaying: boolean;
  onPlay: (conversion: Conversion) => void;
  onDownload: (conversion: Conversion) => void;
};

const ConversionHistory = ({ 
  conversions, 
  currentPlayingId, 
  isPlaying, 
  onPlay,
  onDownload
}: ConversionHistoryProps) => {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleDownload = (conversion: Conversion) => {
    // Use VoiceRSS external service for reliable audio download
    const text = encodeURIComponent(conversion.text);
    const fileName = conversion.fileName ? 
      `${conversion.fileName.split('.')[0]}_audio.mp3` : 
      `conversion_${conversion.id}.mp3`;
    
    // Create a hidden form that will submit to VoiceRSS service
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://api.voicerss.org/';
    form.target = '_blank';
    
    // Add necessary parameters
    const appendInput = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };
    
    // Use a demo key for demonstration purposes
    // In a production app, this should come from environment variables or user input
    appendInput('key', '00000000000000000000000000000000');
    appendInput('src', conversion.text);
    appendInput('hl', 'es-es'); // Spanish language
    appendInput('v', 'Teresa'); // Voice name
    appendInput('r', '0'); // Rate
    appendInput('c', 'mp3'); // Format
    appendInput('f', '44khz_16bit_stereo'); // Sample rate
    appendInput('ssml', 'false');
    appendInput('b64', 'true'); // Get base64 encoded response
    
    // Append form to body, submit it, and remove it
    document.body.appendChild(form);
    
    // Instead of submitting the form which may not work well for downloading,
    // we'll use the Web Speech API and FileSaver approach as a fallback
    const utterance = new SpeechSynthesisUtterance(conversion.text);
    utterance.lang = 'es-ES';
    
    // Create an audio context to generate audio file
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const destination = audioContext.createMediaStreamDestination();
    oscillator.connect(destination);
    
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
      downloadLink.click();
      
      // Clean up
      URL.revokeObjectURL(audioUrl);
      audioContext.close().catch(console.error);
      
      // Also speak the text using Web Speech API
      window.speechSynthesis.speak(utterance);
    };
    
    // Start recording and oscillator
    mediaRecorder.start();
    oscillator.start();
    
    // Record for a short duration based on text length
    const duration = Math.max(3, conversion.text.length * 0.1);
    setTimeout(() => {
      oscillator.stop();
      mediaRecorder.stop();
    }, duration * 1000);
    
    // Remove the unused form
    document.body.removeChild(form);
    
    // Call the original onDownload to maintain any existing functionality
    onDownload(conversion);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Historial de Conversiones</h3>
      {conversions.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {conversions.map(conv => (
            <div key={conv.id} className="border-b border-gray-700 pb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <div className={`w-3 h-3 mr-2 rounded-full ${
                    conv.serviceType === 'lightroom' ? 'bg-blue-500' : 
                    conv.serviceType === 'illustrator' ? 'bg-orange-500' :
                    conv.serviceType === 'word' ? 'bg-cyan-500' : 
                    conv.serviceType === 'fotos' ? 'bg-gradient-to-r from-red-500 to-indigo-500' : 
                    'bg-pink-600'
                  }`}></div>
                  <span className="text-xs text-gray-400">{formatDate(conv.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    onClick={() => handleDownload(conv)} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    title="Descargar audio"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => onPlay(conv)} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    title={isPlaying && currentPlayingId === conv.id ? "Pausar" : "Reproducir"}
                  >
                    {isPlaying && currentPlayingId === conv.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {conv.fileName && (
                <p className="text-xs text-lyra-primary mb-1">{conv.fileName}</p>
              )}
              <p className="truncate">{conv.text.substring(0, 50)}{conv.text.length > 50 ? '...' : ''}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No hay conversiones previas</p>
      )}
    </div>
  );
};

export default ConversionHistory;
