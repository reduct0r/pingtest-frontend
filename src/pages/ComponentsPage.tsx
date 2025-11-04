import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Breadcrumbs from '../components/Breadcrumbs';
import CardComponent from '../components/CardComponent';
import { getComponents } from '../modules/api';
import { ROUTE_LABELS } from '../Routes';
import '../styles/styles.css';
import type { Component } from '../modules/mock';

const ComponentsListPage: FC = () => {
  const [filter, setFilter] = useState('');
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getComponents(filter).then((data) => {
      setComponents(data);
      setLoading(false);
    });
  }, [filter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Фильтр в useEffect
  };

  return (
    <div className="page-wrapper">
      <div className="header-main"> {/* Navbar в App */} </div>
      <div className="main-plate">
        <Breadcrumbs crumbs={[{ label: ROUTE_LABELS.COMPONENTS }]} />
        <div className="welcome-title">Компоненты</div>
        <div className="search-holder">
          <Form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Поиск серверных компонентов"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button type="submit" className="search-button">
              <img src="/images/placeholder_29x29.png" alt="search" />
            </Button>
          </Form>
        </div>
        <div className="container-plate">
          <Row className="main-cards-container">
            {loading ? <p>Загрузка...</p> : components.map((comp) => (
              <Col key={comp.id}>
                <CardComponent component={comp} />
              </Col>
            ))}
          </Row>
        </div>
      </div>
      <div className="footer">Reduct0r 2025</div>
    </div>
  );
};

export default ComponentsListPage;