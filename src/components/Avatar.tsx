// Avatar component
// Displays user initials in a circular avatar with gradient background

import React from 'react';
import '../styles/Avatar.css';

interface AvatarProps {
  email: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ email, onClick }) => {
  const getInitials = (email: string): string => {
    if (!email) return 'U';

    // Extract first letter before @ symbol
    const username = email.split('@')[0];

    // Get first letter, capitalize it
    const firstLetter = username.charAt(0).toUpperCase();

    // If username has multiple parts (e.g., first.last), get both initials
    const parts = username.split(/[._-]/);
    if (parts.length > 1) {
      const secondLetter = parts[1].charAt(0).toUpperCase();
      return firstLetter + secondLetter;
    }

    return firstLetter;
  };

  const initials = getInitials(email);

  return (
    <div
      className="avatar"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      title={email}
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  );
};
