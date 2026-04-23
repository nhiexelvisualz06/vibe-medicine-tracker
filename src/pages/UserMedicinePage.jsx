import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const TIMES = ['am', 'noon', 'pm'];
const TIME_LABELS = { am: 'Morning (AM)', noon: 'Noon', pm: 'Evening (PM)' };

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function UserMedicinePage() {
  const { db, saveDb, currentUser, loading } = useApp();
  const [toast, setToast] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = add mode
  const [formMedId, setFormMedId] = useState('');
  const [formTime, setFormTime] = useState('am');

  // Derive directly from db — no stale local state
  const userMeds = (() => {
    if (!db) return [];
    const seen = new Set();
    const raw = (db.userMedicines ?? []).filter((um) => {
      if (um.userId !== currentUser.userId) return false;
      if (seen.has(um.id)) return false;
      seen.add(um.id);
      return true;
    });
    return raw.map((um) => {
      const med = (db.medicineList ?? []).find((m) => m.medicineId === um.medicineId);
      return { ...um, medicineName: med?.medicineName ?? 'Unknown' };
    });
  })();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => {
    setEditItem(null);
    setFormMedId(db?.medicineList?.[0]?.medicineId ?? '');
    setFormTime('am');
    setShowModal(true);
  };

  const openEdit = (um) => {
    setEditItem(um);
    setFormMedId(um.medicineId);
    setFormTime(um.time);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formMedId) return;
    const newDb = { ...db, userMedicines: [...db.userMedicines] };

    if (editItem) {
      // Update
      const idx = newDb.userMedicines.findIndex((um) => um.id === editItem.id);
      newDb.userMedicines[idx] = { ...newDb.userMedicines[idx], medicineId: formMedId, time: formTime };
    } else {
      // Check duplicate for same user + medicine
      const exists = newDb.userMedicines.some(
        (um) => um.userId === currentUser.userId && um.medicineId === formMedId
      );
      if (exists) {
        showToast('This medicine is already in your list.', 'warning');
        return;
      }
      newDb.userMedicines.push({
        id: generateId('um'),
        userId: currentUser.userId,
        medicineId: formMedId,
        taken: 0,
        time: formTime,
      });
    }

    try {
      await saveDb(newDb);
      setShowModal(false);
      showToast(editItem ? 'Medicine updated!' : 'Medicine added!');
    } catch {
      showToast('Failed to save.', 'danger');
    }
  };

  const handleDelete = async (umId) => {
    if (!window.confirm('Remove this medicine from your list?')) return;
    const newDb = { ...db, userMedicines: db.userMedicines.filter((um) => um.id !== umId) };
    try {
      await saveDb(newDb);
      showToast('Medicine removed.');
    } catch {
      showToast('Failed to remove.', 'danger');
    }
  };

  const availableMeds = db?.medicineList ?? [];

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

      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="section-title">User Medicine</div>
          <div className="section-subtitle">Manage your personal medicine schedule</div>
        </div>
        <button
          className="btn btn-primary btn-sm d-flex align-items-center gap-1"
          style={{ borderRadius: 8 }}
          onClick={openAdd}
        >
          <i className="bi bi-plus-lg" /> Add Medicine
        </button>
      </div>

      {userMeds.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-prescription2" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
          <div className="mt-2">No medicines yet. Click <strong>Add Medicine</strong> to get started.</div>
        </div>
      ) : (
        <div className="table-card">
          <table className="table table-hover mb-0">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th className="small text-muted fw-500 ps-3">Medicine</th>
                <th className="small text-muted fw-500">Schedule</th>
                <th className="small text-muted fw-500">Status</th>
                <th className="small text-muted fw-500 text-end pe-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userMeds.map((med) => (
                <tr key={med.id}>
                  <td className="ps-3">
                    <div className="fw-500" style={{ fontSize: '0.9rem' }}>{med.medicineName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{med.medicineId}</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        med.time === 'am' ? 'badge-am' : med.time === 'noon' ? 'badge-noon' : 'badge-pm'
                      }`}
                      style={{ borderRadius: 6, fontSize: '0.78rem' }}
                    >
                      {TIME_LABELS[med.time]}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${med.taken ? 'bg-success' : 'bg-light text-muted border'}`} style={{ borderRadius: 6, fontSize: '0.75rem' }}>
                      {med.taken ? 'Taken' : 'Pending'}
                    </span>
                  </td>
                  <td className="text-end pe-3">
                    <button
                      className="btn btn-icon btn-outline-primary me-1"
                      onClick={() => openEdit(med)}
                      disabled={loading}
                      title="Edit"
                    >
                      <i className="bi bi-pencil" style={{ fontSize: '0.8rem' }} />
                    </button>
                    <button
                      className="btn btn-icon btn-outline-danger"
                      onClick={() => handleDelete(med.id)}
                      disabled={loading}
                      title="Remove"
                    >
                      <i className="bi bi-trash" style={{ fontSize: '0.8rem' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-600">
                  <i className={`bi bi-${editItem ? 'pencil' : 'plus-circle'} me-2 text-primary`} />
                  {editItem ? 'Edit Medicine' : 'Add Medicine'}
                </h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-500">Medicine</label>
                  <select
                    className="form-select"
                    value={formMedId}
                    onChange={(e) => setFormMedId(e.target.value)}
                  >
                    {availableMeds.map((m) => (
                      <option key={m.medicineId} value={m.medicineId}>{m.medicineName}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-500">Time of Day</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {TIMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`btn btn-sm ${formTime === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                        style={{ borderRadius: 8, flex: 1 }}
                        onClick={() => setFormTime(t)}
                      >
                        {TIME_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light btn-sm" style={{ borderRadius: 8 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 8 }}
                  onClick={handleSave}
                  disabled={loading || !formMedId}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" /> : editItem ? 'Save Changes' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
