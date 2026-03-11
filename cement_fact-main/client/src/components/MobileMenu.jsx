import React from 'react';
import { Link } from 'react-router-dom';

export default function MobileMenu({ open, onClose }) {
  return (
    <>
      <div
        className={`mobile-menu-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="mobile-menu-header">
          <div className="mobile-brand">A.R.M & CO</div>
          <button className="mobile-close" onClick={onClose} aria-label="Close menu">
            ✕
          </button>
        </div>

        <div className="mobile-search">
          <input placeholder="Search products..." aria-label="Search" />
        </div>

        <nav className="mobile-nav">
          <ul>
            <li>
              <Link to="/" onClick={onClose}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/" onClick={onClose}>
                Products
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={onClose}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={onClose}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
