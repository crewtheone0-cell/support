import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import SubmitTicket from './pages/SubmitTicket';
import AdminDashboard from './pages/AdminDashboard';
import CheckStatus from './pages/CheckStatus';
import { useTickets } from './context/TicketContext';

const App: React.FC = () => {
  const { isAuthenticated } = useTickets();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit-ticket" element={<SubmitTicket />} />
          <Route path="/check-status" element={<CheckStatus />} />
          <Route 
            path="/admin" 
            element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;