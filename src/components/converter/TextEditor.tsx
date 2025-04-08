
import { Button } from "../ui/button";
import { Play, Pause, Settings, Download, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ScreenRecorder from "@/utils/screenRecorder";

type TextEditorProps = {
  text: string;
  onTextChange: (text: string) => void;
  isPlaying: boolean;
  onPlayText: () => void;
  converting: boolean;
  onConvert: () => void;
  useWebSpeech: boolean;
  selectedVoice: SpeechSynthesisVoice | null;
  onShowSettings: () => void;
  userPlan: string | null;
};

const TextEditor = ({
  text,
  onTextChange,
  isPlaying,
  onPlayText,
  converting,
  onConvert,
  useWebSpeech,
  selectedVoice,
  onShowSettings,
  userPlan,
}: TextEditorProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const screenRecorder = new ScreenRecorder();
  
  const handleDownloadAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "Sin contenido",
        description: "No hay texto para descargar como audio",
        variant: "destructive",
      });
      return;
    }
    
    // If we're already recording, stop recording and extract audio
    if (isRecording) {
      toast({
        title: "Finalizando grabación",
        description: "Procesando video y extrayendo audio...",
      });
      
      try {
        setIsRecording(false);
        const videoBlob = await screenRecorder.stopRecording();
        
        if (!videoBlob) {
          throw new Error("No se pudo obtener el video grabado");
        }
        
        const fileName = `grabacion_${Date.now()}`;
        
        // Download the video
        ScreenRecorder.downloadBlob(videoBlob, `${fileName}.webm`);
        
        toast({
          title: "Video guardado",
          description: "El video se ha guardado correctamente",
        });
        
        // Extract audio and download it
        toast({
          title: "Extrayendo audio",
          description: "Procesando el audio del video...",
        });
        
        try {
          await ScreenRecorder.convertToAudioAndDownload(videoBlob, `${fileName}_audio.mp3`);
          
          toast({
            title: "Audio extraído",
            description: "El audio se ha guardado correctamente",
          });
        } catch (audioError) {
          console.error("Error extracting audio:", audioError);
          toast({
            title: "Error extrayendo audio",
            description: "Se ha guardado el video, pero no se pudo extraer el audio",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error stopping recording:", error);
        setIsRecording(false);
        toast({
          title: "Error de grabación",
          description: error instanceof Error ? error.message : "Error al detener la grabación",
          variant: "destructive",
        });
      }
      return;
    }
    
    // If we're not recording, check if screen recording is supported
    if (ScreenRecorder.isSupported()) {
      // Start recording
      try {
        toast({
          title: "Iniciando grabación",
          description: "Selecciona la ventana o pestaña que deseas grabar",
        });
        
        const started = await screenRecorder.startRecording({
          duration: ScreenRecorder.estimateSpeechDuration(text) + 10, // Add extra time
          onStop: async (blob) => {
            if (!blob) {
              toast({
                title: "Error de grabación",
                description: "No se pudo obtener el video grabado",
                variant: "destructive",
              });
              setIsRecording(false);
              return;
            }
            
            const fileName = `grabacion_${Date.now()}`;
            
            // Download the video
            ScreenRecorder.downloadBlob(blob, `${fileName}.webm`);
            
            toast({
              title: "Video guardado",
              description: "El video se ha guardado correctamente",
            });
            
            // Extract audio and download it
            toast({
              title: "Extrayendo audio",
              description: "Procesando el audio del video...",
            });
            
            try {
              await ScreenRecorder.convertToAudioAndDownload(blob, `${fileName}_audio.mp3`);
              
              toast({
                title: "Audio extraído",
                description: "El audio se ha guardado correctamente",
              });
            } catch (audioError) {
              console.error("Error extracting audio:", audioError);
              toast({
                title: "Error extrayendo audio",
                description: "Se ha guardado el video, pero no se pudo extraer el audio",
                variant: "destructive",
              });
            }
            
            setIsRecording(false);
          }
        });
        
        if (started) {
          setIsRecording(true);
          
          // Start speaking text if available
          if (text.trim() && window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES';
            
            if (selectedVoice) {
              utterance.voice = selectedVoice;
            }
            
            window.speechSynthesis.speak(utterance);
          }
        } else {
          toast({
            title: "Error de grabación",
            description: "No se pudo iniciar la grabación",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error starting recording:", error);
        toast({
          title: "Error de grabación",
          description: error instanceof Error ? error.message : "Error al iniciar la grabación",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to regular audio download
      try {
        const fileName = `texto_audio_${Date.now()}.mp3`;
        
        toast({
          title: "Preparando descarga",
          description: "Generando audio para descargar...",
        });
        
        const { convertTextToDownloadableAudio } = await import('@/utils/textToSpeechService');
        try {
          await convertTextToDownloadableAudio(text, 'es-ES', fileName);
          
          toast({
            title: "Descarga iniciada",
            description: "El audio se está descargando",
          });
        } catch (firstError) {
          console.error("Primer método de descarga falló:", firstError);
          
          // Intentar método alternativo
          if (window.speechSynthesis && selectedVoice) {
            toast({
              title: "Usando método alternativo",
              description: "Generando audio con el sintetizador de voz del navegador...",
            });
            
            // Crear un AudioContext
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const destination = audioContext.createMediaStreamDestination();
            
            // Crear un MediaRecorder para grabar el audio del sintetizador
            const mediaRecorder = new MediaRecorder(destination.stream);
            const audioChunks: BlobPart[] = [];
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunks.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
              ScreenRecorder.downloadBlob(audioBlob, fileName);
              
              toast({
                title: "Descarga iniciada",
                description: "El audio se está descargando",
              });
            };
            
            // Iniciar grabación
            mediaRecorder.start();
            
            // Reproducir texto con el sintetizador de voz
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;
            
            utterance.onend = () => {
              setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop();
                }
              }, 500);
            };
            
            window.speechSynthesis.speak(utterance);
            
            // Como respaldo, detener después de un tiempo estimado
            const estimatedDuration = text.length / 5 * 0.06;
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, (estimatedDuration * 1000) + 2000);
          } else {
            // Si todo falla, intentar generar un audio simple
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Crear un buffer de audio simple
            const duration = 3; // 3 segundos
            const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < buffer.length; i++) {
              data[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate);
            }
            
            // Convertir a WAV y descargar
            const blob = await audioBufferToWav(buffer);
            ScreenRecorder.downloadBlob(blob, fileName);
            
            toast({
              title: "Descarga alternativa iniciada",
              description: "Se ha generado un audio básico",
            });
          }
        }
      } catch (error) {
        console.error("Error downloading audio:", error);
        toast({
          title: "Error de descarga",
          description: error instanceof Error ? error.message : "No se pudo descargar el audio",
          variant: "destructive",
        });
      }
    }
  };
  
  // Función para convertir AudioBuffer a WAV
  const audioBufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numOfChan = buffer.numberOfChannels;
      const length = buffer.length * numOfChan * 2;
      const view = new DataView(new ArrayBuffer(44 + length));
      
      // Función para escribir una cadena en el view
      const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      // RIFF chunk descriptor
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeString(view, 8, 'WAVE');
      
      // fmt sub-chunk
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, numOfChan, true);
      view.setUint32(24, buffer.sampleRate, true);
      view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true); // byte rate
      view.setUint16(32, numOfChan * 2, true); // block align
      view.setUint16(34, 16, true); // bits per sample
      
      // data sub-chunk
      writeString(view, 36, 'data');
      view.setUint32(40, length, true);
      
      // write the PCM samples
      const offset = 44;
      let pos = 0;
      
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const channelData = buffer.getChannelData(i);
        for (let j = 0; j < buffer.length; j++) {
          const sample = Math.max(-1, Math.min(1, channelData[j]));
          view.setInt16(offset + pos * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          pos++;
        }
      }
      
      resolve(new Blob([view], { type: 'audio/wav' }));
    });
  };
  
  return (
    <>
      <textarea
        value={text}
        onChange={e => onTextChange(e.target.value)}
        placeholder="Cargue un archivo o escriba el texto que desea convertir a voz..."
        className="w-full p-4 min-h-[200px] bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
      />
      
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            onClick={onPlayText}
            disabled={converting || !text.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPlaying ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isPlaying ? "Detener" : "Reproducir"}
          </Button>
          
          <Button
            onClick={handleDownloadAudio}
            disabled={converting || (!text.trim() && !isRecording)}
            variant="outline"
            className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
          >
            {isRecording ? (
              <>
                <Video className="mr-2 h-4 w-4" />
                Grabando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar Audio
              </>
            )}
          </Button>
          
          {useWebSpeech && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-400">
                {selectedVoice ? `${selectedVoice.name.substring(0, 15)}...` : 'Voz predeterminada'}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Ajustar configuración"
                onClick={onShowSettings}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <p className="text-gray-400 mr-4">Plan actual: <span className="text-lyra-primary">{userPlan}</span></p>
          <Button
            onClick={onConvert}
            disabled={converting || !text.trim()}
            className="bg-lyra-primary hover:bg-opacity-80"
          >
            {converting ? "Convirtiendo..." : "Convertir"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default TextEditor;
