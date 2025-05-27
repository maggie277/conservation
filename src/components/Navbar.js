import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [click, setClick] = useState(false);
  const hideNavbarPaths = ['/', '/login', '/register'];

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  // Helper to check if a path is active or partially active (for nested routes)
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`navbar ${click ? 'mobile-menu-open' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          TerraFund Zambia
        </Link>
        <div className="menu-icon" onClick={handleClick}>
          <div className={click ? 'menu-bar change' : 'menu-bar'}></div>
          <div className={click ? 'menu-bar change' : 'menu-bar'}></div>
          <div className={click ? 'menu-bar change' : 'menu-bar'}></div>
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-links ${isActive('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/projects"
              className={`nav-links ${isActive('/projects') ? 'active' : ''}`}
              onClick={closeMobileMenu}
              id="mobile-projects-nav-button"
            >
              Farm Projects
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/farmers-forum"
              className={`nav-links ${isActive('/farmers-forum') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Farmers Forum
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/projects/upload-project"
              className={`nav-links ${isActive('/projects/upload-project') ? 'active' : ''}`}
              onClick={closeMobileMenu}
              id="mobile-upload-nav-button"
            >
              Submit Project
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/help-center"
              className={`nav-links ${isActive('/help-center') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Help Center
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/profile"
              className={`nav-links ${isActive('/profile') ? 'active' : ''}`}
              onClick={closeMobileMenu}
              id="mobile-profile-nav-button"
            >
              My Farm
            </Link>
          </li>
        </ul>

        {/* Desktop navigation elements with IDs */}
        <div className="desktop-nav-elements">
          <Link
            to="/projects"
            className={`nav-links ${isActive('/projects') ? 'active' : ''}`}
            id="projects-nav-button"
            style={{ display: 'none' }}
          >
            Farm Projects
          </Link>
          <Link
            to="/projects/upload-project"
            className={`nav-links ${isActive('/projects/upload-project') ? 'active' : ''}`}
            id="upload-nav-button"
            style={{ display: 'none' }}
          >
            Submit Project
          </Link>
          <Link
            to="/profile"
            className={`nav-links ${isActive('/profile') ? 'active' : ''}`}
            id="profile-nav-button"
            style={{ display: 'none' }}
          >
            My Farm
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
