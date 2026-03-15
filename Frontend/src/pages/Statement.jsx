import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Statement() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStatement();
  }, []);

  const fetchStatement = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/account/statement');
      setTransactions(res.data.transactions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.transaction_type === filter);

  const totalCredit = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const totalDebit = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="statement-page">
      <div className="statement-content">

        {/* Header */}
        <div className="statement-header">
          <div>
            <h1 className="page-title">Account Statement</h1>
            <p className="page-subtitle">Complete transaction history</p>
          </div>
          <button className="btn btn-ghost" onClick={fetchStatement}>↻ Refresh</button>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card credit">
            <span className="summary-label">Total Received</span>
            <span className="summary-amount">{formatCurrency(totalCredit)}</span>
            <span className="summary-count">{transactions.filter(t => t.transaction_type === 'credit').length} credits</span>
          </div>
          <div className="summary-card debit">
            <span className="summary-label">Total Sent</span>
            <span className="summary-amount">{formatCurrency(totalDebit)}</span>
            <span className="summary-count">{transactions.filter(t => t.transaction_type === 'debit').length} debits</span>
          </div>
          <div className="summary-card neutral">
            <span className="summary-label">Total Transactions</span>
            <span className="summary-amount">{transactions.length}</span>
            <span className="summary-count">all time</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['all', 'credit', 'debit'].map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''} ${f}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'credit' ? '↙ Credits' : '↗ Debits'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <div className="loading-center" style={{ padding: 40 }}>
              <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
            </div>
          ) : error ? (
            <div className="error-msg" style={{ margin: 24 }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No {filter !== 'all' ? filter : ''} transactions found</div>
          ) : (
            <table className="stmt-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => {
                  const isCredit = txn.transaction_type === 'credit';
                  return (
                    <tr key={txn.id} className={isCredit ? 'row-credit' : 'row-debit'}>
                      <td>
                        <div className="cell-date">{formatDate(txn.created_at)}</div>
                        <div className="cell-time">{formatTime(txn.created_at)}</div>
                      </td>
                      <td>
                        <span className={`type-badge ${isCredit ? 'credit' : 'debit'}`}>
                          {isCredit ? '↙ Credit' : '↗ Debit'}
                        </span>
                      </td>
                      <td>
                        <div className="cell-user">
                          <div className="mini-avatar">{txn.sender?.name?.charAt(0).toUpperCase()}</div>
                          <span>{txn.sender?.id === user?.id ? <strong>You</strong> : txn.sender?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="cell-user">
                          <div className="mini-avatar">{txn.receiver?.name?.charAt(0).toUpperCase()}</div>
                          <span>{txn.receiver?.id === user?.id ? <strong>You</strong> : txn.receiver?.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`amount-cell ${isCredit ? 'credit' : 'debit'}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td>
                        <span className="balance-cell">{formatCurrency(txn.balance_after)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}