import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { db, saveDb, currentUser, setCurrentUser, loading } = useApp();

  const [username, setUsername]       = useState(currentUser?.username ?? '');
  const [nameToUse, setNameToUse]     = useState(currentUser?.nameToUse ?? '');
  const [oldPw, setOldPw]             = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showOld, setShowOld]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Check username not taken by another user
    const taken = db.users.some(
      (u) => u.username === username.trim() && u.userId !== currentUser.userId
    );
    if (taken) { showToast('Username already in use.', 'danger'); return; }

    const newDb = { ...db };
    const idx = newDb.users.findIndex((u) => u.userId === currentUser.userId);
    newDb.users[idx] = { ...newDb.users[idx], username: username.trim(), nameToUse: nameToUse.trim() };

    try {
      await saveDb(newDb);
      setCurrentUser(newDb.users[idx]);
      showToast('Profile updated!');
    } catch {
      showToast('Failed to save profile.', 'danger');
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const userInDb = db.users.find((u) => u.userId === currentUser.userId);
    if (userInDb.password !== oldPw) { showToast('Current password is incorrect.', 'danger'); return; }
    if (newPw.length < 4)            { showToast('New password must be at least 4 characters.', 'warning'); return; }
    if (newPw !== confirmPw)         { showToast('Passwords do not match.', 'danger'); return; }

    const newDb = { ...db };
    const idx = newDb.users.findIndex((u) => u.userId === currentUser.userId);
    newDb.users[idx] = { ...newDb.users[idx], password: newPw };

    try {
      await saveDb(newDb);
      setOldPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password changed successfully!');
    } catch {
      showToast('Failed to change password.', 'danger');
    }
  };

  return (
    <div>
      {toast && (
        <div
          className={`alert alert-${toast.type} position-fixed`}
          style={{ top: 80, right: 20, zIndex: 9999, minWidth: 240, borderRadius: 12 }}
        >
          {toast.msg}
        </div>
      )}

      <div className="mb-4">
        <div className="section-title">Profile</div>
        <div className="section-subtitle">Update your account information</div>
      </div>

      {/* Avatar */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '1.75rem',
            boxShadow: '0 4px 16px rgba(37,99,235,0.25)',
          }}
        >
          {currentUser?.nameToUse?.[0] ?? '?'}
        </div>
        <div>
          <div className="fw-700" style={{ fontSize: '1.1rem' }}>{currentUser?.nameToUse}</div>
          <div className="text-muted small">@{currentUser?.username}</div>
          <span
            className={`badge mt-1 ${currentUser?.role === 1 ? 'bg-primary' : 'bg-secondary'}`}
            style={{ borderRadius: 6, fontSize: '0.72rem' }}
          >
            {currentUser?.role === 1 ? 'Administrator' : 'User'}
          </span>
        </div>
      </div>

      <div className="row g-3">
        {/* Profile info */}
        <div className="col-12 col-lg-6">
          <div className="stat-card">
            <h6 className="fw-600 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-circle text-primary" /> Account Info
            </h6>
            <form onSubmit={handleProfileSave}>
              <div className="mb-3">
                <label className="form-label small fw-500">Display Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={nameToUse}
                  onChange={(e) => setNameToUse(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-500">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                style={{ borderRadius: 8 }}
                disabled={loading}
              >
                <i className="bi bi-check2" /> Save Profile
              </button>
            </form>
          </div>
        </div>

        {/* Change password */}
        <div className="col-12 col-lg-6">
          <div className="stat-card">
            <h6 className="fw-600 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-lock text-primary" /> Change Password
            </h6>
            <form onSubmit={handlePasswordSave}>
              <div className="mb-3">
                <label className="form-label small fw-500">Current Password</label>
                <div className="input-group">
                  <input
                    type={showOld ? 'text' : 'password'}
                    className="form-control border-end-0"
                    value={oldPw}
                    onChange={(e) => setOldPw(e.target.value)}
                    required
                    placeholder="••••••"
                  />
                  <button type="button" className="input-group-text bg-white" style={{ borderColor: '#e2e8f0' }} onClick={() => setShowOld(!showOld)}>
                    <i className={`bi bi-eye${showOld ? '-slash' : ''} text-muted`} />
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-500">New Password</label>
                <div className="input-group">
                  <input
                    type={showNew ? 'text' : 'password'}
                    className="form-control border-end-0"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    placeholder="Min. 4 characters"
                  />
                  <button type="button" className="input-group-text bg-white" style={{ borderColor: '#e2e8f0' }} onClick={() => setShowNew(!showNew)}>
                    <i className={`bi bi-eye${showNew ? '-slash' : ''} text-muted`} />
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-500">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  required
                  placeholder="Repeat new password"
                />
              </div>
              <button
                type="submit"
                className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                style={{ borderRadius: 8 }}
                disabled={loading}
              >
                <i className="bi bi-shield-lock" /> Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
