
import { useState } from "react";
import { Button } from "../ui/button";
import { Key, Mic, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import elevenLabsApi from "@/utils/elevenLabsApi";

type ApiKeyConfigProps = {
  apiKey: string;
  setApiKey: (key: string) => void;
  useWebSpeech: boolean;
  setUseWebSpeech: (use: boolean) => void;
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  availableVoices: SpeechSynthesisVoice[];
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  onClose: () => void;
};

const ApiKeyConfig = ({
  apiKey,
  setApiKey,
  useWebSpeech,
  setUseWebSpeech,
  selectedVoice,
  setSelectedVoice,
  availableVoices,
  rate,
  setRate,
  pitch,
  setPitch,
  onClose
}: ApiKeyConfigProps) => {
  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (!useWebSpeech && apiKey.trim()) {
      elevenLabsApi.setApiKey(apiKey);
      localStorage.setItem('elevenlabs_api_key', apiKey);
      onClose();
      toast({
        title: "API Key guardada",
        description: "Tu API Key de ElevenLabs ha sido guardada correctamente.",
      });
    } else if (useWebSpeech) {
      onClose();
      toast({
        title: "Usando Web Speech API",
        description: "No se requiere API Key con la API integrada del navegador.",
      });
    } else {
      toast({
        title: "API Key inválida",
        description: "Por favor, ingresa una API Key válida o selecciona usar la API del navegador.",
        variant: "destructive",
      });
    }
  };

  const toggleSpeechEngine = () => {
    const newValue = !useWebSpeech;
    setUseWebSpeech(newValue);
    elevenLabsApi.useWebSpeechApi(newValue);
    localStorage.setItem('use_web_speech', newValue.toString());
    
    toast({
      title: newValue ? "Usando Web Speech API" : "Usando ElevenLabs API",
      description: newValue 
        ? "Ahora utilizando la API integrada del navegador. No se necesita API Key." 
        : "Ahora utilizando ElevenLabs API. Se requiere una API Key.",
    });
  };

  return (
    <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {useWebSpeech ? (
            <Mic className="h-5 w-5 mr-2 text-green-500" />
          ) : (
            <Key className="h-5 w-5 mr-2 text-lyra-primary" />
          )}
          <h3 className="text-lg font-semibold">
            {useWebSpeech ? 'Web Speech API (Navegador)' : 'API Key de ElevenLabs'}
          </h3>
        </div>
        <Button 
          onClick={toggleSpeechEngine}
          size="sm"
          variant="outline"
        >
          {useWebSpeech ? 'Usar ElevenLabs' : 'Usar API del Navegador'}
        </Button>
      </div>
      
      {useWebSpeech ? (
        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-3">
            Estás utilizando la API integrada de tu navegador para convertir texto a voz. 
            No se requiere API Key, pero la calidad y opciones pueden variar según el navegador.
          </p>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Seleccionar voz</label>
            <select 
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              onChange={(e) => {
                const selectedVoice = availableVoices.find(v => v.name === e.target.value);
                if (selectedVoice) setSelectedVoice(selectedVoice);
              }}
              value={selectedVoice?.name || ""}
            >
              {availableVoices.length === 0 ? (
                <option value="">Cargando voces...</option>
              ) : (
                availableVoices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Velocidad: {rate.toFixed(1)}x
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={rate} 
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Tono: {pitch.toFixed(1)}
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={pitch} 
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleSaveApiKey}
            className="bg-green-600 hover:bg-green-700"
          >
            Guardar y Continuar
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-400 mb-3">
            Para utilizar el servicio de conversión de texto a voz con ElevenLabs, necesitas ingresar tu API Key.
            Puedes obtener una clave gratuita en <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-lyra-primary hover:underline">elevenlabs.io</a>
          </p>
          <div className="flex gap-2">
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API Key de ElevenLabs"
              className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-lyra-primary"
            />
            <Button 
              onClick={handleSaveApiKey}
              className="bg-lyra-primary hover:bg-opacity-80"
            >
              Guardar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyConfig;
