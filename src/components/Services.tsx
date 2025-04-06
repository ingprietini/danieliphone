
import { Link } from 'react-router-dom';

const serviceItems = [
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
    title: 'Word',
    description: 'Los words se convierten en voces.',
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

const Services = () => {
  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">S E R V I C I O S</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {serviceItems.map((service) => (
            <Link 
              key={service.id} 
              to={`/convertir?service=${service.id}`}
              className="service-card p-6 flex flex-col items-center hover:scale-105 transition-transform"
            >
              <div className={`w-16 h-16 mb-4 flex items-center justify-center ${service.color} rounded-md`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-400 text-center">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
