import json, os
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
def score_fit(jd_text, resume_text):
    prompt = f"""
Rate this resume against this job description from 0-100 for:
skills, seniority, tools, impact, communication.
Return JSON {skills, seniority, tools, impact, communication, overall}.
JD: {jd_text}
Resume: {resume_text}
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}],
        temperature=0.1
    )
    txt = resp.choices[0].message.content
    try: return json.loads(txt)
    except: return {"overall":0,"raw":txt}
