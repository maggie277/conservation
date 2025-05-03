import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login', '/register'];

  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">TerraFund Zambia</Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/projects" className="nav-links">Farm Projects</Link>
          </li>
          <li className="nav-item">
            <Link to="/farmers-forum" className="nav-links">Farmers Forum</Link>
          </li>
          <li className="nav-item">
            <Link to="/projects/upload-project" className="nav-links">Submit Project</Link>
          </li>
          <li className="nav-item">
            <Link to="/help-center" className="nav-links">Help Center</Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-links">My Farm</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;