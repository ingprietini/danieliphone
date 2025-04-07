
import { Button } from "../ui/button";
import { Play, Pause, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  return (
    <>
      <textarea
        value={text}
        onChange={e => onTextChange(e.target.value)}
        placeholder="Cargue un archivo o escriba el texto que desea convertir a voz..."
        className="w-full p-4 min-h-[200px] bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
      />
      
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
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
          
          {useWebSpeech && (
            <div className="flex items-center gap-2">
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
