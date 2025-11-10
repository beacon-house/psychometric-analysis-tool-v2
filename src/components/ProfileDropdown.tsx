// ProfileDropdown component
// Dropdown menu that appears when clicking the profile avatar

import React, { useEffect, useRef } from 'react';
import '../styles/ProfileDropdown.css';

interface ProfileDropdownProps {
  email: string;
  onSignOut: () => void;
  onClose: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ email, onSignOut, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <div className="dropdown-header">
        <div className="dropdown-user-info">
          <p className="dropdown-label">Signed in as</p>
          <p className="dropdown-email">{email}</p>
        </div>
      </div>
      <div className="dropdown-divider"></div>
      <div className="dropdown-actions">
        <button className="dropdown-action-button" onClick={onSignOut}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
