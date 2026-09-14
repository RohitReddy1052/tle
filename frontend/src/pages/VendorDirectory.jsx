import React, { useEffect, useState } from 'react';
import { fetchVendors } from '../services/api';
import { Link } from 'react-router-dom';
import { Building2, Search, ArrowRight, RefreshCw, MapPin } from 'lucide-react';

export default function VendorDirectory() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVendors();
  }, [search]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await fetchVendors({ search });
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Building2 className="w-7 h-7 text-cyan-400" />
            <span>Corporate Vendor Directory</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Registered vendors, Tax IDs, shared directorship linkages, and historical procurement win rates.
          </p>
        </div>
        
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            placeholder="Search vendor name, tax ID, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin mb-2" />
          <p className="text-xs font-mono text-slate-400">Querying Vendor Database & Tax Registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-white text-base line-clamp-1">{vendor.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-cyan-400 border border-slate-800">
                    {vendor.taxId}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-2 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{vendor.address}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Bids</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">{vendor.totalBidsSubmitted}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Wins</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{vendor.contractsWon}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Win Rate</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">{vendor.winRatePercent}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">${(vendor.totalAwardedAmount / 1000).toFixed(0)}k Awarded</span>
                <Link
                  to={`/vendors/${vendor._id}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <span>Entity Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
