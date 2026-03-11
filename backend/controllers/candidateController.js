const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const aiService = require('../services/aiService');
const emailService = require('../services/emailService');
const mammoth = require('mammoth');

// --- AUTHENTICATION ---
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashed, 'HR']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: 'Email may already be in use.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Server error.' });
  }
};

// --- JOBS ---
exports.createJob = async (req, res) => {
  try {
    const { title, skills, experience, location, salary_range } = req.body;
    const result = await db.query(
      'INSERT INTO jobs (title, skills, experience, location, salary_range) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, skills, experience || 0, location || '', salary_range || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createJob error:', err);
    res.status(500).json({ error: 'Could not create job' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM jobs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// --- RESUME UPLOAD ---
exports.uploadResume = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please attach a PDF or DOCX.' });
    }

    filePath = req.file.path;
    console.log('📄 File received:', req.file.originalname, '→', filePath);

    // Parse text strictly from PDF or Word
    let resumeText = '';
    try {
      const dataBuffer = fs.readFileSync(filePath);
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdfParse(dataBuffer);
        resumeText = data.text;
        console.log('✅ PDF parsed, text length:', resumeText.length);
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.mimetype === 'application/msword' || req.file.originalname.endsWith('.docx') || req.file.originalname.endsWith('.doc')) {
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        resumeText = result.value;
        console.log('✅ DOCX/DOC parsed with mammoth, text length:', resumeText.length);
      } else {
        throw new Error('Unsupported file type');
      }

      if (!resumeText || resumeText.replace(/\s+/g, '').length < 20) {
        throw new Error('Insufficient text extracted, likely a scanned document');
      }
    } catch (parseErr) {
      console.log('⚠️ Text parser failed or insufficient text, falling back to Gemini OCR:', parseErr.message);
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = req.file.mimetype || 'application/pdf';
      resumeText = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }

    // Get job description
    let jobDescription = 'Software Engineer with React and Node.js experience.';
    let jobId = null;
    let job = null;

    if (req.body.jobId) {
      const jobRes = await db.query('SELECT * FROM jobs WHERE id = $1', [req.body.jobId]);
      if (jobRes.rows.length > 0) {
        job = jobRes.rows[0];
        jobId = job.id;
        jobDescription = `Job: ${job.title}. Required Skills: ${job.skills}. Experience: ${job.experience} years.`;
      }
    } else {
      // Get most recent job
      const jobRes = await db.query('SELECT * FROM jobs ORDER BY id DESC LIMIT 1');
      if (jobRes.rows.length > 0) {
        job = jobRes.rows[0];
        jobId = job.id;
        jobDescription = `Job: ${job.title}. Required Skills: ${job.skills}. Experience: ${job.experience} years.`;
      }
    }

    console.log('🤖 Sending to Hybrid Python+Gemini AI Engine...');
    let parsedData;
    try {
      parsedData = await aiService.analyzeResume(resumeText, jobDescription, job ? job.skills : '', job ? job.title : '');
      console.log('✅ AI Response:', parsedData);
    } catch (aiErr) {
      console.error('AI Error:', aiErr.message);
      parsedData = { name: req.body.name || req.file.originalname.replace(/\.[^/.]+$/, ''), email: null, skills: [], experience_years: 0, match_score: 50, ai_recommendation: 'Manual review suggested' };
    }

    const name = parsedData.name || req.body.name || req.file.originalname.replace(/\.[^/.]+$/, '');
    const email = parsedData.email || `${name.replace(/\s+/g, '.').toLowerCase()}.${Date.now()}@candidate.local`;
    const skills = Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : (parsedData.skills || '');
    const experience = parseInt(parsedData.experience_years) || 0;
    const matchScore = parseFloat(parsedData.match_score) || 50;

    let initialStatus = 'Review';
    if (matchScore >= 90) initialStatus = 'Shortlisted';
    else if (matchScore < 40) initialStatus = 'Rejected';

    console.log('💾 Saving AI-Analyzed Profile to DB - name:', name);

    // CRITICAL: Always save the extracted text (parsedData.resume_text if available, else resumeText)
    // If resumeText was base64 (OCR fallback), parsedData.resume_text now holds the OCR text from aiService.
    const textToSave = parsedData.resume_text || (resumeText.startsWith('data:') ? 'OCR Processed' : resumeText);

    const candidateResult = await db.query(
      `INSERT INTO candidates (name, email, skills, experience, status, resume_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET skills = $3, experience = $4, status = $5, resume_text = $6
       RETURNING *`,
      [name, email, skills, experience, initialStatus, textToSave]
    );

    const candidateId = candidateResult.rows[0].id;

    if (jobId) {
      // Update or Insert score
      await db.query(
        `INSERT INTO scores (candidate_id, job_id, score)
         VALUES ($1, $2, $3)
         ON CONFLICT (candidate_id, job_id) DO UPDATE SET score = $3`,
        [candidateId, jobId, matchScore]
      );
    }

    if (isRealEmail && (initialStatus === 'Shortlisted' || initialStatus === 'Rejected')) {
      const emailJobTitle = job ? job.title : 'the applied position';
      const emailJobSkills = job ? job.skills : '';

      try {
        if (initialStatus === 'Shortlisted') {
          await emailService.sendInterviewTestEmail({
            candidateName: name,
            candidateEmail: email,
            jobTitle: emailJobTitle,
            candidateId: candidateId
          });
          console.log(`✅ Auto-Interview Test email sent directly to ${email}`);
        } else if (initialStatus === 'Rejected') {
          await emailService.sendRejectionEmail({
            candidateName: name,
            candidateEmail: email,
            jobTitle: emailJobTitle
          });
          console.log(`✅ Auto-Rejection email sent directly to ${email}`);
        }
      } catch (emailErr) {
        console.error('⚠️ Auto-email send failed:', emailErr.message);
      }
    }

    // Clean up file
    try { fs.unlinkSync(filePath); } catch (_) { }

    res.status(201).json({
      message: 'Resume parsed and saved.',
      candidate: candidateResult.rows[0],
      score: matchScore,
      ai_recommendation: parsedData.recommendation || parsedData.ai_recommendation
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    if (filePath) try { fs.unlinkSync(filePath); } catch (_) { }
    res.status(500).json({ error: `Upload failed: ${err.message}` });
  }
};

// --- CANDIDATES ---
exports.getCandidates = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.name, c.email, c.skills, c.experience, c.status, c.resume_text, c.test_score, c.test_completed, c.video_url, s.score as match_score, s.job_id
      FROM candidates c
      LEFT JOIN scores s ON c.id = s.candidate_id
      ORDER BY s.score DESC NULLS LAST
    `);
    const formatted = result.rows.map(row => ({
      ...row,
      skills_matched: row.skills ? row.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      status: row.status || (row.match_score >= 90 ? 'Shortlisted' : row.match_score > 70 ? 'Review' : 'Rejected'),
      role: 'Applicant'
    }));
    res.json(formatted);
  } catch (err) {
    console.error('getCandidates error:', err);
    res.status(500).json({ error: 'Failed fetching candidates' });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Shortlisted', 'Rejected', 'Review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    let testPassword = null;
    let query = 'UPDATE candidates SET status = $1 WHERE id = $2 RETURNING *';
    let values = [status, id];

    if (status === 'Shortlisted') {
      testPassword = Math.random().toString(36).slice(-6).toUpperCase();
      query = 'UPDATE candidates SET status = $1, test_password = $3 WHERE id = $2 RETURNING *';
      values = [status, id, testPassword];
    }

    const result = await db.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = result.rows[0];

    // Get the job title for the email
    const jobRes = await db.query(
      'SELECT jobs.title, jobs.skills FROM jobs JOIN scores ON jobs.id = scores.job_id WHERE scores.candidate_id = $1 LIMIT 1',
      [id]
    );
    const jobTitle = jobRes.rows.length > 0 ? jobRes.rows[0].title : 'the applied position';
    const jobSkills = jobRes.rows.length > 0 ? jobRes.rows[0].skills : '';

    // Auto-send email if candidate has a real email address
    const placeholderDomains = ['@candidate.local', '@applied.local', '@placeholder'];
    const isRealEmail = candidate.email &&
      !placeholderDomains.some(d => candidate.email.includes(d)) &&
      candidate.email.includes('@') &&
      candidate.email.includes('.');

    console.log(`📧 Candidate email: ${candidate.email} | isRealEmail: ${isRealEmail} | status: ${status}`);

    if (isRealEmail && (status === 'Shortlisted' || status === 'Rejected')) {
      try {
        if (status === 'Shortlisted') {
          await emailService.sendInterviewTestEmail({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            jobTitle,
            candidateId: id,
            testPassword: testPassword || candidate.test_password
          });
          console.log('✅ AI Screening Test email sent to', candidate.email);
        } else if (status === 'Rejected') {
          await emailService.sendRejectionEmail({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            jobTitle
          });
          console.log('✅ Rejection email sent to', candidate.email);
        }
      } catch (emailErr) {
        console.error('⚠️ Email send failed:', emailErr.message);
      }
    } else if (!isRealEmail) {
      console.log('⚠️ No real email found for candidate, skipping email send.');
    }

    res.json({ success: true, candidate, emailSent: isRealEmail, status });
  } catch (err) {
    console.error('updateCandidateStatus error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// --- PUBLIC APPLY (no auth needed) ---
exports.getPublicJobs = async (req, res) => {
  try {
    const result = await db.query('SELECT id, title, skills, experience, location, salary_range FROM jobs ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

exports.getPublicJob = async (req, res) => {
  try {
    const result = await db.query('SELECT id, title, skills, experience, location, salary_range FROM jobs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

exports.publicApply = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a resume file.' });
    filePath = req.file.path;

    const jobId = req.params.jobId || req.body.jobId;
    let jobDescription = 'Software Engineer role';
    let jobTitle = 'Open Position';

    if (jobId) {
      const jobRes = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
      if (jobRes.rows.length > 0) {
        const job = jobRes.rows[0];
        jobDescription = `Job: ${job.title}. Required Skills: ${job.skills}. Experience: ${job.experience} years.`;
        jobTitle = job.title;
      }
    } else {
      // Find the most recent open job to score against to prevent the AI from using generic "Software Engineer"
      const currentJobRes = await db.query('SELECT * FROM jobs ORDER BY id DESC LIMIT 1');
      if (currentJobRes.rows.length > 0) {
        const currentJob = currentJobRes.rows[0];
        jobDescription = `Job: ${currentJob.title}. Required Skills: ${currentJob.skills}. Experience: ${currentJob.experience} years.`;
        jobTitle = currentJob.title;
      }
    }

    let resumeText = '';
    try {
      const dataBuffer = fs.readFileSync(filePath);
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdfParse(dataBuffer);
        resumeText = data.text;
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.mimetype === 'application/msword' || req.file.originalname.endsWith('.docx') || req.file.originalname.endsWith('.doc')) {
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        resumeText = result.value;
      } else {
        throw new Error('Unsupported file type');
      }

      if (!resumeText || resumeText.replace(/\s+/g, '').length < 20) {
        throw new Error('Insufficient text extracted, likely a scanned document');
      }
    } catch (e) {
      console.log('⚠️ Text parser failed/bypassed, using Gemini OCR:', e.message);
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = req.file.mimetype || 'application/pdf';
      resumeText = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    }

    const name = req.body.name || 'Unknown Candidate';
    const email = (req.body.email) || `${name.replace(/\s+/g, '.').toLowerCase()}.${Date.now()}@applied.local`;
    const initialStatus = 'New';
    const matchScore = 0;

    console.log(`💾 Saving async public application for ${name}`);

    const candidateResult = await db.query(
      `INSERT INTO candidates (name, email, skills, experience, status, resume_text) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET skills=$3, experience=$4, status=$5, resume_text=$6 RETURNING *`,
      [name, email, '', 0, initialStatus, resumeText]
    );

    const candidateId = candidateResult.rows[0].id;
    if (jobId) {
      await db.query(
        `INSERT INTO scores (candidate_id, job_id, score) VALUES ($1, $2, $3)
         ON CONFLICT (candidate_id, job_id) DO UPDATE SET score=$3`,
        [candidateId, jobId, matchScore]
      );
    }

    // 🔥 AUTONOMOUS TRIGGER: Screen immediately upon application
    // We don't 'await' this so that the candidate gets an instant "Success" page,
    // while the AI works in the background and sends an email within seconds.
    processCandidateScreening(candidateId).catch(asyncErr => {
      console.error('❌ Autonomous Screening Failed during publicApply:', asyncErr.message);
    });

    try { fs.unlinkSync(filePath); } catch (_) { }

    res.status(201).json({ success: true, message: 'Application submitted! Check your email for status updates.', score: matchScore, status: initialStatus });
  } catch (err) {
    console.error('publicApply error:', err);
    if (filePath) try { fs.unlinkSync(filePath); } catch (_) { }
    res.status(500).json({ error: 'Application failed. Please try again.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const countRes = await db.query('SELECT COUNT(*) FROM candidates');
    const total = parseInt(countRes.rows[0].count, 10);
    const scoreRes = await db.query('SELECT AVG(score) FROM scores');
    const avgScore = scoreRes.rows[0].avg ? Math.round(parseFloat(scoreRes.rows[0].avg)) : 0;
    const shortRes = await db.query("SELECT COUNT(*) FROM candidates WHERE status = 'Shortlisted'");
    const shortlisted = parseInt(shortRes.rows[0].count, 10);
    res.json({ total, shortlisted, avgScore });
  } catch (err) {
    res.status(500).json({ error: 'Failed fetching stats' });
  }
};

// ─── HR ACTION: Send Interview Link ───
exports.sendInterviewInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const candRes = await db.query('SELECT * FROM candidates WHERE id = $1', [id]);
    if (candRes.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const c = candRes.rows[0];
    const jobRes = await db.query(
      'SELECT jobs.title FROM jobs JOIN scores ON jobs.id = scores.job_id WHERE scores.candidate_id = $1 LIMIT 1', [id]
    );
    const jobTitle = jobRes.rows.length > 0 ? jobRes.rows[0].title : 'Software Engineer';

    // Generate the unique URL for the Live AI Interview portal
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const aiInterviewUrl = `${protocol}://${host}/interview/${id}`;

    await emailService.sendInterviewInviteEmail({
      candidateName: c.name,
      candidateEmail: c.email,
      jobTitle,
      testScore: c.test_score,
      interviewLink: aiInterviewUrl
    });
    res.json({ success: true, message: `AI Interview invite sent to ${c.email}` });
  } catch (err) {
    console.error('sendInterviewInvite error:', err);
    res.status(500).json({ error: 'Failed to send interview invite' });
  }
};

// ─── HR ACTION: Send Better Luck Email ───
exports.sendBetterLuck = async (req, res) => {
  try {
    const { id } = req.params;
    const candRes = await db.query('SELECT * FROM candidates WHERE id = $1', [id]);
    if (candRes.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const c = candRes.rows[0];
    const jobRes = await db.query(
      'SELECT jobs.title FROM jobs JOIN scores ON jobs.id = scores.job_id WHERE scores.candidate_id = $1 LIMIT 1', [id]
    );
    const jobTitle = jobRes.rows.length > 0 ? jobRes.rows[0].title : 'Software Engineer';
    await emailService.sendBetterLuckEmail({
      candidateName: c.name,
      candidateEmail: c.email,
      jobTitle,
      testScore: c.test_score
    });
    res.json({ success: true, message: `Better luck email sent to ${c.email}` });
  } catch (err) {
    console.error('sendBetterLuck error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

exports.generateInterviewQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateRes = await db.query('SELECT * FROM candidates WHERE id = $1', [id]);
    if (candidateRes.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = candidateRes.rows[0];
    const jobRes = await db.query(
      'SELECT jobs.* FROM jobs JOIN scores ON jobs.id = scores.job_id WHERE scores.candidate_id = $1 LIMIT 1',
      [id]
    );
    const jobDescription = jobRes.rows.length > 0 ? jobRes.rows[0].skills : 'General Software Engineering';
    const questions = await aiService.generateInterviewQuestions(candidate.name, candidate.skills, jobDescription);
    res.json({ questions });
  } catch (err) {
    console.error('Interview question error:', err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

exports.getJobPosterImage = async (req, res) => {
  try {
    const jobRes = await db.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
    if (jobRes.rows.length === 0) return res.status(404).send('Job not found');
    const job = jobRes.rows[0];

    // Generate prompt with Gemini
    const aiPrompt = await aiService.generatePosterPrompt(job);

    // Redirect to pollination to generating and serving the image on the fly
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=1080&height=1080&nologo=true`;
    res.redirect(imageUrl);
  } catch (err) {
    console.error('getJobPosterImage error:', err);
    res.redirect('https://image.pollinations.ai/prompt/professional%20corporate%20hiring%20poster');
  }
};

// --- INTERNAL AUTONOMOUS SCREENING LOGIC ---
const processCandidateScreening = async (candidateId) => {
  try {
    // 1. Fetch candidate and raw resume
    const candidateRes = await db.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);
    if (candidateRes.rows.length === 0) return { error: 'Candidate not found' };
    const candidate = candidateRes.rows[0];

    if (!candidate.resume_text) {
      return { error: 'No resume text available' };
    }

    // 2. Fetch related job
    const jobRes = await db.query('SELECT jobs.id, jobs.title, jobs.skills, jobs.experience FROM jobs JOIN scores ON jobs.id = scores.job_id WHERE scores.candidate_id = $1 LIMIT 1', [candidateId]);

    let jobDescription, jobSkills, jobTitle, jobId;
    if (jobRes.rows.length > 0) {
      const job = jobRes.rows[0];
      jobId = job.id;
      jobDescription = `Job: ${job.title}. Required Skills: ${job.skills}. Experience: ${job.experience} years.`;
      jobSkills = job.skills;
      jobTitle = job.title;
    } else {
      // Fallback to latest job if none explicitly tied
      const latestJobRes = await db.query('SELECT * FROM jobs ORDER BY id DESC LIMIT 1');
      if (latestJobRes.rows.length > 0) {
        const job = latestJobRes.rows[0];
        jobId = job.id;
        jobDescription = `Job: ${job.title}. Required Skills: ${job.skills}. Experience: ${job.experience} years.`;
        jobSkills = job.skills;
        jobTitle = job.title;
      } else {
        jobDescription = 'General Software Engineer role.';
        jobSkills = '';
        jobTitle = 'General Software Engineer';
      }
    }

    console.log(`🤖 Running Autonomous AI Screen for: ${candidate.name} against ${jobTitle}`);

    // 3. Analyze with AI (using our hardened ATS engine)
    let parsedData;
    try {
      parsedData = await aiService.analyzeResume(candidate.resume_text, jobDescription, jobSkills, jobTitle);
    } catch (aiErr) {
      console.error('⚠️ AI Error during autonomous screen:', aiErr.message);
      parsedData = { match_score: 50, skills: [], experience_years: 0, recommendation: 'Manual review' };
    }

    const skills = Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : (parsedData.skills || '');
    const experience = parseInt(parsedData.experience_years) || 0;
    const matchScore = parseFloat(parsedData.match_score) || 0;

    // 4. Decision Logic (Industry Thresholds)
    let newStatus = 'Review';
    if (matchScore >= 90) newStatus = 'Shortlisted';
    else if (matchScore < 40) newStatus = 'Rejected';

    // 5. Generate Test Credentials for Shortlisted candidates
    let testPassword = null;
    if (newStatus === 'Shortlisted') {
      testPassword = Math.random().toString(36).slice(-6).toUpperCase(); // Random 6-char password
    }

    // 6. Update DB
    await db.query(
      `UPDATE candidates SET skills = $1, experience = $2, status = $3, test_password = $4 WHERE id = $5`,
      [skills, experience, newStatus, testPassword, candidateId]
    );

    if (jobId) {
      await db.query(
        `INSERT INTO scores (candidate_id, job_id, score) VALUES ($1, $2, $3) 
         ON CONFLICT (candidate_id, job_id) DO UPDATE SET score = $3`,
        [candidateId, jobId, matchScore]
      );
    }

    // 7. AUTO-EMAILING (The Autonomous Part)
    const placeholderDomains = ['@candidate.local', '@applied.local', '@placeholder'];
    const isRealEmail = candidate.email && !placeholderDomains.some(d => candidate.email.includes(d)) && candidate.email.includes('@');

    if (isRealEmail) {
      try {
        if (newStatus === 'Shortlisted') {
          console.log(`📧 Automatically sending Shortlist/Test email to ${candidate.email}`);
          await emailService.sendInterviewTestEmail({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            jobTitle: jobTitle,
            candidateId: candidateId,
            testPassword: testPassword
          });
        } else if (newStatus === 'Rejected') {
          console.log(`📧 Automatically sending Rejection email to ${candidate.email}`);
          await emailService.sendRejectionEmail({
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            jobTitle: jobTitle
          });
        }
      } catch (err) {
        console.error('Failed to send autonomous email:', err.message);
      }
    }

    return { success: true, status: newStatus, score: matchScore };
  } catch (err) {
    console.error('Autonomous Screening Error:', err);
    throw err;
  }
};

// ─── VOICE AI INTERVIEW CONTROLLERS ───

exports.startInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateRes = await db.query(`
      SELECT c.name, c.skills, c.interview_completed, j.title 
      FROM candidates c 
      JOIN scores s ON c.id = s.candidate_id 
      JOIN jobs j ON s.job_id = j.id 
      WHERE c.id = $1 LIMIT 1
    `, [id]);

    if (candidateRes.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = candidateRes.rows[0];
    if (candidate.interview_completed) return res.status(403).json({ error: 'Interview completed' });

    const sessionData = await aiService.startInterviewSession(candidate.name, candidate.title, candidate.skills);
    res.json(sessionData);
  } catch (err) {
    console.error('startInterview err:', err);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

exports.chatInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { history, answer, questionNumber } = req.body;

    const candidateRes = await db.query(`
      SELECT c.skills, j.title 
      FROM candidates c 
      JOIN scores s ON c.id = s.candidate_id 
      JOIN jobs j ON s.job_id = j.id 
      WHERE c.id = $1 LIMIT 1
    `, [id]);

    if (candidateRes.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = candidateRes.rows[0];

    const turnData = await aiService.processInterviewTurn(candidate, candidate.title, questionNumber, answer, history);
    res.json(turnData);
  } catch (err) {
    console.error('chatInterview err:', err);
    res.status(500).json({ error: 'Failed chat turn' });
  }
};

exports.submitInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { transcript } = req.body;

    const candidateRes = await db.query(`
      SELECT c.name, j.title 
      FROM candidates c 
      JOIN scores s ON c.id = s.candidate_id 
      JOIN jobs j ON s.job_id = j.id 
      WHERE c.id = $1 LIMIT 1
    `, [id]);
    if (candidateRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const candidate = candidateRes.rows[0];

    // Evaluate the complete transcript
    const evaluation = await aiService.evaluateInterview(candidate, candidate.title, transcript);

    // Save to DB
    await db.query(
      'UPDATE candidates SET interview_completed = true, interview_score = $1, interview_data = $2 WHERE id = $3',
      [evaluation.score, JSON.stringify({ transcript, evaluation }), id]
    );

    res.json({ success: true, evaluation });
  } catch (err) {
    console.error('submitInterview err:', err);
    res.status(500).json({ error: 'Failed submission' });
  }
};

exports.sendOfferLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT c.name, c.email, c.skills, j.title 
      FROM candidates c 
      JOIN scores s ON c.id = s.candidate_id 
      JOIN jobs j ON s.job_id = j.id 
      WHERE c.id = $1 LIMIT 1
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = result.rows[0];

    await emailService.sendOfferLetter({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: candidate.title,
      skills: candidate.skills
    });

    res.json({ success: true, message: 'Offer letter sent' });
  } catch (err) {
    console.error('sendOfferLetter err:', err);
    res.status(500).json({ error: 'Failed to send offer letter' });
  }
};

exports.sendRejectionLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT c.name, c.email, j.title 
      FROM candidates c 
      JOIN scores s ON c.id = s.candidate_id 
      JOIN jobs j ON s.job_id = j.id 
      WHERE c.id = $1 LIMIT 1
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });
    const candidate = result.rows[0];

    await emailService.sendRejectionEmail({
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobTitle: candidate.title
    });

    res.json({ success: true, message: 'Rejection email sent' });
  } catch (err) {
    console.error('sendRejectionLetter err:', err);
    res.status(500).json({ error: 'Failed to send rejection letter' });
  }
};

// --- MANUAL ASYNC SCREENING (HR Triggered fallback) ---
exports.screenCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await processCandidateScreening(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process screening' });
  }
};

// --- TEST PORTAL AUTHENTICATION ---
exports.testLogin = async (req, res) => {
  try {
    const { candidateId, testPassword } = req.body;

    // Find candidate
    const result = await db.query('SELECT name, test_password, test_completed FROM candidates WHERE id = $1', [candidateId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid Candidate ID' });

    const candidate = result.rows[0];
    if (candidate.test_completed) return res.status(403).json({ error: 'Assessment already completed.' });
    if (!candidate.test_password) return res.status(403).json({ error: 'No test assigned to this profile.' });

    // Verify password safely (strip whitespace and uppercase)
    if (testPassword.trim().toUpperCase() !== candidate.test_password.trim().toUpperCase()) {
      return res.status(401).json({ error: 'Incorrect Access Code' });
    }

    // Generate JWT token for test session
    const token = jwt.sign({ id: candidateId, role: 'applicant' }, process.env.JWT_SECRET || 'secret123', { expiresIn: '2h' });
    res.json({ success: true, token, name: candidate.name });
  } catch (err) {
    console.error('testLogin error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.getScreeningTest = async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Check if test already generated
    const candidateRes = await db.query('SELECT name, skills, test_data, test_completed FROM candidates WHERE id = $1', [candidateId]);
    if (candidateRes.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });

    const candidate = candidateRes.rows[0];
    if (candidate.test_completed) return res.status(400).json({ error: 'Test already completed' });
    if (candidate.test_data && candidate.test_data.length > 0) return res.json({ questions: candidate.test_data }); // Return existing test

    // Find the job they applied for
    const jobRes = await db.query(
      'SELECT jobs.skills, jobs.title FROM jobs JOIN scores ON jobs.id = scores.job_id WHERE scores.candidate_id = $1 LIMIT 1',
      [candidateId]
    );
    const jobDescription = jobRes.rows.length > 0 ? `${jobRes.rows[0].title} requiring ${jobRes.rows[0].skills}` : 'Software Engineering';

    // Generate new test via Gemini
    const questions = await aiService.generateScreeningTest(candidate.name, candidate.skills, jobDescription);

    // Save generated test temporarily to prevent regeneration on refresh
    await db.query('UPDATE candidates SET test_data = $1 WHERE id = $2', [JSON.stringify(questions), candidateId]);

    // Format for frontend (hide correct answers, but include category)
    const safeQuestions = questions.map(q => ({
      category: q.category || "General",
      question: q.question,
      options: q.options
    }));
    res.json({ questions: safeQuestions });
  } catch (err) {
    console.error('getScreeningTest error:', err);

    // Industrial Professional Fallback: 17 High-Quality Questions (5V, 5A, 5R, 2T)
    const fallbackQuestions = [
      // Verbal (5)
      { category: "Verbal", question: "Which word is a synonym for 'Meticulous'?", options: ["Careless", "Thorough", "Speedy", "Lazy"], correctAnswer: 1 },
      { category: "Verbal", question: "Choose the correctly spelled word:", options: ["Accomodate", "Acommodate", "Accommodate", "Accommodat"], correctAnswer: 2 },
      { category: "Verbal", question: "Complete the analogy: 'Leaf' is to 'Tree' as 'Wheel' is to:", options: ["Bicycle", "Road", "Tire", "Speed"], correctAnswer: 0 },
      { category: "Verbal", question: "Identify the antonym of 'Ambiguous':", options: ["Unclear", "Vague", "Precise", "Hidden"], correctAnswer: 2 },
      { category: "Verbal", question: "Which of the following sentences is grammatically correct?", options: ["He don't like apples.", "She seen the movie yesterday.", "They are going to the mall.", "Me and him went out."], correctAnswer: 2 },

      // Aptitude (5)
      { category: "Aptitude", question: "If a car travels at 60 km/h, how far does it travel in 15 minutes?", options: ["10 km", "15 km", "20 km", "25 km"], correctAnswer: 1 },
      { category: "Aptitude", question: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctAnswer: 2 },
      { category: "Aptitude", question: "A shopkeeper sells an item for $120, making a 20% profit. What was the cost price?", options: ["$90", "$100", "$110", "$115"], correctAnswer: 1 },
      { category: "Aptitude", question: "If 5 workers can build a wall in 10 days, how many days will 10 workers take?", options: ["5 days", "10 days", "15 days", "20 days"], correctAnswer: 0 },
      { category: "Aptitude", question: "What is the next number in the sequence: 2, 4, 8, 16, ...?", options: ["24", "30", "32", "64"], correctAnswer: 2 },

      // Reasoning (5)
      { category: "Reasoning", question: "If 'BLUE' is coded as 'CMVF', how is 'PINK' coded?", options: ["QJOL", "QJNM", "QKNM", "RJO L"], correctAnswer: 0 },
      { category: "Reasoning", question: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", options: ["Sister", "Aunt", "Grandmother", "Mother"], correctAnswer: 3 },
      { category: "Reasoning", question: "Which one does not belong to the group?", options: ["Apple", "Orange", "Potato", "Banana"], correctAnswer: 2 },
      { category: "Reasoning", question: "If all cats are animals and some animals are black, which is certain?", options: ["All cats are black", "Some cats are black", "Some animals are cats", "No cats are black"], correctAnswer: 2 },
      { category: "Reasoning", question: "Which figure comes next in the logic: Circle, Square, Circle, Square...", options: ["Triangle", "Circle", "Hexagon", "Star"], correctAnswer: 1 },

      // Technical (2)
      { category: "Technical", question: "In a Relational Database, what is the primary purpose of a 'Foreign Key'?", options: ["To speed up searches", "To ensure data uniqueness", "To establish a link between two tables", "To encrypt data"], correctAnswer: 2 },
      { category: "Technical", question: "Which of the following is an example of an Asynchronous operation in programming?", options: ["A simple loop", "A basic math calculation", "Fetching data from an external API", "Variable assignment"], correctAnswer: 2 }
    ];

    res.json({ questions: fallbackQuestions.map(q => ({ category: q.category, question: q.question, options: q.options })) });
  }
};

exports.submitScreeningTest = async (req, res) => {
  try {
    const { candidateId } = req.params;
    let answers = [];
    if (req.body.answers) {
      try {
        answers = JSON.parse(req.body.answers);
      } catch (e) {
        answers = req.body.answers; // Fallback if already an array
      }
    }

    let videoUrl = null;
    if (req.file) {
      // The file was saved to public/videos/ by multer
      // We will save the relative path to be served statically
      videoUrl = `/videos/${req.file.filename}.webm`;

      // Rename file to have .webm extension for easy serving
      const oldPath = req.file.path;
      const newPath = `${req.file.path}.webm`;
      fs.renameSync(oldPath, newPath);
      console.log('📹 Saved test video to:', newPath);
    }

    const candidateRes = await db.query('SELECT test_data, test_completed FROM candidates WHERE id = $1', [candidateId]);
    if (candidateRes.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });

    const candidate = candidateRes.rows[0];
    if (candidate.test_completed) return res.status(400).json({ error: 'Test already submitted' });

    const questions = typeof candidate.test_data === 'string' ? JSON.parse(candidate.test_data) : candidate.test_data;
    if (!questions || questions.length === 0) return res.status(400).json({ error: 'No test found to grade' });

    // Grade Test
    let correctCount = 0;
    if (Array.isArray(answers)) {
      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          correctCount++;
        }
      });
    }

    // Score out of 100
    const finalScore = Math.round((correctCount / questions.length) * 100);

    // Save final grade and video url
    await db.query('UPDATE candidates SET test_score = $1, test_completed = true, video_url = $2 WHERE id = $3', [finalScore, videoUrl, candidateId]);

    res.json({ success: true, score: finalScore });
  } catch (err) {
    console.error('submitScreeningTest error:', err);
    res.status(500).json({ error: 'Failed to submit test' });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete from scores table to respect foreign key constraints
    await db.query('DELETE FROM scores WHERE candidate_id = $1', [id]);

    // Then delete the candidate
    const result = await db.query('DELETE FROM candidates WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found' });

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('deleteCandidate error:', err);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};

exports.bulkDeleteCandidates = async (req, res) => {
  try {
    const { candidateIds } = req.body;
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ error: 'No candidate IDs provided' });
    }

    // First delete from scores table to respect foreign key constraints
    await db.query('DELETE FROM scores WHERE candidate_id = ANY($1::int[])', [candidateIds]);

    // Then delete the candidates
    const result = await db.query('DELETE FROM candidates WHERE id = ANY($1::int[]) RETURNING id', [candidateIds]);

    res.json({ success: true, message: `Successfully deleted ${result.rowCount} candidates`, deletedIds: result.rows.map(r => r.id) });
  } catch (err) {
    console.error('bulkDeleteCandidates error:', err);
    res.status(500).json({ error: 'Failed to bulk delete candidates' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete from scores table to respect foreign key constraints
    await db.query('DELETE FROM scores WHERE job_id = $1', [id]);

    // Then delete the job
    const result = await db.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error('deleteJob error:', err);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
