const express = require('express');
const router = express.Router();
// Sahi tarika: Destructure karke import karein {} ke andar
const { generateQuestion } = require('../controllers/interviewController'); 
const { protect } = require('../middleware/auth'); // Agar auth middleware hai

router.post('/generate-question', protect, generateQuestion);
module.exports = router;
