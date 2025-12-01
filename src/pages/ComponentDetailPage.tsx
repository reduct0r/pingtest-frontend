import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTES, ROUTE_LABELS } from '../Routes';
import '../styles/details-styles.css';
import type { ComponentDto } from '../api/Api';
import { api } from '../api';
import Loader from '../components/Loader';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addComponentToDraft } from '../slices/requestsSlice';

const ComponentDetailPage: FC = () => {
  const base = import.meta.env.BASE_URL;
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<ComponentDto | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { mutationLoading } = useAppSelector((state) => state.requests);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    api.serverComponents
      .serverComponentsDetail(Number(id))
      .then(setComponent)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Подгружаем компонент..." />;
  if (!component) return <p>Компонент не найден</p>;

  return (
    <div className="page-wrapper">
      <Breadcrumbs crumbs={[{ label: ROUTE_LABELS.COMPONENTS, path: ROUTES.COMPONENTS }, { label: component.title }]} />
      <div className="info-board">
        <div className="text-block">
          <p className="title">{component.title}</p>
          <p className="short-description">{component.description}</p>
          <p className="description-text">{component.longDescription}</p>
          {user && component.id && (
            <button
              type="button"
              className="primary-button"
              disabled={mutationLoading}
              onClick={() => dispatch(addComponentToDraft(component.id ?? 0))}
            >
              {mutationLoading ? 'Добавляем...' : 'Добавить в заявку'}
            </button>
          )}
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
    </div>
  );
};

export default ComponentDetailPage;