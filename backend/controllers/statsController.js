const Tender = require('../models/Tender');
const Bid = require('../models/Bid');
const Contract = require('../models/Contract');
const Vendor = require('../models/Vendor');
const Feedback = require('../models/Feedback');
const Settings = require('../models/Settings');
const scoringEngine = require('../services/scoringEngine');
const graphEngine = require('../services/graphEngine');

exports.getStats = async (req, res) => {
  try {
    const tenders = await Tender.find().lean();
    const bids = await Bid.find().populate('vendorId', 'name taxId address directorNames').lean();
    const vendors = await Vendor.find().lean();
    const contracts = await Contract.find().populate('winningVendorId', 'name taxId').lean();
    const feedbacks = await Feedback.find().lean();

    let settings = await Settings.findOne();
    if (!settings) settings = {};

    const cases = scoringEngine.evaluateTenders(tenders, bids, vendors, contracts, graphEngine, settings);

    const flaggedCases = cases.filter(c => c.isFlagged);
    const highRiskCases = cases.filter(c => c.riskLevel === 'High');
    
    // Value at Risk = sum of estimated values of tenders flagged for review
    const valueAtRisk = flaggedCases.reduce((sum, c) => sum + (c.tender.estimatedValue || 0), 0);

    // Category Risk Heatmap
    const categoryMap = new Map();
    cases.forEach(c => {
      const cat = c.tender.category;
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, {
          category: cat,
          totalTenders: 0,
          flaggedCount: 0,
          highRiskCount: 0,
          totalEstimatedValue: 0,
          scoreSum: 0
        });
      }
      const item = categoryMap.get(cat);
      item.totalTenders += 1;
      if (c.isFlagged) item.flaggedCount += 1;
      if (c.riskLevel === 'High') item.highRiskCount += 1;
      item.totalEstimatedValue += c.tender.estimatedValue;
      item.scoreSum += c.compositeScore;
    });

    const categoryRiskHeatmap = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      avgRiskScore: Math.round(cat.scoreSum / cat.totalTenders),
      riskRatePercent: Number(((cat.flaggedCount / cat.totalTenders) * 100).toFixed(1))
    }));

    // Find the 4 Embedded Anomaly Showcase Cases
    const showcaseCases = cases.filter(c => c.isFlagged).slice(0, 4);

    res.json({
      summary: {
        totalTenders: tenders.length,
        totalVendors: vendors.length,
        totalFlaggedCases: flaggedCases.length,
        highRiskCount: highRiskCases.length,
        totalValueAtRisk: valueAtRisk,
        auditorActionedCount: feedbacks.length
      },
      categoryRiskHeatmap,
      showcaseCases
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to generate dashboard statistics' });
  }
};
