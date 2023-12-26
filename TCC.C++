#include <Wire.h>
#include <WiFiManager.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <NewPing.h>
#include <IOXhop_FirebaseESP32.h>
#include <ArduinoJson.h>

// Variáveis para monitoramento do sensor de fluxo
volatile int contaPulso;
unsigned long lastPulseTime = 0;  // Armazena o tempo do último pulso
float vazao;
float media = 0;
int i = 0;
int Min = 0;
float Litros = 0;
float MiliLitros = 0;
float metroCubico;
float ContaDeAgua;
const int pinoSensorFluxo = 14;

// Estado do interruptor solenoide
String Switch_1_State = "";

// Pinos para o sensor ultrassônico HC-SR04
#define TRIGGER_PIN 13
#define ECHO_PIN 12
#define MAX_DISTANCE 200

NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);

// Altura total do tanque em centímetros
int alturaTotalTanque = 20;

// Credenciais do Wi-Fi
char ssid[] = "SuaRedeWiFi";
char password[] = "SuaSenhaWiFi";

// Cliente HTTP para comunicação com o servidor
HTTPClient http;

// Credenciais do Firebase
#define FIREBASE_HOST "https://esp32novo-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "AIzaSyCUSSBB5L969oE1_Sp6VV_TiHuH9DWJeGk"

void incpulso() {
  contaPulso++;
  lastPulseTime = millis();  // Atualiza o tempo do último pulso
}

void setup() {
  Serial.begin(115200);

  // Configuração do pino do Solenoide e do sensor de fluxo
  pinMode(27, OUTPUT);
  pinMode(pinoSensorFluxo, INPUT);
  attachInterrupt(digitalPinToInterrupt(pinoSensorFluxo), incpulso, RISING);

  // Inicialização do WiFiManager
  WiFiManager wifiManager;
  wifiManager.setDebugOutput(false);  // Desativar mensagens de depuração no Serial
  wifiManager.setConnectTimeout(30);

  // Tenta se conectar ao Wi-Fi. Se falhar, inicia o modo de configuração
  if (!wifiManager.autoConnect("AutoConnectAP", "password")) {
    Serial.println("Falha ao conectar e tempo expirado, reiniciando...");
    delay(3000);
    ESP.restart();
  }

  // Inicialização do Firebase
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  Serial.println("Conectado ao Wi-Fi");
}

void loop() {
  // Envio de dados do sensor e controle do Solenoide
  sendSensorData();

  // Leitura do estado da solenoide no Firebase
  String solenoide = Firebase.getString("/SOLENOIDE");

  // Remove todos os caracteres não numéricos da string
  solenoide = removeNonNumeric(solenoide);

  // Converte a string para um número inteiro
  int solenoideValue = solenoide.toInt();

  // Controle do LED com base no estado da solenoide
  if (solenoideValue == 0) {
    digitalWrite(27, HIGH);
  } else if (solenoideValue == 1) {
    digitalWrite(27, LOW);
  }
}

String removeNonNumeric(String str) {
  String result = "";
  for (int i = 0; i < str.length(); i++) {
    if (isdigit(str[i])) {
      result += str[i];
    }
  }
  return result;
}

void sendSensorData() {
  // Cálculos com base nos pulsos do sensor
  noInterrupts();  // Desabilita interrupções durante os cálculos
  unsigned long currentTime = millis();
  unsigned long elapsedTime = currentTime - lastPulseTime;

  // Verifica se houve algum pulso nos últimos 5 segundos
  if (elapsedTime > 5000) {
    contaPulso = 0;
  }

  float pulsos = contaPulso;
  interrupts();  // Reabilita interrupções após os cálculos

  vazao = pulsos / 5.5;
  media += vazao;
  i++;

  MiliLitros = vazao / 60;
  Litros += MiliLitros;
  metroCubico = Litros / 1000;
  ContaDeAgua = metroCubico * 5;

  // Atualiza dados no Firebase
  Firebase.setFloat("DADOS/LITROS", Litros);
  Firebase.setFloat("DADOS/CONTA", ContaDeAgua);
  Serial.println("Litros: " + String(Litros));
  Serial.println("Conta de Água: " + String(ContaDeAgua));

  // Lógica para reiniciar a média a cada 60 ciclos
  if (i == 60) {
    Min++;
    if (Min >= 60) {
      Min = 0;
    }
    media /= 60;
    media = 0;
    i = 0;
  }

  // Simulação de dados do sensor ultrassônico
  int srs = Sensor_Ultrassonico();

  // Converte os dados para strings com substituição de ponto por vírgula
  String tempString = String(Litros);
  tempString.replace('.', ',');

  String humdString = String(ContaDeAgua);
  humdString.replace('.', ',');

  // URL do script Google
  String Web_App_URL = "https://script.google.com/macros/s/AKfycbywlMRD6tUHxN0lZyHioe_OlqFmH-FZk79tJi1nTT_TW8XQJ6ffSNe6giPz4dkD6T8xow/exec";

  // Nomes temporários para as variáveis no script Google
  String tempVarName = "temp";
  String humdVarName = "humd";

  // Leitura do estado do LED
  if (digitalRead(27) == LOW)  Switch_1_State = "On";
  if (digitalRead(27) == HIGH) Switch_1_State = "Off";

  // Construção da URL para envio dos dados para o script Google
  String Send_Data_URL = Web_App_URL + "?sts=write";
  Send_Data_URL += "&srs=" + String(srs);
  Send_Data_URL += "&" + tempVarName + "=" + tempString;
  Send_Data_URL += "&" + humdVarName + "=" + humdString;
  Send_Data_URL += "&swtc1=" + Switch_1_State;

  // Inicialização da conexão HTTP
  http.begin(Send_Data_URL.c_str());
  http.setReuse(true);  // Mantenha a conexão aberta para reutilização

  // Envia a requisição HTTP
  int httpCode = http.GET();
  if (httpCode > 0) {
    String payload = http.getString();
    Serial.println("HTTP Status Code: " + String(httpCode));
    Serial.println("Response: " + payload);
  } else {
    Serial.println("HTTP request failed");
  }

  // Encerra a conexão HTTP
  http.end();
}

int Sensor_Ultrassonico() {
  delay(50); // Aguarda para garantir leitura precisa
  int distancia = sonar.ping_cm(); // Mede a distância em centímetros

  if (distancia > 0) {
    // Calcular porcentagem de água
    int porcentagemAgua = constrain((1 - (float)distancia / alturaTotalTanque) * 100, 0, 100);
    // Calcular porcentagem de vazio
    int porcentagemVazia = 100 - porcentagemAgua;
    return porcentagemVazia; // Retornar a porcentagem de vazio
  } else {
    return -1; // Valor inválido
  }
}
