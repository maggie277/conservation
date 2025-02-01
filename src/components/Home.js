import React from 'react';
import homeImage from '../pictures/home-image.jpg';

const Home = () => {
  return (
    <div className="container">
      <img src={homeImage} alt="Welcome" className="home-image" />
      <div className="overlay">
        <h1>Welcome to Our Platform</h1>
        <div className="home-links">
          <a href="/register">Sign Up</a>
          <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Home;
