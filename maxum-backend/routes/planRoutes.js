const express = require('express');
const { getPlans } = require('../controllers/planController');

const router = express.Router();

// GET /api/plans — public endpoint (no auth required to browse plans)
router.get('/', getPlans);

module.exports = router;
