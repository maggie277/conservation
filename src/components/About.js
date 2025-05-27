import React from 'react';
import './About.css';
import aboutImage from '../pictures/about.jpg'; 
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Our Mission</h1>
          <p>Empowering Zambian communities through sustainable agriculture</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content">
        <section className="about-section">
          <div className="section-text">
            <h2>Why Sustainable Agriculture Matters</h2>
            <p>
              Zambia faces critical challenges with land degradation and food security. 
              Our platform connects farmers with supporters to fund projects that:
            </p>
            <ul>
              <li>Restore degraded soils through conservation farming</li>
              <li>Provide access to drought-resistant seeds and tools</li>
              <li>Train communities in sustainable land management</li>
              <li>Support women-led farming cooperatives</li>
            </ul>
          </div>
          <div className="section-image">
            <img src={aboutImage} alt="Zambian farmers practicing conservation agriculture" />
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-card">
            <h3>1200+</h3>
            <p>Farmers Supported</p>
          </div>
          <div className="stat-card">
            <h3>500+ Hectares</h3>
            <p>Land Restored</p>
          </div>
          <div className="stat-card">
            <h3>85%</h3>
            <p>Success Rate</p>
          </div>
        </section>

        <section className="how-it-works">
          <h2>How TerraFund Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Farmers Submit Projects</h3>
              <p>Local farmers and cooperatives propose sustainable agriculture initiatives.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Community Verification</h3>
              <p>Our partner NGOs vet each project for impact and feasibility.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Funding & Implementation</h3>
              <p>Donors contribute directly to projects they believe in.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Join the Movement</h2>
          <p>Be part of Zambia's agricultural transformation</p>
          <div className="cta-buttons">
            <Button 
              variant="contained" 
              onClick={() => navigate('/register')}
              className="cta-button"
            >
              Register as a Farmer
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/projects')}
              className="cta-button"
            >
              Browse Projects
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;