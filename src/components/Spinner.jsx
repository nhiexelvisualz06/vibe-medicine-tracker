import React from 'react';

export default function Spinner() {
  return (
    <div className="spinner-overlay">
      <div className="text-center">
        <div className="spinner-border text-primary mb-2" role="status" />
        <div className="text-muted small">Loading…</div>
      </div>
    </div>
  );
}
