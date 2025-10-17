import os, json
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
def rewrite_resume(jd_text, resume_text):
    prompt = f"""
You are an ATS optimization specialist.
Given the Job Description and Candidate Resume,
rewrite the resume to maximize ATS match and provide a short (150 words) cover letter.

JD:
{jd_text}

Resume:
{resume_text}

Return JSON with keys: tailored_resume, cover_letter.
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}],
        temperature=0.2
    )
    txt = resp.choices[0].message.content.strip()
    try: return json.loads(txt)
    except: return {"tailored_resume":txt,"cover_letter":"See tailored resume."}
