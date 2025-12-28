import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../Routes';
import '../styles/styles.css';

const NotFoundPage: FC = () => {
  return (
    <section className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '72px', margin: '0 0 20px', color: '#ff6b6b' }}>404</h1>
      <h2 style={{ fontSize: '32px', margin: '0 0 20px', color: '#fff' }}>Страница не найдена</h2>
      <p style={{ fontSize: '18px', margin: '0 0 40px', color: '#ccc', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
        Запрашиваемая страница не существует или была перемещена. Проверьте правильность адреса или вернитесь на главную страницу.
      </p>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to={ROUTES.HOME} className="primary-button">
          На главную
        </Link>
        <Link to={ROUTES.COMPONENTS} className="ghost-button">
          К компонентам
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;

