import os
import base64
from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import RedirectResponse, Response

load_dotenv()

app = FastAPI()

templates = Jinja2Templates(directory="server/templates")

# Configure the Gemini API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

import datetime
from typing import Dict, Optional

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

    model = genai.GenerativeModel('gemini-1.5-pro-latest')

    prompt = f"""
    Analyze the two provided images.
    The first image is the game board.
    The second image is a specific game piece.
    
    1. On the game board, identify the locations of the following modules: 'Mall', 'HDB Block', 'Wet Market', 'Park', 'MRT Station', 'Bus Stop'.
    2. On the game board, locate the game piece shown in the second image.
    
    Return the output as a JSON object with two keys: 'module_positions' and 'piece_position'.
    - 'module_positions' should be a dictionary mapping module names to their grid coordinates (e.g., "A1", "B3").
    - 'piece_position' should be the grid coordinate of the identified game piece.
    
    Example response format:
    {{
      "module_positions": {{ "Mall": "C3", "Park": "D2" }},
      "piece_position": "B4"
    }}
    """

    try:
        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": board_image_bytes},
            {"mime_type": "image/jpeg", "data": character_image_bytes}
        ])
        
        import json
        json_text = response.text[response.text.find('{'):response.text.rfind('}')+1]
        game_state_data = json.loads(json_text)
        
        game_states[game_session_id] = game_state_data
        
        return {"status": "success", "processed_data": game_state_data, "raw_gemini_response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process images with Gemini: {str(e)}")

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

