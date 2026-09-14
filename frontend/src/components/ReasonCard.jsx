import React from 'react';
import { AlertTriangle, Info, TrendingUp, Users, RefreshCw, Network } from 'lucide-react';

export default function ReasonCard({ reason }) {
  const { rule, description, severity, metrics } = reason;

  const getRuleIcon = (ruleName) => {
    if (ruleName.includes('Price') || ruleName.includes('Clustering')) return TrendingUp;
    if (ruleName.includes('Sole') || ruleName.includes('Single')) return Users;
    if (ruleName.includes('Rotation')) return RefreshCw;
    if (ruleName.includes('Relationship') || ruleName.includes('Co-Bidding')) return Network;
    return AlertTriangle;
  };

  const RuleIcon = getRuleIcon(rule);

  const isHigh = severity === 'high';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isHigh 
        ? 'bg-gradient-to-r from-rose-950/30 to-slate-900 border-rose-800/60 shadow-lg shadow-rose-950/20' 
        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isHigh ? 'bg-rose-900/40 text-rose-400 border border-rose-700/50' : 'bg-amber-900/40 text-amber-400 border border-amber-700/50'
          }`}>
            <RuleIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">{rule}</h4>
            <span className={`inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded mt-0.5 ${
              isHigh ? 'bg-rose-950 text-rose-300 border border-rose-800/60' : 'bg-amber-950 text-amber-300 border border-amber-800/60'
            }`}>
              {severity} Severity
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans">
        {description}
      </p>

      {/* Render Structured Metrics tags if present */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
          {Object.entries(metrics).map(([key, val]) => (
            <div key={key} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
              <span className="font-semibold text-cyan-300">
                {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
