import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const TIME_LABELS = { am: 'Morning', noon: 'Noon', pm: 'Evening' };
const TIME_ICONS  = { am: 'sunrise', noon: 'sun', pm: 'moon-stars' };
const TIME_BADGE  = { am: 'badge-am', noon: 'badge-noon', pm: 'badge-pm' };

export default function TrackerPage() {
  const { db, saveDb, currentUser, loading } = useApp();
  const [toast, setToast] = useState(null);

  // Derive directly from db on every render — no stale local state
  const userMeds = (() => {
    if (!db) return [];
    // Deduplicate by id before joining
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

  const toggleTaken = async (umId) => {
    const newDb = { ...db };
    const idx = newDb.userMedicines.findIndex((um) => um.id === umId);
    if (idx === -1) return;
    const current = newDb.userMedicines[idx].taken;
    newDb.userMedicines[idx] = { ...newDb.userMedicines[idx], taken: current ? 0 : 1 };

    // Adjust inventory
    const medId = newDb.userMedicines[idx].medicineId;
    const invIdx = newDb.medicineInventory.findIndex((i) => i.medicineId === medId);
    if (invIdx !== -1) {
      const delta = current ? 1 : -1; // undo → add back, marking → subtract
      const newQty = newDb.medicineInventory[invIdx].quantity + delta;
      newDb.medicineInventory[invIdx] = { ...newDb.medicineInventory[invIdx], quantity: Math.max(0, newQty) };
    }

    try {
      await saveDb(newDb);
      showToast(current ? 'Marked as not taken.' : 'Medicine marked as taken!');
    } catch {
      showToast('Failed to save. Please try again.', 'danger');
    }
  };

  const resetAll = async () => {
    if (!window.confirm('Reset all taken status for today?')) return;
    const newDb = { ...db };
    newDb.userMedicines = newDb.userMedicines.map((um) =>
      um.userId === currentUser.userId ? { ...um, taken: 0 } : um
    );
    try {
      await saveDb(newDb);
      showToast('All medicines reset!');
    } catch {
      showToast('Failed to reset.', 'danger');
    }
  };

  const takenCount = userMeds.filter((m) => m.taken).length;
  const total = userMeds.length;
  const pct = total ? Math.round((takenCount / total) * 100) : 0;

  const byTime = ['am', 'noon', 'pm'].reduce((acc, t) => {
    acc[t] = userMeds.filter((m) => m.time === t);
    return acc;
  }, {});

  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type} position-fixed`}
          style={{ top: 80, right: 20, zIndex: 9999, minWidth: 240, borderRadius: 12 }}
        >
          {toast.type === 'success'
            ? <i className="bi bi-check-circle me-2" />
            : <i className="bi bi-exclamation-triangle me-2" />
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <div className="section-title">Medicine Tracker</div>
          <div className="section-subtitle">{today}</div>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          style={{ borderRadius: 8 }}
          onClick={resetAll}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise" /> Reset Day
        </button>
      </div>

      {/* Progress */}
      <div className="stat-card mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <div className="fw-600" style={{ fontSize: '0.9rem' }}>Today's Progress</div>
            <div className="text-muted small">{takenCount} of {total} medicines taken</div>
          </div>
          <div
            style={{
              width: 54, height: 54, borderRadius: '50%',
              background: pct === 100 ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#2563eb,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            }}
          >
            {pct}%
          </div>
        </div>
        <div className="progress" style={{ height: 8, borderRadius: 8 }}>
          <div
            className={`progress-bar ${pct === 100 ? 'bg-success' : 'bg-primary'}`}
            style={{ width: `${pct}%`, borderRadius: 8, transition: 'width 0.5s ease' }}
          />
        </div>
        {pct === 100 && (
          <div className="text-success small mt-2 fw-500">
            <i className="bi bi-check-circle-fill me-1" /> All done for today! 🎉
          </div>
        )}
      </div>

      {/* By time group */}
      {total === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-capsule" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
          <div className="mt-2">No medicines assigned. Go to <strong>User Medicine</strong> to add some.</div>
        </div>
      ) : (
        ['am', 'noon', 'pm'].map((time) => {
          const meds = byTime[time];
          if (!meds.length) return null;
          return (
            <div key={time} className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className={`bi bi-${TIME_ICONS[time]} text-primary`} />
                <span className="fw-600" style={{ fontSize: '0.9rem' }}>{TIME_LABELS[time]}</span>
                <span className="badge bg-light text-muted border" style={{ borderRadius: 6, fontSize: '0.72rem' }}>
                  {meds.filter((m) => m.taken).length}/{meds.length}
                </span>
              </div>
              <div className="table-card">
                <table className="table table-hover mb-0">
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th className="small text-muted fw-500 ps-3" style={{ width: 40 }}>Done</th>
                      <th className="small text-muted fw-500">Medicine</th>
                      <th className="small text-muted fw-500">Time</th>
                      <th className="small text-muted fw-500">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meds.map((med) => {
                      const inv = db?.medicineInventory?.find((i) => i.medicineId === med.medicineId);
                      return (
                        <tr key={med.id} className={med.taken ? 'taken-row' : ''}>
                          <td className="ps-3">
                            <div className="form-check mb-0">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                style={{ width: 18, height: 18, cursor: 'pointer', borderRadius: 5 }}
                                checked={!!med.taken}
                                onChange={() => toggleTaken(med.id)}
                                disabled={loading}
                              />
                            </div>
                          </td>
                          <td className="fw-500" style={{ fontSize: '0.9rem' }}>{med.medicineName}</td>
                          <td>
                            <span className={`badge ${TIME_BADGE[med.time]}`} style={{ borderRadius: 6, fontSize: '0.75rem' }}>
                              {TIME_LABELS[med.time]}
                            </span>
                          </td>
                          <td>
                            {inv
                              ? <span className={`small ${inv.quantity <= 5 ? 'text-danger fw-600' : 'text-muted'}`}>
                                  {inv.quantity <= 5 && <i className="bi bi-exclamation-triangle-fill me-1" />}
                                  {inv.quantity} left
                                </span>
                              : <span className="text-muted small">—</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
