
const AboutUs = () => {
  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">QUIÉNES SOMOS</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="w-full md:w-1/3">
            <div className="flex justify-center">
            <img src="/imagenes/logo.png" style="with:50%;" alt="logotipo" />
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <p className="text-gray-300 text-lg leading-relaxed">
              En LYRA, nos enfocamos convertir tus textos y archivos en voz, de forma confiable y segura. 
              Con más de 10 años de experiencia en la protección de datos, nuestra misión es brindarte 
              la tranquilidad de que tus archivos al momento de hacer la conversión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
