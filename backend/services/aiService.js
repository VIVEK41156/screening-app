const { GoogleGenerativeAI } = require("@google/generative-ai");
const { spawn } = require('child_process');
const path = require('path');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Rate-limiting retry wrapper for Gemini
async function generateContentWithRetry(promptOrArray, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(promptOrArray);
    } catch (err) {
      if (err.message && err.message.includes('429 Too Many Requests') && i < maxRetries - 1) {
        // Exponential backoff: 3s, 6s, 12s...
        const delay = Math.pow(2, i) * 3000;
        console.warn(`[Gemini Rate Limit] 429 hit. Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

// Helper to run Python Scorer
const runPythonScorer = (resumeText, jobSkills, jobDescription) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [path.join(__dirname, '../ats_scorer.py')]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python Scorer Error:', errorString);
        return resolve({ match_score: 50 }); // Fallback
      }
      try {
        const result = JSON.parse(dataString.trim());
        resolve(result);
      } catch (e) {
        console.error('Python Scorer Parse Error:', e);
        resolve({ match_score: 50 });
      }
    });

    pythonProcess.stdin.write(JSON.stringify({
      resume_text: resumeText,
      job_skills: jobSkills,
      job_desc: jobDescription
    }));
    pythonProcess.stdin.end();
  });
};

exports.analyzeResume = async (resumeText, jobDescription, jobSkills = '', jobTitle = '') => {
  try {
    let finalResumeText = resumeText;
    let isBase64 = resumeText.startsWith('data:');

    // 1. If Base64, we MUST extract text via Gemini Vision first
    if (isBase64) {
      console.log('👁️ Vision OCR Extraction starting for deterministic scoring...');
      const arr = resumeText.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const base64Data = arr[1];

      const ocrResult = await generateContentWithRetry([
        "Please extract all readable text from this document image/PDF exactly. Return ONLY the extracted text.",
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ]);
      finalResumeText = ocrResult.response.text();
      console.log('✅ OCR Text Extracted (Length):', finalResumeText.length);
    }

    console.log('--- EXECUTING DETERMINISTIC ATS SCORER ---');
    const pythonScoreResult = await runPythonScorer(finalResumeText, jobSkills, jobDescription);
    const deterministicScore = pythonScoreResult.match_score || 50;
    console.log(`ATS Engine Score Calculated: ${deterministicScore}%`);

    const prompt = `
      You are an expert, highly accurate HR AI Assistant. I will provide you with a candidate's resume text and a job description.
      
      Your task is to:
      1. Extract the candidate's Name, Email, Phone, Skills (comma separated list), Experience (in total years as an integer).
      2. Set "match_score" to exactly ${deterministicScore}. (This was calculated by our deterministic Machine Learning ATS engine. Do not alter it or calculate your own).
      3. Set "skills" to exactly include these matched skills if available: ${JSON.stringify(pythonScoreResult.matched_skills || [])} but also extract any other skills you find.
      4. Provide a brief 1-2 sentence recommendation on whether to shortlist them based on this score.
      
      Return ONLY a valid JSON object with the following exact keys, no markdown blocks, no extra text:
      {
        "name": "",
        "email": "",
        "phone": "",
        "skills": ["", ""],
        "experience_years": 0,
        "match_score": ${deterministicScore},
        "recommendation": ""
      }
      
      Job Title: ${jobTitle}
      Job Required Skills: ${jobSkills}
      Job Description:
      ${jobDescription}
      
      Resume Text:
      ${finalResumeText}
    `;

    const result = await generateContentWithRetry(prompt);
    const responseText = result.response.text().trim();

    // Clean up potential markdown code blocks returned by Gemini
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    // Safety check: ensure the score used is ALWAYS the deterministic one from Python
    parsed.match_score = deterministicScore;
    parsed.resume_text = finalResumeText; // Return the extracted text for DB persistence
    return parsed;
  } catch (err) {
    console.error("⚠️ AI Pipeline Error (Gemini/Python):", err.message);

    // Last Resort Fallback: If EVERYTHING fails, we still try to get a Python score if possible
    let fallbackScore = 50;
    try {
      const quickRes = await runPythonScorer(resumeText, jobSkills, jobDescription);
      fallbackScore = quickRes.match_score || 50;
    } catch (e) { }

    return {
      name: "Candidate",
      email: null,
      phone: null,
      skills: [],
      experience_years: 0,
      match_score: fallbackScore,
      recommendation: `Match score of ${fallbackScore}% determined via ML. (Note: Full summary analysis failed due to: ${err.message}).`
    };
  }
};

exports.generateInterviewQuestions = async (candidateName, candidateSkills, jobDescription) => {
  try {
    const prompt = `
      You are an expert technical interviewer.
      A candidate named ${candidateName} has applied for a role requiring the following skills: ${jobDescription}.
      The candidate has the following background skills: ${candidateSkills}.
      
      Generate 3 highly specific, challenging interview questions tailored to their background to verify their expertise, and 1 question addressing a potential skill gap between their background and the job requirements.
      
      Return ONLY a valid JSON array of strings, no markdown formatting. Example: 
      ["Question 1", "Question 2", "Question 3", "Question 4"]
    `;

    const result = await generateContentWithRetry(prompt);
    let responseText = result.response.text().trim();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(responseText);
  } catch (err) {
    console.error("Error generating questions:", err);
    return ["Tell me about your experience.", "What are your strengths?", "Describe a challenging project.", "Why do you want this job?"]; // Fallback
  }
};

exports.generatePosterPrompt = async (job) => {
  try {
    const prompt = `
      You are an expert graphic design assistant. 
      Generate a short, highly stylized image generation prompt (max 30 words) for a professional corporate hiring poster for a '${job.title}' role. 
      The image should NOT contain any text. It should feature a high-tech, abstract glassmorphism style, dark purple (#4B3C8C) and neon accents, suitable for modern recruiting.
    `;
    const result = await generateContentWithRetry(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("Error generating poster prompt:", err);
    return "A professional modern abstract technology background in dark purple glassmorphism style, no text, 4k high definition.";
  }
};

exports.generateScreeningTest = async (candidateName, candidateSkills, jobDescription) => {
  try {
    const prompt = `
      You are an expert technical assessor and recruitment specialist for a high-end firm.
      A candidate named ${candidateName} has applied for a role with the following job requirements: ${jobDescription}.
      The candidate has the following background skills: ${candidateSkills}.
      
      Generate a professional, comprehensive multiple-choice screening test containing exactly 17 questions across the following categories:
      1. Verbal Ability (5 questions): Focus on English grammar, vocabulary, and reading comprehension.
      2. Quantitative Aptitude (5 questions): Focus on arithmetic, logic, and data interpretation.
      3. Logical Reasoning (5 questions): Focus on patterns, inductive reasoning, and deductive logic.
      4. Technical Proficiency (2 questions): Focus on core technical skills specifically required for the role (e.g., Python, SQL, Cloud, etc.).
      
      Return ONLY a valid JSON array of objects, with NO markdown formatting or extra text. Each object MUST have:
      - "category" (string, one of: "Verbal", "Aptitude", "Reasoning", "Technical")
      - "question" (string)
      - "options" (array of exactly 4 strings)
      - "correctAnswer" (integer, 0 to 3, representing the index of the correct option)
      
      Example Structure:
      [
        {
          "category": "Verbal",
          "question": "Choose the synonym for...",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0
        }
        ... (repeat for all 17 questions)
      ]
    `;

    const result = await generateContentWithRetry(prompt);
    let responseText = result.response.text().trim();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(responseText);
  } catch (err) {
    console.error("Error generating screening test:", err);
    // Professional Industrial Fallback: Provide a high-quality standard technical test if AI fails
    return [
      {
        "question": "What is the primary benefit of using a Virtual DOM in modern frontend frameworks?",
        "options": ["Direct manipulation of heavy DOM elements", "Batching updates to minimize expensive layout recalculations", "Eliminating the need for CSS", "Speeding up network requests"],
        "correctAnswer": 1
      },
      {
        "question": "Which of the following is a core principle of RESTful API design?",
        "options": ["Stateful communication", "Strict dependency on XML", "Statelessness and resource-based URLs", "Bypassing HTTP status codes"],
        "correctAnswer": 2
      },
      {
        "question": "In JavaScript, 'closure' refers to:",
        "options": ["A function's ability to access its outer scope even after the outer function has returned", "Closing a database connection", "Private class variables only", "Ending a loop prematurely"],
        "correctAnswer": 0
      },
      {
        "question": "What is the main purpose of an Index in a PostgreSQL database?",
        "options": ["To encrypt sensitive data", "To speed up data retrieval operations", "To delete duplicate records automatically", "To provide a backup of the entire table"],
        "correctAnswer": 1
      },
      {
        "question": "Which HTTP method is most appropriate for updating an existing resource partially?",
        "options": ["GET", "POST", "PATCH", "DELETE"],
        "correctAnswer": 2
      }
    ];
  }
};

// --- VOICE AI INTERVIEW ENGINE ---
exports.startInterviewSession = async (candidateName, jobTitle) => {
  const greeting = `Hello ${candidateName}! Welcome to your AI-powered interview for the ${jobTitle} position. I am EVA, your AI interviewer. This session has 6 questions. Please speak naturally. First question: Can you give me a brief introduction about yourself and what drew you to the ${jobTitle} role?`;
  return { greeting, questionNumber: 1, totalQuestions: 6 };
};

exports.processInterviewTurn = async (candidate, jobTitle, questionNumber, answer, history) => {
  try {
    const historyText = history.map(h => `${h.role === 'ai' ? 'EVA' : 'Candidate'}: ${h.text}`).join('\n');
    let prompt;

    if (questionNumber < 6) {
      prompt = `
        You are EVA, an expert AI interviewer hiring for a ${jobTitle} role.
        The candidate's profile has these skills: ${candidate.skills}.
        This is question number ${questionNumber} of 6.
        Here is the conversation so far:
        ${historyText}
        Candidate just answered: "${answer}"
        
        Generate the NEXT single interview question to ask the candidate. 
        Keep it highly conversational, professional, and concise (under 30 words).
        Do not output any prefix like "EVA:". Just the exact words you will speak to the candidate.
      `;
      const result = await generateContentWithRetry(prompt);
      const nextQuestion = result.response.text().trim();
      return { isComplete: false, nextQuestion };
    } else {
      prompt = `
        You are EVA, closing the interview.
        Here is the conversation so far:
        ${historyText}
        Candidate just answered the 6th and final question: "${answer}"
        
        Acknowledge their answer briefly, thank them for their time, and officially conclude the interview.
        Keep it professional, encouraging, and under 30 words.
      `;
      const result = await generateContentWithRetry(prompt);
      const closing = result.response.text().trim();
      return { isComplete: true, nextQuestion: closing };
    }
  } catch (err) {
    console.error("processInterviewTurn Error:", err);
    return { isComplete: false, nextQuestion: "I'm sorry, I encountered a brief glitch. Could you expand on that?" };
  }
};

exports.evaluateInterview = async (candidate, jobTitle, transcript) => {
  try {
    const historyText = transcript.map(h => `${h.role === 'ai' ? 'EVA' : 'Candidate'}: ${h.text}`).join('\n');
    const prompt = `
      You are an expert HR Analyst.
      A candidate completed an AI voice interview for the "${jobTitle}" role.
      Here is the interview transcript:
      ${historyText}
      
      Evaluate their performance out of 100 based on the quality, relevance, and clarity of their answers.
      Return exactly this JSON structure (NO MARKDOWN or prefix/suffix text):
      {
        "score": number, 
        "summary": "2-3 sentences max summarizing their overall performance",
        "strengths": ["string", "string", "string"],
        "weaknesses": ["string", "string"],
        "recommendation": "Hire" | "Consider" | "Reject"
      }
    `;
    const result = await generateContentWithRetry(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("evaluateInterview Error:", err);
    return {
      score: 70,
      summary: "Interview completed but evaluation AI encountered an error generating detailed feedback.",
      strengths: ["Completed the automated interview"],
      weaknesses: ["N/A"],
      recommendation: "Consider"
    };
  }
};
