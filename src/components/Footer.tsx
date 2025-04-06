
const Footer = () => {
  return (
    <footer className="bg-lyra-dark py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center">
              <img src="/imagenes/logo.png" alt="logotipo" />
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
