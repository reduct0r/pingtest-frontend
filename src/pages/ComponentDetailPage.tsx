import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { getComponentById } from '../modules/api';
import { ROUTES, ROUTE_LABELS } from '../Routes';
import '../styles/details-styles.css';
import type { Component } from '../modules/mock';

const ComponentDetailPage: FC = () => {
  const base = import.meta.env.BASE_URL;
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getComponentById(parseInt(id)).then((data) => {
        setComponent(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (!component) return <p>Компонент не найден</p>;

  return (
    <div className="page-wrapper">
      <Breadcrumbs crumbs={[{ label: ROUTE_LABELS.COMPONENTS, path: ROUTES.COMPONENTS }, { label: component.title }]} />
      <div className="info-board">
        <div className="text-block">
          <p className="title">{component.title}</p>
          <p className="short-description">{component.description}</p>
          <p className="description-text">{component.longDescription}</p>
        </div>
        <div className="image-holder">
          <img src={component.imageUrl || `${base}placeholder_142x142.png`} alt="icon" />
          <div className="time-holder">
            <div className="time-component">
              <img src={`${base}ping_icon.svg`} alt="ping icon" />
              <span>{component.time} мс</span>
            </div>
          </div>
        </div>
      </div>
      {/* Checkbox группа, но не для гостя */}
      <div className="add-to-cart">
        {/* Form с checkbox, но mock */}
      </div>
      <div className="footer">Reduct0r 2025</div>
    </div>
  );
};

export default ComponentDetailPage;