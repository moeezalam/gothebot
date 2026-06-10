FROM python:3.12-alpine

RUN apk add --no-cache chromium chromium-chromedriver

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=5000
ENV HOST=0.0.0.0

EXPOSE 5000

CMD ["python", "webapp.py"]
