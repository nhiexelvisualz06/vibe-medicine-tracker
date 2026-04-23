import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login, loading } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="mb-4">
          <div
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 6px 20px rgba(37,99,235,0.3)',
            }}
          >
            <i className="bi bi-capsule text-white" style={{ fontSize: '1.6rem' }} />
          </div>
          <div className="login-logo">MedTracker</div>
          <div className="login-subtitle">Sign in to manage your medicines</div>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-500 small">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px', borderColor: '#e2e8f0' }}>
                <i className="bi bi-person text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                style={{ borderRadius: '0 10px 10px 0', borderColor: '#e2e8f0' }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-500 small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px', borderColor: '#e2e8f0' }}>
                <i className="bi bi-lock text-muted" />
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0 ps-0"
                style={{ borderColor: '#e2e8f0' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-group-text bg-white border-start-0"
                style={{ borderRadius: '0 10px 10px 0', borderColor: '#e2e8f0', cursor: 'pointer' }}
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
              >
                <i className={`bi bi-eye${showPw ? '-slash' : ''} text-muted`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-600"
            style={{ borderRadius: 10, padding: '0.65rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
            }
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            <i className="bi bi-shield-check me-1 text-success" />
            Secured with Pantry JSON Cloud
          </small>
        </div>
      </div>
    </div>
  );
}
