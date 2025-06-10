import './Testimonials.css';

interface TestimonialsProps {
  id?: string;
}

export function Testimonials({ id }: TestimonialsProps) {
  const testimonials = [
    {
      id: 1,
      name: 'João Silva',
      role: 'Organizador de Campeonato',
      photo: '/testimonial1.jpg',
      text: 'A Várzea League revolucionou a forma como organizo os jogos. Agora é tudo mais fácil e profissional.',
      rating: 5
    },
    {
      name: 'Pedro Santos',
      role: 'Capitão de Time',
      photo: '/testimonial2.jpg',
      text: 'Excelente plataforma! Consigo gerenciar meu time e acompanhar as estatísticas de forma simples.',
      rating: 4
    },
    {
      name: 'Carlos Oliveira',
      role: 'Organizador de Partidas',
      text: 'Economizo muito tempo organizando partidas com a VarzeaLeague. A interface é intuitiva e os jogadores adoram a experiência!',
      photo: 'https://placehold.co/100x100/6A55C5/ffffff?text=CO',
      rating: 4
    },
    {
      id: 3,
      name: 'Ana Pereira',
      role: 'Capitã de Time',
      text: 'Gerenciar meu time se tornou muito mais fácil. Consigo organizar as escalações e comunicar-me com todos os jogadores por aqui.',
      photo: 'https://placehold.co/100x100/6A55C5/ffffff?text=AP',
      rating: 5
    },
  ];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://placehold.co/100x100/6A55C5/ffffff?text=User';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : 'empty'}`}>
        {index < rating ? '★' : '☆'}
      </span>
    ));
  };

  return (
    <section className="testimonials-section" id={id || "depoimentos"}>
      <div className="container">
        <h2 className="section-title text-center">
          O que dizem nossos usuários
        </h2>
        <p className="section-subtitle text-center mb-5">
          Veja como a Várzea League está ajudando organizadores e jogadores
        </p>

        <div className="row g-4 justify-content-center">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4 d-flex align-items-stretch">
              <div className="testimonial-card w-100">
                <div className="testimonial-content">
                  <p className="testimonial-text">{testimonial.text}</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.photo} 
                    alt={testimonial.name} 
                    className="testimonial-photo"
                    onError={handleImageError}
                  />
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-role">{testimonial.role}</p>
                    <div className="testimonial-rating">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 