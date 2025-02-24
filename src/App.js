import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Donate from './components/Donate';
import Payment from './components/Payment';
import Receipt from './components/Receipt';
import Profile from './components/Profile';
import HelpCenter from './components/HelpCenter';
import Navbar from './components/Navbar';
import UploadProject from './components/UploadProject';
import PrivateRoute from './components/PrivateRoute';
import Home from './components/Home'; // Import the Home component
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} /> {/* Route for Home component */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          {/* Private Routes (Protected Pages) */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/donate/:projectId" element={<Donate />} />
            <Route path="/payment/:projectId" element={<Payment />} />
            <Route path="/receipt/:projectId" element={<Receipt />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/projects/upload-project" element={<UploadProject />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;