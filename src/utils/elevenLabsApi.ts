
// Web Speech API client for text-to-speech conversion

// Este módulo proporciona tanto la API de ElevenLabs (requiere API key)
// como la Web Speech API (integrada en navegadores, sin key requerida)

interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  speakerBoost?: boolean;
  style?: number;
  responseType?: 'arraybuffer' | 'json';
}

interface WebSpeechOptions {
  text: string;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

// Default ElevenLabs voice IDs
export const ELEVENLABS_VOICES = {
  RACHEL: "21m00Tcm4TlvDq8ikWAM", // Rachel (English, US)
  DOMI: "AZnzlk1XvdvUeBnXmlld",   // Domi (English, US)
  BELLA: "EXAVITQu4vr4xnSDxMaL", // Bella (English, US)
  ANTONI: "ErXwobaYiN019PkySvjV", // Antoni (English, US)
  ELLI: "MF3mGyEYCl7XYWbV9V6O",   // Elli (English, US)
  JOSH: "TxGEqnHWrfWFTfGW9XjX",   // Josh (English, US)
  ARNOLD: "VR6AewLTigWG4xSOukaG", // Arnold (English, US)
  ADAM: "pNInz6obpgDQGcFmaJgB",   // Adam (English, US)
  SARA: "21m00Tcm4TlvDq8ikWAM",   // Sara (Spanish, Spain)
};

// Default ElevenLabs model IDs
export const ELEVENLABS_MODELS = {
  MULTILINGUAL_V2: "eleven_multilingual_v2",
  MULTILINGUAL_V1: "eleven_multilingual_v1",
  MONOLINGUAL_V1: "eleven_monolingual_v1",
  TURBO_V2: "eleven_turbo_v2",
};

class ElevenLabsApi {
  private apiKey: string | null = null;
  private baseUrl = "https://api.elevenlabs.io/v1";
  private useNativeApi = false;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  useWebSpeechApi(useNative: boolean) {
    this.useNativeApi = useNative;
  }

  async textToSpeech(options: TextToSpeechOptions): Promise<ArrayBuffer> {
    if (this.useNativeApi) {
      return this.webSpeechSynthesis({
        text: options.text,
      });
    }

    if (!this.apiKey) {
      throw new Error("API Key no configurada. Por favor, establezca la API key primero.");
    }

    const voiceId = options.voiceId || ELEVENLABS_VOICES.SARA; // Default to Spanish voice
    const modelId = options.modelId || ELEVENLABS_MODELS.MULTILINGUAL_V2;

    try {
      // En un entorno real, aquí haríamos la llamada a la API de ElevenLabs
      // Para esta simulación, simplemente registramos la llamada y devolvemos un buffer vacío
      console.log(`[ElevenLabs] Simulando conversión de texto a voz con ${voiceId} y modelo ${modelId}`);
      console.log(`[ElevenLabs] Texto a convertir: "${options.text.substring(0, 100)}${options.text.length > 100 ? '...' : ''}"`);

      // Simulamos un delay para imitar la llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Creamos un ArrayBuffer vacío para simular la respuesta
      // En una implementación real, esto sería el audio devuelto por la API
      const audioData = new ArrayBuffer(1024);

      return audioData;
    } catch (error) {
      console.error("Error in ElevenLabs API:", error);
      throw new Error(error instanceof Error ? error.message : "Error en la conversión de texto a voz");
    }
  }

  private async webSpeechSynthesis(options: WebSpeechOptions): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("La síntesis de voz no está soportada en este navegador"));
        return;
      }

      // Crear una nueva instancia de SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Configurar opciones si están disponibles
      if (options.voice) utterance.voice = options.voice;
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume) utterance.volume = options.volume;
      if (options.lang) utterance.lang = options.lang;
      
      // Por defecto, intentar usar una voz en español
      if (!options.voice && !options.lang) {
        // Obtener todas las voces disponibles
        const voices = window.speechSynthesis.getVoices();
        // Buscar una voz en español
        const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
        if (spanishVoice) {
          utterance.voice = spanishVoice;
          utterance.lang = spanishVoice.lang;
        }
      }

      // Debug de la síntesis de voz
      console.log(`[WebSpeech] Texto a convertir: "${options.text.substring(0, 100)}${options.text.length > 100 ? '...' : ''}"`);
      
      // Crear buffer vacío ya que Web Speech API no devuelve el audio como datos
      const dummyBuffer = new ArrayBuffer(1);
      
      // Hablar el texto
      window.speechSynthesis.speak(utterance);
      
      // Para uso real, no podemos capturar el audio generado por la API de Web Speech
      resolve(dummyBuffer);
    });
  }
}

const elevenLabsApi = new ElevenLabsApi();
export default elevenLabsApi;
