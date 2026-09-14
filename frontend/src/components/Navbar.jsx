import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, ShieldCheck, Building2, SlidersHorizontal, Scale, Upload, Home } from 'lucide-react';
import DatasetUploadModal from './DatasetUploadModal';

export default function Navbar() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeDatasetLabel, setActiveDatasetLabel] = useState('Demonstration Benchmark Data');

  const navItems = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cases', label: 'Investigation Queue', icon: ShieldAlert },
    { to: '/vendors', label: 'Vendor Directory', icon: Building2 },
    { to: '/settings', label: 'Model Calibration', icon: SlidersHorizontal },
  ];

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3 lg:h-16 gap-3 lg:gap-0">
            
            {/* Logo & Platform Info */}
            <NavLink to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center shadow-lg shadow-cyan-900/30 border border-cyan-400/20 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6 text-cyan-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-white tracking-wide">Procure<span className="text-cyan-400">Guard</span></span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                    Audit AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Public Procurement Oversight & Anomaly Intelligence</p>
              </div>
            </NavLink>

            {/* Navigation Links */}
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 no-scrollbar flex-1 min-w-0 lg:justify-center mx-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Upload Dataset Button & Active Dataset Badge */}
            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>{activeDatasetLabel}</span>
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 text-xs font-semibold transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      <DatasetUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => setActiveDatasetLabel('Real-World Uploaded Data')}
      />
    </>
  );
}
