
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar si el usuario ya existe
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some((user: any) => user.email === formData.email);
    
    if (userExists) {
      toast({
        title: "Error",
        description: "Este correo electrónico ya está registrado.",
        variant: "destructive",
      });
      return;
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      plan: null,
      createdAt: new Date().toISOString()
    };
    
    // Guardar en localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // También iniciar sesión automáticamente
    localStorage.setItem('user', JSON.stringify(newUser));
    
    toast({
      title: "Registro exitoso",
      description: "Bienvenido a LYRA. Tu cuenta ha sido creada exitosamente.",
    });
    
    // Redirigir a inicio
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Crear Cuenta</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 text-center">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
            />
          </div>
          
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
          
          <div className="mb-4">
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
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-center">Confirmar Contraseña:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-lyra-primary"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-lyra-primary hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded mb-4"
          >
            Registrarse
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="text-lyra-primary hover:text-opacity-80">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
