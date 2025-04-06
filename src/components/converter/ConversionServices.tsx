
import { ReactNode } from "react";

export type ConversionService = {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
};

export const conversionServices: ConversionService[] = [
  {
    id: 'lightroom',
    icon: <div className="h-8 w-8 bg-blue-500 transform rotate-45"></div>,
    title: 'Lightroom',
    description: 'Aseguramos tus trabajos de LRC de forma segura.',
    color: 'bg-blue-500'
  },
  {
    id: 'illustrator',
    icon: <div className="h-8 w-8 bg-orange-500 rounded-full"></div>,
    title: 'Illustrator',
    description: 'Tus letras pasan a voz.',
    color: 'bg-orange-500'
  },
  {
    id: 'word',
    icon: <div className="h-8 w-8 bg-cyan-500 rounded-sm"></div>,
    title: 'Word (.docx)',
    description: 'Vista previa y conversión de documentos Word.',
    color: 'bg-cyan-500'
  },
  {
    id: 'fotos',
    icon: <div className="h-8 w-8 bg-gradient-to-r from-red-500 to-indigo-500 flex items-center justify-center">
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
      </svg>
    </div>,
    title: 'Fotos',
    description: 'Tus imágenes con letras pasan a voz.',
    color: 'bg-gradient-to-r from-red-500 to-indigo-500'
  },
  {
    id: 'pdf',
    icon: <div className="h-8 w-8 bg-pink-600 rounded-sm"></div>,
    title: 'PDF',
    description: 'Convertimos tus pdfs a voz.',
    color: 'bg-pink-600'
  }
];

export const getAcceptedFileExtensions = (activeService: string) => {
  switch(activeService) {
    case 'pdf': 
      return '.pdf';
    case 'word': 
      return '.docx,.doc,.rtf,.txt';  // Colocamos .docx primero para indicar preferencia
    case 'fotos': 
      return '.jpg,.jpeg,.png,.gif,.bmp,.webp';
    case 'lightroom': 
      return '.lrcat,.lrtemplate,.xmp';
    case 'illustrator': 
      return '.ai,.eps,.svg';
    default: 
      return '*';
  }
};
