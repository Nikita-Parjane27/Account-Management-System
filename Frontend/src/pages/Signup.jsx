import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) return setError('All fields are required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="auth-page">
    <div className="auth-card">
      <div className="auth-brand">
        <div className="auth-logo">FT</div>
        <span className="auth-logo-text">FinTrack</span>
      </div>
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Start with ₹10,000 welcome balance</p>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <label>Full Name</label>
          <input type="text" placeholder="Your Name" 
          value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>
      </form>
      <div className="auth-badge">
        <span className="auth-dot" /> ₹10,000 credited automatically on signup
      </div>
      <p className="auth-switch">
        Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </div>
  </div>
);
}