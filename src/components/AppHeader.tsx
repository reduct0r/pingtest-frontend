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
  const { cartInfo, loadingCart } = useAppSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchCartIcon());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.HOME);
  };

  const handleCartClick = () => {
    if (cartInfo?.draftId && cartInfo.draftId > 0) {
      navigate(`${ROUTES.REQUESTS}/${cartInfo.draftId}`);
    }
  };

  const hasDraft = Boolean(cartInfo?.draftId && cartInfo.draftId > 0);

  return (
    <header className="app-header">
      <Link to={ROUTES.HOME} className="logo-group">
        <img src={`${base}icon.png`} alt="PINGTEST" onError={(e) => (e.currentTarget.src = `${base}icon.png`)} />
        <span className="logo-title">PINGTEST</span>
      </Link>
      <nav className="main-nav">
        <NavLink to={ROUTES.COMPONENTS}>Компоненты</NavLink>
        {user && <NavLink to={ROUTES.REQUESTS}>Мои заявки</NavLink>}
        {user && <NavLink to={ROUTES.PROFILE}>Личный кабинет</NavLink>}
      </nav>
      <div className="header-actions">
        {user ? <span className="username-chip">{user.username}</span> : null}
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
        <button
          className={`cart-button ${hasDraft ? 'cart-button--active' : 'cart-button--disabled'}`}
          type="button"
          disabled={!hasDraft}
          onClick={handleCartClick}
          title={hasDraft ? 'Открыть черновик заявки' : 'Черновой заявки пока нет'}
        >
          <img src={`${base}cart.png`} alt="Заявка" />
          {loadingCart ? <span className="loader-dot" /> : hasDraft && <span className="badge">{cartInfo?.itemCount ?? 0}</span>}
        </button>
      </div>
    </header>
  );
};

export default AppHeader;

