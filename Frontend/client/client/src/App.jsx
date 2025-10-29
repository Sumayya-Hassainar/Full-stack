import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import Requests from './components/Request';
import { getUserFromToken, clearToken } from './api';
import './App.css'

function PrivateRoute({ children }) {
  const user = getUserFromToken();
  if(!user) return <Navigate to="/auth" />;
  return children;
}

export default function App(){
  const user = getUserFromToken();
  return (
    <BrowserRouter>
      <nav style={{ padding: 10, borderBottom: '1px solid #ddd' }}>
        <Link to="/dashboard" style={{ marginRight: 10 }}>Dashboard</Link>
        <Link to="/marketplace" style={{ marginRight: 10 }}>Marketplace</Link>
        <Link to="/requests" style={{ marginRight: 10 }}>Requests</Link>
        {user ? <button onClick={()=>{ clearToken(); window.location.href='/auth'; }}>Logout</button> : <Link to="/auth">Login</Link>}
      </nav>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
        <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
