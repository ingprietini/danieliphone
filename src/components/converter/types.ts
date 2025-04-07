
export type Conversion = {
  id: number;
  text: string;
  date: string;
  serviceType: string;
  fileName?: string;
  audioData?: ArrayBuffer;
  fromWebSpeech?: boolean;
  audioDuration?: number;
  audioUrl?: string; // New property to store blob URL
};
