import React, { useState } from 'react';
import { submitFeedback } from '../services/api';
import { CheckCircle2, XCircle, HelpCircle, X, ShieldAlert } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, tenderId, tenderTitle, currentFeedback, onSuccess }) {
  const [verdict, setVerdict] = useState(currentFeedback?.verdict || 'confirmed_risk');
  const [reasonCategory, setReasonCategory] = useState(currentFeedback?.reasonCategory || 'Specialized Market');
  const [notes, setNotes] = useState(currentFeedback?.notes || '');
  const [auditorName, setAuditorName] = useState(currentFeedback?.auditorName || 'Lead Auditor');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const fullNotes = `[Reason: ${reasonCategory}] ${notes}`;
      const res = await submitFeedback(tenderId, { verdict, notes: fullNotes, auditorName });
      onSuccess(res.feedback);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record auditor determination');
    } finally {
      setSubmitting(false);
    }
  };

  const options = [
    {
      id: 'confirmed_risk',
      title: 'Confirmed Anomaly Risk',
      description: 'Activity demonstrates genuine peer benchmark deviation or relationship clustering worth formal audit review.',
      icon: CheckCircle2,
      color: 'border-rose-700 bg-rose-950/40 text-rose-300'
    },
    {
      id: 'false_positive',
      title: 'False Positive / Verified',
      description: 'Explanation verified as normal market dynamics (e.g. sole supplier niche market).',
      icon: XCircle,
      color: 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
    },
    {
      id: 'needs_more_data',
      title: 'Needs Additional Submissions',
      description: 'Requires requesting complete historical bidding logs or corporate registration records.',
      icon: HelpCircle,
      color: 'border-amber-700 bg-amber-950/40 text-amber-300'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Record Auditor Determination</h3>
            <p className="text-xs text-slate-400 font-mono truncate max-w-md">{tenderTitle}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950 border border-rose-800 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Audit Verdict</label>
            <div className="grid grid-cols-1 gap-2.5">
              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = verdict === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setVerdict(opt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected ? opt.color : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-current' : 'text-slate-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{opt.title}</span>
                        {isSelected && <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Selected</span>}
                      </div>
                      <p className="text-xs opacity-80 mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Determination Reason Category</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Specialized Market">Specialized Market (Niche Technical Requirements)</option>
              <option value="Legitimate Sole Supplier">Legitimate Sole Supplier / Patent Holder</option>
              <option value="Emergency Procurement">Emergency Procurement Fast-Track</option>
              <option value="Data Quality Issue">Data Quality Issue / Formatting Error</option>
              <option value="Genuine Anomaly Identified">Genuine Anomaly Identified (Referred for Investigation)</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Auditor Name / ID</label>
            <input 
              type="text" 
              value={auditorName} 
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 focus:outline-none"
              placeholder="e.g. Senior Auditor J. Vance"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Investigation Notes & Justification</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 focus:outline-none font-sans"
              placeholder="Detail reasons for audit outcome or specific corporate relationships reviewed..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 transition disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Submit Determination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

