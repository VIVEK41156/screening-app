import sys
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def process_resume():
    # Read entire JSON payload from STDIN
    input_data = sys.stdin.read()
    try:
        data = json.loads(input_data)
        resume_text = data.get("resume_text", "")
        job_skills = data.get("job_skills", "")
        job_desc = data.get("job_desc", "")
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return
        
    if not job_skills or not resume_text:
        print(json.dumps({
            "match_score": 50, 
            "matched_skills": [], 
            "missing_skills": []
        }))
        return

    # Normalize texts
    resume_lower = resume_text.lower()
    
    # Extract unique job skills (split by comma, semicolon, newline, or pipe)
    skills_list = [s.strip().lower() for s in re.split(r'[,;|\n]', job_skills) if len(s.strip()) > 1]
    
    matched = []
    missing = []
    
    # 1. Strict ATS Skill Keyword Matching (Primary Weight)
    for skill in skills_list:
        # Clean the skill name for more robust matching (remove 'Apache ' prefix if it exists)
        base_skill = re.sub(r'^apache\s+', '', skill)
        escaped_base = re.escape(base_skill)
        escaped_skill = re.escape(skill)
        
        # We match if the full skill or the base name exists
        if len(skill) <= 4 and re.match(r'^[a-z0-9]+$', skill):
            pattern = r'\b' + escaped_skill + r'\b'
        else:
            # Match either the full name (e.g., 'Apache Spark') or the common base ('Spark')
            pattern = f"({escaped_skill}|{escaped_base})"
            
        is_match = bool(re.search(pattern, resume_lower))
        sys.stderr.write(f"DEBUG: Skill='{skill}' Pattern='{pattern}' Match={is_match}\n")
        
        if is_match:
            matched.append(skill)
        else:
            missing.append(skill)
            
    skill_score = (len(matched) / len(skills_list)) * 100 if skills_list else 50
    sys.stderr.write(f"DEBUG: Skill Score = {skill_score} (Matched: {len(matched)} / Total: {len(skills_list)})\n")
    
    # 2. TF-IDF Contextual Similarity using Scikit-Learn (Secondary Weight)
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([job_desc, resume_text])
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        context_score = cosine_sim * 100
    except:
        context_score = 50
        
    # Context score is usually very low mathematically (10%-30%) because resumes are long 
    # and job descriptions are short. We normalize it aggressively.
    normalized_context = min(100, context_score * 3.5)
    
    # 3. Final Hybrid ATS Score Calculation
    # 80% weight on exact hard skills match, 20% on AI contextual word similarity
    final_score = (skill_score * 0.8) + (normalized_context * 0.2)
    
    # ATS Calibration: If a candidate matches ALL required skills, they must be guaranteed 
    # an outstanding score (>= 95%) regardless of TF-IDF context penalty.
    if skill_score == 100:
        final_score = max(95, final_score)
        
    # Boundary constraints
    if final_score > 100: final_score = 100
    if final_score < 10: final_score = 10
    
    # Output deterministic JSON exactly as required by the backend
    print(json.dumps({
        "match_score": int(final_score),
        "matched_skills": [s.title() for s in matched],
        "missing_skills": [s.title() for s in missing],
        "metrics": {
            "skill_match_percentage": int(skill_score),
            "tfidf_cosine_similarity": float(cosine_sim)
        }
    }))

if __name__ == "__main__":
    process_resume()
