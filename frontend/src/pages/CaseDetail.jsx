import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCaseReasons } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import ReasonCard from '../components/ReasonCard';
import RelationshipGraph from '../components/RelationshipGraph';
import FeedbackModal from '../components/FeedbackModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { ArrowLeft, ShieldAlert, CheckCircle2, Building2, Calendar, FileText, Share2, RefreshCw, AlertCircle, Cpu } from 'lucide-react';

export default function CaseDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCaseDetail();
  }, [id]);

  const loadCaseDetail = async () => {
    try {
      setLoading(true);
      const res = await fetchCaseReasons(id);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load case investigation details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-mono text-slate-400">Extracting Subgraph & Calculating Peer Group Benchmarks...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Case Not Found</h3>
        <p className="text-sm text-slate-300 mt-1 mb-4">{error}</p>
        <Link to="/cases" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm inline-block">
          Return to Queue
        </Link>
      </div>
    );
  }

  const { caseDetail, peerComparison, bidDistribution, subgraph } = data;
  const { tender, winningVendor, compositeScore, triggerReasons, feedback } = caseDetail;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Back Navigation & Header */}
      <div>
        <Link to="/cases" className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition mb-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Investigation Queue</span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300">
                {tender.category}
              </span>
              <RiskBadge score={compositeScore} size="lg" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{tender.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono pt-1">
              <div className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Estimate: <strong className="text-slate-200">${tender.estimatedValue.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Award Winner: {winningVendor ? (
                  <Link to={`/vendors/${winningVendor._id}`} className="text-cyan-400 underline font-semibold">
                    {winningVendor.name}
                  </Link>
                ) : 'None'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Published: {new Date(tender.publishDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Investigator Verdict Button & Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">Auditor Status</div>
              {feedback ? (
                <div className="text-xs font-semibold text-emerald-300 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-lg">
                  {feedback.verdict === 'confirmed_risk' && 'Confirmed Anomaly'}
                  {feedback.verdict === 'false_positive' && 'Verified Normal (False Positive)'}
                  {feedback.verdict === 'needs_more_data' && 'Additional Submissions Requested'}
                </div>
              ) : (
                <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg">
                  Pending Auditor Determination
                </span>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 transition flex items-center space-x-2 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Determination</span>
            </button>
          </div>
        </div>
      </div>

      {/* Machine Learning Model Prediction Card */}
      {data.mlPrediction && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Machine Learning Anomaly Attribution</h3>
                <p className="text-xs text-slate-400 font-mono">Trained Random Forest Classifier & Isolation Forest Inference</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">ML Confidence</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{(data.mlPrediction.anomalyProbability * 100).toFixed(1)}%</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                data.mlPrediction.riskLevel === 'High' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {data.mlPrediction.riskLevel} Anomaly
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Top Contributing Feature Importances</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {data.mlPrediction.topAttributions.map((attr, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 block text-[10px] uppercase truncate">{attr.feature.replace(/_/g, ' ')}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-200 font-semibold">{attr.val}</span>
                    <span className="text-cyan-400 font-bold">+{attr.contribution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Model Agreement Suite Consensus */}
          {data.mlPrediction.modelAgreement && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-300 uppercase tracking-wider block">Multi-Model Ensemble Consensus</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {data.mlPrediction.modelAgreement.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-300 font-semibold block text-[11px]">{m.model}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{m.score}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      m.verdict === 'High Anomaly' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      m.verdict === 'Moderate Anomaly' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {m.verdict}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transparent AI Explainability Reason Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Transparent Explainability ("Why Flagged")</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {triggerReasons.length} Rule Triggers Evaluated
          </span>
        </div>

        {triggerReasons.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            No specific rule thresholds triggered. Priority score is based on standard category variance baseline.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {triggerReasons.map((reason, idx) => (
              <ReasonCard key={idx} reason={reason} />
            ))}
          </div>
        )}
      </div>

      {/* Main Analysis Section: Bid Comparison Chart + Interactive Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recharts Bid Distribution vs Category Benchmark */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Bid Amount vs. Category Peer Benchmark</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Category Estimated Value Benchmark: ${peerComparison.estimatedValue.toLocaleString()} (Median Ratio: {(peerComparison.peerMedianRatio * 100).toFixed(1)}%)
            </p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bidDistribution} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="vendorName" stroke="#94a3b8" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Submitted Bid']}
                />
                <ReferenceLine y={peerComparison.estimatedValue} stroke="#0284c7" strokeDasharray="4 4" label={{ value: 'Est. Value', fill: '#38bdf8', fontSize: 11 }} />
                <Bar dataKey="bidAmount" name="Bid Amount ($)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Category Peer Z-Score Mean: {peerComparison.peerMeanRatio.toFixed(2)}x</span>
            <span>Category Std Dev: {peerComparison.peerStdDev.toFixed(2)}</span>
          </div>
        </div>

        {/* Interactive Vendor Relationship Graph */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Vendor Relationship Subgraph</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Force-directed network highlighting shared directors, addresses, and co-bidding
              </p>
            </div>
          </div>

          <RelationshipGraph graphData={subgraph} height={320} focusEntityId={id} />
        </div>

      </div>

      {/* Submissions & Bidders Breakdown Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Tender Submissions & Bidder Ratios</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Vendor Name</th>
                <th className="px-4 py-3">Tax Identification ID</th>
                <th className="px-4 py-3">Submitted Bid Amount</th>
                <th className="px-4 py-3">Ratio to Estimated Value</th>
                <th className="px-4 py-3 text-right">Award Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bidDistribution.map((bid, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3 font-semibold text-white">
                    {bid.vendorName}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{bid.vendorTaxId}</td>
                  <td className="px-4 py-3 font-mono text-slate-200">${bid.bidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">
                    {(bid.ratioToEstimate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {bid.isWinner ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                        Award Winner
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">Unsuccessful</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigator Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenderId={id}
        tenderTitle={tender.title}
        currentFeedback={feedback}
        onSuccess={() => loadCaseDetail()}
      />

    </div>
  );
}
