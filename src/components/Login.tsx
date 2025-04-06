
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buscar usuario en localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === formData.email && u.password === formData.password);
    
    if (user) {
      // Guardar sesión de usuario
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo a LYRA.",
      });
      
      // Redirigir a inicio
      navigate('/');
    } else {
      toast({
        title: "Error de inicio de sesión",
        description: "Email o contraseña incorrectos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-center">Correo Electrónico:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-center">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-lyra-primary hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded mb-4"
          >
            Ingresar
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p>¿No tienes una cuenta? <Link to="/register" className="text-lyra-primary hover:text-opacity-80">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
