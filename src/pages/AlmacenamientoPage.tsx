
import Navbar from '../components/Navbar';
import Plans from '../components/Plans';
import Footer from '../components/Footer';

const AlmacenamientoPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-lyra-dark py-12">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Planes de Almacenamiento</h1>
            <p className="text-xl text-gray-300">
              Selecciona el plan que mejor se adapte a tus necesidades
            </p>
          </div>
        </div>
        <Plans />
      </main>
      <Footer />
    </div>
  );
};

export default AlmacenamientoPage;
