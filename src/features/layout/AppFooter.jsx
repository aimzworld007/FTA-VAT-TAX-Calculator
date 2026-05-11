import React from 'react';
import { RouteLink } from '../../components/Router';

export function AppFooter() {
  return (
    <footer className='app-footer'>
      <nav className='footer-links' aria-label='Footer links'>
        <RouteLink to='/'>Back to Home</RouteLink>
        <RouteLink to='/privacy-policy'>Privacy Policy</RouteLink>
        <RouteLink to='/terms'>Terms & Conditions</RouteLink>
        <RouteLink to='/documentation'>Documentation</RouteLink>
      </nav>
      <p>This tool is for calculation assistance and record preparation only. Please verify all figures with official UAE FTA guidance before filing.</p>
    </footer>
  );
}
