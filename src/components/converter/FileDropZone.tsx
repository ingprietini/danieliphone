
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { FileUp, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromFile } from "@/utils/fileExtractor";
import { ConversionService } from "./ConversionServices";
import DocPreview from "./DocPreview";

type FileDropZoneProps = {
  file: File | null;
  setFile: (file: File | null) => void;
  activeService: string;
  currentService: ConversionService;
  onTextExtracted: (text: string) => void;
  acceptedExtensions: string;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  converting: boolean;
  onConvert: () => void;
};

const FileDropZone = ({
  file,
  setFile,
  activeService,
  currentService,
  onTextExtracted,
  acceptedExtensions,
  isDragging,
  setIsDragging,
  converting,
  onConvert
}: FileDropZoneProps) => {
  const { toast } = useToast();
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [documentViewed, setDocumentViewed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessingFile(true);
    setDocumentViewed(false); // Resetear cuando se carga un nuevo archivo
    
    try {
      toast({
        title: "Procesando archivo",
        description: `Analizando el archivo ${selectedFile.name}...`,
      });
      
      let extractedText;
      
      if (activeService && activeService !== 'auto') {
        extractedText = await extractTextFromFile(selectedFile, activeService);
      } else {
        extractedText = await extractTextFromFile(selectedFile, '');
      }
      
      setExtractedText(extractedText);
      onTextExtracted(extractedText);
      
      toast({
        title: "Archivo procesado",
        description: `Texto extraído exitosamente. Ahora puedes visualizar el documento.`,
      });
      
      // Automáticamente mostramos la vista previa después de procesar
      setShowPreview(true);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error al procesar archivo",
        description: error instanceof Error ? error.message : "Error desconocido al procesar el archivo",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleViewContent = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleDocumentViewed = () => {
    setDocumentViewed(true);
    toast({
      title: "Documento visualizado",
      description: "Ahora puedes convertir este documento a voz",
    });
  };

  return (
    <>
      <div 
        className={`mb-6 p-4 rounded-lg border border-dashed transition-all
          ${isDragging ? 'border-lyra-primary bg-lyra-primary/10' : ''}
          ${file ? 'border-green-500 bg-gray-800/40' : 'border-gray-600 bg-gray-800/20'}
        `}
      >
        <div className="flex flex-col items-center justify-center">
          <div className={`w-16 h-16 mb-3 flex items-center justify-center ${currentService.color} rounded-md`}>
            {currentService.icon}
          </div>
          <p className="mb-2 text-sm text-gray-400 text-center">
            {isDragging ? "Suelta el archivo aquí..." : 
             file ? `Archivo cargado: ${file.name}` : 
             `Arrastra o haz clic para subir un archivo ${currentService.title}`}
          </p>
          <input
            type="file"
            id="fileInput"
            ref={fileInputRef}
            className="hidden"
            accept={acceptedExtensions}
            onChange={handleFileSelect}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={triggerFileInput}
              disabled={isProcessingFile}
              className={`flex items-center gap-2 ${isProcessingFile ? 'bg-gray-600' : 'bg-lyra-primary hover:bg-opacity-80'}`}
            >
              {isProcessingFile ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  <span>{file ? 'Cambiar archivo' : 'Seleccionar archivo'}</span>
                </>
              )}
            </Button>
            {file && extractedText && (
              <Button
                type="button"
                variant="outline"
                onClick={handleViewContent}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>Visualizar documento</span>
              </Button>
            )}
          </div>
          
          {file && documentViewed && (
            <div className="mt-4 text-green-500 text-sm flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Documento visualizado. Listo para convertir a voz.
            </div>
          )}
        </div>
      </div>

      {file && (
        <DocPreview
          fileName={file.name}
          content={extractedText}
          rawFile={file}
          isOpen={showPreview}
          onClose={handleClosePreview}
          onConvert={onConvert}
          isConverting={converting}
          onDocumentViewed={handleDocumentViewed}
          onTextExtracted={onTextExtracted}
        />
      )}
    </>
  );
};

export default FileDropZone;
