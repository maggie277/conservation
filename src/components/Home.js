import React from 'react';
import './Home.css'; // Ensure you have a separate CSS file for Home component styles

const Home = () => {
  return (
    <div className="home-container">
      <div className="welcome-message">
        Welcome to Our Platform
      </div>
      <div className="home-buttons">
        <button className="home-button" onClick={() => window.location.href='/register'}>Sign Up</button>
        <button className="home-button" onClick={() => window.location.href='/login'}>Login</button>
      </div>
    </div>
  );
};

export default Home;