function doPost(e) {
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  var headers = response.getHeaders();
  headers["Access-Control-Allow-Origin"] = "*";
  headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";
  
  try {
    // Your existing code...
    const data = JSON.parse(e.postData.contents);
    // Process data...
    
    return response.setContent(JSON.stringify({ success: true }));
  } catch(error) {
    return response.setContent(JSON.stringify({ error: error.toString() }));
  }
}

function doGet() {
  return HtmlService.createHtmlOutput("Service is running");
}
