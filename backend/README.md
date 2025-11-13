# RIGWISE backend (Hugging Face parser)

This folder contains a minimal FastAPI backend that parses basic model metadata from Hugging Face model URLs.

## Setup (local, Python venv)

1. Create a Python virtual environment and activate it

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install requirements

```bash
pip install -r requirements.txt
```

3. Run the server

```bash
uvicorn main:app --reload --port 8000
```

4. Test the endpoint

```bash
curl -sS -X POST http://localhost:8000/parse -H "Content-Type: application/json" -d '{"url":"https://huggingface.co/meta-llama/Llama-3-7b"}' | jq
```

Notes
- This is a small, low-permission parser using public Hugging Face API and scraping as fallback.
- For production use, add rate-limit and caching, and use an API key if necessary.
- For large data fetches, use asynchronous requests.
