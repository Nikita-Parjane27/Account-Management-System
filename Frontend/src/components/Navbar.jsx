import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/send', label: 'Send Money' },
    { path: '/statement', label: 'Statement' },
  ];

  return (
  <nav className="navbar">
    <div className="navbar-inner">
      <Link to="/dashboard" className="navbar-brand">
        <div className="navbar-logo">FT</div>
        <span className="navbar-logo-text">FinTrack</span>
      </Link>
      <div className="navbar-links">
        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="navbar-right">
        <div className="navbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="navbar-user-info">
          <span className="navbar-user-name">{user?.name}</span>
          <span className="navbar-user-email">{user?.email}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  </nav>
);
}