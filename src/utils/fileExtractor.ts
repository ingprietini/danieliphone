
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import * as pdfjs from "pdfjs-dist";

// We need to set the worker source for pdfjs
const pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

// Función para extraer texto de un archivo en base a su tipo
export const extractTextFromFile = async (file: File, serviceType: string): Promise<string> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  // Determinar el tipo de archivo si no se proporciona uno específico
  if (!serviceType || serviceType === 'auto') {
    if (['doc', 'docx', 'rtf', 'txt'].includes(fileExtension || '')) {
      serviceType = 'word';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
      serviceType = 'fotos';
    } else if (['pdf'].includes(fileExtension || '')) {
      serviceType = 'pdf';
    } else if (['lrcat', 'lrtemplate', 'xmp'].includes(fileExtension || '')) {
      serviceType = 'lightroom';
    } else if (['ai', 'eps', 'svg'].includes(fileExtension || '')) {
      serviceType = 'illustrator';
    }
  }
  
  try {
    switch (serviceType) {
      case 'word':
        return await extractTextFromWord(file);
      case 'fotos':
        return await extractTextFromImage(file);
      case 'pdf':
        return await extractTextFromPDF(file);
      case 'lightroom':
      case 'illustrator':
      default:
        // Para otros formatos simplemente devolvemos un mensaje informativo
        return `Archivo ${file.name} cargado con éxito. Este tipo de archivo no contiene texto para extraer directamente.`;
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error(`Error al extraer texto del archivo: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Función para extraer texto de documentos Word
const extractTextFromWord = async (file: File): Promise<string> => {
  // Si es un archivo .txt, simplemente lo leemos como texto
  if (file.name.toLowerCase().endsWith('.txt')) {
    return await file.text();
  }
  
  // Si es un archivo .docx, usamos mammoth
  if (file.name.toLowerCase().endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("Error extracting text from DOCX:", error);
      throw new Error("No se pudo extraer texto del documento Word.");
    }
  }
  
  // Para otros formatos como .doc o .rtf
  return "Este formato de documento necesita convertirse manualmente. Por favor, copia y pega el contenido.";
};

// Función para extraer texto de imágenes usando Tesseract.js
const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    // Crear una URL para la imagen
    const imageUrl = URL.createObjectURL(file);
    
    // Inicializar el worker de Tesseract
    const worker = await createWorker('spa'); // Usamos español como idioma predeterminado
    
    // Reconocer texto de la imagen
    const { data } = await worker.recognize(imageUrl);
    
    // Liberar recursos
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    
    // Si no se encontró texto, devolver un mensaje informativo
    if (!data.text || data.text.trim() === '') {
      return "No se detectó texto en esta imagen. Intenta con otra imagen o ingresa el texto manualmente.";
    }
    
    return data.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("No se pudo extraer texto de la imagen. Intenta con otra imagen o ingresa el texto manualmente.");
  }
};

// Función para extraer texto de archivos PDF
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Convertir el archivo a ArrayBuffer para procesarlo con pdf.js
    const arrayBuffer = await file.arrayBuffer();
    
    // Cargar el documento PDF
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extraer texto de todas las páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    // Si no se encontró texto, devolver un mensaje informativo
    if (!fullText.trim()) {
      return "No se detectó texto en este PDF. Es posible que sea un PDF escaneado que requiere OCR o que contenga solo imágenes.";
    }
    
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("No se pudo extraer texto del PDF. Intenta con otro archivo o ingresa el texto manualmente.");
  }
};
