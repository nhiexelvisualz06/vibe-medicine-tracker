import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AdminMedicinesPage() {
  const { db, saveDb, loading } = useApp();
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [fName, setFName] = useState('');
  const [fQty, setFQty] = useState(0);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const openAdd = () => {
    setEditMed(null); setFName(''); setFQty(30);
    setShowModal(true);
  };

  const openEdit = (med) => {
    const inv = db.medicineInventory.find((i) => i.medicineId === med.medicineId);
    setEditMed(med);
    setFName(med.medicineName);
    setFQty(inv?.quantity ?? 0);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!fName.trim()) { showToast('Medicine name is required.', 'warning'); return; }
    const newDb = {
      ...db,
      medicineList: [...db.medicineList],
      medicineInventory: [...db.medicineInventory],
    };

    if (editMed) {
      const mIdx = newDb.medicineList.findIndex((m) => m.medicineId === editMed.medicineId);
      newDb.medicineList[mIdx] = { ...newDb.medicineList[mIdx], medicineName: fName.trim() };

      const iIdx = newDb.medicineInventory.findIndex((i) => i.medicineId === editMed.medicineId);
      if (iIdx !== -1) {
        newDb.medicineInventory[iIdx] = { ...newDb.medicineInventory[iIdx], quantity: Number(fQty) };
      } else {
        newDb.medicineInventory.push({ id: generateId('mi'), medicineId: editMed.medicineId, quantity: Number(fQty) });
      }
    } else {
      const newMedId = generateId('m');
      newDb.medicineList.push({ medicineId: newMedId, medicineName: fName.trim() });
      newDb.medicineInventory.push({ id: generateId('mi'), medicineId: newMedId, quantity: Number(fQty) });
    }

    try {
      await saveDb(newDb);
      setShowModal(false);
      showToast(editMed ? 'Medicine updated!' : 'Medicine added!');
    } catch {
      showToast('Failed to save.', 'danger');
    }
  };

  const handleDelete = async (medId) => {
    if (!window.confirm('Delete this medicine? It will be removed from all users.')) return;
    const newDb = {
      ...db,
      medicineList: db.medicineList.filter((m) => m.medicineId !== medId),
      medicineInventory: db.medicineInventory.filter((i) => i.medicineId !== medId),
      userMedicines: db.userMedicines.filter((um) => um.medicineId !== medId),
    };
    try {
      await saveDb(newDb);
      showToast('Medicine deleted.');
    } catch {
      showToast('Failed to delete.', 'danger');
    }
  };

  const enriched = (db?.medicineList ?? []).map((m) => {
    const inv = db?.medicineInventory?.find((i) => i.medicineId === m.medicineId);
    const usersCount = db?.userMedicines?.filter((um) => um.medicineId === m.medicineId).length ?? 0;
    return { ...m, quantity: inv?.quantity ?? 0, usersCount };
  });

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} position-fixed`} style={{ top: 80, right: 20, zIndex: 9999, minWidth: 240, borderRadius: 12 }}>
          {toast.msg}
        </div>
      )}

      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <div className="section-title">Medicine Settings</div>
          <div className="section-subtitle">Manage medicine list and inventory</div>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" style={{ borderRadius: 8 }} onClick={openAdd}>
          <i className="bi bi-plus-lg" /> Add Medicine
        </button>
      </div>

      <div className="table-card">
        <table className="table table-hover mb-0">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th className="small text-muted fw-500 ps-3">Medicine</th>
              <th className="small text-muted fw-500">Stock</th>
              <th className="small text-muted fw-500">Users</th>
              <th className="small text-muted fw-500 text-end pe-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((med) => (
              <tr key={med.medicineId}>
                <td className="ps-3">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: '#eff6ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#2563eb', fontSize: '1rem', flexShrink: 0,
                    }}>
                      <i className="bi bi-capsule-pill" />
                    </div>
                    <div>
                      <div className="fw-500" style={{ fontSize: '0.9rem' }}>{med.medicineName}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{med.medicineId}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${med.quantity <= 5 ? 'bg-danger' : med.quantity <= 15 ? 'bg-warning text-dark' : 'bg-success'}`} style={{ borderRadius: 6, fontSize: '0.78rem' }}>
                    {med.quantity} units
                  </span>
                </td>
                <td>
                  <span className="badge bg-light text-muted border" style={{ borderRadius: 6, fontSize: '0.75rem' }}>
                    <i className="bi bi-person me-1" />{med.usersCount}
                  </span>
                </td>
                <td className="text-end pe-3">
                  <button className="btn btn-icon btn-outline-primary me-1" onClick={() => openEdit(med)} disabled={loading} title="Edit">
                    <i className="bi bi-pencil" style={{ fontSize: '0.8rem' }} />
                  </button>
                  <button className="btn btn-icon btn-outline-danger" onClick={() => handleDelete(med.medicineId)} disabled={loading} title="Delete">
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
                  <i className={`bi bi-capsule-pill me-2 text-primary`} />
                  {editMed ? 'Edit Medicine' : 'Add Medicine'}
                </h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-500">Medicine Name</label>
                  <input className="form-control" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Metformin 500mg" />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-500">Stock Quantity</label>
                  <input type="number" min={0} className="form-control" value={fQty} onChange={(e) => setFQty(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light btn-sm" style={{ borderRadius: 8 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }} onClick={handleSave} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : editMed ? 'Save Changes' : 'Add Medicine'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
