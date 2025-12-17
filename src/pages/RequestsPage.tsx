import type { FC, ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRequests, setFilters, moderateRequest } from '../slices/requestsSlice';
import Loader from '../components/Loader';
import { ROUTES } from '../Routes';

const statusLabels: Record<string, string> = {
  DRAFT: 'Черновик',
  FORMED: 'Сформирована',
  COMPLETED: 'Завершена',
  REJECTED: 'Отклонена',
  ARCHIVED: 'Архив',
  DELETED: 'Удалена',
};

const RequestsPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { requests, loadingList, filters, error, mutationLoading } = useAppSelector((state) => state.requests);
  const isDateRangeValid =
    !filters.startDate || !filters.endDate || filters.startDate <= filters.endDate;
  const isModerator = Boolean(user?.isModerator);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Устанавливаем сегодняшние даты при первом заходе на страницу, если они не установлены
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!filters.startDate || !filters.endDate) {
      dispatch(setFilters({ startDate: today, endDate: today }));
    }
  }, []); // Только при монтировании компонента

  // Short polling только для модераторов
  useEffect(() => {
    if (user && isDateRangeValid) {
      // Первый запрос сразу
      dispatch(fetchRequests());
      
      // Short polling только для модераторов (каждые 3 секунды)
      if (isModerator) {
        pollingIntervalRef.current = setInterval(() => {
          dispatch(fetchRequests());
        }, 3000);

        return () => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        };
      }
    }
  }, [dispatch, user, isModerator, filters.status, filters.startDate, filters.endDate, filters.creatorFilter, isDateRangeValid]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ status: event.target.value as typeof filters.status }));
  };

  const handleDateChange =
    (field: 'startDate' | 'endDate') => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value || null;
      dispatch(setFilters({ [field]: value }));
    };

  const handleResetDates = () => {
    dispatch(setFilters({ startDate: null, endDate: null }));
  };

  const handleCreatorFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ creatorFilter: event.target.value || null }));
  };

  const handleModerate = async (requestId: number, action: 'COMPLETE' | 'REJECT') => {
    await dispatch(moderateRequest({ requestId, action }));
  };

  if (!user) {
    return (
      <section className="empty-state">
        <p>Для просмотра заявок необходимо авторизоваться.</p>
        <Link to={ROUTES.LOGIN} className="primary-button">
          Перейти ко входу
        </Link>
      </section>
    );
  }

  return (
    <section className="requests-page">
      <div className="requests-header">
        <div>
          <h1>{isModerator ? 'Все заявки' : 'Мои заявки'}</h1>
          <p>
            {isModerator 
              ? 'Просматривайте и модерируйте все заявки в системе.' 
              : 'Добавляйте серверные компоненты в заявку и отслеживайте статусы обработки.'}
          </p>
          {isModerator && (
            <p style={{ color: '#1cbfff', fontSize: '14px', marginTop: '8px' }}>
              Режим модератора активен
            </p>
          )}
        </div>
        <div className="filter-bar">
          <label>
            Дата от
            <input
              type="date"
              value={filters.startDate ?? ''}
              onChange={handleDateChange('startDate')}
              max={filters.endDate ?? undefined}
            />
          </label>
          <label>
            Дата до
            <input
              type="date"
              value={filters.endDate ?? ''}
              onChange={handleDateChange('endDate')}
              min={filters.startDate ?? undefined}
            />
          </label>
          {(filters.startDate || filters.endDate) && (
            <button type="button" className="ghost-button" onClick={handleResetDates}>
              Сбросить
            </button>
          )}
          <label>
            Статус
            <select value={filters.status} onChange={handleStatusChange}>
              <option value="ALL">Все</option>
              <option value="FORMED">Сформирована</option>
              <option value="COMPLETED">Завершена</option>
              <option value="REJECTED">Отклонена</option>
              <option value="ARCHIVED">Архив</option>
            </select>
          </label>
          {isModerator && (
            <label>
              Создатель
              <input
                type="text"
                placeholder="Фильтр по имени..."
                value={filters.creatorFilter ?? ''}
                onChange={handleCreatorFilterChange}
              />
            </label>
          )}
        </div>
        {!isDateRangeValid && (
          <p className="form-error">Дата "от" не может быть позже даты "до".</p>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {loadingList ? (
        <Loader label="Загружаем заявки..." />
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <p>Заявки не найдены. Добавьте компонент на странице услуг, чтобы собрать новую заявку.</p>
          <Link to={ROUTES.COMPONENTS} className="ghost-button">
            Перейти к услугам
          </Link>
        </div>
      ) : (
        <div className="requests-cards-container">
          {requests
            .filter((item) => item.status !== 'DRAFT' && item.status !== 'DELETED')
            .map((item) => (
              <div
                key={item.id}
                className="request-card"
                onClick={() => item.id && navigate(`${ROUTES.REQUESTS}/${item.id}`)}
              >
                <div className="request-card-id">ID: {item.id}</div>
                <div className="request-card-status">
                  <span className={`status-chip status-chip--${item.status.toLowerCase()}`}>
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </div>
                <div className="request-card-date">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
                <div className="request-card-creator">
                  Создатель: <strong>{item.creatorUsername}</strong>
                </div>
                <div className="request-card-coefficient">
                  Коэф. нагрузки: <strong>{item.loadCoefficient ?? 1}</strong>
                </div>
                  <div className="request-card-time">
                    {item.status === 'COMPLETED' && item.totalTime != null && item.totalTime > 0 ? (
                      <>
                        Время: <strong>{item.totalTime} мс</strong>
                      </>
                    ) : item.status === 'COMPLETED' ? (
                      'Время: рассчитывается...'
                    ) : (
                      'Время: —'
                    )}
                  </div>
                {isModerator && item.status === 'FORMED' && item.id != null && (
                  <div className="request-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="primary-button"
                      disabled={mutationLoading}
                      onClick={() => handleModerate(item.id!, 'COMPLETE')}
                    >
                      Завершить
                    </button>
                    <button
                      type="button"
                      className="ghost-button ghost-button--danger"
                      disabled={mutationLoading}
                      onClick={() => handleModerate(item.id!, 'REJECT')}
                    >
                      Отклонить
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

export default RequestsPage;

