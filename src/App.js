import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Donate from './components/Donate';
import Payment from './components/Payment';
import Receipt from './components/Receipt'; // Import the Receipt component
import Home from './components/Home';
import Profile from './components/Profile';
import Navbar from './components/Navbar'; // Import the Navbar component
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/donate/:projectId" element={<Donate />} />
        <Route path="/payment/:projectId" element={<Payment />} />
        <Route path="/receipt/:projectId" element={<Receipt />} /> {/* Add Receipt route */}
        <Route path="/profile" element={<Profile />} /> {/* Add Profile route */}
      </Routes>
    </Router>
  );
}

export default App;
