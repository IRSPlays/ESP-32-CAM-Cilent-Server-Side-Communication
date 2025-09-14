# SingaPlayGO Client/Server
ESP32‑CAM client + FastAPI server for image-based board game interactions using Google Gemini Vision. The ESP32 posts camera frames to the server; an admin UI lets you upload a character image and trigger analysis with Gemini to detect module positions and the piece location on the board.

## Overview
- Server: FastAPI app in `server/` with an admin panel at `/admin`.
- Vision: Uses `google-generativeai` (Gemini). Default model: `gemini-2.5-flash` (configurable).
- ESP32: Firmware in `esp32/` posts JPEG frames to the server.

## Repository Structure
```
.
├── server/
│   ├── main.py              # FastAPI app (admin UI + endpoints)
│   ├── templates/admin.html # Admin panel
│   ├── requirements.txt     # Python deps
│   └── Dockerfile           # Container build for the server
├── esp32/                   # ESP32-CAM firmware (Arduino sketch)
└── README.md
```

## Prerequisites
- Python 3.9+ (Dockerfile uses 3.9‑slim)
- Google API key with access to Gemini models

Create `server/.env` (used by the server at runtime):
```
GOOGLE_API_KEY=your_api_key_here
# Optional (defaults to gemini-2.5-flash)
# GEMINI_MODEL=gemini-1.5-pro-latest
```

## Running the Server

### Option 1: Docker (recommended)
Build from the `server/` folder (Dockerfile lives there):
```bash
docker build -t smart-board-game-server ./server
```
Run and pass env via file or variables:
```bash
docker run -d -p 8000:8000 --env-file server/.env --name smart-board smart-board-game-server
# or
docker run -d -p 8000:8000 -e GOOGLE_API_KEY=$GOOGLE_API_KEY -e GEMINI_MODEL=gemini-2.5-flash --name smart-board smart-board-game-server
```

### Option 2: Local (venv)
From repo root, create/activate venv and install deps:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r server/requirements.txt
```
Run the app (choose one):
```bash
# From repo root
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000

# Or from inside the server directory
cd server
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

If you’re using the Codespace venv directly, you can also run:
```
/workspaces/SingaPlayGO-CILENT-SEVER-/.venv/bin/python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

## Endpoints & Admin Flow
- `POST /esp32/submit-image?esp32_id=<id>`
    - Body: raw JPEG bytes (e.g., `Content-Type: image/jpeg`).
    - Stores the latest frame for that device.

- `GET /admin`
    - Opens the admin UI. Select a device (ESP32 ID) and upload a character image to trigger processing.

- `POST /admin/process-turn`
    - Form fields: `esp32_id`, `game_session_id`, and file `character_image`.
    - Runs Gemini vision analysis and returns JSON with detected module positions and the piece location.

- `GET /admin/status`
    - Returns device list, status, and links to latest device images.

- `GET /admin/latest-image/{esp32_id}`
    - Returns the latest stored JPEG for a device.

## Configuration
- `GOOGLE_API_KEY`: required. Loaded from `server/.env` or environment.
- `GEMINI_MODEL`: optional. Defaults to `gemini-2.5-flash`. You can set to a pro model (e.g., `gemini-1.5-pro-latest`), and the server will auto‑fallback to a flash model if you hit quota (HTTP 429).

## Troubleshooting
- 429 (Quota): The server logs warn and may fallback to a flash model if starting from a pro model.
- Non‑JSON responses: The server enforces JSON mode and includes robust parsing; check logs for response preview if parsing fails.
- Large images: Server downscales inputs to reduce token usage.
- Logs: Check terminal output for detailed diagnostics (SDK version, image sizes, model used).

## ESP32‑CAM Firmware
1. Open `esp32/esp32.ino` in Arduino IDE.
2. Install ESP32 board support and `esp_camera` library.
3. Configure Wi‑Fi credentials and server URL (e.g., `http://<server-ip>:8000/esp32/submit-image?esp32_id=cam1`).
4. Flash the ESP32‑CAM and verify frames appear under `/admin`.
