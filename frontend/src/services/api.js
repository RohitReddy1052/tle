const API_BASE = '/api';

export const fetchStats = async () => {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
};

export const fetchCases = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/cases${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to load cases');
  return res.json();
};

export const fetchCaseReasons = async (id) => {
  const res = await fetch(`${API_BASE}/cases/${id}/reasons`);
  if (!res.ok) throw new Error('Failed to load case reasons');
  return res.json();
};

export const submitFeedback = async (id, data) => {
  const res = await fetch(`${API_BASE}/cases/${id}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to record feedback');
  return res.json();
};

export const fetchTenders = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/tenders${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to load tenders');
  return res.json();
};

export const fetchTenderById = async (id) => {
  const res = await fetch(`${API_BASE}/tenders/${id}`);
  if (!res.ok) throw new Error('Failed to load tender detail');
  return res.json();
};

export const fetchVendors = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/vendors${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to load vendors');
  return res.json();
};

export const fetchVendorById = async (id) => {
  const res = await fetch(`${API_BASE}/vendors/${id}`);
  if (!res.ok) throw new Error('Failed to load vendor detail');
  return res.json();
};

export const fetchSettings = async () => {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
};

export const updateSettings = async (data) => {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
};

export const fetchMLMetrics = async () => {
  const res = await fetch(`${API_BASE}/ml/metrics`);
  if (!res.ok) throw new Error('Failed to fetch ML model metrics');
  return res.json();
};

export const retrainMLModels = async () => {
  const res = await fetch(`${API_BASE}/ml/retrain`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger ML model retraining');
  return res.json();
};
