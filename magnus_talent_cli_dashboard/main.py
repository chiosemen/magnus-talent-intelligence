import os, json
from dotenv import load_dotenv
from modules.supabase_client import insert_log
from modules.llm_rewriter import rewrite_resume
from modules.llm_scorer import score_fit
from modules.outreach import send_email
from modules.ui import header, jd_summary, score_panel, show_cover_letter_preview
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.panel import Panel
from rich.console import Console
console = Console()
load_dotenv("config.env")
def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()
def main():
    header()
    company = os.getenv("JD_COMPANY", "—")
    role = os.getenv("JD_ROLE", "Senior Product Owner")
    location = os.getenv("JD_LOCATION", "Remote")
    jd_text = read_file("job_description.txt")
    resume_text = read_file("resume.txt")
    jd_summary(company, role, location)
    with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"),
                  BarColumn(), TextColumn("{task.completed}/{task.total}"),
                  TimeElapsedColumn(), transient=False) as progress:
        task = progress.add_task("Running pipeline", total=3)
        progress.update(task, description="Scoring resume vs JD")
        scores = score_fit(jd_text, resume_text)
        insert_log("matches", {"fit_score": scores.get("overall", 0), "rubric": scores})
        progress.advance(task)
        score_panel(scores)
        progress.update(task, description="Rewriting resume + drafting cover letter")
        rewrite = rewrite_resume(jd_text, resume_text)
        insert_log("rewrites", {"tailored_resume": rewrite["tailored_resume"], "cover_letter": rewrite["cover_letter"]})
        progress.advance(task)
        show_cover_letter_preview(rewrite["cover_letter"])
        progress.update(task, description="Email outreach")
        status = send_email(
            subject=f"Application – {role} (Magnus Talent AI)",
            body=rewrite["cover_letter"] + "\n\n---\n" + rewrite["tailored_resume"],
            to_email=os.getenv("TO_EMAIL")
        )
        insert_log("outreach", {"status": status, "to_email": os.getenv("TO_EMAIL")})
        progress.advance(task)
    console.print(Panel.fit(f"[bold green]Done[/] — Status: {status}. Logged to Supabase.", border_style="green"))
if __name__ == "__main__":
    main()
