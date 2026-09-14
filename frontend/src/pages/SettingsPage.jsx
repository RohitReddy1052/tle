import React, { useEffect, useState } from 'react';
import { fetchSettings, updateSettings, fetchMLMetrics, retrainMLModels } from '../services/api';
import { SlidersHorizontal, CheckCircle2, RotateCcw, ShieldCheck, RefreshCw, Cpu, Zap, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const [weights, setWeights] = useState({
    priceDeviationWeight: 0.30,
    singleBidderWeight: 0.20,
    winRateWeight: 0.15,
    bidRotationWeight: 0.15,
    relationshipWeight: 0.20
  });
  const [mlMetrics, setMlMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [settingsData, mlData] = await Promise.all([
        fetchSettings(),
        fetchMLMetrics().catch(() => null)
      ]);
      setWeights({
        priceDeviationWeight: settingsData.priceDeviationWeight ?? 0.30,
        singleBidderWeight: settingsData.singleBidderWeight ?? 0.20,
        winRateWeight: settingsData.winRateWeight ?? 0.15,
        bidRotationWeight: settingsData.bidRotationWeight ?? 0.15,
        relationshipWeight: settingsData.relationshipWeight ?? 0.20
      });
      setMlMetrics(mlData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (key, val) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseFloat(val)
    }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateSettings(weights);
      setMessage('Model scoring weights successfully calibrated! Queue re-ranked.');
      setTimeout(() => {
        navigate('/cases');
      }, 1500);
    } catch (err) {
      setMessage('Failed to update scoring calibration weights');
    } finally {
      setSaving(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setMessage('');
    try {
      const res = await retrainMLModels();
      setMlMetrics(res.metadata);
      setMessage('Python Machine Learning models successfully trained & evaluated!');
    } catch (err) {
      setMessage('Failed to retrain Python ML models');
    } finally {
      setRetraining(false);
    }
  };

  const handleReset = () => {
    setWeights({
      priceDeviationWeight: 0.30,
      singleBidderWeight: 0.20,
      winRateWeight: 0.15,
      bidRotationWeight: 0.15,
      relationshipWeight: 0.20
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-mono text-slate-400">Loading Scoring Engine Calibration Settings & ML Metrics...</p>
      </div>
    );
  }

  const sliderConfigs = [
    {
      key: 'priceDeviationWeight',
      label: 'Peer-Group Price Deviation Weight',
      description: 'Sensitivity to bids exceeding category median price benchmarks (Z-score & IQR outliers).'
    },
    {
      key: 'singleBidderWeight',
      label: 'Single-Bidder Frequency Weight',
      description: 'Weight assigned to tenders awarded with zero competing bidders.'
    },
    {
      key: 'winRateWeight',
      label: 'Win-Rate Market Concentration Weight',
      description: 'Weight assigned when a single vendor holds >40% share of category awards.'
    },
    {
      key: 'bidRotationWeight',
      label: 'Bid Rotation Ring Weight',
      description: 'Weight assigned to sequential alternating wins among recurring co-bidding groups.'
    },
    {
      key: 'relationshipWeight',
      label: 'Vendor Relationship Subgraph Density Weight',
      description: 'Weight assigned when co-bidders share registered addresses, directors, or tax IDs.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-3">
          <SlidersHorizontal className="w-7 h-7 text-cyan-400" />
          <span>Anomaly Scoring Calibration & Model Lab</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
          Tune priority weights and review trained Python Machine Learning model performance (Isolation Forest & Random Forest).
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-200 text-xs font-mono flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Machine Learning Model Performance Card */}
      {mlMetrics && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Python Machine Learning Engine (scikit-learn)</h2>
                <p className="text-xs text-slate-400 font-mono">Trained on {mlMetrics.samplesCount} Procurement Records (Isolation Forest & Random Forest)</p>
              </div>
            </div>

            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining ML Models...' : 'Retrain ML Models'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">ROC-AUC Score</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{(mlMetrics.metrics.rocAucScore * 100).toFixed(1)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Accuracy</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{(mlMetrics.metrics.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Precision</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{(mlMetrics.metrics.precision * 100).toFixed(1)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Recall</span>
              <span className="text-lg font-bold text-rose-400 font-mono">{(mlMetrics.metrics.recall * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono font-semibold text-slate-300 block uppercase tracking-wider">Top ML Feature Importance Attributions</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mlMetrics.featureImportances.slice(0, 4).map((f, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
                  <span className="text-slate-300 capitalize">{f.feature.replace(/_/g, ' ')}</span>
                  <span className="text-cyan-400 font-bold">{(f.importance * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Priority Score Weight Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Priority Score Weight Distribution</h2>
            <p className="text-xs text-slate-400 font-mono">Current total weight factor: <strong className="text-cyan-300">{(totalWeight * 100).toFixed(0)}%</strong></p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <div className="space-y-6">
          {sliderConfigs.map((cfg) => {
            const val = weights[cfg.key];
            const pct = Math.round(val * 100);
            return (
              <div key={cfg.key} className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">{cfg.label}</label>
                  <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                    {pct}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">{cfg.description}</p>
                <input 
                  type="range" 
                  min="0.00" 
                  max="0.50" 
                  step="0.05"
                  value={val}
                  onChange={(e) => handleSliderChange(cfg.key, e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditor feedback updates model weights dynamically</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 transition disabled:opacity-50"
          >
            {saving ? 'Recalculating...' : 'Save & Live Recalculate Queue'}
          </button>
        </div>

      </form>

    </div>
  );
}
