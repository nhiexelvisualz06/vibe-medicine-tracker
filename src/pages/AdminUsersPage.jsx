import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AdminUsersPage() {
  const { db, saveDb, loading } = useApp();
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [fUsername, setFUsername] = useState('');
  const [fPassword, setFPassword] = useState('');
  const [fName, setFName] = useState('');
  const [fRole, setFRole] = useState(0);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => {
    setEditUser(null);
    setFUsername(''); setFPassword(''); setFName(''); setFRole(0);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setFUsername(u.username); setFPassword(u.password); setFName(u.nameToUse); setFRole(u.role);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!fUsername.trim() || !fPassword.trim() || !fName.trim()) {
      showToast('All fields are required.', 'warning'); return;
    }
    const taken = db.users.some(
      (u) => u.username === fUsername.trim() && u.userId !== editUser?.userId
    );
    if (taken) { showToast('Username already in use.', 'danger'); return; }

    const newDb = { ...db, users: [...db.users] };

    if (editUser) {
      const idx = newDb.users.findIndex((u) => u.userId === editUser.userId);
      newDb.users[idx] = { ...newDb.users[idx], username: fUsername.trim(), password: fPassword, nameToUse: fName.trim(), role: fRole };
    } else {
      newDb.users.push({
        userId: generateId('u'),
        username: fUsername.trim(),
        password: fPassword,
        nameToUse: fName.trim(),
        role: fRole,
      });
    }

    try {
      await saveDb(newDb);
      setShowModal(false);
      showToast(editUser ? 'User updated!' : 'User added!');
    } catch {
      showToast('Failed to save.', 'danger');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    const newDb = {
      ...db,
      users: db.users.filter((u) => u.userId !== userId),
      userMedicines: db.userMedicines.filter((um) => um.userId !== userId),
    };
    try {
      await saveDb(newDb);
      showToast('User deleted.');
    } catch {
      showToast('Failed to delete.', 'danger');
    }
  };

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} position-fixed`} style={{ top: 80, right: 20, zIndex: 9999, minWidth: 240, borderRadius: 12 }}>
          {toast.msg}
        </div>
      )}

      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="section-title">User Settings</div>
          <div className="section-subtitle">Manage all user accounts</div>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" style={{ borderRadius: 8 }} onClick={openAdd}>
          <i className="bi bi-person-plus" /> Add User
        </button>
      </div>

      <div className="table-card">
        <table className="table table-hover mb-0">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th className="small text-muted fw-500 ps-3">User</th>
              <th className="small text-muted fw-500">Username</th>
              <th className="small text-muted fw-500">Role</th>
              <th className="small text-muted fw-500 text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(db?.users ?? []).map((u) => (
              <tr key={u.userId}>
                <td className="ps-3">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                    }}>
                      {u.nameToUse?.[0]}
                    </div>
                    <span className="fw-500" style={{ fontSize: '0.9rem' }}>{u.nameToUse}</span>
                  </div>
                </td>
                <td className="text-muted small">@{u.username}</td>
                <td>
                  <span className={`badge ${u.role === 1 ? 'bg-primary' : 'bg-secondary'}`} style={{ borderRadius: 6, fontSize: '0.75rem' }}>
                    {u.role === 1 ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="text-end pe-3">
                  <button className="btn btn-icon btn-outline-primary me-1" onClick={() => openEdit(u)} disabled={loading} title="Edit">
                    <i className="bi bi-pencil" style={{ fontSize: '0.8rem' }} />
                  </button>
                  <button className="btn btn-icon btn-outline-danger" onClick={() => handleDelete(u.userId)} disabled={loading} title="Delete">
                    <i className="bi bi-trash" style={{ fontSize: '0.8rem' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-600">
                  <i className={`bi bi-person-${editUser ? 'gear' : 'plus'} me-2 text-primary`} />
                  {editUser ? 'Edit User' : 'Add User'}
                </h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-500">Display Name</label>
                  <input className="form-control" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-500">Username</label>
                  <input className="form-control" value={fUsername} onChange={(e) => setFUsername(e.target.value)} placeholder="Username" />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-500">Password</label>
                  <input className="form-control" type="text" value={fPassword} onChange={(e) => setFPassword(e.target.value)} placeholder="Password" />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-500">Role</label>
                  <div className="d-flex gap-2">
                    <button type="button" className={`btn btn-sm ${fRole === 0 ? 'btn-primary' : 'btn-outline-secondary'}`} style={{ borderRadius: 8, flex: 1 }} onClick={() => setFRole(0)}>
                      User
                    </button>
                    <button type="button" className={`btn btn-sm ${fRole === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} style={{ borderRadius: 8, flex: 1 }} onClick={() => setFRole(1)}>
                      Admin
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light btn-sm" style={{ borderRadius: 8 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }} onClick={handleSave} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : editUser ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
