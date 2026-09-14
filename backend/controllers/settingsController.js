const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        priceDeviationWeight: 0.30,
        singleBidderWeight: 0.20,
        winRateWeight: 0.15,
        bidRotationWeight: 0.15,
        relationshipWeight: 0.20
      });
    }
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const {
      priceDeviationWeight,
      singleBidderWeight,
      winRateWeight,
      bidRotationWeight,
      relationshipWeight
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (priceDeviationWeight !== undefined) settings.priceDeviationWeight = Number(priceDeviationWeight);
    if (singleBidderWeight !== undefined) settings.singleBidderWeight = Number(singleBidderWeight);
    if (winRateWeight !== undefined) settings.winRateWeight = Number(winRateWeight);
    if (bidRotationWeight !== undefined) settings.bidRotationWeight = Number(bidRotationWeight);
    if (relationshipWeight !== undefined) settings.relationshipWeight = Number(relationshipWeight);

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
