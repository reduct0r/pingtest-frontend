import type { FC } from 'react';
import { useMemo } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import '../styles/styles.css';

const HomePage: FC = () => {
  const images = [
    '/line/balancer_line.png',
    '/line/cache_line.png',
    '/line/server_line.png',
    '/line/server_settings.png',
    '/line/speed_front.png',
  ];

  const shuffledImages = useMemo(() => {
    return [...images].sort(() => Math.random() - 0.5);
  }, []);

  const repeated = Array(4).fill(shuffledImages).flat();

  return (
    <div className="page-wrapper">
      <Breadcrumbs crumbs={[]} />
      <div className="main-plate">
        <div className="home-content">
          <div className="left-column">
            <div className="section">
              <h2 className="section-title">О компании</h2>
              <p className="section-text">PINGTEST — ведущая компания в области анализа и оптимизации производительности веб-приложений. Мы помогаем бизнесу снижать время отклика и повышать пользовательский опыт.</p>
            </div>
            <div className="section">
              <h2 className="section-title">Наши услуги</h2>
              <ul className="services-list">
                <li>Расчет пинга серверных компонентов</li>
                <li>Анализ баз данных и кэша</li>
                <li>Рекомендации по оптимизации</li>
              </ul>
            </div>
          </div>
          <div className="right-image">
            <img 
              src="/hero_image.png" 
              alt="PINGTEST Optimization" 
              className="hero-image"
            />
          </div>
        </div>
        <div className="ticker-container">
          <div className="ticker">
            {repeated.map((src, index) => (
              <img key={`first-${index}`} src={src} alt="" className="ticker-image" />
            ))}
            {repeated.map((src, index) => (
              <img key={`second-${index}`} src={src} alt="" className="ticker-image" />
            ))}
          </div>
        </div>
      </div>
      <div className="footer">Reduct0r 2025</div>
    </div>
  );
};

export default HomePage;