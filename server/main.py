import os
import base64
import datetime
import json
import logging
import re
import traceback
from importlib.metadata import version, PackageNotFoundError
from typing import Dict, Optional
from io import BytesIO

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import Response
from fastapi.templating import Jinja2Templates
import google.generativeai as genai
from pydantic import BaseModel
from PIL import Image

# Load .env file from the 'server' directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=dotenv_path)

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger("server")

app = FastAPI()

# Configure the Gemini API key using the correct environment variable
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    logger.error("GOOGLE_API_KEY not found in environment. Please check server/.env file.")
else:
    logger.info("Google API key loaded successfully.")
    genai.configure(api_key=api_key)

try:
    genai_ver = version("google-generativeai")
except PackageNotFoundError:
    genai_ver = "unknown"
logger.info(f"google-generativeai version: {genai_ver}")

templates = Jinja2Templates(directory="server/templates")

def _downscale(image: Image.Image, max_side: int = 1024) -> Image.Image:
    try:
        w, h = image.size
        scale = max(w, h) / float(max_side)
        if scale > 1.0:
            new_size = (int(w / scale), int(h / scale))
            return image.resize(new_size, Image.LANCZOS)
        return image
    except Exception:
        logger.warning("Downscale failed; using original image size.")
        return image

# In-memory storage
esp32_devices: Dict[str, Dict] = {}
latest_images: Dict[str, bytes] = {}
game_states: Dict[str, Dict] = {}

@app.post("/esp32/submit-image")
async def submit_image(request: Request, esp32_id: str):
    image_bytes = await request.body()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No image data received.")

    timestamp = datetime.datetime.now(datetime.timezone.utc)
    esp32_devices[esp32_id] = {
        "last_seen": timestamp,
        "status": "online"
    }
    latest_images[esp32_id] = image_bytes
    
    return {"status": "success", "message": f"Image received from {esp32_id}."}

@app.post("/admin/process-turn")
async def process_turn(esp32_id: str, game_session_id: str, character_image: UploadFile = File(...)):
    if esp32_id not in latest_images:
        raise HTTPException(status_code=404, detail=f"No recent image found for ESP32 with ID: {esp32_id}.")

    board_image_bytes = latest_images[esp32_id]
    character_image_bytes = await character_image.read()

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    model = genai.GenerativeModel(model_name)

    logger.info(
        "Processing turn | game_session_id=%s esp32_id=%s board_bytes=%d char_bytes=%d model=%s",
        game_session_id,
        esp32_id,
        len(board_image_bytes) if board_image_bytes else 0,
        len(character_image_bytes) if character_image_bytes else 0,
        model_name,
    )

    prompt = f"""
    Analyze the two provided images.
    The first image is the game board.
    The second image is a specific game piece.
    
    1. On the game board, identify the locations of the following modules: 'Mall', 'HDB Block', 'Wet Market', 'Park', 'MRT Station', 'Bus Stop'.
    2. On the game board, locate the game piece shown in the second image.
    
    Return the output as a JSON object with two keys: 'module_positions' and 'piece_position'.
    - 'module_positions' should be a dictionary mapping module names to their grid coordinates (e.g., "A1", "B3").
    - 'piece_position' should be the grid coordinate of the identified game piece.
    
    Respond with STRICT, valid JSON only. No extra text, no markdown, no code fences.
    
    Example response format:
    {{
      "module_positions": {{ "Mall": "C3", "Park": "D2" }},
      "piece_position": "B4"
    }}
    """

    try:
        # Use PIL Images per older SDK guidance
        board_image = Image.open(BytesIO(board_image_bytes)).convert("RGB")
        character_image = Image.open(BytesIO(character_image_bytes)).convert("RGB")

        # Reduce token/byte usage by downscaling large inputs
        board_image = _downscale(board_image, 1024)
        character_image = _downscale(character_image, 1024)

        logger.info(
            "Images opened | board_size=%s char_size=%s board_mode=%s char_mode=%s",
            getattr(board_image, 'size', None),
            getattr(character_image, 'size', None),
            getattr(board_image, 'mode', None),
            getattr(character_image, 'mode', None),
        )

        logger.info("Calling Gemini generate_content with model=%s...", model_name)

        gen_config = {"response_mime_type": "application/json"}

        def _call_model(active_model_name: str):
            active_model = genai.GenerativeModel(active_model_name)
            return active_model.generate_content(
                [
                    prompt,
                    board_image,
                    character_image,
                ],
                generation_config=gen_config,
            )

        try:
            response = _call_model(model_name)
        except Exception as inner_e:
            msg = str(inner_e) or inner_e.__class__.__name__
            if "429" in msg and "pro" in model_name:
                fallback = "gemini-2.5-flash"
                logger.warning("429 quota on %s; retrying with fallback model=%s", model_name, fallback)
                response = _call_model(fallback)
                model_name = fallback
            else:
                raise

        logger.info("Gemini call completed with model=%s.", model_name)
        
        # Log raw response text length for debugging
        try:
            logger.info("Response text length: %d", len(getattr(response, 'text', '') or ''))
        except Exception:
            logger.warning("Could not determine response text length.")

        def _extract_json(text: str):
            if not text:
                raise ValueError("Empty response text")
            t = text.strip()
            # Remove ```json ... ``` fences if present
            fence = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL | re.IGNORECASE)
            m = fence.search(t)
            if m:
                t = m.group(1).strip()
            # Try direct parse
            try:
                return json.loads(t)
            except Exception:
                pass
            # Heuristic: take first {...last} block
            l, r = t.find('{'), t.rfind('}')
            if l != -1 and r != -1 and r > l:
                candidate = t[l:r+1]
                return json.loads(candidate)
            # Give up
            raise ValueError("Could not locate valid JSON in response")

        try:
            game_state_data = _extract_json(response.text)
        except Exception as parse_e:
            logger.error("JSON parse failed: %s\nResponse head: %s", parse_e, (response.text or '')[:400])
            raise HTTPException(status_code=500, detail={
                "error": "JSON parsing failed",
                "reason": str(parse_e),
                "note": "See server logs for raw response preview",
            })
        
        game_states[game_session_id] = game_state_data
        
        logger.info("Processing success | keys=%s", list(game_state_data.keys()))
        return {"status": "success", "processed_data": game_state_data, "raw_gemini_response": response.text}
    except Exception as e:
        logger.exception("Gemini processing failed: %s", e)
        # Surface a concise error to client, full trace in server logs
        raise HTTPException(status_code=500, detail=f"Failed to process images with Gemini: {type(e).__name__}: {str(e)}")

@app.get("/admin/status")
async def get_admin_status():
    # Prune devices that haven't been seen in a while
    now = datetime.datetime.now(datetime.timezone.utc)
    for esp32_id, data in list(esp32_devices.items()):
        if (now - data["last_seen"]).total_seconds() > 30:
            data["status"] = "offline"

    return {
        "esp32_devices": esp32_devices,
        "latest_images": {k: f"/admin/latest-image/{k}" for k in latest_images.keys()}
    }

@app.get("/admin/latest-image/{esp32_id}")
async def get_latest_image(esp32_id: str):
    if esp32_id not in latest_images:
        raise HTTPException(status_code=404, detail="No image found.")
    return Response(content=latest_images[esp32_id], media_type="image/jpeg")

@app.get("/admin")
async def admin_page(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

# Remove or comment out the old endpoints
# @app.post("/capture-image") ...
# @app.get("/game-state/{game_session_id}") ...
# @app.post("/game-session/{game_session_id}/configure-board") ...
# @app.get("/esp32-status/{esp32_id}") ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

