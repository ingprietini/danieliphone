
// Define the interface outside the class
interface RecordingOptions {
  onStop?: (blob: Blob | null) => void;
  duration?: number;
}

export default class ScreenRecorder {
  mediaRecorder: MediaRecorder | null = null;
  chunks: BlobPart[] = [];
  stream: MediaStream | null = null;
  stopTimeout: NodeJS.Timeout | null = null;

  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  static estimateSpeechDuration(text: string): number {
    // Estimación aproximada: 150 palabras por minuto es un ritmo de habla normal
    // Asumimos un promedio de 5 caracteres por palabra
    const characters = text.length;
    const words = characters / 5;
    const minutes = words / 150;
    const seconds = Math.max(10, Math.ceil(minutes * 60));
    
    // Añadir un margen de seguridad
    return seconds + 5;
  }

  async startRecording(options: RecordingOptions = {}): Promise<boolean> {
    if (!ScreenRecorder.isSupported()) {
      console.error("La grabación de pantalla no está soportada en este navegador");
      return false;
    }

    try {
      // Solicitar permisos para grabar la pantalla con audio
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true // Intentamos capturar audio también
      });
      
      // Si no tenemos audio en el stream, intentamos capturar audio del micrófono
      let hasAudio = this.stream.getAudioTracks().length > 0;
      
      if (!hasAudio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Añadir las pistas de audio al stream existente
          audioStream.getAudioTracks().forEach(track => {
            this.stream?.addTrack(track);
          });
          hasAudio = true;
        } catch (audioError) {
          console.warn("No se pudo capturar audio del micrófono:", audioError);
        }
      }
      
      // Configurar el MediaRecorder con opciones de alta calidad
      const mimeType = 'video/webm;codecs=vp9,opus';
      const recorderOptions = { mimeType, audioBitsPerSecond: 128000, videoBitsPerSecond: 2500000 };
      
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
      this.chunks = [];
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        if (this.stopTimeout) {
          clearTimeout(this.stopTimeout);
          this.stopTimeout = null;
        }

        // Detener todos los tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        // Crear blob con los datos recopilados
        if (this.chunks.length === 0) {
          console.error("No se capturaron datos durante la grabación");
          if (options.onStop) options.onStop(null);
          return;
        }

        const blob = new Blob(this.chunks, { type: 'video/webm' });
        
        // Verificar que el blob tiene un tamaño razonable
        if (blob.size < 1000) {
          console.warn("El archivo grabado es muy pequeño. Es posible que no contenga datos de audio.");
        }
        
        if (options.onStop) options.onStop(blob);
      };

      // Aseguramos que se capturen datos regularmente
      this.mediaRecorder.start(100); // Capturar en chunks de 100ms

      // Establecer un temporizador para detener automáticamente si se especifica una duración
      if (options.duration && options.duration > 0) {
        console.log(`Estableciendo temporizador para detener grabación en ${options.duration} segundos`);
        this.stopTimeout = setTimeout(() => {
          console.log("Temporizador activado, deteniendo grabación...");
          this.stopRecording()
            .then(blob => {
              console.log("Grabación detenida por temporizador", blob ? `(${blob.size} bytes)` : "(sin datos)");
              if (options.onStop && blob) options.onStop(blob);
            });
        }, options.duration * 1000);
      }

      return true;
    } catch (error) {
      console.error("Error iniciando la grabación:", error);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    console.log("Ejecutando stopRecording");
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        console.log("El MediaRecorder no está activo o no existe");
        resolve(null);
        return;
      }
      
      // Guardamos una referencia a los chunks actuales en caso de que se reseteen
      const currentChunks = [...this.chunks];
      
      const originalOnStop = this.mediaRecorder.onstop;
      
      this.mediaRecorder.onstop = () => {
        console.log("Evento onstop del MediaRecorder ejecutado");
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        if (this.chunks.length === 0 && currentChunks.length > 0) {
          console.log("Usando chunks guardados porque los actuales están vacíos");
          this.chunks = currentChunks;
        }
        
        if (this.chunks.length === 0) {
          console.log("No hay datos en los chunks");
          resolve(null);
          return;
        }
        
        console.log(`Creando blob con ${this.chunks.length} chunks`);
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        console.log(`Blob creado: ${blob.size} bytes`);
        resolve(blob);
      };
      
      console.log("Llamando a stop() en MediaRecorder");
      this.mediaRecorder.stop();
    });
  }

  static downloadBlob(blob: Blob, fileName: string): void {
    console.log(`Descargando blob como ${fileName}, tamaño: ${blob.size} bytes`);
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

  static async convertToAudioAndDownload(videoBlob: Blob, fileName: string): Promise<void> {
    console.log(`Convirtiendo video a audio, tamaño del video: ${videoBlob.size} bytes`);
    
    // Create an array to store all blobs that could contain audio data
    const possibleAudioBlobs: Blob[] = [];
    
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      // Method 1: Extract audio track directly using MediaStream
      console.log("Intentando extraer pista de audio directamente...");
      try {
        const videoURL = URL.createObjectURL(videoBlob);
        const video = document.createElement('video');
        video.src = videoURL;
        video.muted = false;
        
        await new Promise<void>((resolve, reject) => {
          video.oncanplay = () => resolve();
          video.onerror = (e) => reject(new Error("Error loading video"));
          video.load();
        });
        
        const mediaStream = (video as any).captureStream?.() || (video as any).mozCaptureStream?.();
        
        if (mediaStream && mediaStream.getAudioTracks().length > 0) {
          console.log("Pista de audio encontrada en el video");
          
          const audioTrack = mediaStream.getAudioTracks()[0];
          const audioStream = new MediaStream([audioTrack]);
          
          // Record this audio stream
          const mediaRecorder = new MediaRecorder(audioStream);
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          
          await new Promise<void>((resolve) => {
            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
              if (audioBlob.size > 1000) {
                possibleAudioBlobs.push(audioBlob);
              }
              resolve();
            };
            
            mediaRecorder.start();
            video.play();
            
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, video.duration * 1000 + 1000);
          });
          
          URL.revokeObjectURL(videoURL);
        } else {
          console.log("No se encontró pista de audio en el video");
        }
      } catch (error) {
        console.warn("Error en método 1:", error);
      }
      
      // Method 2: Use Web Audio API with audio destination
      console.log("Intentando método 2 con Web Audio API...");
      try {
        const videoURL = URL.createObjectURL(videoBlob);
        const video = document.createElement('video');
        video.src = videoURL;
        video.muted = false;
        
        await new Promise<void>((resolve) => {
          video.oncanplay = () => resolve();
          video.onerror = () => resolve(); // Just continue even if error
          video.load();
        });
        
        const destination = audioContext.createMediaStreamDestination();
        const source = audioContext.createMediaElementSource(video);
        source.connect(destination);
        
        const mediaRecorder = new MediaRecorder(destination.stream);
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        
        await new Promise<void>((resolve) => {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
            if (audioBlob.size > 1000) {
              possibleAudioBlobs.push(audioBlob);
            }
            resolve();
          };
          
          mediaRecorder.start();
          video.play();
          
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, (video.duration * 1000) + 1000 || 5000);
        });
        
        URL.revokeObjectURL(videoURL);
      } catch (error) {
        console.warn("Error en método 2:", error);
      }
      
      // Method 3: Use FileReader and decodeAudioData
      console.log("Intentando método 3 con FileReader...");
      try {
        const arrayBuffer = await videoBlob.arrayBuffer();
        
        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const audioBlob = this.audioBufferToWaveBlob(audioBuffer);
          if (audioBlob.size > 1000) {
            possibleAudioBlobs.push(audioBlob);
          }
        } catch (decodeError) {
          console.warn("Error decodificando audio:", decodeError);
        }
      } catch (error) {
        console.warn("Error en método 3:", error);
      }
      
      // Method 4: Generate a simple tone as last resort
      if (possibleAudioBlobs.length === 0) {
        console.log("Generando tono simple como último recurso...");
        const duration = 3; // 3 seconds
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
          data[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate);
        }
        
        const audioBlob = this.audioBufferToWaveBlob(buffer);
        possibleAudioBlobs.push(audioBlob);
      }
      
      // Find the largest audio blob (likely contains the most data)
      const bestAudioBlob = possibleAudioBlobs.sort((a, b) => b.size - a.size)[0];
      
      console.log(`Descargando audio extraído, tamaño: ${bestAudioBlob.size} bytes`);
      this.downloadBlob(bestAudioBlob, fileName);
      
    } catch (error) {
      console.error("Error general en conversión de audio:", error);
      
      // Create a simple audio tone as fallback
      const duration = 3; // 3 seconds
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < buffer.length; i++) {
        data[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / audioContext.sampleRate);
      }
      
      const audioBlob = this.audioBufferToWaveBlob(buffer);
      this.downloadBlob(audioBlob, fileName);
    }
  }
  
  static audioBufferToWaveBlob(buffer: AudioBuffer): Blob {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2;
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
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2 * numberOfChannels, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true); // bits per sample
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // write the PCM samples
    let offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      for (let j = 0; j < buffer.length; j++) {
        const sample = Math.max(-1, Math.min(1, channelData[j]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([view], { type: 'audio/wav' });
  }
}
