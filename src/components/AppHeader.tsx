import type { FC } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { ROUTES } from '../Routes';
import { logoutUser } from '../slices/authSlice';
import { fetchCartIcon } from '../slices/requestsSlice';
import { useEffect } from 'react';

const AppHeader: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const base = import.meta.env.BASE_URL;
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCartIcon());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.HOME);
  };

  return (
    <header className="app-header">
      <Link to={ROUTES.HOME} className="logo-group">
        <img src={`${base}icon.png`} alt="PINGTEST" onError={(e) => (e.currentTarget.src = `${base}icon.png`)} />
        <span className="logo-title">PINGTEST</span>
      </Link>
      <nav className="main-nav">
        <NavLink to={ROUTES.COMPONENTS}>Компоненты</NavLink>
        {user && <NavLink to={ROUTES.REQUESTS}>{user.isModerator ? 'Все заявки' : 'Мои заявки'}</NavLink>}
        {user && <NavLink to={ROUTES.PROFILE}>Личный кабинет</NavLink>}
      </nav>
      <div className="header-actions">
        {user && (
          <span className="username-chip">
            {user.username}
            {user.isModerator && <span style={{ marginLeft: '8px', color: '#1cbfff', fontSize: '12px' }}>(Модератор)</span>}
          </span>
        )}
        {!user && (
          <>
            <Link to={ROUTES.LOGIN} className="ghost-button">
              Войти
            </Link>
            <Link to={ROUTES.REGISTER} className="ghost-button ghost-button--secondary">
              Регистрация
            </Link>
          </>
        )}
        {user && (
          <button className="ghost-button" type="button" disabled={authLoading} onClick={handleLogout}>
            Выйти
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

