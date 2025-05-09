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

  return (
    <nav className="navbar">
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
            <Link to="/" className="nav-links" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/projects" className="nav-links" onClick={closeMobileMenu}>
              Farm Projects
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/farmers-forum" className="nav-links" onClick={closeMobileMenu}>
              Farmers Forum
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/projects/upload-project" className="nav-links" onClick={closeMobileMenu}>
              Submit Project
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/help-center" className="nav-links" onClick={closeMobileMenu}>
              Help Center
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-links" onClick={closeMobileMenu}>
              My Farm
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;