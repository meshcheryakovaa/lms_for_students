import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, login, getMe, getGroups } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', username: '', first_name: '',
    last_name: '', password: '', role: 'student', group: '',
  });
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Загружаем список групп при монтировании
  useEffect(() => {
    getGroups()
      .then((r) => setGroups(r.data))
      .catch(() => {}); // если нет токена — список будет пустым, не критично
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      // Преобразуем group: пустая строка → null, число → число
      payload.group = form.group ? parseInt(form.group, 10) : null;
      // Преподавателю группа не нужна
      if (form.role === 'teacher') payload.group = null;

      await register(payload);
      // Сразу логинимся после регистрации
      const { data } = await login(form.email, form.password);
      const token = data.auth_token;
      localStorage.setItem('token', token);
      const meRes = await getMe();
      signIn(token, meRes.data);
      navigate(meRes.data.role === 'teacher' ? '/teacher' : '/journal');
    } catch (err) {
      const d = err.response?.data;
      if (d) {
        const msg = Object.entries(d)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
        setError(msg);
      } else {
        setError('Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Регистрация</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <label>Имя
              <input name="first_name" value={form.first_name} onChange={handleChange} required />
            </label>
            <label>Фамилия
              <input name="last_name" value={form.last_name} onChange={handleChange} required />
            </label>
          </div>
          <label>Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>Имя пользователя (username)
            <input name="username" value={form.username} onChange={handleChange} required />
          </label>
          <label>Пароль
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          <label>Роль
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
            </select>
          </label>

          {form.role === 'student' && (
            <label>Группа
              <select name="group" value={form.group} onChange={handleChange}>
                <option value="">— не выбрана —</option>
                {groups
                  .filter((g) => !g.is_archived)
                  .map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
              </select>
            </label>
          )}

          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </button>
        </form>
        <p className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
