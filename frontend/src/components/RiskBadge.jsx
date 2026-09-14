import React from 'react';

export default function RiskBadge({ score, size = 'md', showLabel = true }) {
  let badgeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-800';
  let labelText = 'Standard Baseline';
  let dotColor = 'bg-cyan-400';

  if (score >= 70) {
    badgeStyle = 'bg-rose-950/80 text-rose-300 border-rose-800/80 shadow-rose-950/30';
    labelText = 'High Priority Audit';
    dotColor = 'bg-rose-500';
  } else if (score >= 40) {
    badgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-800/80 shadow-amber-950/30';
    labelText = 'Flagged for Review';
    dotColor = 'bg-amber-500';
  }

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-sm font-semibold' 
    : (size === 'sm' ? 'px-2 py-0.5 text-xs font-mono' : 'px-2.5 py-1 text-xs font-medium');

  return (
    <div className={`inline-flex items-center space-x-2 rounded-full border shadow-sm ${badgeStyle} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      <span className="font-mono font-bold">{score} / 100</span>
      {showLabel && <span className="text-[11px] opacity-90 border-l border-current/30 pl-2">{labelText}</span>}
    </div>
  );
}
