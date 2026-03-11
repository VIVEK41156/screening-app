# AI-Powered Resume Screening System 🚀

This is a full-stack web application designed to automate and streamline the resume screening process using AI. It analyzes candidate resumes, extracts key skills, evaluates them against job requirements, and provides an intelligent ranking and shortlisting system.

## Features ✨

*   **AI Resume Parsing:** Extracts skills, experience, and education from resumes.
*   **Intelligent Scoring:** Matches candidate profiles against specific job requirements using AI.
*   **Dashboard Analytics:** Visualizes applicant data, average scores, and pipeline status.
*   **Candidate Ranking:** Automatically ranks candidates based on their AI match score.
*   **Live AI Interviews:** (Preview) Interface for analyzing candidate video responses.
*   **Deep Dark Theme:** A premium, fully custom-designed dark interface with vibrant accents.

## Tech Stack 🛠️

*   **Frontend:** React (Vite), custom vanilla CSS (no external CSS frameworks), Recharts for data visualization.
*   **Backend:** Node.js, Express, PostgreSQL (for database management).
*   **AI Integration:** DeepSeek AI (via OpenRouter/OpenAI compatible API) for text analysis and scoring.

## Getting Started 💻

To run this project locally, you will need Node.js and PostgreSQL installed on your system.

### 1. Clone the repository

```bash
git clone https://github.com/VIVEK41156/screening-app.git
cd screening-app
```

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/your_database_name
OPENROUTER_API_KEY=your_deepseek_or_openrouter_api_key
```
*(Replace `username`, `password`, `your_database_name`, and `your_deepseek_or_openrouter_api_key` with your actual credentials)*

**Start the Backend Server:**

```bash
node server.js
```
*(The server will start on port 5000 or the port specified in your .env)*

### 3. Frontend Setup

Open a *new* terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
```

**Start the Frontend Development Server:**

```bash
npm run dev
```

The application will now be running. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173` or similar).
