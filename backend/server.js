const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');

// Serve the public apply page using fs.readFile (avoids Windows path issues with sendFile)
app.get('/apply/:jobId', async (req, res) => {
    const filePath = path.join(__dirname, 'public', 'apply.html');

    let jobTitle = 'Open Position';
    let jobSkills = 'Various Skills';
    try {
        const jobRes = await db.query('SELECT * FROM jobs WHERE id = $1', [req.params.jobId]);
        if (jobRes.rows.length > 0) {
            jobTitle = jobRes.rows[0].title;
            jobSkills = jobRes.rows[0].skills;
        }
    } catch (dbErr) {
        console.error('Error fetching job for OG tags:', dbErr);
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('❌ Could not read apply.html:', filePath, err.message);
            return res.status(500).send(`<h2>Error loading apply page</h2><pre>${err.message}</pre><p>Looking for: ${filePath}</p>`);
        }

        const posterUrl = `${req.protocol}://${req.get('host')}/api/public/jobs/${req.params.jobId}/poster`;

        // Inject Dynamic OpenGraph Social Media tags
        data = data.replace('__OG_TITLE__', `We are hiring a ${jobTitle}! | EvalRight HR`);
        data = data.replace('__OG_DESC__', `Required Skills: ${jobSkills}. Apply dynamically now.`);
        data = data.replace('__OG_IMAGE__', posterUrl);

        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    });
});

app.get('/test/:candidateId', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'test.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('❌ Could not read test.html:', filePath, err.message);
            return res.status(500).send(`<h2>Error loading test page</h2><pre>${err.message}</pre><p>Looking for: ${filePath}</p>`);
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    });
});

app.get('/interview/:candidateId', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'interview.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('❌ Could not read interview.html:', filePath, err.message);
            return res.status(500).send(`<h2>Error loading interview page</h2><pre>${err.message}</pre><p>Looking for: ${filePath}</p>`);
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    });
});

// Static files from /public (for apply.html assets)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the compiled React Frontend
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// API Routes
app.use('/api', require('./routes/candidateRoutes'));

// Catch-all route for the React SPA (except for API and Apply routes)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/apply/')) {
        return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
    console.log(`📁 Serving apply.html from: ${path.join(__dirname, 'public', 'apply.html')}`);
});
