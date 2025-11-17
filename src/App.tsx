import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComponentsListPage from './pages/ComponentsPage';
import ComponentDetailPage from './pages/ComponentDetailPage';
import { ROUTES, ROUTE_LABELS } from './Routes';
import './styles/styles.css';

const App: FC = () => {
  return (
    <BrowserRouter>
      <div className="header-main" style={{ display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <Link to={ROUTES.HOME} className="logo-group" style={{ paddingTop: 0, paddingLeft: 0 }}>
          <img src="/icon.png" alt="icon" onError={(e) => { e.currentTarget.src = '/icon.png'; }} />
          <span className="logo-title">PINGTEST</span>
        </Link>
        <Link to={ROUTES.COMPONENTS} style={{ color: '#ffffff', textDecoration: 'none', transition: 'color 0.3s ease', marginLeft: '20px' }} onMouseOver={(e) => e.currentTarget.style.color = '#1CBFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#ffffff'}>
          {ROUTE_LABELS.COMPONENTS}
        </Link>
      </div>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.COMPONENTS} element={<ComponentsListPage />} />
        <Route path={ROUTES.COMPONENT_DETAIL} element={<ComponentDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;