import type { FC, ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchComponents } from '../slices/catalogSlice';
import { api } from '../api';
import type { ComponentDto } from '../api/Api';
import Loader from '../components/Loader';
import { ROUTES } from '../Routes';
import '../styles/styles.css';

interface ComponentFormData {
  title: string;
  description: string;
  longDescription: string;
  time: number;
  imageUrl?: string | null;
}

const ComponentEditPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const isCreating = id === 'new';
  const parsedId = id && id !== 'new' ? Number(id) : NaN;
  const componentId = Number.isFinite(parsedId) ? parsedId : null;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { items, loading } = useAppSelector((state) => state.catalog);
  const [formData, setFormData] = useState<ComponentFormData>({
    title: '',
    description: '',
    longDescription: '',
    time: 0,
    imageUrl: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ComponentFormData, string>>>({});
  const [mutationLoading, setMutationLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentComponent, setCurrentComponent] = useState<ComponentDto | null>(null);

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
    if (!isCreating) {
      dispatch(fetchComponents());
    }
  }, [dispatch, user, isModerator, navigate, isCreating]);

  useEffect(() => {
    if (isCreating) {
      // Режим создания - форма уже пустая
      setCurrentComponent(null);
      return;
    }
    
    if (componentId && items.length > 0) {
      const component = items.find((c) => c.id === componentId);
      if (component) {
        setCurrentComponent(component);
        setFormData({
          title: component.title,
          description: component.description,
          longDescription: component.longDescription,
          time: component.time,
          imageUrl: component.imageUrl || null,
        });
      } else {
        navigate(ROUTES.COMPONENTS_MANAGEMENT);
      }
    }
  }, [componentId, items, navigate, isCreating]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ComponentFormData, string>> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Название обязательно';
    }
    if (!formData.description.trim()) {
      errors.description = 'Описание обязательно';
    }
    if (!formData.longDescription.trim()) {
      errors.longDescription = 'Полное описание обязательно';
    }
    if (!formData.time || formData.time <= 0) {
      errors.time = 'Время должно быть больше 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ComponentFormData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'time' ? Number(event.target.value) : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setMutationLoading(true);
    try {
      if (isCreating) {
        await api.serverComponents.serverComponentsCreate(formData);
      } else if (componentId) {
        await api.serverComponents.serverComponentsUpdate(componentId, formData);
      }
      dispatch(fetchComponents());
      navigate(ROUTES.COMPONENTS_MANAGEMENT);
    } catch (error: any) {
      console.error('Ошибка при сохранении компонента:', error);
      setFormErrors({ title: error?.response?.data?.message || 'Ошибка при сохранении' });
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!componentId) return;
    
    if (!confirm('Вы уверены, что хотите удалить этот серверный компонент?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await api.serverComponents.serverComponentsDelete(componentId);
      dispatch(fetchComponents());
      navigate(ROUTES.COMPONENTS_MANAGEMENT);
    } catch (error: any) {
      console.error('Ошибка при удалении компонента:', error);
      alert('Ошибка при удалении серверного компонента');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user || !isModerator) {
    return null;
  }

  if (!isCreating && loading) {
    return <Loader label="Загружаем данные..." />;
  }

  if (!isCreating && (!currentComponent || !componentId)) {
    if (loading) {
      return <Loader label="Загружаем данные..." />;
    }
    return (
      <section className="empty-state">
        <p>Серверный компонент не найден.</p>
        <Link to={ROUTES.COMPONENTS_MANAGEMENT} className="ghost-button">
          Вернуться к списку
        </Link>
      </section>
    );
  }

  return (
    <section className="requests-page">
      <div className="requests-header">
        <div>
          <h1>{isCreating ? 'Создание серверного компонента' : 'Редактирование серверного компонента'}</h1>
          <p>{isCreating ? 'Заполните данные для нового серверного компонента.' : 'Измените данные серверного компонента или удалите его.'}</p>
        </div>
      </div>

      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
          <label>
            Название <span style={{ color: '#ff6384' }}>*</span>
            <input
              type="text"
              value={formData.title}
              onChange={handleInputChange('title')}
              placeholder="Введите название серверного компонента"
            />
            {formErrors.title && <span className="form-error">{formErrors.title}</span>}
          </label>

          <label>
            Описание <span style={{ color: '#ff6384' }}>*</span>
            <textarea
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="Введите краткое описание"
              rows={3}
              style={{
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                padding: '10px 14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            {formErrors.description && <span className="form-error">{formErrors.description}</span>}
          </label>

          <label>
            Полное описание <span style={{ color: '#ff6384' }}>*</span>
            <textarea
              value={formData.longDescription}
              onChange={handleInputChange('longDescription')}
              placeholder="Введите полное описание"
              rows={5}
              style={{
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#ffffff',
                padding: '10px 14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            {formErrors.longDescription && <span className="form-error">{formErrors.longDescription}</span>}
          </label>

          <label>
            Время (мс) <span style={{ color: '#ff6384' }}>*</span>
            <input
              type="number"
              value={formData.time || ''}
              onChange={handleInputChange('time')}
              placeholder="Введите время в миллисекундах"
              min={1}
            />
            {formErrors.time && <span className="form-error">{formErrors.time}</span>}
          </label>

          <label>
            URL изображения (необязательно)
            <input
              type="text"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value || null }))}
              placeholder="Введите URL изображения"
            />
          </label>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="submit" className="primary-button" disabled={mutationLoading || deleteLoading}>
              {mutationLoading ? (isCreating ? 'Создание...' : 'Сохранение...') : (isCreating ? 'Создать' : 'Сохранить')}
            </button>
            {!isCreating && (
              <button
                type="button"
                className="ghost-button ghost-button--danger"
                onClick={handleDelete}
                disabled={mutationLoading || deleteLoading}
              >
                {deleteLoading ? 'Удаление...' : 'Удалить'}
              </button>
            )}
            <Link to={ROUTES.COMPONENTS_MANAGEMENT} className="ghost-button" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ComponentEditPage;

