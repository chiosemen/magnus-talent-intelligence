from rich.console import Console
console = Console()
def log(title, message):
    console.rule(f"[bold cyan]{title}")
    console.print(message)
