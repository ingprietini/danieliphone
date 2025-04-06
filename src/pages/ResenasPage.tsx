
import Navbar from '../components/Navbar';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const ResenasPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-lyra-dark py-12">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Reseñas de Nuestros Clientes</h1>
            <p className="text-xl text-gray-300">
              Conoce lo que opinan nuestros usuarios sobre LYRA
            </p>
          </div>
        </div>
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default ResenasPage;
