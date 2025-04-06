
import { Button } from "../ui/button";
import { Play, Pause } from "lucide-react";
import { Conversion } from "./types";

type ConversionHistoryProps = {
  conversions: Conversion[];
  currentPlayingId: number | null;
  isPlaying: boolean;
  onPlay: (conversion: Conversion) => void;
};

const ConversionHistory = ({ 
  conversions, 
  currentPlayingId, 
  isPlaying, 
  onPlay 
}: ConversionHistoryProps) => {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
                <Button 
                  onClick={() => onPlay(conv)} 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                >
                  {isPlaying && currentPlayingId === conv.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
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
