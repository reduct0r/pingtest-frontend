import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAppInfo } from '../context/AppInfoContext';

const AppLayout: FC = () => {
  const { companyMotto } = useAppInfo();

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <span>{companyMotto}</span>
        <span>© {new Date().getFullYear()} Reduct0r</span>
      </footer>
    </div>
  );
};

export default AppLayout;

