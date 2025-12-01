import type { FC, ChangeEvent } from 'react';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRequests, setFilters } from '../slices/requestsSlice';
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
  const { requests, loadingList, filters, error } = useAppSelector((state) => state.requests);

  useEffect(() => {
    if (user) {
      dispatch(fetchRequests());
    }
  }, [dispatch, user, filters.status]);

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ status: event.target.value as typeof filters.status }));
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
          <h1>Мои заявки</h1>
          <p>Добавляйте серверные компоненты в заявку и отслеживайте статусы обработки.</p>
        </div>
        <div className="filter-bar">
          <label>
            Статус
            <select value={filters.status} onChange={handleStatusChange}>
              <option value="ALL">Все</option>
              <option value="DRAFT">Черновик</option>
              <option value="FORMED">Сформирована</option>
              <option value="COMPLETED">Завершена</option>
              <option value="REJECTED">Отклонена</option>
            </select>
          </label>
        </div>
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
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Статус</th>
                <th>Создана</th>
                <th>Всего компонентов</th>
                <th>Время, мс</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <span className={`status-chip status-chip--${item.status.toLowerCase()}`}>{statusLabels[item.status] ?? item.status}</span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.items.reduce((acc, current) => acc + current.quantity, 0)}</td>
                  <td>{item.totalTime ?? 0}</td>
                  <td>
                    <button type="button" className="ghost-button" onClick={() => navigate(`${ROUTES.REQUESTS}/${item.id}`)}>
                      Открыть
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default RequestsPage;

