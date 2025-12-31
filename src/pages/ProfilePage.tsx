import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateProfile } from '../slices/authSlice';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { ROUTES } from '../Routes';

const ProfilePage: FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: user?.username ?? '',
    password: '',
  });

  if (!user) {
    return (
      <section className="empty-state">
        <p>Чтобы редактировать профиль, выполните вход.</p>
        <Link to={ROUTES.LOGIN} className="primary-button">
          Войти
        </Link>
      </section>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await dispatch(updateProfile({ username: formData.username, password: formData.password || undefined }));
    setFormData((prev) => ({ ...prev, password: '' }));
  };

  return (
    <section className="profile-page">
      <h1>Личный кабинет</h1>
      <p>Обновите отображаемое имя или задайте новый пароль.</p>

      <form onSubmit={handleSubmit} className="profile-form">
        <label>
          Логин
          <input
            type="text"
            value={formData.username}
            onChange={(event) => setFormData((prev) => ({ ...prev, username: event.target.value }))}
            required
          />
        </label>

        <label>
          Новый пароль
          <input
            type="password"
            value={formData.password}
            placeholder="Оставьте пустым, чтобы не менять"
            onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? <Loader label="Сохраняем..." inline /> : 'Сохранить изменения'}
        </button>
      </form>
    </section>
  );
};

export default ProfilePage;

