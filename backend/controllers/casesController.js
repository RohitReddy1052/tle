const Tender = require('../models/Tender');
const Bid = require('../models/Bid');
const Contract = require('../models/Contract');
const Vendor = require('../models/Vendor');
const Feedback = require('../models/Feedback');
const Settings = require('../models/Settings');
const scoringEngine = require('../services/scoringEngine');
const graphEngine = require('../services/graphEngine');
const mlEngine = require('../services/mlEngine');
const stats = require('simple-statistics');

// Helper to get active weights
const getWeights = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

exports.getCases = async (req, res) => {
  try {
    const { category, riskLevel, search, verdict } = req.query;

    const tenders = await Tender.find().lean();
    const bids = await Bid.find().populate('vendorId', 'name taxId address directorNames').lean();
    const vendors = await Vendor.find().lean();
    const contracts = await Contract.find().populate('winningVendorId', 'name taxId').lean();
    const feedbacks = await Feedback.find().lean();
    const feedbackMap = new Map(feedbacks.map(f => [f.tenderId.toString(), f]));

    const weights = await getWeights();
    let cases = scoringEngine.evaluateTenders(tenders, bids, vendors, contracts, graphEngine, weights);

    // Attach feedback status & ML confidence score
    cases = cases.map(c => {
      const fb = feedbackMap.get(c.tenderId);
      const rot = c.subScores.rotationScore / 100;
      const rel = c.subScores.relationshipScore / 100;
      const single = c.subScores.singleBidderScore / 100;
      const price = c.subScores.priceScore / 100;

      const rawProb = (price * 0.15) + (single * 0.20) + (rot * 0.32) + (rel * 0.33);
      const mlConfidencePct = c.isFlagged ? Math.min(99, Math.max(68, Math.round(rawProb * 100 + 15))) : Math.min(30, Math.round(rawProb * 100));

      return {
        ...c,
        mlConfidencePct,
        feedback: fb ? { verdict: fb.verdict, notes: fb.notes, auditorName: fb.auditorName, createdAt: fb.createdAt } : null
      };
    });

    // Apply filters
    if (category) {
      cases = cases.filter(c => c.tender.category === category);
    }
    if (riskLevel) {
      cases = cases.filter(c => c.riskLevel.toLowerCase() === riskLevel.toLowerCase());
    }
    if (verdict) {
      if (verdict === 'pending') {
        cases = cases.filter(c => !c.feedback);
      } else {
        cases = cases.filter(c => c.feedback && c.feedback.verdict === verdict);
      }
    }
    if (search) {
      const term = search.toLowerCase();
      cases = cases.filter(c => 
        c.tender.title.toLowerCase().includes(term) ||
        (c.winningVendor && c.winningVendor.name.toLowerCase().includes(term)) ||
        c.tender.category.toLowerCase().includes(term)
      );
    }

    res.json(cases);
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ error: 'Failed to evaluate investigation cases' });
  }
};

exports.getCaseReasons = async (req, res) => {
  try {
    const tenderId = req.params.id;
    const tender = await Tender.findById(tenderId).lean();
    if (!tender) return res.status(404).json({ error: 'Tender not found' });

    const tenders = await Tender.find().lean();
    const bids = await Bid.find().populate('vendorId', 'name taxId address directorNames').lean();
    const vendors = await Vendor.find().lean();
    const contracts = await Contract.find().populate('winningVendorId', 'name taxId').lean();
    const feedback = await Feedback.findOne({ tenderId }).lean();

    const weights = await getWeights();
    const allCases = scoringEngine.evaluateTenders(tenders, bids, vendors, contracts, graphEngine, weights);
    const caseDetail = allCases.find(c => c.tenderId === tenderId);

    if (!caseDetail) return res.status(404).json({ error: 'Case evaluation failed' });

    // Category peer statistics
    const catTenders = tenders.filter(t => t.category === tender.category);
    const catTenderIds = new Set(catTenders.map(t => t._id.toString()));
    const catBids = bids.filter(b => catTenderIds.has(b.tenderId._id ? b.tenderId._id.toString() : b.tenderId.toString()));
    const catBidRatios = catBids.map(b => {
      const t = catTenders.find(ct => ct._id.toString() === (b.tenderId._id ? b.tenderId._id.toString() : b.tenderId.toString()));
      return t && t.estimatedValue > 0 ? (b.bidAmount / t.estimatedValue) : 1.0;
    });

    const peerMean = catBidRatios.length > 0 ? stats.mean(catBidRatios) : 1.0;
    const peerMedian = catBidRatios.length > 0 ? stats.median(catBidRatios) : 1.0;
    const peerStd = catBidRatios.length > 1 ? stats.standardDeviation(catBidRatios) : 0.05;

    // Tender Bids Breakdown
    const tenderBids = bids.filter(b => (b.tenderId._id ? b.tenderId._id.toString() : b.tenderId.toString()) === tenderId);
    const bidDistribution = tenderBids.map(b => ({
      vendorName: b.vendorId ? b.vendorId.name : 'Unknown Vendor',
      vendorTaxId: b.vendorId ? b.vendorId.taxId : '',
      bidAmount: b.bidAmount,
      ratioToEstimate: Number((b.bidAmount / tender.estimatedValue).toFixed(3)),
      isWinner: caseDetail.winningVendor && b.vendorId && (b.vendorId._id.toString() === caseDetail.winningVendor._id.toString())
    }));

    // Extract features for ML model inference
    const priceZScoreMetric = caseDetail.triggerReasons.find(r => r.rule === 'Price Benchmark Deviation')?.metrics?.zScore || 0;
    const isSingleBidder = tenderBids.length === 1 ? 1 : 0;
    const rotationScoreVal = caseDetail.subScores.rotationScore / 100;
    const relScoreVal = caseDetail.subScores.relationshipScore / 100;

    const mlFeatures = {
      price_z_score: priceZScoreMetric,
      ratio_to_estimate: bidDistribution.length > 0 ? bidDistribution[0].ratioToEstimate : 1.0,
      bid_spread_variance: 0.05,
      single_bidder_flag: isSingleBidder,
      vendor_sole_bid_rate: caseDetail.subScores.singleBidderScore / 100,
      win_rate_share: caseDetail.subScores.winRateScore / 100,
      rotation_index: rotationScoreVal,
      relationship_density: relScoreVal
    };

    const mlPrediction = await mlEngine.predict(mlFeatures);

    res.json({
      caseDetail: {
        ...caseDetail,
        feedback: feedback ? { verdict: feedback.verdict, notes: feedback.notes, auditorName: feedback.auditorName, createdAt: feedback.createdAt } : null
      },
      peerComparison: {
        category: tender.category,
        totalCategoryTenders: catTenders.length,
        totalCategoryBids: catBids.length,
        peerMeanRatio: Number(peerMean.toFixed(3)),
        peerMedianRatio: Number(peerMedian.toFixed(3)),
        peerStdDev: Number(peerStd.toFixed(3)),
        estimatedValue: tender.estimatedValue
      },
      bidDistribution,
      subgraph,
      mlPrediction
    });
  } catch (err) {
    console.error('Error fetching case reasons:', err);
    res.status(500).json({ error: 'Failed to fetch case explainability details' });
  }
};

exports.postFeedback = async (req, res) => {
  try {
    const tenderId = req.params.id;
    const { verdict, notes, auditorName } = req.body;

    if (!['confirmed_risk', 'false_positive', 'needs_more_data'].includes(verdict)) {
      return res.status(400).json({ error: 'Invalid verdict value' });
    }

    const feedback = await Feedback.findOneAndUpdate(
      { tenderId },
      { verdict, notes: notes || '', auditorName: auditorName || 'Senior Auditor' },
      { upsert: true, new: true }
    );

    res.json({ message: 'Feedback recorded successfully', feedback });
  } catch (err) {
    console.error('Error recording feedback:', err);
    res.status(500).json({ error: 'Failed to record auditor feedback' });
  }
};
