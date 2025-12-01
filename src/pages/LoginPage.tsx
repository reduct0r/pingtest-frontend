import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, clearAuthError } from '../slices/authSlice';
import { ROUTES } from '../Routes';
import Loader from '../components/Loader';

const LoginPage: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, loading, lastUsername } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: lastUsername ?? '',
    password: '',
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      navigate(ROUTES.COMPONENTS);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearAuthError());
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>Вход в аккаунт</h1>
        <p className="auth-subtitle">Используйте учетные данные, чтобы продолжить работу с заявками.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Логин
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="example@mail.com" required />
          </label>

          <label>
            Пароль
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? <Loader label="Выполняем вход..." inline /> : 'Войти'}
          </button>
        </form>

        <p className="auth-hint">
          Еще нет аккаунта? <Link to={ROUTES.REGISTER}>Зарегистрируйтесь</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;

