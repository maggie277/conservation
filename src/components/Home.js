import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="welcome-message">
        TerraFund Zambia
      </div>
      <div className="tagline">
        Crowdfunding for Sustainable Farms and Healthy Land
      </div>
      <div className="home-buttons">
        <button 
          className="home-button" 
          onClick={() => window.location.href='/register'}
        >
          Join as a Farmer
        </button>
        <button 
          className="home-button" 
          onClick={() => window.location.href='/login'}
        >
          Login
        </button>
        <button
          className="home-button secondary"
          onClick={() => window.location.href='/about'}
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default Home;