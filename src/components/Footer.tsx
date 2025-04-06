
const Footer = () => {
  return (
    <footer className="bg-lyra-dark py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-lyra-purple" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.5,2,2,6.5,2,12c0,3.8,2.1,7.2,5.3,8.8c0.8-1.1,2.1-1.8,3.6-1.8c0.7,0,1.4,0.2,2,0.5c0.6-0.3,1.2-0.5,1.9-0.5c1.4,0,2.8,0.7,3.6,1.8c3.2-1.6,5.3-4.9,5.3-8.8C22,6.5,17.5,2,12,2z M12,15.5c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S13.9,15.5,12,15.5z"/>
              </svg>
              <span className="ml-2 font-bold text-xl">LYRA</span>
            </div>
            <p className="mt-4 text-gray-400 max-w-xs">
              Convierte tus textos a voz de forma fácil, rápida y segura con nuestra plataforma.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Navegación</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-lyra-primary">Inicio</a></li>
                <li><a href="/servicios" className="text-gray-400 hover:text-lyra-primary">Servicios</a></li>
                <li><a href="/almacenamiento" className="text-gray-400 hover:text-lyra-primary">Planes</a></li>
                <li><a href="/resenas" className="text-gray-400 hover:text-lyra-primary">Reseñas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li><a href="/contactanos" className="text-gray-400 hover:text-lyra-primary">Formulario</a></li>
                <li><a href="#" className="text-gray-400 hover:text-lyra-primary">soporte@lyra.com</a></li>
                <li><a href="#" className="text-gray-400 hover:text-lyra-primary">+52 123 456 7890</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-lyra-primary">Términos de uso</a></li>
                <li><a href="#" className="text-gray-400 hover:text-lyra-primary">Política de privacidad</a></li>
                <li><a href="#" className="text-gray-400 hover:text-lyra-primary">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left">
          <p className="text-gray-500">
            © {new Date().getFullYear()} LYRA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
