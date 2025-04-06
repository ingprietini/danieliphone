
import Navbar from '../components/Navbar';
import AboutUs from '../components/AboutUs';
import Footer from '../components/Footer';

const QuienesSomosPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-lyra-dark py-12">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Quiénes Somos</h1>
            <p className="text-xl text-gray-300">
              Conoce más sobre LYRA y nuestra misión
            </p>
          </div>
        </div>
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
};

export default QuienesSomosPage;
