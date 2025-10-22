// Header component with logo and responsive design
// Shows full logo on desktop, only image on mobile

import React from 'react';
import '../styles/Header.css';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img src="/bh-ig-logo.png" alt="Beacon House" className="logo" />
        </div>
      </div>
    </header>
  );
};
