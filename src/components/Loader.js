import React from "react";
import { CircularProgress } from '@mui/material';
import './Loader.css';

const Loader = ({ loading }) => {
  return (
    <div className="loader-container">
      <CircularProgress 
        size={60}
        thickness={4}
        sx={{
          color: '#2E8B57',
          animationDuration: '800ms'
        }}
      />
      <p className="loader-text">Loading farm data...</p>
    </div>
  );
};

export default Loader;