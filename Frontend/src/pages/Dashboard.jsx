import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user, refreshBalance } = useAuth();
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshBalance();
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    try {
      const res = await api.get('/account/statement');
      setRecentTxns(res.data.transactions.slice(0, 5));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return (
  <div className="dashboard-page">
    <div className="dashboard-content">

      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <Link to="/send" className="btn btn-primary">Send Money</Link>
      </div>

      <div className="balance-card">
        <span className="balance-label">Available Balance</span>
        <span className="balance-amount">{formatCurrency(user?.balance ?? 0)}</span>
        <span className="balance-sub">Updated just now</span>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Total Sent</span>
          <span className="stat-value">
            {formatCurrency(recentTxns.filter(t => t.transaction_type === 'debit').reduce((s, t) => s + parseFloat(t.amount), 0))}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Received</span>
          <span className="stat-value">
            {formatCurrency(recentTxns.filter(t => t.transaction_type === 'credit').reduce((s, t) => s + parseFloat(t.amount), 0))}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <Link to="/statement" className="see-all">View all →</Link>
        </div>
        {loading ? (
          <div className="loading-center"><span className="spinner" /></div>
        ) : recentTxns.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet</p>
            <Link to="/send" className="btn btn-primary" style={{fontSize: 13}}>Make your first transfer</Link>
          </div>
        ) : (
          <div className="txn-list">
            {recentTxns.map((txn) => {
              const isCredit = txn.transaction_type === 'credit';
              return (
                <div key={txn.id} className="txn-item">
                  <div className={`txn-icon ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? '↙' : '↗'}
                  </div>
                  <div className="txn-info">
                    <span className="txn-name">
                      {isCredit ? `From ${txn.sender?.name}` : `To ${txn.receiver?.name}`}
                    </span>
                    <span className="txn-date">{formatDate(txn.created_at)}</span>
                  </div>
                  <span className={`txn-amount ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="actions-grid">
        <Link to="/send" className="action-card">
          <span className="action-icon">↗</span>
          <span className="action-label">Send Money</span>
          <span className="action-desc">Transfer to any user</span>
        </Link>
        <Link to="/statement" className="action-card">
          <span className="action-icon">≡</span>
          <span className="action-label">Statement</span>
          <span className="action-desc">View full history</span>
        </Link>
      </div>

    </div>
  </div>
);
}