import './Footer.css';

export function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-lg-3 mb-4 mb-lg-0">
            <h3>Várzea League</h3>
            <p>Transformando a várzea em experiências inesquecíveis.</p>
            <p className="location">
              <i className="bi bi-geo-alt"></i>
              Curitiba, PR
            </p>
          </div>
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h4>Contato</h4>
            <ul className="contact-list">
              <li>
                <a href="mailto:contato@varzealeague.com" className="contact-link">
                  <i className="bi bi-envelope"></i>
                  contato@varzealeague.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/5541999999999" target="_blank" rel="noopener noreferrer" className="contact-link">
                  <i className="bi bi-whatsapp"></i>
                  (41) 99999-9999
                </a>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 social-section">
            <h4>Redes Sociais</h4>
            <div className="social-links">
              <a href="https://instagram.com/varzealeague" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://wa.me/5541999999999" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="bi bi-whatsapp"></i>
              </a>
              <a href="mailto:contato@varzealeague.com" className="social-link">
                <i className="bi bi-envelope"></i>
              </a>
            </div>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="row">
          <div className="col-12 text-center">
            <p className="copyright">
              © {new Date().getFullYear()} Várzea League. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 