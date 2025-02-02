import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Donate from './components/Donate';
import Payment from './components/Payment';
import Receipt from './components/Receipt';
import Home from './components/Home';
import Profile from './components/Profile';
import Share from './components/Share';
import Navbar from './components/Navbar';
import UploadProject from './components/UploadProject'; // Import UploadProject
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content"> {/* Ensures content is below navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/donate/:projectId" element={<Donate />} />
          <Route path="/payment/:projectId" element={<Payment />} />
          <Route path="/receipt/:projectId" element={<Receipt />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/share" element={<Share />} />
          <Route path="/projects/upload-project" element={<UploadProject />} /> {/* Added route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
