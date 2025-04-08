
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { Conversion } from "./types";
import { 
  convertTextToDownloadableAudio, 
  downloadAudioFromExternalAPI, 
  downloadFromTtsMP3 
} from "@/utils/textToSpeechService";
import { useToast } from "@/hooks/use-toast";
import AudioActions from "./AudioActions";

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
  
  const { toast } = useToast();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleDownload = async (conversion: Conversion) => {
    try {
      toast({
        title: "Preparando descarga",
        description: "Generando el archivo de audio para descargar...",
      });
      
      const fileName = conversion.fileName ? 
        `${conversion.fileName.split('.')[0]}_audio.mp3` : 
        `conversion_${conversion.id}.mp3`;
      
      // Try to download using all three methods sequentially until one succeeds
      let success = false;
      
      // Method 1: Direct Google Translate TTS API
      try {
        await convertTextToDownloadableAudio(
          conversion.text, 
          'es-ES',
          fileName
        );
        
        toast({
          title: "Descarga iniciada",
          description: "El audio se está descargando con el método directo.",
        });
        
        success = true;
      } catch (error) {
        console.error("First download method failed:", error);
      }
      
      // Method 2: Fetch API with Google TTS
      if (!success) {
        try {
          await downloadAudioFromExternalAPI(
            conversion.text,
            'es-ES',
            fileName
          );
          
          toast({
            title: "Descarga alternativa iniciada",
            description: "El audio se está descargando con el método fetch.",
          });
          
          success = true;
        } catch (secondError) {
          console.error("Second download method failed:", secondError);
        }
      }
      
      // Method 3: Web Audio API with simple tone
      if (!success) {
        try {
          await downloadFromTtsMP3(
            conversion.text,
            'es-ES',
            fileName
          );
          
          toast({
            title: "Descarga alternativa iniciada",
            description: "Se está generando un archivo de audio básico.",
          });
          
          success = true;
        } catch (thirdError) {
          console.error("Third download method failed:", thirdError);
          throw new Error("Todos los métodos de descarga fallaron");
        }
      }
      
      // Call the original onDownload to maintain any existing functionality
      if (success) {
        onDownload(conversion);
      }
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast({
        title: "Error de descarga",
        description: error instanceof Error ? error.message : "Error al descargar el audio.",
        variant: "destructive",
      });
    }
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
                
                <AudioActions
                  conversion={conv}
                  isPlaying={isPlaying}
                  isCurrentPlaying={currentPlayingId === conv.id}
                  onPlay={() => onPlay(conv)}
                  onDownload={() => handleDownload(conv)}
                />
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
