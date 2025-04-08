
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-lyra-dark py-24">
      <div className="container mx-auto text-center">
        <div className="flex justify-center mb-6">
          <img 
            src="/iamgenes/a76511af-df1a-4ac4-81ea-4eb0f69957a3.png" 
            alt="LYRA logo" 
            className="h-24 w-24"
          />
        </div>
        <h1 className="text-6xl font-bold mb-8">L Y R A</h1>
        <p className="text-2xl max-w-2xl mx-auto mb-8">
          Haz que tus palabras cobren vida con Lyra. Descubre nuestros planes y empieza a transformar texto en voz.
        </p>
        
        {/* Información sobre concurrencia */}
        <div className="bg-gray-800/60 p-6 rounded-lg max-w-3xl mx-auto mb-10">
          <h3 className="text-xl font-bold mb-3 text-lyra-primary">Procesamiento Concurrente</h3>
          <p className="mb-4">
            LYRA utiliza tecnología avanzada de procesamiento concurrente para convertir tus archivos rápidamente:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-gray-800/80 p-3 rounded">
              <h4 className="font-semibold mb-1">Conversiones Simultáneas</h4>
              <p className="text-sm text-gray-300">Procesa múltiples archivos a la vez sin afectar el rendimiento.</p>
            </div>
            <div className="bg-gray-800/80 p-3 rounded">
              <h4 className="font-semibold mb-1">Respuesta Inmediata</h4>
              <p className="text-sm text-gray-300">La interfaz permanece receptiva mientras se procesan tus archivos.</p>
            </div>
            <div className="bg-gray-800/80 p-3 rounded">
              <h4 className="font-semibold mb-1">Alta Disponibilidad</h4>
              <p className="text-sm text-gray-300">Sistema diseñado para manejar múltiples solicitudes sin degradación.</p>
            </div>
            <div className="bg-gray-800/80 p-3 rounded">
              <h4 className="font-semibold mb-1">Escalabilidad</h4>
              <p className="text-sm text-gray-300">Adaptamos recursos según la demanda para ofrecer siempre el mejor servicio.</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link 
            to="/almacenamiento" 
            className="bg-lyra-primary hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded-md"
          >
            MÁS INFORMACIÓN
          </Link>
          <Link 
            to="/convertir" 
            className="bg-transparent border-2 border-lyra-primary hover:bg-lyra-primary hover:bg-opacity-20 text-white font-bold py-2 px-6 rounded-md"
          >
            CONVERTIR
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
