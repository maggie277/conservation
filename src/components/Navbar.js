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
        <Link to="/" className="navbar-logo">Conservation Hub</Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links" id="home-button">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/projects" className="nav-links" id="projects-button">Projects</Link>
          </li>
          <li className="nav-item">
            <Link to="/projects/upload-project" className="nav-links" id="upload-button">Upload</Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-links" id="profile-button">Profile</Link>
          </li>
          <li className="nav-item">
            <Link to="/help-center" className="nav-links">Help Center</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;