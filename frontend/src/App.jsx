import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import InvestigationQueue from './pages/InvestigationQueue';
import CaseDetail from './pages/CaseDetail';
import VendorDirectory from './pages/VendorDirectory';
import VendorProfile from './pages/VendorProfile';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<InvestigationQueue />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/vendors" element={<VendorDirectory />} />
            <Route path="/vendors/:id" element={<VendorProfile />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs font-mono text-slate-500">
          ProcureGuard Audit Intelligence • Hackathon SDG 16: Peace, Justice & Strong Institutions
        </footer>
      </div>
    </Router>
  );
}

