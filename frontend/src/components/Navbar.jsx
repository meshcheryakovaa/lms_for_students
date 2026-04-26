import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/client';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🎓 LMS</Link>
      {user && (
        <div className="navbar-links">
          {user.role === 'student' && (
            <Link to="/journal">Мой журнал</Link>
          )}
          {user.role === 'teacher' && (
            <Link to="/teacher">Панель учителя</Link>
          )}
          <Link to="/profile">Профиль</Link>
          <button onClick={handleLogout} className="btn btn-outline">Выйти</button>
        </div>
      )}
    </nav>
  );
}
