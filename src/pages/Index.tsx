
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Plans from '../components/Plans';
import Testimonials from '../components/Testimonials';
import AboutUs from '../components/AboutUs';
import Footer from '../components/Footer';

const Index = () => {
  React.useEffect(() => {
    // Asegurarse de que el fondo está correctamente configurado
    document.body.style.backgroundColor = "#000000";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    
    // Log para depuración
    console.log("Index page mounted");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Services />
        <Plans />
        <Testimonials />
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
