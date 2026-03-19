import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section footer-about">
            <h3>Reach Us</h3>
            <p className="brand"><strong>A.R.M. & Co.</strong></p>
            <p className="address">TS No.2154/2, NORTH MAIN STREET, PUDUKKOTTAI 31/1,2, PATTATHAMMAL STREET AIRPORT, TRICHIRAPALLI, 620007, Pudukkottai, Tamil Nadu, India</p>
            <p className="owner"><strong>Owner:</strong> Shaikh Mohammad</p>
            <div className="footer-actions">
              <button className="btn btn-secondary" onClick={() => window.open('https://maps.google.com', '_blank')}>Get Directions</button>
              <button className="btn" onClick={() => window.location.href = 'tel:8838052328'}>Call Us</button>
            </div>
          </div>

          <div className="footer-section footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a className="interactive" href="/">Products</a></li>
              <li><a className="interactive" href="/about">About us</a></li>
              <li><a className="interactive" href="/orders">Orders</a></li>
              <li><a className="interactive" href="/profile">Profile</a></li>
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h4>Contact</h4>
            <p className="contact-item">Phone: <a className="interactive" href="tel:8838052328">8838052328</a></p>
            <p className="contact-item">Email: <a className="interactive" href="mailto:info@armco.com">info@armco.com</a></p>
            <div className="social-icons">
              <button className="social-icon" aria-label="facebook" onClick={() => window.open('https://facebook.com', '_blank')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.33 2 2 6.48 2 12.07 2 17.04 5.66 21.1 10.44 22v-7.02H8.11v-2.9h2.33V9.01c0-2.3 1.36-3.56 3.45-3.56.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.9h-2.1V22C18.34 21.1 22 17.04 22 12.07z" fill="currentColor"/></svg>
              </button>
              <button className="social-icon" aria-label="instagram" onClick={() => window.open('https://instagram.com', '_blank')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm5.2-3.6a1.12 1.12 0 11-1.12 1.12A1.12 1.12 0 0117.2 4.6z" fill="currentColor"/></svg>
              </button>
              <button className="social-icon" aria-label="email" onClick={() => window.location.href = 'mailto:info@armco.com'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          <div className="footer-section footer-newsletter">
            <h4>Newsletter</h4>
            <p className="muted">Get updates on new products and offers.</p>
            <div className="newsletter">
              <input type="email" placeholder="Your email" aria-label="email" />
              <button className="btn-primary" onClick={() => alert('Subscribed (demo)')}>Subscribe</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 A.R.M & CO Retails of Cement & Steel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}