import type { FC } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import AppHeader from './AppHeader';
import { useAppInfo } from '../context/AppInfoContext';
import { ROUTES } from '../Routes';
import { useAppSelector } from '../hooks/redux';

const breadcrumbMap: Record<string, string> = {
  '': 'Главная',
  components: 'Компоненты',
  requests: 'Мои заявки', // Будет переопределено для модератора
  profile: 'Личный кабинет',
  login: 'Вход',
  register: 'Регистрация',
  'components-management': 'Управление серверными компонентами',
};

const getStoredComponentTitle = (id: string) => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(`componentTitle:${id}`);
};

const AppLayout: FC = () => {
  const { companyMotto } = useAppInfo();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  const buildBreadcrumbs = () => {
    const cleaned = location.pathname.replace(/^\/+/, '');
    if (!cleaned) {
      return [];
    }
    const parts = cleaned.split('/');
    const state = (location.state as { breadcrumb?: string } | undefined) ?? {};

    return parts.map((part, index) => {
      const path = `/${parts.slice(0, index + 1).join('/')}`;
      const prev = parts[index - 1];
      const isLast = index === parts.length - 1;
      let label = breadcrumbMap[part] ?? decodeURIComponent(part);
      
      // Для модератора меняем "Мои заявки" на "Все заявки"
      if (part === 'requests') {
        label = Boolean(user?.isModerator) ? 'Все заявки' : 'Мои заявки';
      }

      if (/^\d+$/.test(part)) {
        if (prev === 'requests') {
          label = `Заявка ${part}`;
        } else if (prev === 'components') {
          if (isLast && state.breadcrumb) {
            label = state.breadcrumb;
          } else {
            label = getStoredComponentTitle(part) ?? `Компонент ${part}`;
          }
        } else if (prev === 'components-management') {
          if (part === 'new') {
            label = 'Создание серверного компонента';
          } else {
            label = `Редактирование серверного компонента ${part}`;
          }
        }
      }

      return { label, path, isLast };
    });
  };

  const crumbs = buildBreadcrumbs();

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <div className="breadcrumbs-wrapper">
          <Link to={ROUTES.HOME}>Главная</Link>
          {crumbs.map((crumb) => (
            <span key={crumb.path}>
              {' '}
              /{' '}
              {crumb.isLast ? (
                <span>{crumb.label}</span>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </div>
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

