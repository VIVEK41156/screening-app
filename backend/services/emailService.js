const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const COMPANY = process.env.COMPANY_NAME || 'HR Smart AI';
const FROM = process.env.EMAIL_USER;

exports.sendInterviewTestEmail = async ({ candidateName, candidateEmail, jobTitle, candidateId, testPassword }) => {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://screening-backend.onrender.com';
  const testUrl = `${BACKEND_URL}/test/${candidateId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 640px; margin: 2rem auto; }
        .header { background: linear-gradient(135deg, #4B3C8C, #3A2E6F); padding: 2.5rem; border-radius: 16px 16px 0 0; text-align: center; color: white; }
        .header h1 { font-size: 1.75rem; margin: 0; }
        .header p { opacity: 0.8; font-size: 0.9rem; margin-top: 0.5rem; }
        .body { background: white; padding: 2.5rem; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .congrats { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; margin-bottom: 1.5rem; }
        .congrats p { color: #166534; margin: 0; font-weight: 600; }
        p { color: #374151; line-height: 1.7; margin-bottom: 1rem; }
        .details { background: #f8f7ff; border-radius: 12px; padding: 1.25rem 1.5rem; margin: 1.5rem 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 0.5rem 0; color: #374151; font-size: 0.9rem; }
        .details td:first-child { font-weight: 600; color: #4B3C8C; width: 40%; }
        .btn { display: inline-block; margin-top: 1.5rem; padding: 0.875rem 2rem; background: linear-gradient(135deg, #4B3C8C, #3A2E6F); color: white !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 1rem; text-align: center; }
        .footer { text-align: center; color: #9ca3af; font-size: 0.78rem; margin-top: 1.5rem; }
        .signature { border-top: 1px solid #e5e7eb; margin-top: 1.5rem; padding-top: 1.25rem; color: #6b7280; font-size: 0.875rem; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="https://evalright.us/wp-content/uploads/2024/08/EvalRight-PNG-AI-2048x853.png" alt="EvalRight" style="height:40px;object-fit:contain;filter:brightness(0) invert(1);display:block;margin:0 auto 0.75rem" />
          <p>AI-Powered Recruitment Platform</p>
        </div>
        <div class="body">
          <div class="congrats"><p>🎉 Congratulations, ${candidateName}!</p></div>
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>We are thrilled to inform you that your resume was an excellent match for the <strong>${jobTitle}</strong> position. You have been shortlisted for the next round!</p>
          <p>As the next step in our process, we require you to complete a brief Technical AI Screening Test designed specifically for your profile. Please click the secure link below to begin your exam.</p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${testUrl}" class="btn">Start AI Screening Test</a>
          </div>

          <div class="details">
            <table>
              <tr><td>Role</td><td>${jobTitle}</td></tr>
              <tr><td>Candidate ID</td><td><strong>${candidateId}</strong></td></tr>
              <tr><td>Access Code</td><td><strong style="font-family: monospace; font-size: 1.1rem; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${testPassword || 'N/A'}</strong></td></tr>
              <tr><td>Format</td><td>Multiple Choice (Role-Specific AI Generated)</td></tr>
              <tr><td>Requirement</td><td>Webcam & Microphone</td></tr>
            </table>
          </div>
          
          <p>Please ensure you are in a quiet environment before starting the assessment.</p>
          <div class="signature">
            <p><strong>${COMPANY} — Recruitment Team</strong></p>
            <p>Powered by HR Smart AI · Google Gemini</p>
          </div>
        </div>
        <div class="footer">${COMPANY} · This is an automated email from our AI recruitment system.</div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${COMPANY} Recruitment" <${FROM}>`,
    to: candidateEmail,
    subject: `Action Required: AI Screening Test for ${jobTitle} at ${COMPANY}`,
    html,
  });
};

exports.sendOfferLetter = async ({ candidateName, candidateEmail, jobTitle, skills }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 640px; margin: 2rem auto; }
        .header { background: linear-gradient(135deg, #4B3C8C, #3A2E6F); padding: 2.5rem; border-radius: 16px 16px 0 0; text-align: center; color: white; }
        .header h1 { font-size: 1.75rem; margin: 0; }
        .header p { opacity: 0.8; font-size: 0.9rem; margin-top: 0.5rem; }
        .body { background: white; padding: 2.5rem; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .congrats { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; margin-bottom: 1.5rem; }
        .congrats p { color: #166534; margin: 0; font-weight: 600; }
        p { color: #374151; line-height: 1.7; margin-bottom: 1rem; }
        .details { background: #f8f7ff; border-radius: 12px; padding: 1.25rem 1.5rem; margin: 1.5rem 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 0.5rem 0; color: #374151; font-size: 0.9rem; }
        .details td:first-child { font-weight: 600; color: #4B3C8C; width: 40%; }
        .btn { display: inline-block; margin-top: 1.5rem; padding: 0.875rem 2rem; background: linear-gradient(135deg, #4B3C8C, #3A2E6F); color: white !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 1rem; }
        .footer { text-align: center; color: #9ca3af; font-size: 0.78rem; margin-top: 1.5rem; }
        .signature { border-top: 1px solid #e5e7eb; margin-top: 1.5rem; padding-top: 1.25rem; color: #6b7280; font-size: 0.875rem; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="https://evalright.us/wp-content/uploads/2024/08/EvalRight-PNG-AI-2048x853.png" alt="EvalRight" style="height:40px;object-fit:contain;filter:brightness(0) invert(1);display:block;margin:0 auto 0.75rem" />
          <p>AI-Powered Recruitment Platform</p>
        </div>
        <div class="body">
          <div class="congrats"><p>🎉 Congratulations, ${candidateName}!</p></div>
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>We are thrilled to inform you that after our AI-assisted screening process, you have been <strong>selected</strong> for the following position. Your profile showed an exceptional match with our requirements.</p>
          <div class="details">
            <table>
              <tr><td>Position</td><td>${jobTitle}</td></tr>
              <tr><td>Company</td><td>${COMPANY}</td></tr>
              <tr><td>Key Skills</td><td>${skills || 'As discussed'}</td></tr>
              <tr><td>Decision Date</td><td>${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</td></tr>
            </table>
          </div>
          <p>Please reply to this email to confirm your acceptance and we will share the detailed offer letter, compensation structure, and onboarding details within 24 hours.</p>
          <p>We look forward to having you join our team!</p>
          <div class="signature">
            <p><strong>${COMPANY} — Recruitment Team</strong></p>
            <p>Powered by HR Smart AI · Google Gemini</p>
          </div>
        </div>
        <div class="footer">${COMPANY} · This is an automated email from our AI recruitment system.</div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${COMPANY} Recruitment" <${FROM}>`,
    to: candidateEmail,
    subject: `🎉 Congratulations! You've been selected — ${jobTitle} at ${COMPANY}`,
    html,
  });
};

exports.sendRejectionEmail = async ({ candidateName, candidateEmail, jobTitle }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 640px; margin: 2rem auto; }
        .header { background: linear-gradient(135deg, #4B3C8C, #3A2E6F); padding: 2.5rem; border-radius: 16px 16px 0 0; text-align: center; color: white; }
        .body { background: white; padding: 2.5rem; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        p { color: #374151; line-height: 1.7; margin-bottom: 1rem; }
        .note { background: #fff7ed; border-left: 4px solid #f97316; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; margin: 1.5rem 0; }
        .note p { color: #9a3412; margin: 0; font-size: 0.9rem; }
        .signature { border-top: 1px solid #e5e7eb; margin-top: 1.5rem; padding-top: 1.25rem; color: #6b7280; font-size: 0.875rem; }
        .footer { text-align: center; color: #9ca3af; font-size: 0.78rem; margin-top: 1.5rem; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="https://evalright.us/wp-content/uploads/2024/08/EvalRight-PNG-AI-2048x853.png" alt="EvalRight" style="height:40px;object-fit:contain;filter:brightness(0) invert(1);display:block;margin:0 auto 0.75rem" />
          <p>AI-Powered Recruitment Platform</p>
        </div>
        <div class="body">
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${COMPANY}</strong>.</p>
          <p>After careful AI-assisted review, we won't be moving forward with your application at this time.</p>
          <div class="note">
            <p>💡 <strong>Tip:</strong> We keep all profiles on file for 6 months. We encourage you to apply for future openings that match your skill set.</p>
          </div>
          <p>We appreciate your effort and wish you the very best.</p>
          <div class="signature">
            <p><strong>${COMPANY} — Recruitment Team</strong></p>
            <p>Powered by HR Smart AI · Google Gemini</p>
          </div>
        </div>
        <div class="footer">${COMPANY} · Automated AI Recruitment System</div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${COMPANY} Recruitment" <${FROM}>`,
    to: candidateEmail,
    subject: `Your Application Update — ${jobTitle} at ${COMPANY}`,
    html,
  });
};

// ─── INTERVIEW INVITE (HR sends after test pass) ───
exports.sendInterviewInviteEmail = async ({ candidateName, candidateEmail, jobTitle, testScore, interviewLink }) => {
  const meetLink = interviewLink || 'https://meet.google.com/new';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 640px; margin: 2rem auto; }
        .header { background: linear-gradient(135deg, #16a34a, #15803d); padding: 2.5rem; border-radius: 16px 16px 0 0; text-align: center; color: white; }
        .header h1 { font-size: 1.75rem; margin: 0.75rem 0 0; }
        .header p { opacity: 0.85; font-size: 0.9rem; margin-top: 0.5rem; }
        .body { background: white; padding: 2.5rem; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .congrats { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; margin-bottom: 1.5rem; }
        .congrats p { color: #166534; margin: 0; font-weight: 700; font-size: 1rem; }
        p { color: #374151; line-height: 1.7; margin-bottom: 1rem; }
        .score-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 16px; padding: 1.25rem; text-align: center; margin: 1.5rem 0; }
        .score-num { font-size: 3rem; font-weight: 900; color: #16a34a; line-height: 1; }
        .score-label { font-size: 0.85rem; color: #15803d; font-weight: 600; }
        .details { background: #f8f7ff; border-radius: 12px; padding: 1.25rem 1.5rem; margin: 1.5rem 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 0.5rem 0; color: #374151; font-size: 0.9rem; }
        .details td:first-child { font-weight: 600; color: #4B3C8C; width: 40%; }
        .btn { display: block; width: fit-content; margin: 1.5rem auto; padding: 1rem 2.5rem; background: linear-gradient(135deg, #16a34a, #15803d); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 1.05rem; text-align: center; }
        .signature { border-top: 1px solid #e5e7eb; margin-top: 1.5rem; padding-top: 1.25rem; color: #6b7280; font-size: 0.875rem; }
        .footer { text-align: center; color: #9ca3af; font-size: 0.78rem; margin-top: 1.5rem; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="https://evalright.us/wp-content/uploads/2024/08/EvalRight-PNG-AI-2048x853.png" alt="EvalRight" style="height:40px;object-fit:contain;filter:brightness(0) invert(1);display:block;margin:0 auto 0.75rem" />
          <h1>🎉 Interview Invitation</h1>
          <p>You've made it to the final round!</p>
        </div>
        <div class="body">
          <div class="congrats"><p>Congratulations, ${candidateName}! You passed the AI Screening Test.</p></div>
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>We are thrilled to inform you that you have passed the AI Screening Assessment for the <strong>${jobTitle}</strong> position and you are invited for a <strong>Live Technical Interview</strong>!</p>

          <div class="score-box">
            <div class="score-num">${testScore || '--'}%</div>
            <div class="score-label">Your Screening Test Score</div>
          </div>

          <div class="details">
            <table>
              <tr><td>Position</td><td>${jobTitle}</td></tr>
              <tr><td>Interview Type</td><td>Live Technical Round</td></tr>
              <tr><td>Platform</td><td>Google Meet / Video Call</td></tr>
              <tr><td>Next Step</td><td>Click the button below to join</td></tr>
            </table>
          </div>

          <p>Please use the link below to join your interview session. Ensure your camera and microphone are working before joining.</p>
          <a href="${meetLink}" class="btn">Join Interview Session →</a>

          <p style="font-size:0.85rem;color:#6b7280;">If the button above doesn't work, copy and paste this link: ${meetLink}</p>

          <div class="signature">
            <p><strong>${COMPANY} — Recruitment Team</strong></p>
            <p>Powered by HR Smart AI · Google Gemini</p>
          </div>
        </div>
        <div class="footer">${COMPANY} · Automated AI Recruitment System</div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${COMPANY} Recruitment" <${FROM}>`,
    to: candidateEmail,
    subject: `🎉 Interview Invitation — ${jobTitle} at ${COMPANY}`,
    html,
  });
};

// ─── BETTER LUCK NEXT TIME (HR sends after test fail) ───
exports.sendBetterLuckEmail = async ({ candidateName, candidateEmail, jobTitle, testScore }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .wrapper { max-width: 640px; margin: 2rem auto; }
        .header { background: linear-gradient(135deg, #b45309, #92400e); padding: 2.5rem; border-radius: 16px 16px 0 0; text-align: center; color: white; }
        .header h1 { font-size: 1.75rem; margin: 0.75rem 0 0; }
        .body { background: white; padding: 2.5rem; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        p { color: #374151; line-height: 1.7; margin-bottom: 1rem; }
        .score-box { background: #fff7ed; border: 2px solid #f97316; border-radius: 16px; padding: 1.25rem; text-align: center; margin: 1.5rem 0; }
        .score-num { font-size: 3rem; font-weight: 900; color: #b45309; line-height: 1; }
        .score-label { font-size: 0.85rem; color: #c2410c; font-weight: 600; }
        .tips { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 1.25rem; border-radius: 0 12px 12px 0; margin: 1.5rem 0; }
        .tips p { margin: 0; color: #78350f; font-size: 0.9rem; }
        .tips ul { color: #78350f; font-size: 0.9rem; margin: 0.5rem 0 0 1rem; line-height: 2; }
        .signature { border-top: 1px solid #e5e7eb; margin-top: 1.5rem; padding-top: 1.25rem; color: #6b7280; font-size: 0.875rem; }
        .footer { text-align: center; color: #9ca3af; font-size: 0.78rem; margin-top: 1.5rem; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="https://evalright.us/wp-content/uploads/2024/08/EvalRight-PNG-AI-2048x853.png" alt="EvalRight" style="height:40px;object-fit:contain;filter:brightness(0) invert(1);display:block;margin:0 auto 0.75rem" />
          <h1>Keep Going! 💪</h1>
          <p>Better Luck Next Time</p>
        </div>
        <div class="body">
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>Thank you for completing the AI Screening Assessment for the <strong>${jobTitle}</strong> position. We truly appreciate the time and effort you invested.</p>

          <div class="score-box">
            <div class="score-num">${testScore || '--'}%</div>
            <div class="score-label">Your Score · Passing: 60%</div>
          </div>

          <p>Unfortunately, you did not meet the qualifying threshold for this round. But this is not the end — every great engineer has faced setbacks.</p>

          <div class="tips">
            <p><strong>💡 How to prepare for next time:</strong></p>
            <ul>
              <li>Practice Verbal & Reasoning on IndiaBIX / PrepInsta</li>
              <li>Brush up on Aptitude on GeeksforGeeks</li>
              <li>Strengthen your technical skills on LeetCode</li>
            </ul>
          </div>

          <p>We will keep your profile on file for <strong>6 months</strong>. Future openings that match your skills will be shared with you.</p>
          <p>Wishing you the very best! Keep learning and keep growing. 🚀</p>

          <div class="signature">
            <p><strong>${COMPANY} — Recruitment Team</strong></p>
            <p>Powered by HR Smart AI · Google Gemini</p>
          </div>
        </div>
        <div class="footer">${COMPANY} · Automated AI Recruitment System</div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"${COMPANY} Recruitment" <${FROM}>`,
    to: candidateEmail,
    subject: `Assessment Update — ${jobTitle} at ${COMPANY}`,
    html,
  });
};

