const express = require('express');
const router = express.Router();
const { generateQuestion } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/generate-question', protect, generateQuestion);

module.exports = router;