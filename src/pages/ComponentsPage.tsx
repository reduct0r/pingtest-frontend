import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';  // Добавлен для Link на корзину
import Breadcrumbs from '../components/Breadcrumbs';
import CardComponent from '../components/CardComponent';
import { getComponents } from '../modules/api';
import { ROUTE_LABELS } from '../Routes';
import '../styles/styles.css';
import type { Component } from '../modules/mock';

const ComponentsListPage: FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getComponents(appliedFilter).then((data) => {
      setComponents(data);
      setLoading(false);
    });
  }, [appliedFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilter(inputValue);
  };

  // Захардкоженые значения
  const draftTimePingId = 1;  // ID для ссылки
  const requestSize = 3;  //  кол-во элементов

  return (
    <div className="page-wrapper">
      <div className="main-plate">
        <Breadcrumbs crumbs={[{ label: ROUTE_LABELS.COMPONENTS }]} />
        <div className="welcome-title">Компоненты</div>
        <div className="search-holder">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Поиск серверных компонентов"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="search-button">
              <img src="/search_icon.svg" alt="search" />
            </button>
          </form>
        </div>
        <div className="container-plate">
          <div className="main-cards-container">
            {loading ? <p>Загрузка...</p> : components.map((comp) => (
              <div key={comp.id} style={{ flex: '0 0 300px', margin: '0 auto' }}>
                <CardComponent component={comp} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="footer">Reduct0r 2025</div>
      {draftTimePingId !== null && requestSize > 0 && (
        <div className="request-icon">
          <img src="/cart.png" alt="Корзина" onError={(e) => { e.currentTarget.src = '/placeholder_85x89.png'; }} />
          <span className="request-badge">{requestSize}</span>
        </div>
      )}
    </div>
  );
};

export default ComponentsListPage;