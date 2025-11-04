import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, ROUTE_LABELS } from '../Routes';
import '../styles/BreadCrumbs.css';

interface Crumb {
  label: string;
  path?: string;
}

interface Props {
  crumbs: Crumb[];
}

const Breadcrumbs: FC<Props> = ({ crumbs }) => {
  return (
    <ul className="breadcrumbs">
      <li>
        <Link to={ROUTES.HOME}>{ROUTE_LABELS.HOME}</Link>
      </li>
      {crumbs.map((crumb, index) => (
        <li key={index}>
          / {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : crumb.label}
        </li>
      ))}
    </ul>
  );
};

export default Breadcrumbs;