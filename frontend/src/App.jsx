import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentJournalPage from './pages/StudentJournalPage';
import TeacherPanelPage from './pages/TeacherPanelPage';
import ProfilePage from './pages/ProfilePage';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner">Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'teacher' ? '/teacher' : '/journal'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/journal" element={
              <PrivateRoute role="student"><StudentJournalPage /></PrivateRoute>
            } />
            <Route path="/teacher" element={
              <PrivateRoute role="teacher"><TeacherPanelPage /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
