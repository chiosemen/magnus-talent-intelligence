import os, json
from dotenv import load_dotenv
from modules.supabase_client import insert_log
from modules.llm_rewriter import rewrite_resume
from modules.llm_scorer import score_fit
from modules.outreach import send_email
from modules.logger import log
load_dotenv("config.env")
def main():
    jd_text = open("job_description.txt").read()
    resume_text = open("resume.txt").read()
    log("Score", "LLM rubric scoring")
    score = score_fit(jd_text, resume_text)
    insert_log("matches", {"fit_score": score.get("overall", 0), "rubric": score})
    log("Rewrite", "Tailored resume + cover letter")
    rewrite = rewrite_resume(jd_text, resume_text)
    insert_log("rewrites", {"tailored_resume": rewrite["tailored_resume"], "cover_letter": rewrite["cover_letter"]})
    log("Outreach", "Emailing recruiter")
    status = send_email("Application – Product Owner", rewrite["cover_letter"] + "\n\n---\n" + rewrite["tailored_resume"], os.getenv("TO_EMAIL"))
    insert_log("outreach", {"status": status, "to_email": os.getenv("TO_EMAIL")})
    log("Done", "Loop complete")
if __name__ == "__main__":
    main()
