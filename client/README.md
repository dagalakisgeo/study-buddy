# Study Buddy: Client

This is the Next.js web interface (in Greek) for the Study Buddy RAG server. It runs locally and talks
to the FastAPI server in `../server`.

| Page | Server endpoint(s) | What it does |
|---|---|---|
| `/chat`: **Συνομιλία** | `POST /api/v1/query` | Ask questions; answers are rendered as markdown, with source citations (file, page, snippet) |
| `/documents`: **Έγγραφα** | `POST /api/v1/documents`, `GET /api/v1/documents`, `DELETE /api/v1/documents/{id}` | Upload PDFs (drag and drop), list them and delete them |
| `/health`: **Κατάσταση** | `GET /api/v1/health` | Server and vector store status, refreshed every 10 seconds |

`/` redirects to `/chat`. A status dot in the navigation bar polls `/health` every 30 seconds.

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, react-markdown,
Vitest + Testing Library.

## Prerequisites

- **Node.js 20.9+**. Node 24 LTS is recommended: `winget install OpenJS.NodeJS.LTS`, then restart your
  terminal and VS Code.
- **The server must be running** on http://localhost:8000. See [../server/README.md](../server/README.md).
  The server already allows CORS requests from `http://localhost:3000`.

## Setup (once)

```powershell
cd C:\repos\study-buddy\client
npm install
```

Optional: to point at a different server or change the upload limit, create a local env file:

```powershell
Copy-Item .env.local.example .env.local
```

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | `20` (keep it equal to `MAX_UPLOAD_MB` in `server/.env`) |

Restart `npm run dev` after changing `.env.local`. `NEXT_PUBLIC_*` values are built into the page
when it compiles.

## Run

You need two terminals: one for the server and one for the client.

```powershell
# Terminal 1: server
cd C:\repos\study-buddy\server
poetry run uvicorn study_buddy.main:create_app --factory --reload

# Terminal 2: client
cd C:\repos\study-buddy\client
npm run dev
```

Open http://localhost:3000.

## Run from VS Code (Run and Debug)

Open the workspace file: **File → Open Workspace from File…** → `study-buddy.code-workspace`.
Then go to **Run and Debug** (`Ctrl+Shift+D`) and pick one of these:

| Configuration | What it does |
|---|---|
| **Full stack (server + client)** | Starts both. The browser opens the API docs and http://localhost:3000. Stopping one stops both. |
| **Client: Next.js (debug) (client)** | Starts only the client (`npm run dev`) and opens the browser when it's ready |
| **Client: Vitest (debug) (client)** | Runs the client tests with the debugger attached |

## Production build

```powershell
npm run build
npm start          # serves the optimized build on http://localhost:3000
```

## Tests and checks

```powershell
npm test             # run all tests once (Vitest)
npm run test:watch   # re-run tests on save
npm run typecheck    # TypeScript
npm run lint         # ESLint
```

## Project structure

```
src/
  app/              # routes: chat/, documents/, health/ (server components with metadata)
  components/       # UI: chat/, documents/, health/, ui/ (Button, Alert, Card, Spinner), NavBar
  hooks/            # useChat, useDocuments, useHealth: page state, no fetch code
  lib/api/          # client.ts (all HTTP calls), types.ts (mirror of server schemas.py), errors.ts
  lib/config.ts     # NEXT_PUBLIC_* settings
tests/              # Vitest tests: api/, components/, hooks/
```

All HTTP calls go through `src/lib/api/client.ts`, and hooks and components depend only on its
`StudyBuddyApi` interface. If the server's API changes, update `src/lib/api/types.ts` to match
`server/src/study_buddy/api/schemas.py`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Ο διακομιστής δεν είναι διαθέσιμος…" | The server isn't running, or it's on another port. Start it, or set `NEXT_PUBLIC_API_BASE_URL`. |
| CORS error in the browser console | The client must run on `http://localhost:3000`, or you must add its URL to `CORS_ORIGINS` in `server/.env`. |
| "Σφάλμα του γλωσσικού μοντέλου" (502) | Groq failed or rate-limited. Check `GROQ_API_KEY` and `LLM_MODEL` in `server/.env`. |
| `npm` is not recognized | Restart the terminal or VS Code after installing Node.js. |
| Uploaded documents disappear | The server is using `VECTOR_STORE=memory`, which keeps data only until a restart. |
