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
      <Link to={`/components/${component.id}`} className="card-link">
        <div className="card-content-container">
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
            <button type="button" className="primary-button primary-button--ghost" disabled={isAdding} onClick={() => onAdd?.(component.id!)}>
              {isAdding ? 'Добавляем...' : 'Добавить в заявку'}
            </button>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CardComponent;