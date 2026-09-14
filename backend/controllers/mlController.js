const mlEngine = require('../services/mlEngine');

exports.getMLMetrics = async (req, res) => {
  try {
    const metadata = mlEngine.getMetadata();
    if (!metadata) {
      return res.status(404).json({ error: 'ML models not trained yet' });
    }
    res.json(metadata);
  } catch (err) {
    console.error('Error fetching ML metrics:', err);
    res.status(500).json({ error: 'Failed to fetch ML model metrics' });
  }
};

exports.retrainModels = async (req, res) => {
  try {
    const metadata = await mlEngine.trainModels();
    res.json({ message: 'ML models successfully retrained and saved!', metadata });
  } catch (err) {
    console.error('Error retraining ML models:', err);
    res.status(500).json({ error: 'Failed to retrain ML models' });
  }
};
