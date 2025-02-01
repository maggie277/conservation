import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">MyApp</Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/projects" className="nav-links">Projects</Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-links">Profile</Link>
          </li>
          <li className="nav-item">
            <Link to="/share" className="nav-links">Share</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
