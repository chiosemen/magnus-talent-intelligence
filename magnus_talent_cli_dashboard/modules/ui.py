from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich import box
console = Console()
def header():
    console.print(Panel.fit(
        "[bold magenta]Magnus Talent Intelligence Agent[/]  —  [cyan]Resume -> JD -> Rewrite -> Outreach[/]",
        border_style="magenta"
    ))
def jd_summary(company, role, location):
    t = Table(box=box.SIMPLE_HEAVY)
    t.add_column("Company", style="cyan", no_wrap=True)
    t.add_column("Role", style="green")
    t.add_column("Location", style="yellow")
    t.add_row(company or "—", role or "—", location or "—")
    console.print(t)
def score_panel(scores: dict):
    rows = []
    for k in ["skills", "seniority", "tools", "impact", "communication", "overall"]:
        if k in scores:
            rows.append(f"[bold]{k.capitalize():<14}[/]: {scores[k]}")
    console.print(Panel("\n".join(rows), title="Fit Scores", border_style="green"))
def show_cover_letter_preview(text: str):
    preview = (text[:600] + "...") if len(text) > 600 else text
    console.print(Panel(preview, title="Cover Letter Preview", border_style="blue"))
