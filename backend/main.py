from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re

app = FastAPI(title="RIGWISE Backend Parser")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ParseRequest(BaseModel):
    url: str

class ModelMetadata(BaseModel):
    modelId: str
    name: str | None
    architecture: str | None
    parameterCount: float | None
    quantization: str | None
    maxContextLength: int | None


def extract_model_id(url: str) -> str:
    # patterns: huggingface.co/{modelId}
    m = re.search(r"huggingface.co/([^/]+/[^/]+|[^/]+)$", url)
    if not m:
        raise ValueError("Could not extract model ID from URL")
    return m.group(1)


@app.post("/parse", response_model=ModelMetadata)
async def parse_model(payload: ParseRequest):
    url = payload.url.strip()
    try:
        model_id = extract_model_id(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    api_url = f"https://huggingface.co/api/models/{model_id}"
    try:
        r = requests.get(api_url, timeout=10)
        r.raise_for_status()
        meta = r.json()
    except Exception:
        meta = None

    # default values
    name = model_id
    architecture = None
    quantization = None
    parameterCount = None
    maxContextLength = None

    # Try config.json fetch
    try:
        config_url = f"https://huggingface.co/{model_id}/raw/main/config.json"
        r2 = requests.get(config_url, timeout=8)
        if r2.status_code == 200:
            config = r2.json()
            architecture = (config.get("architectures") or [None])[0]
            maxContextLength = config.get("max_position_embeddings") or config.get("n_positions")
            # some model configs include 'hidden_size' and 'num_hidden_layers' to estimate params
            hidden_size = config.get("hidden_size")
            num_layers = config.get("num_hidden_layers") or config.get("n_layer") or config.get("num_hidden_layers")
            if hidden_size and num_layers:
                # very rough estimate for transformers: params ~ 12 * hidden_size^2 * num_layers (approx)
                try:
                    hidden_size = int(hidden_size)
                    num_layers = int(num_layers)
                    parameterCount = (12 * (hidden_size ** 2) * num_layers) / 1e9
                except Exception:
                    parameterCount = None
    except Exception:
        pass

    # If API returned file info, use siblings sizes to estimate parameter count and detect quant
    if meta and isinstance(meta, dict):
        name = meta.get("modelId") or name or model_id
        siblings = meta.get("siblings") or []
        total_weight_bytes = 0
        for s in siblings:
            fname = s.get("rfilename") or s.get("filename") or ""
            if fname and re.search(r"\.pt$|\.bin$|\.safetensors$|\.gguf$|\.pth$|\.ckpt$", fname):
                size = s.get("size", 0)
                total_weight_bytes += size
                # detect quantization by filename heuristics
                if re.search(r"(q4|q8|4bit|8bit|Q4|Q8|ggml|gguf)", fname, flags=re.I):
                    quantization = quantization or "4-bit" if re.search(r"q4|4bit", fname, flags=re.I) else "8-bit"

        if total_weight_bytes and total_weight_bytes > 0:
            # estimate param by dividing by an assumed bytes-per-param for fp32/float16
            # use fp32 (4 bytes) fallback if parameterCount is still missing
            try:
                est_params = total_weight_bytes / 4.0 / 1e9
                if not parameterCount:
                    parameterCount = est_params
            except Exception:
                pass

    # fallback: try scraping README to find parameter claim e.g., "7B" or "70B"
    if not parameterCount:
        try:
            readme_url = f"https://huggingface.co/{model_id}"
            r3 = requests.get(readme_url, timeout=6)
            if r3.status_code == 200:
                soup = BeautifulSoup(r3.text, "html.parser")
                txt = soup.get_text(separator=" ")
                m = re.search(r"(\d+(?:\.\d+)?)(\s?)[Bb](?:illion)?\b", txt, flags=re.I)
                if m:
                    val = float(m.group(1))
                    parameterCount = val
        except Exception:
            pass

    return ModelMetadata(
        modelId=model_id,
        name=name,
        architecture=architecture,
        parameterCount=round(parameterCount, 3) if parameterCount else None,
        quantization=quantization,
        maxContextLength=int(maxContextLength) if maxContextLength else None,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
