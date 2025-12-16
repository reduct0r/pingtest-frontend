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
  const [coefficient, setCoefficient] = useState<number>(1);
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    if (requestId) {
      void dispatch(fetchRequestById(requestId));
    }
  }, [dispatch, requestId]);

  useEffect(() => {
    if (currentRequest?.loadCoefficient != null) {
      setCoefficient(currentRequest.loadCoefficient);
    } else {
      setCoefficient(1);
    }
    // Инициализируем локальные значения количества для каждого элемента
    if (currentRequest?.items) {
      const quantities: Record<number, number> = {};
      currentRequest.items.forEach((item) => {
        quantities[item.componentId] = item.quantity;
      });
      setItemQuantities(quantities);
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

  const handleCoefficientChange = (value: string) => {
    if (!isDraft) return;

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;

    const safeValue = parsed < 1 ? 1 : parsed;
    setCoefficient(safeValue);
    // Не сохраняем автоматически, только обновляем локальное состояние
  };

  const handleQuantityChange = (componentId: number, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) return;
    // Обновляем только локальное состояние
    setItemQuantities((prev) => ({
      ...prev,
      [componentId]: quantity,
    }));
  };

  const handleDeleteItem = async (componentId: number) => {
    if (!currentRequest.id) return;
    const result = await dispatch(deleteItemFromDraft({ requestId: currentRequest.id, componentId }));
    // Обновляем локальное состояние после удаления
    if (deleteItemFromDraft.fulfilled.match(result)) {
      setItemQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[componentId];
        return newQuantities;
      });
    }
  };

  const handleForm = async () => {
    if (!currentRequest.id || !isDraft) return;
    
    // Сначала сохраняем все изменения количества элементов
    const promises = Object.entries(itemQuantities).map(([componentIdStr, quantity]) => {
      const componentId = Number(componentIdStr);
      const currentItem = currentRequest.items.find((item) => item.componentId === componentId);
      if (currentItem && currentItem.quantity !== quantity) {
        return dispatch(updateItemQuantity({ requestId: currentRequest.id!, componentId, quantity }));
      }
      return Promise.resolve();
    });

    // Сохраняем коэффициент нагрузки, если он изменился
    if (currentRequest.loadCoefficient !== coefficient) {
      promises.push(dispatch(updateLoadCoefficient({ requestId: currentRequest.id, loadCoefficient: coefficient })));
    }

    // Ждем сохранения всех изменений
    await Promise.all(promises);
    
    // Затем формируем заявку
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
    // Сохранение коэффициента нагрузки в БД
    if (currentRequest.id && isDraft) {
      void dispatch(updateLoadCoefficient({ requestId: currentRequest.id, loadCoefficient: coefficient }));
    }
  };

  const handleSaveItems = async () => {
    // Сохранение всех изменений количества элементов в БД
    if (!currentRequest.id || !isDraft) return;

    const promises = Object.entries(itemQuantities).map(([componentIdStr, quantity]) => {
      const componentId = Number(componentIdStr);
      const currentItem = currentRequest.items.find((item) => item.componentId === componentId);
      // Сохраняем только если количество изменилось
      if (currentItem && currentItem.quantity !== quantity) {
        return dispatch(updateItemQuantity({ requestId: currentRequest.id!, componentId, quantity }));
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
    // Обновляем данные заявки после сохранения
    void dispatch(fetchRequestById(currentRequest.id));
  };

  const handleSaveFields = () => {
    // Сохранение полей заявки (коэффициента) в БД
    if (currentRequest.id && isDraft) {
      void dispatch(updateLoadCoefficient({ requestId: currentRequest.id, loadCoefficient: coefficient }));
    }
  };

  const showTotalTimeValue = currentRequest.status === 'COMPLETED' && currentRequest.totalTime != null;

  return (
    <div className="ping-wrapper">
      <div className="ping-main-board">
        <div className="ping-main-title">
          <div className="logo-group logo-group--inline">
            <img src={`${import.meta.env.BASE_URL}icon.png`} alt="PINGTEST" onError={(e) => (e.currentTarget.src = `${import.meta.env.BASE_URL}icon.png`)} />
            <span className="logo-title">PINGTEST</span>
          </div>
        </div>

        <div className="ping-info">
          <div className="ping-info__row">
            <p>
              Номер: <span>{currentRequest.id}</span>
            </p>
            <p>
              Статус: <span>{currentRequest.status}</span>
            </p>
          </div>
          <div className="ping-info__row">
            <label className="coefficient-label">
              Коэф. нагрузки
              <input
                type="number"
                className="mini-input"
                value={coefficient}
                min={1}
                disabled={!isDraft}
                onChange={(event) => handleCoefficientChange(event.target.value)}
              />
            </label>
            {isDraft && (
              <button type="button" className="ghost-button" onClick={handleSaveCoefficient}>
                Сохранить коэф.
              </button>
            )}
            <div className="ping-totals">
              <p>
                Количество позиций: <strong>{currentRequest.items.reduce((acc, item) => acc + (itemQuantities[item.componentId] ?? item.quantity), 0)}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="ping-components-stack">
          {currentRequest.items.length === 0 ? (
            <p className="ping-empty">В заявке пока нет компонентов. Вернитесь к каталогу и добавьте нужные позиции.</p>
          ) : (
            currentRequest.items.map((item) => (
              <div className="tile-container" key={`${item.componentId}-${item.title}`}>
                <img
                  src={item.imageUrl || `${import.meta.env.BASE_URL}placeholder_142x142.png`}
                  alt={item.title}
                  className="icon"
                  onError={(e) => (e.currentTarget.src = `${import.meta.env.BASE_URL}placeholder_142x142.png`)}
                />
                <div className="tile-content">
                  <p className="title">{item.title}</p>
                  <p className="description">{item.description}</p>
                </div>
                <div className="time">
                  <img src={`${import.meta.env.BASE_URL}ping_icon.svg`} alt="ping" onError={(e) => (e.currentTarget.src = `${import.meta.env.BASE_URL}ping_icon.svg`)} />
                  <span>{item.time} мс</span>
                </div>
                <div className="quantity">
                  Кол-во
                  <input
                    type="number"
                    className="mini-input"
                    value={itemQuantities[item.componentId] ?? item.quantity}
                    min={1}
                    disabled={!isDraft}
                    onChange={(event) => handleQuantityChange(item.componentId, Number(event.target.value))}
                  />
                </div>
                <div className="priority">
                  Итого
                  <strong>{item.subtotalTime} мс</strong>
                </div>
                {isDraft && (
                  <button type="button" className="tile-delete" onClick={() => handleDeleteItem(item.componentId)}>
                    Удалить
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        {isDraft && (
          <div className="ping-actions">
            <button type="button" className="ghost-button" onClick={handleSaveItems}>
              Сохранить м-м
            </button>
            <button type="button" className="ghost-button" onClick={handleSaveFields}>
              Сохранить поля заявки
            </button>
            <button type="button" className="ghost-button" onClick={handleForm}>
              Сформировать заявку
            </button>
            <button type="button" className="ghost-button ghost-button--danger" onClick={handleDeleteRequest}>
              Очистить черновик
            </button>
          </div>
        )}
        <div className="ping-total-result">
          Итоговое время: {showTotalTimeValue ? <span>{currentRequest.totalTime} мс</span> : ''}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;


