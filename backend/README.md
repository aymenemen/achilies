---
title: Noor Ouarzazate DNI API
colorFrom: orange
colorTo: blue
sdk: docker
pinned: false
---

# NOOR Ouarzazate DNI API

FastAPI backend for the live NOOR Ouarzazate DNI forecast demo.

## Hugging Face Spaces

Create a new Hugging Face Space with:

- SDK: Docker
- Root files: the contents of this `backend/` directory

The container starts:

```bash
uvicorn api:app --host 0.0.0.0 --port 7860
```

Useful endpoints:

- `/health`
- `/predict`
- `/forecast`
- `/forecast.csv`

After the Space is live, set the Vercel frontend environment variable:

```bash
VITE_API_BASE_URL=https://<username>-<space-name>.hf.space
```
