import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchComponents } from '../slices/catalogSlice';
import { api } from '../api';
import type { ComponentDto } from '../api/Api';
import Loader from '../components/Loader';
import { ROUTES } from '../Routes';
import '../styles/styles.css';

const ComponentsManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { items, loading, error } = useAppSelector((state) => state.catalog);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const isModerator = Boolean(user?.isModerator);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!isModerator) {
      navigate(ROUTES.FORBIDDEN);
      return;
    }
    dispatch(fetchComponents());
  }, [dispatch, user, isModerator, navigate]);

  const handleCardClick = (component: ComponentDto) => {
    if (component.id) {
      navigate(`${ROUTES.COMPONENTS_MANAGEMENT}/${component.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, componentId: number) => {
    e.stopPropagation();
    
    if (!confirm('Вы уверены, что хотите удалить этот серверный компонент?')) {
      return;
    }

    setDeleteLoading(componentId);
    try {
      await api.serverComponents.serverComponentsDelete(componentId);
      dispatch(fetchComponents());
    } catch (error: any) {
      console.error('Ошибка при удалении компонента:', error);
      alert('Ошибка при удалении серверного компонента');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreate = () => {
    navigate(ROUTES.COMPONENT_CREATE);
  };

  if (!user || !isModerator) {
    return null;
  }

  return (
    <section className="requests-page">
      <div className="requests-header">
        <div>
          <h1>Управление серверными компонентами</h1>
          <p>Добавляйте, редактируйте и удаляйте серверные компоненты в системе.</p>
        </div>
        <button type="button" className="primary-button" onClick={handleCreate}>
          Добавить серверный компонент
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <Loader label="Загружаем серверные компоненты..." />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Серверные компоненты не найдены. Создайте первый серверный компонент.</p>
        </div>
      ) : (
        <div className="requests-cards-container">
          {items.map((component) => (
            <div
              key={component.id}
              className="request-card"
              onClick={() => handleCardClick(component)}
              style={{ display: 'flex', alignItems: 'center', gap: '24px' }}
            >
              <div className="request-card-id" style={{ minWidth: '80px', flexShrink: 0 }}>ID: {component.id}</div>
              <div style={{ minWidth: '100px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {component.imageUrl ? (
                  <img
                    src={component.imageUrl}
                    alt={component.title}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      border: '2px solid #1cbfff',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9193a8',
                      fontSize: '12px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    Нет
                  </div>
                )}
              </div>
              <div style={{ minWidth: '150px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <strong style={{ fontSize: '18px', color: '#fff', lineHeight: '1.2' }}>{component.title}</strong>
              </div>
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '20px', overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', color: '#9193a8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 auto', minWidth: 0 }}>
                  {component.description}
                </div>
                <div style={{ fontSize: '13px', color: '#1cbfff', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Время: <strong>{component.time} мс</strong>
                </div>
              </div>
              {component.id && (
                <div className="request-card-actions" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    className="ghost-button ghost-button--danger"
                    onClick={(e) => handleDelete(e, component.id!)}
                    disabled={deleteLoading === component.id}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {deleteLoading === component.id ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ComponentsManagementPage;
