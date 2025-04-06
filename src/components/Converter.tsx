import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Settings } from "lucide-react";
import elevenLabsApi from "../utils/elevenLabsApi";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { ConversionService, conversionServices, getAcceptedFileExtensions } from "./converter/ConversionServices";
import { Conversion } from "./converter/types";
import ApiKeyConfig from "./converter/ApiKeyConfig";
import FileDropZone from "./converter/FileDropZone";
import TextEditor from "./converter/TextEditor";
import ServiceSelector from "./converter/ServiceSelector";
import ConversionHistory from "./converter/ConversionHistory";

const Converter = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [converting, setConverting] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const [activeService, setActiveService] = useState<string>("illustrator");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useWebSpeech, setUseWebSpeech] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [documentViewed, setDocumentViewed] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { isPlaying, playAudio, speakText, getVoices, stopAudio, cleanup } = useAudioPlayer({
    onPlayStart: () => {
      console.log("Audio playback started");
    },
    onPlayEnd: () => {
      console.log("Audio playback ended");
      setCurrentPlayingId(null);
    },
    onPlayError: (error) => {
      console.error("Audio playback error:", error);
      toast({
        title: "Error de reproducción",
        description: error.message,
        variant: "destructive",
      });
      setCurrentPlayingId(null);
    }
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const service = searchParams.get('service');
    if (service && conversionServices.some(s => s.id === service)) {
      setActiveService(service);
    }
  }, [location]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = getVoices();
      setAvailableVoices(voices);
      
      const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
      if (spanishVoice) {
        setSelectedVoice(spanishVoice);
      } else if (voices.length > 0) {
        setSelectedVoice(voices[0]);
      }
    };

    if ('speechSynthesis' in window) {
      loadVoices();
      
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [getVoices]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserPlan(user.plan || null);
      
      const userConversions = localStorage.getItem(`conversions_${user.email}`);
      if (userConversions) {
        setConversions(JSON.parse(userConversions));
      }

      const storedApiKey = localStorage.getItem('elevenlabs_api_key');
      if (storedApiKey) {
        setApiKey(storedApiKey);
        elevenLabsApi.setApiKey(storedApiKey);
      }

      const storedUseWebSpeech = localStorage.getItem('use_web_speech');
      if (storedUseWebSpeech) {
        const useWebSpeechValue = storedUseWebSpeech === 'true';
        setUseWebSpeech(useWebSpeechValue);
        elevenLabsApi.useWebSpeechApi(useWebSpeechValue);
      } else {
        setUseWebSpeech(true);
        elevenLabsApi.useWebSpeechApi(true);
      }
    }
  }, [toast]);

  // Cuando cambia el archivo, ya no necesitamos resetear documentViewed
  useEffect(() => {
    if (file) {
      // Siempre consideramos que el documento está listo para usarse
      setDocumentViewed(true);
    } else {
      setDocumentViewed(true);
    }
  }, [file]);

  // Configuración de eventos de arrastrar y soltar
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };
    
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const selectedFile = e.dataTransfer.files[0];
        setFile(selectedFile);
        handleExtractedText(fileText);
      }
    };
    
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [fileText]);

  const handleExtractedText = (extractedText: string) => {
    setFileText(extractedText);
    setText(extractedText);
  };
  
  // Función para marcar un documento como visualizado (la mantenemos por compatibilidad)
  const handleDocumentViewed = () => {
    setDocumentViewed(true);
  };

  const handleConvert = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Necesitas iniciar sesión",
        description: "Para convertir texto a voz, necesitas iniciar sesión primero.",
        variant: "destructive",
      });
      return;
    }

    if (!userPlan) {
      toast({
        title: "Selecciona un plan",
        description: "Necesitas seleccionar un plan para usar esta funcionalidad.",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Texto vacío",
        description: "Por favor, escribe algún texto para convertir.",
        variant: "destructive",
      });
      return;
    }
    
    // Eliminamos la verificación de documentViewed

    if (!useWebSpeech && !apiKey.trim()) {
      setShowApiKeyInput(true);
      toast({
        title: "API Key requerida",
        description: "Para convertir texto a voz con ElevenLabs, necesitas ingresar tu API Key.",
      });
      return;
    }

    setConverting(true);
    
    try {
      let audioData: ArrayBuffer | null = null;

      if (useWebSpeech) {
        audioData = new ArrayBuffer(0);
        speakText(text, { 
          voice: selectedVoice || undefined,
          rate,
          pitch
        });
      } else {
        audioData = await elevenLabsApi.textToSpeech({
          text: text,
        });
      }

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const newConversion = {
        id: Date.now(),
        text: text,
        date: new Date().toISOString(),
        serviceType: activeService,
        fileName: file?.name,
        audioData: audioData
      };
      
      const updatedConversions = [...conversions, newConversion];
      setConversions(updatedConversions);
      
      localStorage.setItem(`conversions_${userData.email}`, JSON.stringify(updatedConversions));
      
      toast({
        title: "Conversión exitosa",
        description: "Tu texto ha sido convertido a voz exitosamente.",
      });
      
      setConverting(false);
      
      if (!useWebSpeech) {
        setCurrentPlayingId(newConversion.id);
        playAudio(audioData);
      }
      
    } catch (error) {
      console.error("Conversion error:", error);
      setConverting(false);
      
      toast({
        title: "Error de conversión",
        description: error instanceof Error ? error.message : "Error al convertir texto a voz.",
        variant: "destructive",
      });
    }
  };

  const playAudioFromConversion = (conversion: Conversion) => {
    if (isPlaying && currentPlayingId === conversion.id) {
      stopAudio();
      setCurrentPlayingId(null);
      return;
    }

    setCurrentPlayingId(conversion.id);

    if (useWebSpeech) {
      speakText(conversion.text, { 
        voice: selectedVoice || undefined,
        rate,
        pitch
      });
    } else if (conversion.audioData) {
      playAudio(conversion.audioData);
    } else {
      elevenLabsApi.textToSpeech({
        text: conversion.text
      })
        .then(audioData => {
          const updatedConversions = conversions.map(c => 
            c.id === conversion.id ? { ...c, audioData } : c
          );
          setConversions(updatedConversions);
          
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem(`conversions_${userData.email}`, JSON.stringify(updatedConversions));
          
          playAudio(audioData);
        })
        .catch(error => {
          console.error("Error generating audio:", error);
          toast({
            title: "Error de reproducción",
            description: error instanceof Error ? error.message : "Error al generar el audio.",
            variant: "destructive",
          });
          setCurrentPlayingId(null);
        });
    }
  };

  const playText = () => {
    if (!useWebSpeech && !apiKey.trim()) {
      setShowApiKeyInput(true);
      toast({
        title: "API Key requerida",
        description: "Para reproducir voz con ElevenLabs, necesitas ingresar tu API Key.",
      });
      return;
    }
    
    // Eliminamos la verificación de documentViewed

    if (isPlaying) {
      stopAudio();
      return;
    }

    toast({
      title: "Generando audio",
      description: "Espera mientras se genera el audio.",
    });

    if (useWebSpeech) {
      speakText(text, { 
        voice: selectedVoice || undefined,
        rate,
        pitch
      });
    } else {
      elevenLabsApi.textToSpeech({ text })
        .then(audioData => {
          playAudio(audioData);
        })
        .catch(error => {
          console.error("Error generating audio:", error);
          toast({
            title: "Error de reproducción",
            description: error instanceof Error ? error.message : "Error al generar el audio.",
            variant: "destructive",
          });
        });
    }
  };

  const selectService = (serviceId: string) => {
    setActiveService(serviceId);
    
    setFile(null);
    setFileText("");
    setDocumentViewed(true); // Resetear cuando se cambia de servicio
    
    navigate(`/convertir?service=${serviceId}`, { replace: true });
    
    toast({
      title: `Servicio seleccionado: ${serviceId}`,
      description: `Has seleccionado el servicio de conversión ${serviceId}`,
    });
  };

  const currentService = conversionServices.find(service => service.id === activeService) || conversionServices[0];
  const acceptedExtensions = getAcceptedFileExtensions(activeService);

  return (
    <div className="py-16 bg-black min-h-screen">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="mr-2">
            <img 
              src="/imagenes/a76511af-df1a-4ac4-81ea-4eb0f69957a3.png" 
              alt="LYRA logo" 
              className="h-12 w-12 inline-block align-text-bottom"
            />
          </span>
          CONVERTIR A VOZ
        </h2>
        
        {!isLoggedIn ? (
          <div className="text-center">
            <p className="text-xl mb-4">Para usar esta función, necesitas iniciar sesión.</p>
            <a 
              href="/login" 
              className="inline-block bg-lyra-primary hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-md"
            >
              Iniciar Sesión
            </a>
          </div>
        ) : !userPlan ? (
          <div className="text-center">
            <p className="text-xl mb-4">Para usar esta función, necesitas seleccionar un plan.</p>
            <a 
              href="/almacenamiento" 
              className="inline-block bg-lyra-primary hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-md"
            >
              Elegir Plan
            </a>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/3">
              <div className="bg-gray-900 p-6 rounded-lg">
                {showApiKeyInput ? (
                  <ApiKeyConfig
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                    useWebSpeech={useWebSpeech}
                    setUseWebSpeech={setUseWebSpeech}
                    selectedVoice={selectedVoice}
                    setSelectedVoice={setSelectedVoice}
                    availableVoices={availableVoices}
                    rate={rate}
                    setRate={setRate}
                    pitch={pitch}
                    setPitch={setPitch}
                    onClose={() => setShowApiKeyInput(false)}
                  />
                ) : (
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Conversión con {currentService.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        Usando: {useWebSpeech ? 'API del Navegador' : 'ElevenLabs API'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowApiKeyInput(true)}
                        className="flex items-center gap-1"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configurar</span>
                      </Button>
                    </div>
                  </div>
                )}

                <div ref={dropZoneRef}>
                  <FileDropZone
                    file={file}
                    setFile={setFile}
                    activeService={activeService}
                    currentService={currentService}
                    onTextExtracted={handleExtractedText}
                    acceptedExtensions={acceptedExtensions}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    converting={converting}
                    onConvert={handleConvert}
                  />
                </div>

                <TextEditor
                  text={text}
                  onTextChange={setText}
                  isPlaying={isPlaying && currentPlayingId === null}
                  onPlayText={playText}
                  converting={converting}
                  onConvert={handleConvert}
                  useWebSpeech={useWebSpeech}
                  selectedVoice={selectedVoice}
                  onShowSettings={() => setShowApiKeyInput(true)}
                  userPlan={userPlan}
                />
              </div>
              
              <ServiceSelector
                services={conversionServices}
                activeService={activeService}
                onSelectService={selectService}
              />
            </div>
            
            <div className="w-full md:w-1/3">
              <ConversionHistory
                conversions={conversions}
                currentPlayingId={currentPlayingId}
                isPlaying={isPlaying}
                onPlay={playAudioFromConversion}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Converter;
