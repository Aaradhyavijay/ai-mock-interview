const express = require('express');
const router = express.Router();
const { generateQuestion, evaluateAnswer } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/generate-question', protect, generateQuestion);
router.post('/evaluate-answer', protect, evaluateAnswer);

module.exports = router;