import React from 'react';
import './Spinner.css';

const Spinner = () => {
    return (
        <div className="spinner-container">
            <div className="spinner-circle"></div>
            <p>Loading farm data...</p>
        </div>
    );
};

export default Spinner;