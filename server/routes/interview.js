const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateQuestion, evaluateAnswer, saveSession, getStats, uploadResume, getResume } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

// Store uploaded PDF in memory (not on disk) — we only need it briefly to extract text
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/generate-question', protect, generateQuestion);
router.post('/evaluate-answer', protect, evaluateAnswer);
router.post('/save-session', protect, saveSession);
router.get('/stats', protect, getStats);
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.get('/resume', protect, getResume);

module.exports = router;