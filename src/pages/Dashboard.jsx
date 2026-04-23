import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar, { PAGES } from '../components/Sidebar';
import Spinner from '../components/Spinner';
import TrackerPage from './TrackerPage';
import UserMedicinePage from './UserMedicinePage';
import ProfilePage from './ProfilePage';
import AdminUsersPage from './AdminUsersPage';
import AdminMedicinesPage from './AdminMedicinesPage';

const PAGE_TITLES = {
  [PAGES.TRACKER]: { label: 'Tracker', icon: 'check2-circle' },
  [PAGES.USER_MEDICINE]: { label: 'User Medicine', icon: 'prescription2' },
  [PAGES.PROFILE]: { label: 'Profile', icon: 'person-circle' },
  [PAGES.ADMIN_USERS]: { label: 'User Settings', icon: 'people' },
  [PAGES.ADMIN_MEDICINES]: { label: 'Medicine Settings', icon: 'capsule-pill' },
};

export default function Dashboard() {
  const { loading, loadDb, currentUser } = useApp();
  const [activePage, setActivePage] = useState(PAGES.TRACKER);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadDb();
  }, [loadDb]);

  const renderPage = () => {
    switch (activePage) {
      case PAGES.TRACKER:          return <TrackerPage />;
      case PAGES.USER_MEDICINE:    return <UserMedicinePage />;
      case PAGES.PROFILE:          return <ProfilePage />;
      case PAGES.ADMIN_USERS:      return <AdminUsersPage />;
      case PAGES.ADMIN_MEDICINES:  return <AdminMedicinesPage />;
      default:                     return <TrackerPage />;
    }
  };

  const pageInfo = PAGE_TITLES[activePage] ?? PAGE_TITLES[PAGES.TRACKER];

  return (
    <div>
      {loading && <Spinner />}

      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-wrapper">
        {/* Topbar */}
        <div className="topbar gap-3">
          {/* Hamburger – mobile only */}
          <button
            className="btn btn-light btn-sm d-lg-none"
            style={{ borderRadius: 8, border: '1px solid #e9ecef' }}
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list" style={{ fontSize: '1.1rem' }} />
          </button>

          <div className="d-flex align-items-center gap-2">
            <i className={`bi bi-${pageInfo.icon} text-primary`} style={{ fontSize: '1.1rem' }} />
            <span className="fw-600" style={{ fontSize: '0.95rem', color: '#1e293b' }}>
              {pageInfo.label}
            </span>
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="text-muted small d-none d-sm-block">
              Hi, <strong>{currentUser?.nameToUse}</strong>
            </span>
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              }}
            >
              {currentUser?.nameToUse?.[0] ?? '?'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
