import type { FC, ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRequests, setFilters, moderateRequest, setPage } from '../slices/requestsSlice';
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
  const { requests, loadingList, filters, error, mutationLoading, paginatedData, currentPage } = useAppSelector((state) => state.requests);
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

  // Первый запрос при изменении фильтров
  useEffect(() => {
    if (user && isDateRangeValid) {
      dispatch(fetchRequests());
    }
  }, [dispatch, user, isModerator, filters.status, filters.startDate, filters.endDate, filters.creatorFilter, isDateRangeValid, currentPage]);

  // Short polling только для модераторов (каждые 10 секунд)
  useEffect(() => {
    if (user && isModerator && isDateRangeValid) {
      pollingIntervalRef.current = setInterval(() => {
        dispatch(fetchRequests());
      }, 10000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [dispatch, user, isModerator, isDateRangeValid]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ status: event.target.value as typeof filters.status }));
    dispatch(setPage(0));
  };

  const handleDateChange =
    (field: 'startDate' | 'endDate') => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value || null;
      dispatch(setFilters({ [field]: value }));
      dispatch(setPage(0));
    };

  const handleResetDates = () => {
    dispatch(setFilters({ startDate: null, endDate: null }));
    dispatch(setPage(0));
  };

  const handleCreatorFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ creatorFilter: event.target.value || null }));
  };

  const handleModerate = async (requestId: number, action: 'COMPLETE' | 'REJECT') => {
    await dispatch(moderateRequest({ requestId, action }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  // Генерация номеров страниц для отображения
  const getPageNumbers = () => {
    if (!paginatedData) return [];
    const totalPages = paginatedData.totalPages;
    const current = paginatedData.currentPage;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);
      if (current > 2) pages.push('...');
      for (let i = Math.max(1, current - 1); i <= Math.min(totalPages - 2, current + 1); i++) {
        pages.push(i);
      }
      if (current < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
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
      {paginatedData && paginatedData.totalPages > 1 && (
        <div className="pagination-container" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ghost-button"
            disabled={!paginatedData.hasPrevious || loadingList}
            onClick={() => handlePageChange(currentPage! - 1)}
          >
            Назад
          </button>
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} style={{ color: '#fff', padding: '0 5px' }}>...</span>
            ) : (
              <button
                key={pageNum}
                type="button"
                className={pageNum === currentPage ? 'primary-button' : 'ghost-button'}
                disabled={loadingList}
                onClick={() => handlePageChange(pageNum as number)}
                style={{ minWidth: '40px' }}
              >
                {(pageNum as number) + 1}
              </button>
            )
          ))}
          <button
            type="button"
            className="ghost-button"
            disabled={!paginatedData.hasNext || loadingList}
            onClick={() => handlePageChange(currentPage! + 1)}
          >
            Вперед
          </button>
        </div>
      )}
    </section>
  );
};

export default RequestsPage;

