import './Testimonials.css';

export function Testimonials() {
  const testimonials = [
    {
      name: 'João Silva',
      role: 'Organizador de Campeonato',
      photo: '/testimonial1.jpg',
      text: 'A Várzea League revolucionou a forma como organizo os jogos. Agora é tudo mais fácil e profissional.'
    },
    {
      name: 'Pedro Santos',
      role: 'Capitão de Time',
      photo: '/testimonial2.jpg',
      text: 'Excelente plataforma! Consigo gerenciar meu time e acompanhar as estatísticas de forma simples.'
    },
    {
      name: 'Carlos Oliveira',
      role: 'Jogador',
      photo: '/testimonial3.jpg',
      text: 'Muito prático para confirmar presença nos jogos e ver as estatísticas do time.'
    }
  ];

  return (
    <section className="testimonials-section" id="depoimentos">
      <div className="container">
        <h2 className="section-title text-center">
          O que dizem nossos usuários
        </h2>
        <p className="section-subtitle text-center mb-5">
          Veja como a Várzea League está ajudando organizadores e jogadores
        </p>

        <div className="row g-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="col-md-4">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">"{testimonial.text}"</p>
                </div>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.photo} 
                    alt={testimonial.name} 
                    className="testimonial-photo"
                  />
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-role">{testimonial.role}</p>
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