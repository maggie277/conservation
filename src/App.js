import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import Payment from './components/Payment';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/new-project" element={<ProjectForm />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;
