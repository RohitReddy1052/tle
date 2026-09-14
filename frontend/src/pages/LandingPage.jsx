import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Activity, Search, ShieldAlert, Cpu, Eye, Scale, AlertTriangle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 pb-16 pt-4">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-14 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>AI-Assisted Public Procurement Anomaly Detection System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Follow the Signal. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Investigate the Pattern.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            An AI-assisted procurement auditing platform that helps investigators identify unusual patterns, understand the evidence behind them, and prioritize cases for human review.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-900/40 transition-all hover:scale-[1.02]"
            >
              <span>Explore Overview Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/cases"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-semibold text-sm transition"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Investigation Queue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Restrained Interactive Workflow Diagram */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">End-to-End Audit & Investigation Workflow</h2>
          <p className="text-sm text-slate-400 font-mono">From raw procurement ingestion to explainable auditor decision making</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group hover:border-cyan-800 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wide">Step 01</div>
            <h3 className="text-base font-bold text-white">Procurement Data Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests real-world CSV datasets across tenders, bids, vendors, and contract payments with automated schema validation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group hover:border-cyan-800 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-blue-400 uppercase tracking-wide">Step 02</div>
            <h3 className="text-base font-bold text-white">Multi-Model Anomaly Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ensemble of Isolation Forest, LOF, and Robust Statistical Z-scores detect price dispersion, single-bid awards, and collusion networks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group hover:border-cyan-800 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wide">Step 03</div>
            <h3 className="text-base font-bold text-white">Transparent Risk Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assigns a 0–100 Investigation Priority Score decomposed into clear signal contributions (+24 Price, +18 Sole Bidder, +16 Rotation).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group hover:border-cyan-800 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wide">Step 04</div>
            <h3 className="text-base font-bold text-white">Human Auditor Decision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Human investigators review graph evidence, record feedback (dismiss false positives or confirm risk), and guide sensitivity.
            </p>
          </div>

        </div>
      </div>

      {/* Responsible AI & Guiding Principles Card */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-10 space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Responsible AI & Auditing Guiding Principles</h2>
            <p className="text-xs text-slate-400 font-mono">Ensuring ethical governance and actionable oversight without automated accusations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What system DOES */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>What ProcureGuard DOES</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Detects unusual bidding, pricing, and vendor award concentration.</li>
              <li>Prioritizes cases transparently using 0–100 Investigation Scores.</li>
              <li>Explains individual anomaly signals with peer group benchmarks.</li>
              <li>Visualizes vendor-agency corporate relationship graphs.</li>
              <li>Empowers human auditors to review, annotate, and dismiss false positives.</li>
            </ul>
          </div>

          {/* What system DOES NOT DO */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>What ProcureGuard DOES NOT Do</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Does NOT determine legal guilt or declare entities corrupt.</li>
              <li>Does NOT replace human investigative judgment.</li>
              <li>Does NOT make automated administrative or legal decisions.</li>
              <li>Does NOT issue automatic penalties to vendors or officials.</li>
              <li>Does NOT rely on generic unverified corruption labels.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200/90 text-xs leading-relaxed font-sans flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Auditor Disclaimer: </span>
            Anomaly detection is not proof of misconduct. Alerts identify procurement activity that may deserve further human investigation relative to comparable sector activity.
          </div>
        </div>
      </div>

    </div>
  );
}
