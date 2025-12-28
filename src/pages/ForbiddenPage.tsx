import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../Routes';
import '../styles/styles.css';

const ForbiddenPage: FC = () => {
  return (
    <section className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '72px', margin: '0 0 20px', color: '#ff6b6b' }}>403</h1>
      <h2 style={{ fontSize: '32px', margin: '0 0 20px', color: '#fff' }}>Доступ запрещен</h2>
      <p style={{ fontSize: '18px', margin: '0 0 40px', color: '#ccc', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
        У вас нет прав для доступа к этой странице. Пожалуйста, обратитесь к администратору, если вы считаете, что это ошибка.
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to={ROUTES.HOME} className="primary-button">
          На главную
        </Link>
        <Link to={ROUTES.LOGIN} className="ghost-button">
          Войти
        </Link>
      </div>
    </section>
  );
};

export default ForbiddenPage;

