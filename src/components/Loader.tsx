import type { FC } from 'react';

interface Props {
  label?: string;
  inline?: boolean;
}

const Loader: FC<Props> = ({ label = 'Загрузка...', inline = false }) => {
  return (
    <div className={`loader ${inline ? 'loader--inline' : ''}`}>
      <span className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
};

export default Loader;

