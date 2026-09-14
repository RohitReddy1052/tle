import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchVendorById } from '../services/api';
import RelationshipGraph from '../components/RelationshipGraph';
import { Building2, Calendar, FileText, Share2, ArrowLeft, RefreshCw, AlertCircle, Award, Users, MapPin } from 'lucide-react';

export default function VendorProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVendor();
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const res = await fetchVendorById(id);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load vendor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-mono text-slate-400">Loading Corporate Entity Profile & Relationship Graph...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Vendor Entity Not Found</h3>
        <p className="text-sm text-slate-300 mt-1 mb-4">{error}</p>
        <Link to="/vendors" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm inline-block">
          Back to Directory
        </Link>
      </div>
    );
  }

  const { vendor, contracts, bids, subgraph } = data;
  const totalAwarded = contracts.reduce((sum, c) => sum + c.awardedValue, 0);
  const winRate = bids.length > 0 ? ((contracts.length / bids.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Back Link & Entity Header */}
      <div>
        <Link to="/vendors" className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition mb-3">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vendor Directory</span>
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-900 flex items-center justify-center text-cyan-200 border border-cyan-500/30 shadow-lg">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{vendor.name}</h1>
                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 mt-1">
                  <span>Tax ID: <strong className="text-cyan-300">{vendor.taxId}</strong></span>
                  <span>•</span>
                  <span>Registered: {new Date(vendor.registrationDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 uppercase text-[10px] block">Registered Address</span>
                <span className="font-mono">{vendor.address}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-400 uppercase text-[10px] block">Key Directors & Executive Management</span>
                <span className="font-mono">{vendor.directorNames && vendor.directorNames.length > 0 ? vendor.directorNames.join(', ') : 'None listed'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Contracts Awarded</span>
          <span className="text-2xl font-bold text-white font-mono">{contracts.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Total Award Value</span>
          <span className="text-2xl font-bold text-cyan-300 font-mono">${totalAwarded.toLocaleString()}</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Total Bids Submitted</span>
          <span className="text-2xl font-bold text-white font-mono">{bids.length}</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Win Rate Percentage</span>
          <span className="text-2xl font-bold text-amber-300 font-mono">{winRate}%</span>
        </div>
      </div>

      {/* Ego-Network Subgraph */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <span>Corporate Ego-Network & Institutional Links</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">Centered on {vendor.name}</p>
        </div>

        <RelationshipGraph graphData={subgraph} height={380} focusEntityId={id} />
      </div>

      {/* Contract History Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Awarded Public Procurement History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Tender Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Awarded Contract Value</th>
                <th className="px-4 py-3">Award Date</th>
                <th className="px-4 py-3 text-right">Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 italic">No awarded contracts on record for this vendor.</td>
                </tr>
              ) : (
                contracts.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-white">
                      {c.tenderId ? c.tenderId.title : 'Tender Record'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{c.tenderId ? c.tenderId.category : 'N/A'}</td>
                    <td className="px-4 py-3 font-mono text-cyan-300 font-semibold">${c.awardedValue.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{new Date(c.awardDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/cases/${c.tenderId._id || c.tenderId}`} className="text-cyan-400 hover:underline font-mono">
                        View Case →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
