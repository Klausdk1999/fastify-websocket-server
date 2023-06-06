#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

// wi-fi connection
const char* ssid = "Minuano";
const char* password = "kf156873";

// WebSocket server details
const char* websockets_server_host = "fastify-websocket-server-production.up.railway.app";
const int websockets_server_port = 443;
const char* websockets_server_path = "/id123123";

// Define the WebSocket client
WebSocketsClient webSocket;

// Define the LED pin
const int ledPin = LED_BUILTIN;

void setup() {
  Serial.begin(115200);
  delay(10);

  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, HIGH);

  // Connect to WiFi network
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  // Connect to WebSocket server
  webSocket.beginSSL(websockets_server_host, websockets_server_port, websockets_server_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setExtraHeaders("ws-access-key:1234567890123456789012345678901234567890123456789012345678901234"); // Replace with your access key
}

void loop() {
  webSocket.loop();
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WSc] Disconnected!");
      break;
    case WStype_CONNECTED:
      Serial.println("[WSc] Connected!");
      break;
    case WStype_TEXT:
      Serial.println("[WSc] Received text: " + String((char*)payload));
      if (String((char*)payload) == "one") {
        digitalWrite(ledPin, LOW);
        delay(5000);
        digitalWrite(ledPin, HIGH);
      }
      break;
    case WStype_BIN:
      Serial.println("[WSc] Received binary data");
      break;
  }
}
