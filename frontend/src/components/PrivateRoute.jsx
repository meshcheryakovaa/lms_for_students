import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner">Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Если роль не совпадает — показываем ошибку доступа вместо редиректа
  // (редирект обратно на "/" → loop)
  if (role && user.role !== role) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '2rem' }}>🚫</p>
          <h2>Нет доступа</h2>
          <p style={{ color: 'var(--muted)', marginTop: '.5rem' }}>
            Эта страница доступна только для роли <b>{role}</b>.<br />
            Ваша роль: <b>{user.role || 'не задана'}</b>
          </p>
        </div>
      </div>
    );
  }

  return children;
}
