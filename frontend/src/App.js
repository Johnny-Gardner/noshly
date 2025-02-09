import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index'; // Landing page
import LoginPage from './pages/LoginPage'; // Login page
import RegisterPage from './pages/RegisterPage'; // Register page
import Dashboard from './pages/Dashboard'; // Dashboard content
import Analytics from './pages/Analytics'; // Analytics page
import Settings from './pages/Settings';
import Profile from './pages/ProfilePage';
import AdminPortal from './pages/AdminPortal';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import Layout from './components/Layout'; // Layout with top bar and sidebar

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/updatepassword" element={<UpdatePassword />} />

        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/adminportal" element={<AdminPortal />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
