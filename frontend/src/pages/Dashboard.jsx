import React, { useEffect, useState } from 'react';
import { fetchStats } from '../services/api';
import { Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { ShieldAlert, DollarSign, FileText, CheckCircle, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-mono text-slate-400">Evaluating Procurement Datasets & Graphs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Connection Issue</h3>
        <p className="text-sm text-slate-300 mt-1 mb-4">{error}</p>
        <button onClick={loadStats} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm">
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, categoryRiskHeatmap, showcaseCases } = stats;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-xs font-mono mb-4">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Assisted Anomaly Detection Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Institutional Procurement Audit & Anomaly Intelligence
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed font-sans">
            ProcureGuard helps government oversight auditors identify procurement activity requiring human investigation. Everything is transparently framed as <span className="text-cyan-300 font-semibold">"flagged for review"</span> using peer-group statistics and graph community analysis.
          </p>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Total Tenders</span>
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{summary.totalTenders}</div>
          <p className="text-xs text-slate-400 mt-1">Across 6 procurement categories</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Flagged for Review</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">{summary.totalFlaggedCases}</div>
          <p className="text-xs text-amber-300/80 mt-1">{summary.highRiskCount} high priority cases</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Total Value at Risk</span>
            <DollarSign className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 font-mono">
            ${(summary.totalValueAtRisk / 1000000).toFixed(2)}M
          </div>
          <p className="text-xs text-slate-400 mt-1">Sum of flagged tender estimates</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Auditor Determinations</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-300 font-mono">{summary.auditorActionedCount}</div>
          <p className="text-xs text-slate-400 mt-1">Cases reviewed by auditors</p>
        </div>

      </div>

      {/* Embedded Anomaly Showcase Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Synthetic Embedded Anomaly Showcase</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Demonstration cases embedded in synthetic data for live hackathon evaluation</p>
          </div>
          <Link to="/cases" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold">
            <span>View Full Investigation Queue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showcaseCases.map((item) => (
            <div key={item.tenderId} className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                    {item.tender.category}
                  </span>
                  <RiskBadge score={item.compositeScore} />
                </div>
                <h3 className="text-base font-semibold text-white mt-3 line-clamp-1">{item.tender.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2 font-mono">
                  <span>Est: ${item.tender.estimatedValue.toLocaleString()}</span>
                  <span>Winner: {item.winningVendor ? item.winningVendor.name : 'N/A'}</span>
                </div>

                <div className="mt-3 space-y-1">
                  {item.triggerReasons.slice(0, 2).map((r, idx) => (
                    <div key={idx} className="text-xs text-amber-300/90 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1 rounded">
                      • {r.rule}: {r.description}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">{item.bidsCount} Bids Submitted</span>
                <Link
                  to={`/cases/${item.tenderId}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <span>Investigate Case</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Risk Heatmap Chart */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Category Risk & Benchmark Distribution</h2>
          <p className="text-xs text-slate-400 font-mono">Comparison of total tenders vs. flagged cases across procurement sectors</p>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryRiskHeatmap} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              <Bar dataKey="totalTenders" name="Total Sector Tenders" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="flaggedCount" name="Flagged for Audit Review" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
