#include <WiFi.h>
#include "esp_camera.h"
#include <HTTPClient.h>

// Wi-Fi credentials
const char* ssid = "Epicwifi";
const char* password = "Epicwifi";

// Server details
const char* server_url = "https://sturdy-giggle-jvwx79v964r2p9vx-8000.app.github.dev/esp32/submit-image";
const char* esp32_id = "esp32-cam-02";
const char* game_session_id = "game-01";

// Pin definition for CAMERA_MODEL_AI_THINKER
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  Serial.begin(115200);
  
  // Wi-Fi connection
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Camera configuration
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // For faster transfers, use a smaller frame size.
  // Options: FRAMESIZE_UXGA (1600x1200), FRAMESIZE_SXGA (1280x1024), FRAMESIZE_XGA (1024x768),
  // FRAMESIZE_SVGA (800x600), FRAMESIZE_VGA (640x480)
  config.frame_size = FRAMESIZE_SVGA; // Changed from UXGA for speed
  config.jpeg_quality = 20; // Can be 10-63, lower number means higher quality
  config.fb_count = 1; // Using 1 frame buffer can also speed things up

  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
}

void loop() {
  // Capture and send image every 10 seconds
  delay(1000);
  
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  #include <WiFi.h>
#include <WiFiClientSecure.h>
#include "esp_camera.h"
#include <HTTPClient.h>

// ... existing code ...
  if(WiFi.status()== WL_CONNECTED){
    WiFiClientSecure client;
    client.setInsecure(); // For testing only, bypass SSL certificate validation
    HTTPClient http;
    
    String url = String(server_url) + "?esp32_id=" + String(esp32_id) + "&game_session_id=" + String(game_session_id);
    Serial.print("Requesting URL: ");
    Serial.println(url);
    
    http.begin(client, url); // Use secure client
    
    int httpResponseCode = http.POST(fb->buf, fb->len);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      Serial.print("HTTP error: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
  
  esp_camera_fb_return(fb);
}
