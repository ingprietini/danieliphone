
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="bg-lyra-dark py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/" className="text-white">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/a76511af-df1a-4ac4-81ea-4eb0f69957a3.png" 
              alt="LYRA logo" 
              className="h-8 w-8"
            />
            <span className="ml-2 font-bold text-xl">LYRA</span>
          </div>
        </Link>
        <div className="flex space-x-6">
          <Link to="/" className="text-white hover:text-lyra-primary">INICIO</Link>
          <Link to="/servicios" className="text-white hover:text-lyra-primary">SERVICIOS</Link>
          <Link to="/almacenamiento" className="text-white hover:text-lyra-primary">ALMACENAMIENTO</Link>
          <Link to="/resenas" className="text-white hover:text-lyra-primary">RESEÑAS</Link>
          <Link to="/quienes-somos" className="text-white hover:text-lyra-primary">QUIÉNES SOMOS</Link>
          <Link to="/contactanos" className="text-white hover:text-lyra-primary">CONTÁCTANOS</Link>
          <Link to="/convertir" className="text-white hover:text-lyra-primary">CONVERTIR</Link>
        </div>
        <div>
          {isLoggedIn ? (
            <div className="relative group">
              <button className="flex items-center text-white">
                <UserCircle className="h-6 w-6 text-lyra-primary" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <p className="px-4 py-2 text-sm text-gray-700 border-b">{user?.name}</p>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login">
              <UserCircle className="h-6 w-6 text-lyra-primary" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
