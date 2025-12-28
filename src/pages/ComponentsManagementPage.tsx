import type { FC, ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const ComponentsManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { items, loading, error } = useAppSelector((state) => state.catalog);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ComponentFormData>({
    title: '',
    description: '',
    longDescription: '',
    time: 0,
    imageUrl: null,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ComponentFormData, string>>>({});
  const [mutationLoading, setMutationLoading] = useState(false);
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      time: 0,
      imageUrl: null,
    });
    setFormErrors({});
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (component: ComponentDto) => {
    if (!component.id) return;
    setEditingId(component.id);
    setIsCreating(false);
    setFormData({
      title: component.title,
      description: component.description,
      longDescription: component.longDescription,
      time: component.time,
      imageUrl: component.imageUrl || null,
    });
    setFormErrors({});
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setMutationLoading(true);
    try {
      if (editingId) {
        await api.serverComponents.serverComponentsUpdate(editingId, formData);
      } else if (isCreating) {
        await api.serverComponents.serverComponentsCreate(formData);
      }
      resetForm();
      dispatch(fetchComponents());
    } catch (error: any) {
      console.error('Ошибка при сохранении компонента:', error);
      setFormErrors({ title: error?.response?.data?.message || 'Ошибка при сохранении' });
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот компонент?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.serverComponents.serverComponentsDelete(id);
      dispatch(fetchComponents());
    } catch (error: any) {
      console.error('Ошибка при удалении компонента:', error);
      alert('Ошибка при удалении компонента');
    } finally {
      setDeleteLoading(null);
    }
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

  if (!user || !isModerator) {
    return null;
  }

  return (
    <section className="requests-page">
      <div className="requests-header">
        <div>
          <h1>Управление услугами</h1>
          <p>Добавляйте, редактируйте и удаляйте услуги в системе.</p>
        </div>
        <button type="button" className="primary-button" onClick={handleCreate} disabled={isCreating || editingId !== null}>
          Добавить услугу
        </button>
      </div>

      {(isCreating || editingId !== null) && (
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h2 style={{ marginBottom: '20px', color: '#fff' }}>
            {editingId ? 'Редактирование услуги' : 'Создание новой услуги'}
          </h2>
          <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '600px' }}>
            <label>
              Название <span style={{ color: '#ff6384' }}>*</span>
              <input
                type="text"
                value={formData.title}
                onChange={handleInputChange('title')}
                placeholder="Введите название услуги"
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
              <button type="submit" className="primary-button" disabled={mutationLoading}>
                {mutationLoading ? 'Сохранение...' : editingId ? 'Сохранить изменения' : 'Создать услугу'}
              </button>
              <button type="button" className="ghost-button" onClick={handleCancel} disabled={mutationLoading}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <Loader label="Загружаем услуги..." />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Услуги не найдены. Создайте первую услугу.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>ID</th>
                <th style={{ textAlign: 'left' }}>Название</th>
                <th style={{ textAlign: 'left' }}>Описание</th>
                <th style={{ textAlign: 'left' }}>Время (мс)</th>
                <th style={{ textAlign: 'left' }}>Изображение</th>
                <th style={{ textAlign: 'center' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((component) => (
                <tr key={component.id}>
                  <td>{component.id}</td>
                  <td>
                    <strong>{component.title}</strong>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {component.description}
                  </td>
                  <td>{component.time}</td>
                  <td>
                    {component.imageUrl ? (
                      <img
                        src={component.imageUrl}
                        alt={component.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ color: '#9193a8' }}>Нет</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleEdit(component)}
                        disabled={isCreating || editingId !== null || deleteLoading !== null}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Редактировать
                      </button>
                      <button
                        type="button"
                        className="ghost-button ghost-button--danger"
                        onClick={() => component.id && handleDelete(component.id)}
                        disabled={isCreating || editingId !== null || deleteLoading === component.id}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        {deleteLoading === component.id ? 'Удаление...' : 'Удалить'}
                      </button>
                    </div>
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

export default ComponentsManagementPage;

