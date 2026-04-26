import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getMe } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form.email, form.password);
      const token = data.auth_token;
      // Временно кладём токен чтобы getMe сработал
      localStorage.setItem('token', token);
      const meRes = await getMe();
      signIn(token, meRes.data);
      navigate(meRes.data.role === 'teacher' ? '/teacher' : '/journal');
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Вход</h1>
        <form onSubmit={handleSubmit} className="form">
          <label>Email
            <input type="email" name="email" value={form.email}
              onChange={handleChange} required autoFocus />
          </label>
          <label>Пароль
            <input type="password" name="password" value={form.password}
              onChange={handleChange} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="auth-footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
