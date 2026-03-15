import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function SendMoney() {
  const { user, refreshBalance } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const quickAmounts = [500, 1000, 2000, 5000];

  useEffect(() => {
    if (!search || selectedUser) return;
    const timer = setTimeout(() => searchUsers(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const searchUsers = async (q) => {
    if (q.length < 2) { setUsers([]); return; }
    setSearchLoading(true);
    try {
      const res = await api.get(`/account/users?search=${q}`);
      setUsers(res.data.users);
    } catch (e) {
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setSearch(u.email);
    setUsers([]);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setSearch('');
    setAmount('');
    setError('');
    setSuccess('');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedUser) return setError('Please select a recipient');
    if (!amount || amount <= 0) return setError('Enter a valid amount');
    if (parseFloat(amount) > parseFloat(user.balance)) return setError('Insufficient balance');

    setLoading(true);
    try {
      const res = await api.post('/account/transfer', {
        receiverEmail: selectedUser.email,
        amount: parseFloat(amount),
      });
      setSuccess(res.data.message);
      setAmount('');
      setSelectedUser(null);
      setSearch('');
      await refreshBalance();
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className="send-page">
      <div className="send-content">

        <div>
          <h1 className="page-title">Send Money</h1>
          <p className="page-subtitle">Transfer funds to any registered user</p>
        </div>

        <div className="balance-pill">
          <span className="balance-pill-label">Available</span>
          <span className="balance-pill-amount">{formatCurrency(user?.balance ?? 0)}</span>
        </div>

        <div className="card">
          <form className="send-form" onSubmit={handleTransfer}>

            {error && <div className="error-msg">{error}</div>}
            {success && (
              <div className="success-msg">
                ✓ {success} —{' '}
                <span
                  onClick={() => navigate('/statement')}
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  View Statement
                </span>
              </div>
            )}

            {/* Recipient Field */}
            <div className="input-group">
              <label>Recipient</label>
              {selectedUser ? (
                <div className="selected-user">
                  <div className="sel-avatar">{selectedUser.name.charAt(0).toUpperCase()}</div>
                  <div className="sel-info">
                    <span className="sel-name">{selectedUser.name}</span>
                    <span className="sel-email">{selectedUser.email}</span>
                  </div>
                  <button type="button" className="clear-btn" onClick={handleClear}>✕</button>
                </div>
              ) : (
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setError(''); }}
                    autoComplete="off"
                  />
                  {(searchLoading || users.length > 0) && (
                    <div className="search-dropdown">
                      {searchLoading ? (
                        <div className="dropdown-loading">
                          <span className="spinner" style={{ width: 16, height: 16 }} />
                          Searching...
                        </div>
                      ) : (
                        users.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleSelectUser(u)}
                          >
                            <div className="drop-avatar">{u.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="drop-name">{u.name}</div>
                              <div className="drop-email">{u.email}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amount Field */}
            <div className="input-group">
              <label>Amount (₹)</label>
              <div className="amount-wrapper">
                <span className="rupee-symbol">₹</span>
                <input
                  type="number"
                  className="amount-input"
                  placeholder="0.00"
                  value={amount}
                  min="1"
                  onChange={(e) => { setAmount(e.target.value); setError(''); }}
                />
              </div>
              <div className="quick-amounts">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`quick-btn ${amount == q ? 'active' : ''}`}
                    onClick={() => setAmount(String(q))}
                  >
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Preview */}
            {selectedUser && amount > 0 && (
              <div className="transfer-preview">
                <div className="preview-row">
                  <span>Sending to</span>
                  <span className="preview-val">{selectedUser.name}</span>
                </div>
                <div className="preview-row">
                  <span>Amount</span>
                  <span className="preview-val accent">{formatCurrency(amount)}</span>
                </div>
                <div className="preview-row">
                  <span>Balance after</span>
                  <span className="preview-val">
                    {formatCurrency(parseFloat(user?.balance ?? 0) - parseFloat(amount))}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary send-btn" disabled={loading}>
              {loading ? <><span className="spinner" /> Processing...</> : '↗ Send Money'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}