import type { FC } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import '../styles/styles.css';

const HomePage: FC = () => {
  return (
    <div className="page-wrapper">
      <div className="main-plate">
        <Breadcrumbs crumbs={[]} />
        <div className="welcome-title">Расчет времени отклика веб-приложения</div>
        <p>Добро пожаловать в PINGTEST! Здесь вы можете рассчитать время отклика на основе серверных компонентов.</p>
      </div>
      <div className="footer">Reduct0r 2025</div>
    </div>
  );
};

export default HomePage;