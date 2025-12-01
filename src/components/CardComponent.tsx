import type { FC } from 'react';
import { Link } from 'react-router-dom';
import '../styles/styles.css';
import type { ComponentDto } from '../api/Api';

interface Props {
  component: ComponentDto;
  canAdd?: boolean;
  isAdding?: boolean;
  onAdd?: (componentId: number) => void;
}

const CardComponent: FC<Props> = ({ component, canAdd = false, onAdd, isAdding }) => {
  const base = import.meta.env.BASE_URL;
  return (
    <div className="card-container">
      <div className="card-content-container">
        <Link to={`/components/${component.id}`} className="card-body-link" state={{ breadcrumb: component.title }}>
          <img
            src={component.imageUrl || `${base}placeholder_142x142.png`}
            alt={component.title}
            className="card-content-container-img"
            onError={(e) => {
              e.currentTarget.src = `${base}placeholder_142x142.png`;
            }}
          />
          <p className="card-title">{component.title}</p>
          <p className="description">{component.description}</p>
        </Link>
        <div className="time-row">
          <div className="time">
            <img
              src={`${base}ping_icon.svg`}
              alt="ping icon"
              onError={(e) => {
                e.currentTarget.src = `${base}placeholder_23x23.png`;
              }}
            />
            <span>{component.time} мс</span>
          </div>
          {canAdd && component.id && (
            <button
              type="button"
              className="primary-button primary-button--ghost add-inline"
              disabled={isAdding}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onAdd?.(component.id!);
              }}
            >
              {isAdding ? '...' : 'Добавить'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardComponent;