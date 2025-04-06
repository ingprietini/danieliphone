
const testimonials = [
  {
    id: 1,
    name: 'Aylin',
    image: 'https://drive.google.com/file/d/1GMeTfObBjhONO-yIIeSldY-JHKZtzCnV/view',
    comment: 'Su rapidez de convertir mis textos a voz es muy rápido...',
    rating: 5
  },
  {
    id: 2,
    name: 'Aida',
    image: 'https://drive.google.com/file/d/1ry7JM0EjTb7vFhaHbZnba31hbfNzUZtO/view',
    comment: 'Recomiendo a LYRA 100%.',
    rating: 5
  },
  {
    id: 3,
    name: 'Natalia',
    image: 'https://drive.google.com/file/d/1uz-lR6yT0jookLcnjDxNNWPc4w2wDlOw/view',
    comment: 'Excelente servicio, muy fácil de usar.',
    rating: 5
  },
  {
    id: 4,
    name: 'Vanessa',
    image: 'https://drive.google.com/file/d/1iHNPk0ztM1K6iknRMeS5aT_oyXIzOVPY/view',
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
