import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { registerUser, clearAuthError } from '../slices/authSlice';
import Loader from '../components/Loader';
import { ROUTES } from '../Routes';

const RegisterPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, loading, registrationSuccess } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearAuthError());
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    const result = await dispatch(registerUser({ username: formData.username, password: formData.password }));
    if (registerUser.fulfilled.match(result)) {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Регистрация</h1>
        <p className="auth-subtitle">Заведите учетную запись, чтобы добавлять компоненты в заявку и отслеживать статусы.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Логин
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="example@mail.com" required />
          </label>

          <label>
            Пароль
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>

          <label>
            Подтверждение пароля
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </label>

          {error && <p className="form-error">{error}</p>}
          {registrationSuccess && <p className="form-success">Регистрация прошла успешно! Используйте логин для входа.</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? <Loader label="Создаем аккаунт..." inline /> : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="auth-hint">
          Уже есть аккаунт? <Link to={ROUTES.LOGIN}>Войти</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;

