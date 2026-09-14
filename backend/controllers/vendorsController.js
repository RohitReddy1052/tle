const Vendor = require('../models/Vendor');
const Tender = require('../models/Tender');
const Bid = require('../models/Bid');
const Contract = require('../models/Contract');
const Payment = require('../models/Payment');
const graphEngine = require('../services/graphEngine');

exports.getVendors = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { taxId: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(filter).lean();
    const contracts = await Contract.find().lean();
    const bids = await Bid.find().lean();

    // Map stats per vendor
    const contractStats = new Map();
    contracts.forEach(c => {
      const vId = c.winningVendorId.toString();
      if (!contractStats.has(vId)) contractStats.set(vId, { count: 0, totalValue: 0 });
      const stat = contractStats.get(vId);
      stat.count += 1;
      stat.totalValue += c.awardedValue;
    });

    const bidStats = new Map();
    bids.forEach(b => {
      const vId = b.vendorId.toString();
      bidStats.set(vId, (bidStats.get(vId) || 0) + 1);
    });

    const result = vendors.map(v => {
      const vId = v._id.toString();
      const cStat = contractStats.get(vId) || { count: 0, totalValue: 0 };
      const totalBids = bidStats.get(vId) || 0;
      const winRate = totalBids > 0 ? Number(((cStat.count / totalBids) * 100).toFixed(1)) : 0;

      return {
        ...v,
        totalBidsSubmitted: totalBids,
        contractsWon: cStat.count,
        totalAwardedAmount: cStat.totalValue,
        winRatePercent: winRate
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    // Contracts won
    const contracts = await Contract.find({ winningVendorId: vendor._id }).populate('tenderId').lean();
    const contractIds = contracts.map(c => c._id);
    const payments = await Payment.find({ contractId: { $in: contractIds } }).lean();

    // All bids by vendor
    const bids = await Bid.find({ vendorId: vendor._id }).populate('tenderId').lean();

    // Graph subgraph centered on vendor
    const vendors = await Vendor.find().lean();
    const tenders = await Tender.find().lean();
    const allBids = await Bid.find().lean();
    const allContracts = await Contract.find().lean();

    const graph = graphEngine.buildGraph(vendors, tenders, allBids, allContracts);
    const subgraph = graphEngine.getSubgraph(graph, vendorId);

    res.json({
      vendor,
      contracts,
      bids,
      payments,
      subgraph
    });
  } catch (err) {
    console.error('Error fetching vendor details:', err);
    res.status(500).json({ error: 'Failed to fetch vendor details' });
  }
};
