import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="nlc-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Document Tracker</h4>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/public-documents">My Documents</a></li>
            <li><a href="/alerts">Alerts</a></li>
            <li><a href="/reports">Reports</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>NLC India Limited</p>
          <p>Corporate Office, Neyveli Township</p>
          <p>Phone: +91 44 2235 0135</p>
          <p>Email: info@nlcindia.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} NLC India Limited. All Rights Reserved.</p>
        <div className="footer-social">
          <a href="https://facebook.com/nlcindia" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com/nlcindia" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://linkedin.com/company/nlcindia" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
