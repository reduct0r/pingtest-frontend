import type { FC } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComponentsListPage from './pages/ComponentsPage';
import ComponentDetailPage from './pages/ComponentDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RequestsPage from './pages/RequestsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import ProfilePage from './pages/ProfilePage';
import ComponentsManagementPage from './pages/ComponentsManagementPage';
import ComponentEditPage from './pages/ComponentEditPage';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES } from './Routes';
import './styles/styles.css';
import AppLayout from './components/AppLayout';

const App: FC = () => {

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.COMPONENTS} element={<ComponentsListPage />} />
          <Route path={ROUTES.COMPONENT_DETAIL} element={<ComponentDetailPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          <Route path={ROUTES.REQUEST_DETAIL} element={<RequestDetailPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.COMPONENTS_MANAGEMENT} element={<ComponentsManagementPage />} />
          <Route path={ROUTES.COMPONENT_EDIT} element={<ComponentEditPage />} />
          <Route path={ROUTES.COMPONENT_CREATE} element={<ComponentEditPage />} />
          <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;