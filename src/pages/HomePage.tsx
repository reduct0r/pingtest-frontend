import type { FC } from 'react';
import { useMemo } from 'react';
import '../styles/styles.css';
import { useAppInfo } from '../context/AppInfoContext';

const HomePage: FC = () => {
  const base = import.meta.env.BASE_URL;
  const { appName } = useAppInfo();
  const images = [
    `${base}line/balancer_line.png`,
    `${base}line/cache_line.png`,
    `${base}line/server_line.png`,
    `${base}line/server_settings.png`,
    `${base}line/speed_front.png`,
  ];

  const shuffledImages = useMemo(() => {
    return [...images].sort(() => Math.random() - 0.5);
  }, []);

  const repeated = Array(4).fill(shuffledImages).flat();

  return (
    <div className="page-wrapper">
      <div className="main-plate">
        <div className="home-content">
          <div className="left-column">
            <div className="section">
              <h2 className="section-title">О компании</h2>
              <p className="section-text">
                {appName} — сервис расчета времени отклика серверных компонентов. Конструктор заявок собран на Redux Toolkit, axios и кодогенерации Swagger, поэтому
                фронтенд и бэкенд синхронизированы по единому контракту.
              </p>
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
            <img src={`${base}hero_image.png`} alt="PINGTEST Optimization" className="hero-image" />
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
    </div>
  );
};

export default HomePage;