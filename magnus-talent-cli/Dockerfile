FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
COPY magnus_talent_cli_dashboard/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY magnus_talent_cli_dashboard .
ENTRYPOINT ["python","main.py"]
