const express = require('express');
const router = express.Router();

const tendersController = require('../controllers/tendersController');
const casesController = require('../controllers/casesController');
const vendorsController = require('../controllers/vendorsController');
const statsController = require('../controllers/statsController');
const settingsController = require('../controllers/settingsController');
const mlController = require('../controllers/mlController');

// Stats Endpoint
router.get('/stats', statsController.getStats);

// ML Model Endpoints
router.get('/ml/metrics', mlController.getMLMetrics);
router.post('/ml/retrain', mlController.retrainModels);

// Tenders Endpoints
router.get('/tenders', tendersController.getTenders);
router.get('/tenders/:id', tendersController.getTenderById);

// Investigation Cases & Explainability Endpoints
router.get('/cases', casesController.getCases);
router.get('/cases/:id/reasons', casesController.getCaseReasons);
router.post('/cases/:id/feedback', casesController.postFeedback);

// Vendor Profile Endpoints
router.get('/vendors', vendorsController.getVendors);
router.get('/vendors/:id', vendorsController.getVendorById);

// Settings Endpoints
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

module.exports = router;
