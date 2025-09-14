# SingaPlayGO-CILENT-SEVER-
A ESP 32 Cam Cilent + Server Side communication via github codespace as an API

### Running the Server

**1. With Docker (Recommended):**

*   **Build the Docker image:**
    ```bash
    docker build -t smart-board-game-server .
    ```
*   **Run the Docker container:**
    ```bash
    docker run -d -p 8000:8000 --env-file .env smart-board-game-server
    ```

**2. Without Docker:**

*   **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
*   **Run the server:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```

### ESP32-CAM Firmware

1.  Open `esp32/esp32.ino` in the Arduino IDE.
2.  Install the ESP32 board definitions.
3.  Install the `esp_camera` library.
4.  Update the Wi-Fi credentials and server IP address in the `.ino` file.
5.  Flash the firmware to your ESP32-CAM.


### Start up server : /workspaces/SingaPlayGO-CILENT-SEVER-/.venv/bin/python -m uvicorn server.main:app --host 0.0.0.0 --port 8000