const express = require('express');
const router = express.Router();
const { generateQuestion, evaluateAnswer, saveSession, getStats } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/generate-question', protect, generateQuestion);
router.post('/evaluate-answer', protect, evaluateAnswer);
router.post('/save-session', protect, saveSession);
router.get('/stats', protect, getStats);

module.exports = router;