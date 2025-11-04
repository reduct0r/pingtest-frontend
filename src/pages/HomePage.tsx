import type { FC } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTES } from '../Routes';
import '../styles/styles.css';

const HomePage: FC = () => {
  return (
    <div className="page-wrapper">
      <Breadcrumbs crumbs={[]} />
      <div className="main-plate" style={{ display: 'flex', flexDirection: 'row', gap: '40px', padding: '40px', backgroundColor: '#05061F', borderRadius: '20px', margin: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#1A1B2E', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#ffffff', fontSize: '28px', marginBottom: '10px' }}>О компании</h2>
            <p style={{ color: '#9193A8', fontSize: '16px', lineHeight: '1.5' }}>PINGTEST — ведущая компания в области анализа и оптимизации производительности веб-приложений. Мы помогаем бизнесу снижать время отклика и повышать пользовательский опыт.</p>
          </div>
          <div style={{ backgroundColor: '#1A1B2E', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#ffffff', fontSize: '28px', marginBottom: '10px' }}>Наши услуги</h2>
            <ul style={{ color: '#9193A8', fontSize: '16px', listStyleType: 'disc', paddingLeft: '20px' }}>
              <li>Расчет пинга серверных компонентов</li>
              <li>Анализ баз данных и кэша</li>
              <li>Рекомендации по оптимизации</li>
            </ul>
            <Link 
              to={ROUTES.COMPONENTS}  // Путь к странице услуг (компонентов)
              style={{ 
                display: 'inline-block', 
                backgroundColor: '#1A1B2E', 
                color: '#ffffff', 
                border: '2px solid #1CBFFF', 
                padding: '10px 30px', 
                borderRadius: '30px', 
                cursor: 'pointer', 
                transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease', 
                fontFamily: 'Roboto Mono, monospace', 
                fontSize: '18px', 
                fontWeight: 'bold', 
                textDecoration: 'none', 
                marginTop: '20px' 
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#17172e';
                e.currentTarget.style.borderColor = '#881af0';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1B2E';
                e.currentTarget.style.borderColor = '#1CBFFF';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Просмотреть услуги
            </Link>
          </div>
        </div>
      </div>
      <div className="footer">Reduct0r 2025</div>
    </div>
  );
};

export default HomePage;