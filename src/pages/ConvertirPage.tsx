
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Converter from '../components/Converter';
import Footer from '../components/Footer';

const ConvertirPage = () => {
  useEffect(() => {
    // Asegurarse de que el fondo está correctamente configurado
    document.body.style.backgroundColor = "#000000";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    
    // Log para depuración
    console.log("ConvertirPage mounted");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-900/50 p-6 rounded-lg mb-8">
            <h1 className="text-3xl font-bold mb-4 text-center">Plataforma de Conversión</h1>
            <p className="text-lg text-center mb-3">
              Utiliza nuestro potente motor de conversión con procesamiento concurrente para transformar texto a voz.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <div className="bg-gray-800/70 max-w-md p-4 rounded-lg">
                <h3 className="font-semibold text-lyra-primary mb-2">¿Qué es el procesamiento concurrente?</h3>
                <p className="text-sm">
                  El procesamiento concurrente permite que múltiples tareas se ejecuten simultáneamente, 
                  lo que hace que LYRA pueda manejar varias conversiones a la vez sin ralentizar tu experiencia.
                  Esto significa conversiones más rápidas y una interfaz que responde sin importar cuántos archivos proceses.
                </p>
              </div>
              
              <div className="bg-gray-800/70 max-w-md p-4 rounded-lg">
                <h3 className="font-semibold text-lyra-primary mb-2">¿Cómo funciona?</h3>
                <p className="text-sm">
                  Nuestro sistema divide cada proceso de conversión en tareas independientes que se ejecutan en paralelo:
                </p>
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Extracción de texto (OCR para imágenes)</li>
                  <li>Procesamiento del lenguaje</li>
                  <li>Generación de voz en tiempo real</li>
                  <li>Optimización de audio</li>
                </ul>
                <p className="text-sm mt-2">
                  Todo esto ocurre en servidores distribuidos, lo que maximiza la velocidad y eficiencia.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Converter />
      </main>
      <Footer />
    </div>
  );
};

export default ConvertirPage;
