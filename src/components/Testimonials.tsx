
const testimonials = [
  {
    id: 1,
    name: 'Aylin',
    image: '/lovable-uploads/e37cfa43-c922-47c2-b878-23bd7183d969.png',
    comment: 'Su rapidez de convertir mis textos a voz es muy rápido.',
    rating: 5
  },
  {
    id: 2,
    name: 'Aida',
    image: '/lovable-uploads/a819b32a-291a-406c-9514-0cb19bc066d8.png',
    comment: 'Recomiendo a LYRA 100%.',
    rating: 5
  },
  {
    id: 3,
    name: 'Natalia',
    image: '/lovable-uploads/a77a6de6-ef72-4cce-b9e8-1f66e79fa930.png',
    comment: 'Excelente servicio, muy fácil de usar.',
    rating: 5
  },
  {
    id: 4,
    name: 'Vanessa',
    image: '/lovable-uploads/b9c64167-26b6-4ae5-adc9-4f95cf90f265.png',
    comment: 'Muy intuitivo y fácil de navegar.',
    rating: 5
  }
];

const Testimonials = () => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    return stars;
  };

  return (
    <div className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">RESEÑAS DE CLIENTES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 mb-4 overflow-hidden avatar-circle">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-lyra-primary mb-2">{testimonial.name}</h3>
                <p className="text-gray-300 text-center mb-3">{testimonial.comment}</p>
                <div className="flex">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
