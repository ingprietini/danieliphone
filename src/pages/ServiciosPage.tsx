
import Navbar from '../components/Navbar';
import Services from '../components/Services';
import Footer from '../components/Footer';

const ServiciosPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-lyra-dark py-12">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Nuestros Servicios</h1>
            <p className="text-xl text-gray-300">
              Ofrecemos una variedad de servicios de conversión de texto a voz
            </p>
          </div>
        </div>
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default ServiciosPage;
