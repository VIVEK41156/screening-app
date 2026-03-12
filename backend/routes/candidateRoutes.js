const express = require('express');
const multer = require('multer');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/auth');

const path = require('path');

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only .pdf, .doc, and .docx resumes are allowed!'));
    }
};

const upload = multer({
    dest: 'uploads/',
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Auth
router.post('/login', candidateController.login);
router.post('/register', candidateController.register);

// Jobs (protected)
router.post('/jobs', authMiddleware, candidateController.createJob);
router.get('/jobs', authMiddleware, candidateController.getJobs);
router.delete('/jobs/:id', authMiddleware, candidateController.deleteJob);

// Candidates & Dashboard (protected)
router.post('/resume/upload', authMiddleware, upload.single('resume'), candidateController.uploadResume);
router.get('/candidates', authMiddleware, candidateController.getCandidates);
router.patch('/candidates/:id/status', authMiddleware, candidateController.updateCandidateStatus);
router.post('/candidates/:id/screen', authMiddleware, candidateController.screenCandidate);
router.post('/candidates/bulk-delete', authMiddleware, candidateController.bulkDeleteCandidates);
router.delete('/candidates/:id', authMiddleware, candidateController.deleteCandidate);
router.get('/candidates/:id/interview', authMiddleware, candidateController.generateInterviewQuestions);
router.get('/stats', authMiddleware, candidateController.getStats);
router.post('/candidates/:id/send-interview', authMiddleware, candidateController.sendInterviewInvite);
router.post('/candidates/:id/send-better-luck', authMiddleware, candidateController.sendBetterLuck);
router.post('/candidates/:id/send-offer', authMiddleware, candidateController.sendOfferLetter);
router.post('/candidates/:id/send-rejection', authMiddleware, candidateController.sendRejectionLetter);

const fs = require('fs');

const videoDir = path.join(__dirname, '../public/videos');
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}

const videoUpload = multer({
    dest: path.join(__dirname, '../public/videos'),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for video
});

// PUBLIC routes (no auth - for candidates applying externally)
router.get('/public/jobs', candidateController.getPublicJobs);
router.get('/public/jobs/:id', candidateController.getPublicJob);
router.post('/public/apply/:jobId', upload.single('resume'), candidateController.publicApply);
router.get('/public/jobs/:id/poster', candidateController.getJobPosterImage);

// TEST PORTAL (Secured via candidate-specific JWT)
router.post('/public/test/:candidateId/login', candidateController.testLogin);
router.get('/public/test/:candidateId/generate', authMiddleware, candidateController.getScreeningTest);
router.post('/public/test/:candidateId/submit', authMiddleware, videoUpload.single('video'), candidateController.submitScreeningTest);

// VOICE AI INTERVIEW PORTAL (Public - candidate specific URL handled via ID in real deployment, simplified here)
router.post('/public/interview/:id/start', candidateController.startInterview);
router.post('/public/interview/:id/chat', candidateController.chatInterview);
router.post('/public/interview/:id/submit', candidateController.submitInterview);

module.exports = router;
