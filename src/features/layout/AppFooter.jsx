import React from 'react';
import { RouteLink } from '../../components/Router';

export function AppFooter() {
  return (
    <footer className='app-footer'>
      <nav className='footer-links' aria-label='Footer links'>
        <RouteLink to='/'>Home</RouteLink>
        <RouteLink to='/privacy-policy'>Privacy Policy</RouteLink>
        <RouteLink to='/terms'>Terms & Conditions</RouteLink>
        <RouteLink to='/documentation'>Documentation</RouteLink>
      </nav>
     <p>
  Built with ❤️ in  🇦🇪 UAE by 
             <a href="https://ecashbiz.com/landing" target="_blank">
       eCashbiz ERP
  </a>
</p>
    </footer>
  );
}
