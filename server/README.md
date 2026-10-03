# Study Buddy — RAG Server

FastAPI service that ingests PDFs and answers questions about them using
Retrieval-Augmented Generation. Every external service it uses is free.

| Concern | Default | Free tier |
|---|---|---|
| LLM | Groq `openai/gpt-oss-120b` via [pydantic_ai](https://ai.pydantic.dev) | [console.groq.com](https://console.groq.com/keys) |
| Vector store | Weaviate Cloud sandbox (or `memory` for local dev) | [console.weaviate.cloud](https://console.weaviate.cloud) — sandboxes expire after 14 days |
| Embeddings | `intfloat/multilingual-e5-small` via sentence-transformers (local CPU, multilingual incl. Greek) | unlimited |
| Documents | PDF (pypdf) | — |

## Setup

All commands are PowerShell and run from the `server/` folder unless noted.

### 1. Install Python 3.12

The project is pinned to Python 3.12 (`.python-version` and `requires-python` in `pyproject.toml`).

```powershell
winget install --id Python.Python.3.12 -e
```

Alternatively, download the installer from https://www.python.org/downloads/windows/ and tick
**"Add python.exe to PATH"**.

Next, turn off the Microsoft Store stubs. They would otherwise run instead of the real Python.
Go to **Settings → Apps → Advanced app settings → App execution aliases** and switch off
`python.exe` and `python3.exe`. Restart your terminal and VS Code, then check:

```powershell
python --version   # Python 3.12.x
```

### 2. Install Poetry

```powershell
python -m pip install --user pipx
python -m pipx ensurepath
# restart the terminal, then:
pipx install poetry
poetry --version
```

### 3. Install dependencies

```powershell
cd server
poetry config virtualenvs.in-project true     # optional: create .venv\ here so VS Code finds it
poetry env use "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
poetry install
```

`poetry install` downloads torch, which is needed for the local embeddings. Expect a few hundred MB.

### 4. Configure environment variables

```powershell
Copy-Item .env.example .env
```

Then edit `.env`:

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | https://console.groq.com/keys (free) |
| `WEAVIATE_URL`, `WEAVIATE_API_KEY` | https://console.weaviate.cloud → create a **Sandbox** cluster. It shows the REST endpoint and an Admin API key. |

To try the API without a Weaviate account, set `VECTOR_STORE=memory`. The data is then kept in
memory and lost when the server restarts. A Groq key is still required.

## Run

```powershell
poetry run uvicorn study_buddy.main:create_app --factory --reload
```

- API docs (Swagger UI): http://localhost:8000/docs
- `--reload` restarts the server when you save a file.
- The first start downloads the embedding model (~470 MB) and caches it under `~\.cache\huggingface`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Liveness + vector store readiness |
| POST | `/api/v1/documents` | Upload a PDF (multipart field `file`) |
| GET | `/api/v1/documents` | List ingested documents |
| DELETE | `/api/v1/documents/{document_id}` | Remove a document |
| POST | `/api/v1/query` | `{"question": "...", "top_k": 5}` → answer + citations |

Quick check from PowerShell:

```powershell
curl.exe -F "file=@C:\path\to\notes.pdf" http://localhost:8000/api/v1/documents
Invoke-RestMethod http://localhost:8000/api/v1/query -Method Post -ContentType "application/json" `
  -Body (@{ question = "Summarise chapter 1" } | ConvertTo-Json)
```

## Run in debug mode

### Verbose logging

To see debug-level logs from uvicorn, including requests and startup details:

```powershell
poetry run uvicorn study_buddy.main:create_app --factory --reload --log-level debug
```

### VS Code debugger (breakpoints)

VS Code settings live in `server/.vscode/`, separate from the client's. VS Code only reads them
when the `server` folder is part of the open workspace, so open it one of two ways:

- **Whole repo (recommended):** **File → Open Workspace from File…** → `study-buddy.code-workspace`
  at the repository root. Each folder (`server`, `client`) keeps its own `.vscode` settings.
- **Server only:** `code C:\repos\study-buddy\server`.

Opening the repository root as a plain folder will **not** show the server's debug configurations.

To start the server from the **Run and Debug** view:

1. Click the Run and Debug icon in the Activity Bar (`Ctrl+Shift+D`).
2. In the dropdown at the top, pick **Server: FastAPI (debug) (server)**.
3. Press the green ▶ button (or `F5`). The API page opens in your browser when the server is ready.
4. Use the debug toolbar to pause, step, restart (`Ctrl+Shift+F5`) or stop (`Shift+F5`).

- `server/.vscode/launch.json` has two configurations:
  - **Server: FastAPI (debug)** runs uvicorn with `server/.env` loaded and debug logging on. When
    the server is ready, it opens the API page (http://127.0.0.1:8000/docs) in your browser.
  - **Server: pytest (debug)** runs the test suite under the debugger.
- `server/.vscode/settings.json` points the interpreter at `.venv\Scripts\python.exe` and enables
  pytest discovery.

1. Install the **Python** and **Python Debugger** extensions.
2. Create the venv in the project (`poetry config virtualenvs.in-project true` before
   `poetry install`) so the interpreter setting finds it. Otherwise choose the interpreter with
   `Ctrl+Shift+P` → **Python: Select Interpreter**, using the path printed by `poetry env info --path`.
3. Set a breakpoint, for example in `src/study_buddy/api/routes/query.py`. Press `F5`, choose
   **Server: FastAPI (debug)**, then call the endpoint from http://localhost:8000/docs.

`--reload` is left out of the debug configuration on purpose: the reloader restarts the server in
a child process, which makes breakpoints unreliable. Restart the debugger (`Ctrl+Shift+F5`) after
code changes instead.

## Tests

The default test suite runs **offline**. It uses fake embeddings, the in-memory vector store and
pydantic_ai's `TestModel`, so no API keys or model downloads are needed.

```powershell
poetry run pytest                                   # whole suite
poetry run pytest -v                                # list each test
poetry run pytest tests/unit                        # unit tests only
poetry run pytest tests/api                         # HTTP endpoint tests only
poetry run pytest tests/unit/test_services.py -k rag   # one file, tests matching "rag"
poetry run pytest -x --pdb                          # stop at the first failure and open the debugger
```

### Integration tests (real Weaviate)

These are skipped unless Weaviate credentials are set as **environment variables**. The `.env`
file is not read by pytest.

```powershell
$env:WEAVIATE_URL = "https://<your-cluster>.weaviate.cloud"
$env:WEAVIATE_API_KEY = "<your-key>"
poetry run pytest -m integration
```

### Running tests in VS Code

`server/.vscode/settings.json` enables pytest and tells the Python Environments extension to use
`server\.venv`. Open the **Testing** panel (beaker icon) to see and run the tests.

If discovery fails with `No module named pytest`, VS Code is using the global Python. To fix it,
run `Ctrl+Shift+P` → **Python: Select Interpreter**, choose the **server** folder, and pick
`.venv\Scripts\python.exe`. Then click **Refresh Tests** in the Testing panel. To debug a test, right-click it and
choose **Debug Test**, or use the **Server: pytest (debug)** launch configuration above.

## Lint & type-check

```powershell
poetry run ruff check .          # lint
poetry run ruff check . --fix    # lint and auto-fix
poetry run ruff format .         # format
poetry run mypy src              # static type checking
```

## Architecture

```
api/             HTTP only: routes, DTOs, domain-error → status mapping
services/        Use cases: IngestionService, RetrievalService, RagService, DocumentService
domain/          Models, errors, and ports (Protocols) the services depend on
infrastructure/  Adapters: PdfLoader, RecursiveCharacterSplitter, SentenceTransformerEmbedder,
                 WeaviateVectorStore / InMemoryVectorStore, PydanticAIGenerator
core/            Settings and the composition root (container.py)
```

How the code follows SOLID:

- **Single responsibility.** Each adapter does one job, services only orchestrate, and routes only translate HTTP.
- **Open/closed.** To add a file type, write a new `DocumentLoader` and register it in `core/container.py`. To use another LLM or vector database, write a new adapter. Existing code doesn't change.
- **Liskov substitution.** `InMemoryVectorStore` and `WeaviateVectorStore` are interchangeable behind `VectorStore`.
- **Interface segregation.** The ports are small (`Embedder`, `VectorStore`, `Retriever`, `HealthCheck`, `Lifecycle`, ...).
- **Dependency inversion.** Services depend only on `domain/ports.py`, and only `core/container.py` knows the concrete classes.

### Swapping the LLM

`PydanticAIGenerator` accepts any pydantic_ai model. To switch the LLM, change `_build_llm_model` in
`core/container.py`. For example:

- Gemini: `GoogleModel("gemini-2.5-flash", provider=GoogleProvider(api_key=...))`
- Ollama: `OpenAIChatModel("llama3.2", provider=OllamaProvider(base_url="http://localhost:11434/v1"))`
