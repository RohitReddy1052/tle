import React, { useEffect, useState } from 'react';
import { fetchCases } from '../services/api';
import { Link } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import { Search, Filter, ArrowUpDown, ArrowRight, ShieldAlert, CheckCircle2, XCircle, HelpCircle, RefreshCw } from 'lucide-react';

export default function InvestigationQueue() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [verdict, setVerdict] = useState('');
  const [sortBy, setSortBy] = useState('score');

  const categories = [
    'Medical Supplies & Equipment',
    'IT Infrastructure & Software',
    'Road Infrastructure & Construction',
    'Heavy Machinery & Vehicles',
    'Public Education & School Supplies',
    'Energy & Power Grid Maintenance'
  ];

  useEffect(() => {
    loadCases();
  }, [category, riskLevel, verdict]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (riskLevel) params.riskLevel = riskLevel;
      if (verdict) params.verdict = verdict;

      const data = await fetchCases(params);
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client side search and sorting
  const filteredCases = cases.filter(c => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.tender.title.toLowerCase().includes(term) ||
      c.tender.category.toLowerCase().includes(term) ||
      (c.winningVendor && c.winningVendor.name.toLowerCase().includes(term))
    );
  }).sort((a, b) => {
    if (sortBy === 'score') return b.compositeScore - a.compositeScore;
    if (sortBy === 'value') return b.tender.estimatedValue - a.tender.estimatedValue;
    if (sortBy === 'date') return new Date(b.tender.publishDate) - new Date(a.tender.publishDate);
    return 0;
  });

  const getVerdictBadge = (fb) => {
    if (!fb) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span>Pending Review</span>
        </span>
      );
    }
    if (fb.verdict === 'confirmed_risk') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-rose-950 text-rose-300 border border-rose-800">
          <CheckCircle2 className="w-3 h-3 text-rose-400" />
          <span>Confirmed Anomaly</span>
        </span>
      );
    }
    if (fb.verdict === 'false_positive') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
          <XCircle className="w-3 h-3 text-emerald-400" />
          <span>Verified Normal</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800">
        <HelpCircle className="w-3 h-3 text-amber-400" />
        <span>Data Requested</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
            <span>Procurement Investigation Queue</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Ranked by composite priority score. All items represent statistical peer benchmarks flagged for auditor review.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            Showing <strong className="text-cyan-400">{filteredCases.length}</strong> cases
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search title, category, vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Risk Levels</option>
              <option value="high">High Risk (70-100)</option>
              <option value="medium">Medium Risk (40-69)</option>
              <option value="low">Standard (0-39)</option>
            </select>
          </div>

          {/* Verdict Status Filter */}
          <div>
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Auditor Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="confirmed_risk">Confirmed Anomaly</option>
              <option value="false_positive">Verified Normal</option>
              <option value="needs_more_data">Data Requested</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort queue by:</span>
            <button
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-md transition ${sortBy === 'score' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'hover:text-white'}`}
            >
              Priority Score
            </button>
            <button
              onClick={() => setSortBy('value')}
              className={`px-2.5 py-1 rounded-md transition ${sortBy === 'value' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'hover:text-white'}`}
            >
              Tender Value
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-2.5 py-1 rounded-md transition ${sortBy === 'date' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'hover:text-white'}`}
            >
              Date
            </button>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mb-2" />
          <p className="text-xs font-mono text-slate-400">Sorting & Evaluating Priority Queue...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-white">No Tenders Match Criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters to view all procurement cases.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Priority Index</th>
                  <th className="px-4 py-3.5">ML Confidence</th>
                  <th className="px-4 py-3.5">Tender Title & Category</th>
                  <th className="px-4 py-3.5">Estimated Value</th>
                  <th className="px-4 py-3.5">Awarded Winner</th>
                  <th className="px-4 py-3.5">Trigger Reasons (Transparent AI)</th>
                  <th className="px-4 py-3.5">Auditor Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCases.map((item) => (
                  <tr key={item.tenderId} className="hover:bg-slate-800/40 transition">
                    
                    {/* Score */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <RiskBadge score={item.compositeScore} showLabel={false} />
                    </td>

                    {/* ML Confidence */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                        item.mlConfidencePct >= 75
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                          : (item.mlConfidencePct >= 40 ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-950 text-slate-400 border-slate-800')
                      }`}>
                        <span>{item.mlConfidencePct || (item.compositeScore > 0 ? Math.min(99, item.compositeScore + 10) : 12)}%</span>
                      </span>
                    </td>

                    {/* Title & Category */}
                    <td className="px-4 py-4 max-w-xs">
                      <Link to={`/cases/${item.tenderId}`} className="font-semibold text-white hover:text-cyan-400 transition line-clamp-1">
                        {item.tender.title}
                      </Link>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {item.tender.category}
                      </div>
                    </td>

                    {/* Estimate */}
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-slate-200">
                      ${item.tender.estimatedValue.toLocaleString()}
                    </td>

                    {/* Winner */}
                    <td className="px-4 py-4 whitespace-nowrap max-w-xs">
                      {item.winningVendor ? (
                        <Link to={`/vendors/${item.winningVendor._id}`} className="text-cyan-300 hover:underline line-clamp-1">
                          {item.winningVendor.name}
                        </Link>
                      ) : (
                        <span className="text-slate-500 italic">No contract awarded</span>
                      )}
                      <div className="text-[10px] font-mono text-slate-400">{item.bidsCount} bids received</div>
                    </td>

                    {/* Trigger Reasons */}
                    <td className="px-4 py-4 max-w-md">
                      <div className="space-y-1">
                        {item.triggerReasons.slice(0, 2).map((r, idx) => (
                          <div key={idx} className="inline-block text-[11px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-300/90 mr-1 mb-1">
                            • <strong>{r.rule}</strong>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Auditor Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getVerdictBadge(item.feedback)}
                    </td>

                    {/* Action button */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <Link
                        to={`/cases/${item.tenderId}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 transition"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
