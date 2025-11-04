import type { FC } from 'react';
import { Link } from 'react-router-dom';
import '../styles/styles.css';
import type { Component } from '../modules/mock';

interface Props {
  component: Component;
}

const CardComponent: FC<Props> = ({ component }) => {
  return (
    <div className="card-container">
      <Link to={`/components/${component.id}`} className="card-link">
        <div className="card-content-container">
          <img
            src={component.imageUrl || '/images/placeholder_142x142.png'}
            alt="placeholder"
            className="card-content-container-img"
            onError={(e) => { e.currentTarget.src = '/images/placeholder_142x142.png'; }}
          />
          <p className="card-title">{component.title}</p>
          <p className="description">{component.description}</p>
          <div className="time">
            <img src="/images/placeholder_23x23.png" alt="ping icon" onError={(e) => { e.currentTarget.src = '/images/placeholder_23x23.png'; }} />  {}
            <span>{component.time} мс</span>
            {/* <AddButton componentId={component.id} /> */}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CardComponent;