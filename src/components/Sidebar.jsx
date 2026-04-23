import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const PAGES = {
  TRACKER: 'tracker',
  USER_MEDICINE: 'user_medicine',
  PROFILE: 'profile',
  ADMIN_USERS: 'admin_users',
  ADMIN_MEDICINES: 'admin_medicines',
};

export { PAGES };

export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  const { currentUser, logout } = useApp();
  const isAdmin = currentUser?.role === 1;
  const [adminOpen, setAdminOpen] = useState(
    activePage === PAGES.ADMIN_USERS || activePage === PAGES.ADMIN_MEDICINES
  );

  const navLink = (page, icon, label) => {
    const active = activePage === page;
    return (
      <li className="nav-item">
        <a
          className={`nav-link${active ? ' active' : ''}`}
          onClick={() => { onNavigate(page); onClose(); }}
          role="button"
        >
          <i className={`bi bi-${icon}`} />
          {label}
        </a>
      </li>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="sidebar-overlay"
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={onClose}
      />

      <nav className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand d-flex align-items-center gap-2">
          <i className="bi bi-capsule text-primary" />
          MedTracker
        </div>

        {/* User info */}
        <div className="sidebar-user">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
              }}
            >
              {currentUser?.nameToUse?.[0] ?? '?'}
            </div>
            <div>
              <div className="user-name">{currentUser?.nameToUse}</div>
              <div className="user-role">{isAdmin ? 'Administrator' : 'User'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <ul className="sidebar-nav list-unstyled">
          {navLink(PAGES.TRACKER, 'check2-circle', 'Tracker')}
          {navLink(PAGES.USER_MEDICINE, 'prescription2', 'User Medicine')}
          {navLink(PAGES.PROFILE, 'person-circle', 'Profile')}

          {isAdmin && (
            <li className="nav-item">
              <a
                className={`nav-link${adminOpen ? ' active' : ''}`}
                onClick={() => setAdminOpen(!adminOpen)}
                role="button"
              >
                <i className="bi bi-shield-lock" />
                Admin Panel
                <i className={`bi bi-chevron-${adminOpen ? 'up' : 'down'} ms-auto`} style={{ fontSize: '0.75rem' }} />
              </a>

              {adminOpen && (
                <ul className="sub-nav list-unstyled mt-1">
                  <li className="nav-item">
                    <a
                      className={`nav-link${activePage === PAGES.ADMIN_USERS ? ' active' : ''}`}
                      onClick={() => { onNavigate(PAGES.ADMIN_USERS); onClose(); }}
                      role="button"
                    >
                      <i className="bi bi-people" />
                      User Settings
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link${activePage === PAGES.ADMIN_MEDICINES ? ' active' : ''}`}
                      onClick={() => { onNavigate(PAGES.ADMIN_MEDICINES); onClose(); }}
                      role="button"
                    >
                      <i className="bi bi-capsule-pill" />
                      Medicine Settings
                    </a>
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>

        {/* Footer logout */}
        <div className="sidebar-footer">
          <button
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: 10 }}
            onClick={logout}
          >
            <i className="bi bi-box-arrow-left" />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
