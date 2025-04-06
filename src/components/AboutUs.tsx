
const AboutUs = () => {
  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">QUIÉNES SOMOS</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="w-full md:w-1/3">
            <div className="flex justify-center">
              <svg className="h-48 w-48 text-lyra-purple" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.5,2,2,6.5,2,12c0,3.8,2.1,7.2,5.3,8.8c0.8-1.1,2.1-1.8,3.6-1.8c0.7,0,1.4,0.2,2,0.5c0.6-0.3,1.2-0.5,1.9-0.5c1.4,0,2.8,0.7,3.6,1.8c3.2-1.6,5.3-4.9,5.3-8.8C22,6.5,17.5,2,12,2z M12,15.5c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S13.9,15.5,12,15.5z"/>
              </svg>
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
