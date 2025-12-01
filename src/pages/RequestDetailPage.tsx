import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchRequestById,
  updateItemQuantity,
  deleteItemFromDraft,
  formRequest,
  deleteRequest,
  updateLoadCoefficient,
} from '../slices/requestsSlice';
import Loader from '../components/Loader';
import { ROUTES } from '../Routes';

const RequestDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const parsedId = id ? Number(id) : NaN;
  const requestId = Number.isFinite(parsedId) ? parsedId : null;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentRequest, loadingCurrent, error } = useAppSelector((state) => state.requests);
  const { user } = useAppSelector((state) => state.auth);
  const [coefficient, setCoefficient] = useState<number | ''>('');

  useEffect(() => {
    if (requestId) {
      void dispatch(fetchRequestById(requestId));
    }
  }, [dispatch, requestId]);

  useEffect(() => {
    if (currentRequest?.loadCoefficient != null) {
      setCoefficient(currentRequest.loadCoefficient);
    } else {
      setCoefficient('');
    }
  }, [currentRequest]);

  if (!user) {
    return (
      <section className="empty-state">
        <p>Авторизуйтесь, чтобы посмотреть детали заявки.</p>
        <Link to={ROUTES.LOGIN} className="primary-button">
          Войти
        </Link>
      </section>
    );
  }

  if (!requestId) {
    return (
      <section className="empty-state">
        <p>Некорректный идентификатор заявки.</p>
      </section>
    );
  }

  if (loadingCurrent) {
    return <Loader label="Подгружаем данные заявки..." />;
  }

  if (!currentRequest) {
    return (
      <section className="empty-state">
        <p>{error ?? 'Заявка не найдена или недоступна.'}</p>
        <Link to={ROUTES.REQUESTS} className="ghost-button">
          Вернуться к списку
        </Link>
      </section>
    );
  }

  const isDraft = currentRequest.status === 'DRAFT';

  const handleQuantityChange = (componentId: number, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1 || !currentRequest.id) return;
    void dispatch(updateItemQuantity({ requestId: currentRequest.id, componentId, quantity }));
  };

  const handleDeleteItem = (componentId: number) => {
    if (!currentRequest.id) return;
    void dispatch(deleteItemFromDraft({ requestId: currentRequest.id, componentId }));
  };

  const handleForm = () => {
    if (!currentRequest.id) return;
    void dispatch(formRequest(currentRequest.id));
  };

  const handleDeleteRequest = async () => {
    if (!currentRequest.id) return;
    const result = await dispatch(deleteRequest(currentRequest.id));
    if (deleteRequest.fulfilled.match(result)) {
      navigate(ROUTES.REQUESTS);
    }
  };

  const handleSaveCoefficient = () => {
    if (!currentRequest.id || coefficient === '' || !Number.isFinite(Number(coefficient))) return;
    void dispatch(updateLoadCoefficient({ requestId: currentRequest.id, loadCoefficient: Number(coefficient) }));
  };

  return (
    <section className="request-details">
      <header className="request-details__header">
        <div>
          <Link to={ROUTES.REQUESTS} className="ghost-button ghost-button--secondary">
            ← Назад к списку
          </Link>
          <h1>Заявка #{currentRequest.id}</h1>
          <p>Статус: {currentRequest.status}</p>
        </div>
        <div className="request-actions">
          {isDraft && (
            <>
              <button type="button" className="ghost-button" onClick={handleForm}>
                Подтвердить
              </button>
              <button type="button" className="ghost-button ghost-button--danger" onClick={handleDeleteRequest}>
                Очистить черновик
              </button>
            </>
          )}
        </div>
      </header>

      <div className="request-panel">
        <div>
          <label>
            Коэффициент нагрузки
            <input
              type="number"
              value={coefficient}
              onChange={(event) => setCoefficient(event.target.value === '' ? '' : Number(event.target.value))}
              disabled={!isDraft}
              min={1}
            />
          </label>
          {isDraft && (
            <button type="button" className="ghost-button" onClick={handleSaveCoefficient}>
              Сохранить коэффициент
            </button>
          )}
        </div>
        <div>
          <strong>Всего компонентов: </strong>
          {currentRequest.items.reduce((acc, item) => acc + item.quantity, 0)}
        </div>
        <div>
          <strong>Итоговое время: </strong>
          {currentRequest.totalTime ?? 0} мс
        </div>
      </div>

      <div className="cards-wrapper-2">
        {currentRequest.items.length === 0 ? (
          <p>В заявке пока нет компонентов. Вернитесь на страницу услуг и нажмите кнопку «Добавить».</p>
        ) : (
          currentRequest.items.map((item) => (
            <div className="fav-card" key={`${item.componentId}-${item.title}`}>
              <div className="fav-card-body">
                <div className="fav-card-header">
                  <h3>{item.title}</h3>
                  <span>{item.time} мс за единицу</span>
                </div>
                <p>{item.description}</p>
                <div className="fav-card-controls">
                  <label>
                    Количество
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => handleQuantityChange(item.componentId, Number(event.target.value))}
                      disabled={!isDraft}
                    />
                  </label>
                  <div>
                    <strong>Итого:</strong> {item.subtotalTime} мс
                  </div>
                  {isDraft && (
                    <button type="button" className="ghost-button ghost-button--danger" onClick={() => handleDeleteItem(item.componentId)}>
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <aside className="info-panel">
        <h3>Работа с заявкой через Postman</h3>
        <p>
          После авторизации браузер сохраняет JWT в HttpOnly-cookie. Откройте вкладку <strong>Application → Cookies</strong> в DevTools, чтобы скопировать cookie
          значения и использовать их как заголовок <code>Cookie</code> в Postman или Insomnia. В localStorage мы сохраняем только вспомогательные данные (например,
          последний логин), поэтому безопасность учетных данных не нарушается.
        </p>
      </aside>
    </section>
  );
};

export default RequestDetailPage;

