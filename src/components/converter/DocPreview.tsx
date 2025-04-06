
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Volume, X, Download, Clipboard, Check, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mammoth from "mammoth";

interface DocPreviewProps {
  fileName: string;
  content: string;
  rawFile?: File;
  isOpen: boolean;
  onClose: () => void;
  onConvert: () => void;
  isConverting: boolean;
  onDocumentViewed?: () => void;
  onTextExtracted?: (text: string) => void;
}

const DocPreview = ({
  fileName,
  content,
  rawFile,
  isOpen,
  onClose,
  onConvert,
  isConverting,
  onDocumentViewed,
  onTextExtracted
}: DocPreviewProps) => {
  const { toast } = useToast();
  const [previewContent, setPreviewContent] = useState(content);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const isImage = rawFile && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  const isDocx = fileName.toLowerCase().endsWith('.docx');
  
  useEffect(() => {
    // Si tenemos un archivo raw y es una imagen, crear URL para previsualización
    if (rawFile && isImage) {
      const url = URL.createObjectURL(rawFile);
      setImageUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    
    // Si tenemos un archivo raw y es un DOCX, usar mammoth para renderizarlo
    const processFile = async () => {
      if (rawFile && isDocx) {
        try {
          const arrayBuffer = await rawFile.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setHtmlContent(result.value);
          
          // Si tenemos advertencias, las registramos
          if (result.messages.length > 0) {
            console.log("Mammoth warnings:", result.messages);
          }
        } catch (error) {
          console.error("Error processing DOCX with mammoth:", error);
          // Fallback a contenido de texto plano
          setHtmlContent("");
        }
      } else {
        // Resetear contenido HTML si no es un archivo DOCX
        setHtmlContent("");
      }
    };
    
    processFile();
  }, [rawFile, fileName, isImage, isDocx]);

  useEffect(() => {
    // Marcar automáticamente el documento como visto al abrirse
    if (isOpen && onDocumentViewed) {
      onDocumentViewed();
    }
  }, [isOpen, onDocumentViewed]);

  // Auto-copiar al portapapeles cuando se abre la vista previa y actualizar el área de texto principal
  useEffect(() => {
    if (isOpen && content) {
      const textToCopy = isDocx && htmlContent 
        ? document.querySelector('.docx-content')?.textContent || content
        : content;
        
      copyToClipboard(textToCopy);
      
      // Actualizar el área de texto principal con el contenido extraído
      if (onTextExtracted) {
        onTextExtracted(textToCopy);
      }
    }
  }, [isOpen, content, htmlContent, onTextExtracted]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copiado al portapapeles",
          description: "El texto ha sido copiado al portapapeles automáticamente.",
        });
        
        // Resetear estado copiado después de 2 segundos
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Error al copiar al portapapeles:", err);
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar el texto al portapapeles.",
          variant: "destructive",
        });
      });
  };

  const handleConvert = () => {
    toast({
      title: "Conversión iniciada",
      description: "Preparando para convertir el documento a voz..."
    });
    onConvert();
  };

  // Si no está abierto, no mostrar nada
  if (!isOpen) {
    return null;
  }

  const textToCopy = isDocx && htmlContent 
    ? document.querySelector('.docx-content')?.textContent || content
    : content;
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-background max-w-3xl w-full max-h-[80vh] rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isImage ? (
              <Image className="h-5 w-5 text-green-500" />
            ) : (
              <FileText className="h-5 w-5 text-blue-500" />
            )}
            <h3 className="text-lg font-semibold">Vista previa: {fileName}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto my-4 p-4 bg-gray-800 rounded-md border border-gray-700 mx-4">
          {isImage && imageUrl ? (
            <div className="flex flex-col items-center">
              <img 
                src={imageUrl} 
                alt="Imagen cargada" 
                className="max-w-full max-h-[400px] object-contain mb-4" 
              />
              <div className="w-full p-2 bg-gray-700 rounded">
                <h4 className="font-medium mb-2">Texto extraído de la imagen:</h4>
                <pre className="whitespace-pre-wrap text-sm">{content}</pre>
              </div>
            </div>
          ) : isDocx && htmlContent ? (
            <div 
              className="docx-content text-sm text-white"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          ) : (
            <pre className="whitespace-pre-wrap text-sm">{previewContent}</pre>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => copyToClipboard(textToCopy)}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-4 w-4" />
                  <span>Copiar al portapapeles</span>
                </>
              )}
            </Button>
            <div className="text-sm text-gray-400">
              {isImage ? 
                "Imagen procesada - Texto extraído listo para convertir a voz" :
                isDocx && htmlContent ? 
                "Documento DOCX listo para convertir a voz" : 
                `${content.length} caracteres detectados - Listo para convertir a voz`}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button 
              onClick={handleConvert}
              disabled={isConverting || (!content.trim() && !htmlContent)}
              className="bg-lyra-primary hover:bg-opacity-80 flex items-center gap-2"
            >
              <Volume className="h-4 w-4" />
              {isConverting ? "Convirtiendo..." : "Convertir a voz"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocPreview;
