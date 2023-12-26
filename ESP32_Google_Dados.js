function doGet(e) { 
  Logger.log(JSON.stringify(e));
  var result = 'Ok';
  if (e.parameter == 'undefined') {
    result = 'Nenhum parâmetro';
  }
  else {
    var sheet_id = '1wEYa-Ez8xUBbNbAVAit-xMx6HHh1L9wDHBZlNbBSpks';  // ID da planilha.
    var sheet_name = "ESP32_Google_Sheets_Sheet";  // Nome da planilha no Google Sheets.

    var sheet_open = SpreadsheetApp.openById(sheet_id);
    var sheet_target = sheet_open.getSheetByName(sheet_name);

    var newRow = sheet_target.getLastRow() + 1;

    var rowDataLog = [];

    var Data_for_I3;
    var Data_for_J3;
    var Data_for_K3;
    var Data_for_L3;
    var Data_for_M3;
    var Data_for_N3;
    var Data_for_O3;

    var Curr_Date = Utilities.formatDate(new Date(), "America/Sao_Paulo", 'dd/MM/yyyy');
    rowDataLog[0] = Curr_Date;  // A data será escrita na coluna A (na seção "DHT11 Sensor Data Logger").
    Data_for_I3 = Curr_Date;  // A data será escrita na coluna I3 (na seção "Latest DHT11 Sensor Data").

    var Curr_Time = Utilities.formatDate(new Date(), "America/Sao_Paulo", 'HH:mm:ss');  
    rowDataLog[1] = Curr_Time;  // O horário será escrito na coluna B (na seção "DHT11 Sensor Data Logger").
    Data_for_J3 = Curr_Time;  // O horário será escrito na coluna J3 (na seção "Latest DHT11 Sensor Data").

    var sts_val = '';

    for (var param in e.parameter) {
      Logger.log('No loop for, param=' + param);
      var value = stripQuotes(e.parameter[param]);
      Logger.log(param + ':' + e.parameter[param]);
      switch (param) {
        case 'sts':
          sts_val = value;
          break;

        case 'srs':
          rowDataLog[2] = value;  // O status de leitura do sensor será escrito na coluna C (na seção "DHT11 Sensor Data Logger").
          Data_for_K3 = value;  // O status de leitura do sensor será escrito na coluna K3 (na seção "Latest DHT11 Sensor Data").
          result += ', Status de Leitura do Sensor Escrito na coluna C';
          break;

        case 'temp':
          // Substitui pontos por vírgulas
          value.replace('.', ',');
          rowDataLog[3] = value;  // O valor da temperatura será escrito na coluna D (na seção "DHT11 Sensor Data Logger").
          Data_for_L3 = value;  // O valor da temperatura será escrito na coluna L3 (na seção "Latest DHT11 Sensor Data").
          result += ', Temperatura Escrita na coluna D';
          break;

        case 'humd':
          // Substitui pontos por vírgulas
          value.replace('.', ',');
          rowDataLog[4] = value; // O valor da umidade será escrito na coluna E (na seção "DHT11 Sensor Data Logger").
          Data_for_M3 = value;  // O valor da umidade será escrito na coluna M3 (na seção "Latest DHT11 Sensor Data").
          result += ', Umidade Escrita na coluna E';
          break;
        case 'swtc1':
          rowDataLog[5] = value;  // O estado do Switch_1 será escrito na coluna F (na seção "DHT11 Sensor Data Logger").
          Data_for_N3 = value;  // O estado do Switch_1 será escrito na coluna N3 (na seção "Latest DHT11 Sensor Data").
          result += ', Switch_1 Escrito na coluna F';
          break;

        case 'swtc2':
          rowDataLog[6] = value;  // O estado do Switch_2 será escrito na coluna G (na seção "DHT11 Sensor Data Logger").
          Data_for_O3 = value;  // O estado do Switch_2 será escrito na coluna O3 (na seção "Latest DHT11 Sensor Data").
          result += ', Switch_2 Escrito na coluna G';
          break;  

        default:
          result += ", parâmetro não suportado";
      }
    }
    
    // Condições para escrever os dados recebidos do ESP32 no Google Sheets.
    if (sts_val == 'write') {
      // Escreve os dados na seção "DHT11 Sensor Data Logger".
      Logger.log(JSON.stringify(rowDataLog));
      var newRangeDataLog = sheet_target.getRange(newRow, 1, 1, rowDataLog.length);
      newRangeDataLog.setValues([rowDataLog]);
      
      // Escreve os dados na seção "Latest DHT11 Sensor Data".
      var RangeDataLatest = sheet_target.getRange('I3:O3');
      RangeDataLatest.setValues([[Data_for_I3, Data_for_J3, Data_for_K3, Data_for_L3, Data_for_M3, Data_for_N3, Data_for_O3]]);

      return ContentService.createTextOutput(result);
    }
    
    // Condições para enviar dados ao ESP32 quando o ESP32 lê dados do Google Sheets.
    if (sts_val == 'read') {
      // Use a linha de código abaixo se quiser que o ESP32 leia dados das colunas I3 a O3 (Data, Hora, Status de Leitura do Sensor, Temperatura, Umidade, Switch 1, Switch 2).
      // var all_Data = sheet_target.getRange('I3:O3').getDisplayValues();
      
      // Use a linha de código abaixo se quiser que o ESP32 leia dados das colunas K3 a O3 (Status de Leitura do Sensor, Temperatura, Umidade, Switch 1, Switch 2).
      var all_Data = sheet_target.getRange('K3:O3').getValues();
      return ContentService.createTextOutput(all_Data);
    }
  }
}

function stripQuotes(value) {
  return value.replace(/^["']|['"]$/g, "");
}


function getEnvironment() {
  var environment = {
    spreadsheetID: "1wEYa-Ez8xUBbNbAVAit-xMx6HHh1L9wDHBZlNbBSpks",
    firebaseUrl: "https://esp32-407015-default-rtdb.firebaseio.com/",
  };
  return environment;
}

// Creates a Google Sheets on change trigger for the specific sheet
function createSpreadsheetEditTrigger(sheetID) {
  var triggers = ScriptApp.getProjectTriggers();
  var triggerExists = false;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getTriggerSourceId() == sheetID) {
      triggerExists = true;
      break;
    }
  }

  if (!triggerExists) {
    var spreadsheet = SpreadsheetApp.openById(sheetID);
    ScriptApp.newTrigger("importSheet")
      .forSpreadsheet(spreadsheet)
      .onChange()
      .create();
  }
}

// Delete all the existing triggers for the project
function deleteTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

// Initialize
function initialize(e) {
  writeDataToFirebase(getEnvironment().spreadsheetID);
}

// Write the data to the Firebase URL
function writeDataToFirebase(sheetID) {
  var ss = SpreadsheetApp.openById(sheetID);
  SpreadsheetApp.setActiveSpreadsheet(ss);
  createSpreadsheetEditTrigger(sheetID);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    importSheet(sheets[i]);
    SpreadsheetApp.setActiveSheet(sheets[i]);
  }
}

// A utility function to generate nested object when
// given a keys in array format
function assign(obj, keyPath, value) {
  lastKeyIndex = keyPath.length - 1;
  for (var i = 0; i < lastKeyIndex; ++i) {
    key = keyPath[i];
    if (!(key in obj)) obj[key] = {};
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

// Import each sheet when there is a change
function importSheet() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var name = sheet.getName();
  var data = sheet.getDataRange().getValues();

  var dataToImport = {};

  for (var i = 1; i < data.length; i++) {
    dataToImport[data[i][0]] = {};
    for (var j = 0; j < data[0].length; j++) {
      assign(dataToImport[data[i][0]], data[0][j].split("__"), data[i][j]);
    }
  }

  var token = ScriptApp.getOAuthToken();

  var firebaseUrl =
    getEnvironment().firebaseUrl + sheet.getParent().getId() + "/" + name;
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, token);
  base.setData("", dataToImport);
}

