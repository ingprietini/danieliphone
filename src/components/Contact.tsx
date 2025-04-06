
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardar en localStorage
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push({
      ...formData,
      id: Date.now(),
      date: new Date().toISOString()
    });
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    
    // Mostrar toast y limpiar formulario
    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarnos. Te responderemos pronto.",
    });
    
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">CONTÁCTANOS</h2>
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <p className="text-gray-300 mb-8">
              ¿Tienes alguna duda o pregunta? Estamos aquí para ayudarte. Llena el formulario a
              continuación y nos pondremos en contacto contigo lo antes posible.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">Síguenos en nuestras redes sociales:</h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-600 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.89,0H5.11A5.11,5.11,0,0,0,0,5.11V18.89A5.11,5.11,0,0,0,5.11,24H18.89A5.11,5.11,0,0,0,24,18.89V5.11A5.11,5.11,0,0,0,18.89,0ZM16,7H13.5a3.5,3.5,0,0,0-3.5,3.5V13h-2v3h2v7h3V16h3l0.5-3h-3.5v-2a1,1,0,0,1,1-1H16V7Z"/>
                </svg>
              </a>
              <a href="#" className="bg-pink-600 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2.16c3.2,0,3.58,0,4.85.07a6.64,6.64,0,0,1,2.23.41,3.48,3.48,0,0,1,1.3.85,3.48,3.48,0,0,1,.85,1.3,6.64,6.64,0,0,1,.41,2.23c.06,1.27.07,1.65.07,4.85s0,3.58-.07,4.85a6.64,6.64,0,0,1-.41,2.23,3.72,3.72,0,0,1-2.15,2.15,6.64,6.64,0,0,1-2.23.41c-1.27.06-1.65.07-4.85.07s-3.58,0-4.85-.07a6.64,6.64,0,0,1-2.23-.41,3.48,3.48,0,0,1-1.3-.85,3.48,3.48,0,0,1-.85-1.3,6.64,6.64,0,0,1-.41-2.23C2.17,15.58,2.16,15.2,2.16,12s0-3.58.07-4.85a6.64,6.64,0,0,1,.41-2.23,3.48,3.48,0,0,1,.85-1.3,3.48,3.48,0,0,1,1.3-.85,6.64,6.64,0,0,1,2.23-.41C8.42,2.17,8.8,2.16,12,2.16M12,0C8.74,0,8.33,0,7.05.07A8.8,8.8,0,0,0,4.14.63,5.63,5.63,0,0,0,2,2,5.63,5.63,0,0,0,.63,4.14,8.8,8.8,0,0,0,.07,7.05C0,8.33,0,8.74,0,12s0,3.67.07,4.95a8.8,8.8,0,0,0,.56,2.91A5.63,5.63,0,0,0,2,22a5.63,5.63,0,0,0,2.14,1.37,8.8,8.8,0,0,0,2.91.56C8.33,24,8.74,24,12,24s3.67,0,4.95-.07a8.8,8.8,0,0,0,2.91-.56A5.89,5.89,0,0,0,23.37,20a8.8,8.8,0,0,0,.56-2.91C24,15.67,24,15.26,24,12s0-3.67-.07-4.95a8.8,8.8,0,0,0-.56-2.91A5.63,5.63,0,0,0,22,2a5.63,5.63,0,0,0-2.14-1.37A8.8,8.8,0,0,0,16.95.07C15.67,0,15.26,0,12,0Z"/>
                  <path d="M12,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z"/>
                  <circle cx="18.41" cy="5.59" r="1.44"/>
                </svg>
              </a>
              <a href="#" className="bg-green-600 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.1,3.9C17.9,1.7,15,0.5,12,0.5C5.8,0.5,0.7,5.6,0.7,11.9C0.7,14,1.3,16,2.5,17.8L0.6,24l6.3-1.7c1.7,0.9,3.6,1.4,5.5,1.4h0c6.3,0,11.4-5.1,11.4-11.4C23.3,8.9,22.2,6,20.1,3.9z M12,21.4L12,21.4c-1.7,0-3.3-0.5-4.8-1.3l-0.4-0.2l-3.5,1l1-3.4L4,17c-1-1.5-1.4-3.2-1.4-5.1c0-5.2,4.2-9.4,9.4-9.4c2.5,0,4.9,1,6.7,2.8c1.8,1.8,2.8,4.2,2.8,6.7C21.4,17.2,17.2,21.4,12,21.4z M17.1,14.3c-0.3-0.1-1.7-0.9-1.9-1c-0.3-0.1-0.5-0.1-0.7,0.1c-0.2,0.3-0.8,1-0.9,1.1c-0.2,0.2-0.3,0.2-0.6,0.1c-0.3-0.1-1.2-0.5-2.3-1.4c-0.9-0.8-1.4-1.7-1.6-2c-0.2-0.3,0-0.5,0.1-0.6s0.3-0.3,0.4-0.5c0.2-0.1,0.3-0.3,0.4-0.5c0.1-0.2,0-0.4,0-0.5C10,9,9.3,7.6,9,7c-0.1-0.4-0.4-0.4-0.5-0.4h-0.6c-0.2,0-0.5,0.2-0.8,0.5C6.8,7.4,6,8.2,6,9.6c0,1.4,1,2.8,1.1,2.9c0.1,0.2,2,3.1,4.9,4.3c0.7,0.3,1.2,0.5,1.6,0.6c0.7,0.2,1.3,0.2,1.8,0.1c0.6-0.1,1.7-0.7,1.9-1.3c0.2-0.7,0.2-1.2,0.2-1.3C17.6,14.5,17.4,14.4,17.1,14.3z"/>
                </svg>
              </a>
              <a href="#" className="bg-red-600 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.2,7.7c-0.2-1-1-1.8-2-2c-1.8-0.5-8.9-0.5-8.9-0.5s-7.2,0-8.9,0.5c-1,0.2-1.8,1-2,2C0,9.5,0,12,0,12s0,2.5,0.5,4.3c0.2,1,1,1.8,2,2c1.8,0.5,8.9,0.5,8.9,0.5s7.2,0,8.9-0.5c1-0.2,1.8-1,2-2C24,14.5,24,12,24,12S24,9.5,22.2,7.7z M9.6,15.6V8.4l6,3.6L9.6,15.6z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 bg-gray-900 p-6 rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block mb-2">Nombre:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2">Correo electrónico:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block mb-2">Mensaje:</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-lyra-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
