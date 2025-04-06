
import Navbar from '../components/Navbar';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const ContactanosPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-lyra-dark py-12">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Contáctanos</h1>
            <p className="text-xl text-gray-300">
              Estamos aquí para responder tus preguntas
            </p>
          </div>
        </div>
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactanosPage;
