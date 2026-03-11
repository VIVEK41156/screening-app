import os
import json
from datetime import datetime
import sqlite3

def generate_ai_insights():
    """
    Simulates advanced AI analysis on a mock dataset of resumes to impress the CEO.
    This script could be extended to use NLP libraries like SpaCy or Transformers 
    to parse actual resume PDFs in a full production environment.
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting AI Candidate Analysis Pipeline...")
    
    # Mock data representing extracted skills from recent candidate batch
    recent_candidates = [
        {"name": "Alice Smith", "skills": ["React", "Node.js", "TypeScript"], "experience_years": 4},
        {"name": "Bob Johnson", "skills": ["Python", "Django", "PostgreSQL"], "experience_years": 6},
        {"name": "Charlie Davis", "skills": ["React", "CSS", "Figma"], "experience_years": 2},
        {"name": "Diana Evans", "skills": ["Java", "Spring Boot", "AWS"], "experience_years": 5},
        {"name": "Ethan Foster", "skills": ["React", "Next.js", "GraphQL"], "experience_years": 3},
    ]

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Ingested {len(recent_candidates)} resumes for processing.")
    
    # Perform rudimentary analysis
    skill_frequency = {}
    total_experience = 0
    
    for c in recent_candidates:
        total_experience += c["experience_years"]
        for skill in c["skills"]:
            skill_frequency[skill] = skill_frequency.get(skill, 0) + 1
            
    avg_experience = total_experience / len(recent_candidates)
    top_skills = sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Generate insights
    insights = {
        "timestamp": datetime.now().isoformat(),
        "total_analyzed": len(recent_candidates),
        "average_experience_years": round(avg_experience, 1),
        "trending_skills": [skill for skill, count in top_skills],
        "ai_recommendation": f"High concentration of {top_skills[0][0]} skills detected. Recommend opening senior {top_skills[0][0]} roles to capture top talent in this pool."
    }
    
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Analysis Complete. Key Finding: {insights['ai_recommendation']}")
    
    # Save the output to be consumed by the Node backend if needed
    output_path = os.path.join(os.path.dirname(__file__), 'ai_insights.json')
    with open(output_path, 'w') as f:
        json.dump(insights, f, indent=2)
        
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Insights written to {output_path}")

if __name__ == "__main__":
    # Ensure any required directories or setups are present
    print("--- SMART RESUME SCREENING: AI ANALYTICS ENGINE ---")
    generate_ai_insights()
    print("--- EXECUTION FINISHED ---")
