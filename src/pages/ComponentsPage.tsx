import type { FC } from 'react';
import { useEffect, useState } from 'react';
import CardComponent from '../components/CardComponent';
import { ROUTES } from '../Routes';
import '../styles/styles.css';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchComponents, setSearchValue } from '../slices/catalogSlice';
import { addComponentToDraft } from '../slices/requestsSlice';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const ComponentsListPage: FC = () => {
  const base = import.meta.env.BASE_URL;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading, error, searchValue } = useAppSelector((state) => state.catalog);
  const { user } = useAppSelector((state) => state.auth);
  const { mutationLoading, cartInfo } = useAppSelector((state) => state.requests);
  const [inputValue, setInputValue] = useState(searchValue);

  useEffect(() => {
    dispatch(fetchComponents());
  }, [dispatch, searchValue]);

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(setSearchValue(inputValue));
  };

  const handleAdd = (componentId: number) => {
    if (!user) return;
    dispatch(addComponentToDraft(componentId));
  };

  return (
    <div className="page-wrapper">
      <div className="main-plate">
        <div className="welcome-title">Компоненты</div>
        <div className="search-holder">
          <form className="search-bar" onSubmit={handleSearch}>
            <input type="text" placeholder="Поиск серверных компонентов" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button type="submit" className="search-button">
              <img src={`${base}search_icon.svg`} alt="search" />
            </button>
          </form>
        </div>
        <div className="container-plate">
          {error && <p className="form-error">{error}</p>}
          {loading ? (
            <Loader />
          ) : (
          <div className="main-cards-container">
              {items.map((comp) => (
              <div key={comp.id} style={{ flex: '0 0 300px', margin: '0 auto' }}>
                  <CardComponent component={comp} canAdd={Boolean(user)} onAdd={handleAdd} isAdding={mutationLoading} />
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
      {user && (
        <button
          type="button"
          className={`request-icon ${!cartInfo?.draftId || !cartInfo?.itemCount ? 'request-icon--disabled' : ''}`}
          onClick={() => cartInfo?.draftId && cartInfo?.itemCount && navigate(`${ROUTES.REQUESTS}/${cartInfo.draftId}`)}
          disabled={!cartInfo?.draftId || !cartInfo?.itemCount}
        >
          <img src={`${base}cart.png`} alt="Корзина" onError={(e) => (e.currentTarget.src = `${base}placeholder_85x89.png`)} />
          {cartInfo?.itemCount ? <span className="request-badge">{cartInfo.itemCount}</span> : null}
        </button>
      )}
    </div>
  );
};

export default ComponentsListPage;