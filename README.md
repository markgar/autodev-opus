# AutoDev

Web portal for [buildteam](https://github.com/markgar/buildteam) — describe the software you want, and the platform builds it autonomously. AutoDev provides project management (dashboard, log viewer) and a sample spec admin screen.

See [REQUIREMENTS.md](REQUIREMENTS.md) for functional requirements and [SPEC.md](SPEC.md) for technical decisions.

## Quick Start

```bash
npm install          # install all dependencies (frontend + backend)
npm run dev          # start dev server (Vite frontend + Express API)
```

## Build & Run

```bash
npm run build        # compile TypeScript backend + Vite frontend
npm start            # serve production build
```

## Environment

Set `STAMP_ID` to your Azure stamp (defaults to `qqq`). The app uses `DefaultAzureCredential` — log in with `az login` for local dev.
