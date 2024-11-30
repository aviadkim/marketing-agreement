function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // יצירת תיקייה לשמירת הקבצים אם לא קיימת
    const folder = getOrCreateFolder('Marketing Agreement Forms');
    
    // שמירת התמונות והחתימה בדרייב
    const fileUrls = saveFiles(folder, data);
    
    // הוספת שורה לגיליון
    const row = [
      new Date(),                    // תאריך ושעה
      data.firstName,                // פרטים אישיים
      data.lastName,
      data.idNumber,
      data.email,
      data.phone,
      
      data.investmentAmount,         // פרטי השקעה
      data.bank,
      data.currency,
      data.purpose,
      data.purposeOther,
      data.timeline,
      
      data.marketExperience,         // שאלון סיכון
      data.riskTolerance,
      data.lossResponse,
      data.investmentKnowledge,
      data.investmentRestrictions,
      
      data.riskAcknowledgement ? 'כן' : 'לא',  // הצהרות
      data.independentDecision ? 'כן' : 'לא',
      data.updateCommitment ? 'כן' : 'לא',
      
      fileUrls.signature || '',      // קישורים לקבצים
      fileUrls.screenshot || '',
      
      data.submissionDate           // תאריך שליחה
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: 'success',
      row: row
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: 'error',
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function saveFiles(folder, data) {
  const fileUrls = {};
  const timestamp = new Date().getTime();
  const idNumber = data.idNumber || 'unknown';
  
  // שמירת החתימה
  if (data.signature) {
    try {
      const signatureData = data.signature.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
      const signatureBlob = Utilities.newBlob(
        Utilities.base64Decode(signatureData),
        'image/png',
        `signature_${idNumber}_${timestamp}.png`
      );
      const signatureFile = folder.createFile(signatureBlob);
      signatureFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrls.signature = signatureFile.getUrl();
    } catch (error) {
      Logger.log('Error saving signature: ' + error.toString());
    }
  }
  
  // שמירת צילום הטופס
  if (data.formScreenshot) {
    try {
      const screenshotData = data.formScreenshot.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
      const screenshotBlob = Utilities.newBlob(
        Utilities.base64Decode(screenshotData),
        'image/png',
        `form_${idNumber}_${timestamp}.png`
      );
      const screenshotFile = folder.createFile(screenshotBlob);
      screenshotFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrls.screenshot = screenshotFile.getUrl();
    } catch (error) {
      Logger.log('Error saving screenshot: ' + error.toString());
    }
  }
  
  return fileUrls;
}
