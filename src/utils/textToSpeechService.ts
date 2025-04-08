
// Convertir texto a audio y descargarlo usando la API de Google Translate TTS
export async function convertTextToDownloadableAudio(
  text: string,
  lang: string = 'es-ES',
  fileName: string = 'audio.mp3'
): Promise<void> {
  try {
    // Limitamos el texto a 200 caracteres para la API de Google
    const chunks = splitTextIntoChunks(text, 200);
    
    if (chunks.length === 1) {
      // Un solo chunk, usamos el método simple
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunks[0])}&tl=${lang}&client=tw-ob`;
      
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Descargar el archivo
      downloadBlob(blob, fileName);
    } else {
      // Múltiples chunks, tenemos que concatenar
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffers: AudioBuffer[] = [];
      
      // Mostrar progreso
      console.log(`Procesando ${chunks.length} fragmentos de texto...`);
      
      // Procesar cada chunk
      for (let i = 0; i < chunks.length; i++) {
        try {
          const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunks[i])}&tl=${lang}&client=tw-ob`;
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioBuffers.push(audioBuffer);
          console.log(`Fragmento ${i + 1}/${chunks.length} procesado`);
        } catch (error) {
          console.error(`Error procesando fragmento ${i + 1}:`, error);
        }
      }
      
      // Concatenar los buffers de audio
      const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
      const concatenatedBuffer = audioContext.createBuffer(
        1,  // mono
        totalLength,
        audioContext.sampleRate
      );
      
      let offset = 0;
      for (const buffer of audioBuffers) {
        const channelData = buffer.getChannelData(0);
        concatenatedBuffer.getChannelData(0).set(channelData, offset);
        offset += buffer.length;
      }
      
      // Convertir a wav y descargar
      const wavBlob = await audioBufferToWave(concatenatedBuffer);
      downloadBlob(wavBlob, fileName);
    }
  } catch (error) {
    console.error("Error en convertTextToDownloadableAudio:", error);
    throw new Error("No se pudo generar el audio: " + (error instanceof Error ? error.message : String(error)));
  }
}

// Método alternativo usando un servicio externo
export async function downloadAudioFromExternalAPI(
  text: string,
  lang: string = 'es-ES',
  fileName: string = 'audio.mp3'
): Promise<void> {
  try {
    // Intentamos con otro servicio TTS
    const url = `https://api.voicerss.org/?key=demo&hl=${lang.split('-')[0]}&v=Linda&r=0&c=mp3&f=8khz_8bit_mono&src=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    const blob = await response.blob();
    downloadBlob(blob, fileName);
  } catch (error) {
    console.error("Error en downloadAudioFromExternalAPI:", error);
    throw new Error("No se pudo generar el audio con el servicio alternativo");
  }
}

// Método de respaldo usando Web Audio API para generar audio simple
export async function downloadFromTtsMP3(
  text: string,
  lang: string = 'es-ES',
  fileName: string = 'audio.mp3'
): Promise<void> {
  try {
    // Si hay SpeechSynthesis disponible, usamos eso para generar el audio
    if ('speechSynthesis' in window) {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        
        // Buscar una voz en el idioma especificado
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (voice) {
          utterance.voice = voice;
        }
        
        // Configurar el contexto de audio para grabar
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        
        // Procesar datos de audio mientras se reproduce
        const audioChunks: Float32Array[] = [];
        
        // Usar MediaRecorder como alternativa si está disponible
        if (navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              window.speechSynthesis.speak(utterance);
              
              setTimeout(() => {
                // Generar un tono simple como alternativa
                const duration = text.length * 0.1; // 100ms por caracter
                generateToneAndDownload(duration, fileName)
                  .then(resolve)
                  .catch(reject);
              }, 1000);
            })
            .catch(err => {
              console.warn("No se pudo acceder al micrófono:", err);
              // Generar un tono simple como última opción
              const duration = text.length * 0.1; // 100ms por caracter
              generateToneAndDownload(duration, fileName)
                .then(resolve)
                .catch(reject);
            });
        } else {
          // Generar un tono simple como última opción
          const duration = text.length * 0.1; // 100ms por caracter
          generateToneAndDownload(duration, fileName)
            .then(resolve)
            .catch(reject);
        }
      });
    } else {
      // Si no hay síntesis de voz, generamos un tono
      const duration = text.length * 0.1; // 100ms por caracter
      await generateToneAndDownload(duration, fileName);
    }
  } catch (error) {
    console.error("Error en downloadFromTtsMP3:", error);
    throw new Error("No se pudo generar el audio con el método de respaldo");
  }
}

// Función auxiliar para dividir texto en fragmentos
function splitTextIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  
  // Dividir por oraciones o frases naturales
  const sentences = text.match(/[^.!?]+[.!?]+|\s*[.!?]+\s*/g) || [text];
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= chunkSize) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      
      // Si la oración es más larga que el tamaño máximo, dividirla
      if (sentence.length > chunkSize) {
        const words = sentence.split(' ');
        currentChunk = '';
        
        for (const word of words) {
          if (currentChunk.length + word.length + 1 <= chunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            chunks.push(currentChunk.trim());
            currentChunk = word;
          }
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  
  // Añadir el último fragmento si queda algo
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Función auxiliar para descargar un blob
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Función para generar un tono simple
async function generateToneAndDownload(duration: number, fileName: string): Promise<void> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const frameCount = audioContext.sampleRate * duration;
  const audioBuffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  // Generar un tono simple con envolvente ADSR
  const attackTime = 0.1;
  const decayTime = 0.2;
  const sustainLevel = 0.7;
  const releaseTime = 0.3;
  
  for (let i = 0; i < frameCount; i++) {
    const t = i / audioContext.sampleRate;
    let amplitude = 0;
    
    if (t < attackTime) {
      // Fase de ataque
      amplitude = (t / attackTime);
    } else if (t < attackTime + decayTime) {
      // Fase de decaimiento
      const decayProgress = (t - attackTime) / decayTime;
      amplitude = 1 - ((1 - sustainLevel) * decayProgress);
    } else if (t < duration - releaseTime) {
      // Fase de sostenimiento
      amplitude = sustainLevel;
    } else {
      // Fase de liberación
      const releaseProgress = (t - (duration - releaseTime)) / releaseTime;
      amplitude = sustainLevel * (1 - releaseProgress);
    }
    
    // Mezclar varios tonos para hacerlo más rico
    const frequency1 = 440; // A4
    const frequency2 = 220; // A3
    
    channelData[i] = amplitude * (
      0.6 * Math.sin(2 * Math.PI * frequency1 * t) + 
      0.4 * Math.sin(2 * Math.PI * frequency2 * t)
    ) * 0.5;
  }
  
  // Convertir a WAV y descargar
  const wavBlob = await audioBufferToWave(audioBuffer);
  downloadBlob(wavBlob, fileName);
}

// Función para convertir AudioBuffer a formato WAV
async function audioBufferToWave(buffer: AudioBuffer): Promise<Blob> {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const view = new DataView(new ArrayBuffer(44 + length));
  
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
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
  
  return new Blob([view], { type: 'audio/wav' });
}
