const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateQuestion, evaluateAnswer, saveSession, getStats, getQuestionHistory, uploadResume, getResume } = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
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
router.get('/question-history', protect, getQuestionHistory);
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);
router.get('/resume', protect, getResume);

module.exports = router;