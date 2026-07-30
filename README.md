# Chrome Extension (React + Vite)

Compact README for the Chrome extension workspace.

## Overview

This repository contains a Chrome extension built with a React frontend (Vite) and a small Node.js backend under `server/` used for optional features or local APIs.

Key parts:

- `public/`: extension entry points (`manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js`).
- `src/`: React app source used for the extension UI.
- `server/`: optional Node.js server for local development or APIs.

## Features

- Chrome extension popup UI built with React and Vite.
- Background and content scripts bundled in `public/` for extension runtime.
- Local development server for API/mocking in `server/`.

## Requirements

- Node.js 18+ (recommended)
- npm or Yarn
- Google Chrome (for loading the extension)

## Setup (Development)

1. Install root dependencies:

```
npm install
```

2. Install server dependencies and run dev server (if using backend):

```
cd server
npm install
npm run dev
```

3. Start Vite for the React app (from repo root):

```
npm run dev
```

4. Load the extension in Chrome:

- Open `chrome://extensions` -> Enable "Developer mode" -> "Load unpacked" -> select this repository's `public/` folder (or the build output when built).

Note: For development the popup UI served by Vite can be used directly by loading `popup.html` that references the dev server, or build and point the manifest to the production files.

## Build (Production)

1. Build the React app / extension assets:

```
npm run build
```

2. The production-ready files will be in the configured output directory (see `vite.config.js`). Use that folder to load the extension in Chrome via "Load unpacked".

## Project Structure

- `public/` — extension manifest, background script, content script, popup entry
- `src/` — React app sources (popup UI)
- `server/` — Node.js backend and API (optional)
- `index.html`, `vite.config.js`, `package.json` — project config and entry points
