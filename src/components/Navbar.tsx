import type { FC } from 'react';
import { Link } from 'react-router-dom';
import '../styles/styles.css';

const Navbar: FC = () => (
  <div className="header-main">
    <Link to="/" className="logo-group">
      <img 
        src="/icon.png" 
        alt="icon" 
        onError={(e) => { e.currentTarget.src = '/icon.png'; }}
      />
      <span className="logo-title">PINGTEST</span>
    </Link>
    <nav style={{ display: 'inline-flex', gap: '20px', marginLeft: '20px' }}>  {}
      <Link to="/" style={{ color: '#ffffff', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#1CBFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}>
        Главная
      </Link>
      <Link to="/components" style={{ color: '#ffffff', textDecoration: 'none', transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#1CBFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}>
        Компоненты
      </Link>
    </nav>
  </div>
);

export default Navbar;