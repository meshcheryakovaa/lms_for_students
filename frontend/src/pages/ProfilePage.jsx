import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="page">
      <div className="profile-card">
        <div className="profile-avatar">{user.first_name?.[0] || user.email[0]}</div>
        <h2>{user.first_name} {user.last_name}</h2>
        <p className="profile-role tag">{ROLE_LABELS[user.role] ?? user.role}</p>
        <table className="profile-table">
          <tbody>
            <tr><td>Email</td><td>{user.email}</td></tr>
            <tr><td>Username</td><td>{user.username}</td></tr>
            <tr><td>ID</td><td>{user.id}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
