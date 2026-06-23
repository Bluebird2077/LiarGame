function doPost(e) {
  try {
    var prompt = e.parameter.prompt;
    var apiKey = "AIzaSyD9z_WVstFQclmuTmp3X-ymiqWrRuJgtVw"; // <- 여기에 키를 꼭 넣어주셔요!
    
    // 우선순위가 높은 모델부터 순차적으로 시도합니다 (Fallback 메커니즘)
    var models = [
      "gemini-2.5-flash-lite", // 1순위: 기존에 쓰시려던 모델
      "gemini-2.0-flash",      // 2순위: 최신 고성능 모델
      "gemini-1.5-pro",        // 3순위: 논리력이 뛰어난 Pro 모델
      "gemini-1.5-flash"       // 4순위: 응답 속도가 가장 빠르고 안정적인 모델 (최종 방어선)
    ];

    var payload = {
      "contents": [{
        "parts": [{ "text": prompt }]
      }]
    };

    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };

    var lastResponseText = "";
    var lastResponseCode = 500;

    // 모델 리스트를 순회하며 순차적으로 API를 호출합니다.
    for (var i = 0; i < models.length; i++) {
      var modelName = models[i];
      // v1beta 경로가 모든 최신 모델을 지원하므로 v1beta를 사용합니다.
      var apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;
      
      var response = UrlFetchApp.fetch(apiUrl, options);
      var responseCode = response.getResponseCode();
      var responseText = response.getContentText();
      
      // 응답이 성공(200)인 경우 즉시 파싱해서 반환하고 종료합니다.
      if (responseCode === 200) {
        var json = JSON.parse(responseText);
        if (json.candidates && json.candidates.length > 0 && json.candidates[0].content) {
          var aiResponse = json.candidates[0].content.parts[0].text;
          // 유니티 혹은 웹서버가 바로 파싱할 수 있도록 순수 텍스트(JSON 형태)만 반환
          return ContentService.createTextOutput(aiResponse);
        }
      }
      
      // 실패한 경우(503 과부하, 404 없는 모델 등) 다음 모델로 넘어갑니다.
      lastResponseCode = responseCode;
      lastResponseText = responseText;
    }

    // 모든 모델이 실패한 경우에만 마지막으로 발생한 에러를 반환합니다.
    var errorJson;
    try { errorJson = JSON.parse(lastResponseText); } catch(err) {}
    var errMsg = errorJson && errorJson.error ? errorJson.error.message : lastResponseText;
    return ContentService.createTextOutput("AI API Error (All models failed. Last Code " + lastResponseCode + "): " + errMsg);

  } catch (err) {
    return ContentService.createTextOutput("GAS Exception: " + err.toString());
  }
}