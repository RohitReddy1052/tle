const Tender = require('../models/Tender');
const Bid = require('../models/Bid');
const Contract = require('../models/Contract');
const Vendor = require('../models/Vendor');

exports.getTenders = async (req, res) => {
  try {
    const { category, minValue, maxValue, search, status } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (minValue || maxValue) {
      filter.estimatedValue = {};
      if (minValue) filter.estimatedValue.$gte = Number(minValue);
      if (maxValue) filter.estimatedValue.$lte = Number(maxValue);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const tenders = await Tender.find(filter).sort({ publishDate: -1 }).lean();

    // Attach bid counts and contract winner details
    const tenderIds = tenders.map(t => t._id);
    const bids = await Bid.find({ tenderId: { $in: tenderIds } }).lean();
    const contracts = await Contract.find({ tenderId: { $in: tenderIds } }).populate('winningVendorId', 'name taxId').lean();

    const bidCountMap = new Map();
    bids.forEach(b => {
      const idStr = b.tenderId.toString();
      bidCountMap.set(idStr, (bidCountMap.get(idStr) || 0) + 1);
    });

    const contractMap = new Map(contracts.map(c => [c.tenderId.toString(), c]));

    const result = tenders.map(t => {
      const idStr = t._id.toString();
      const contract = contractMap.get(idStr);
      return {
        ...t,
        bidCount: bidCountMap.get(idStr) || 0,
        winningVendor: contract ? contract.winningVendorId : null,
        awardedValue: contract ? contract.awardedValue : null,
        awardDate: contract ? contract.awardDate : null
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error fetching tenders:', err);
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
};

exports.getTenderById = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id).lean();
    if (!tender) return res.status(404).json({ error: 'Tender not found' });

    const bids = await Bid.find({ tenderId: tender._id }).populate('vendorId', 'name taxId address directorNames').lean();
    const contract = await Contract.findOne({ tenderId: tender._id }).populate('winningVendorId', 'name taxId address directorNames').lean();

    res.json({
      tender,
      bids,
      contract
    });
  } catch (err) {
    console.error('Error fetching tender detail:', err);
    res.status(500).json({ error: 'Failed to fetch tender details' });
  }
};
