function saveFiles(folder, data) {
  if (!folder) {
    Logger.log("No folder provided");
    return {};
  }
  
  try {
    const urls = {};
    const timestamp = new Date().getTime();
    
    // Save signature if exists
    if (data.signature) {
      Logger.log("Processing signature");
      const signatureBlob = Utilities.newBlob(
        data.signature.split(',')[1], 
        'image/png', 
        `signature_${timestamp}.png`
      );
      const signatureFile = folder.createFile(signatureBlob);
      signatureFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
      urls.signature = signatureFile.getDownloadUrl();
      Logger.log("Signature saved: " + urls.signature);
    }

    // Save form screenshot if exists
    if (data.formScreenshot) {
      Logger.log("Processing screenshot");
      const screenshotBlob = Utilities.newBlob(
        data.formScreenshot.split(',')[1],
        'application/pdf',
        `form_${timestamp}.pdf`
      );
      const screenshotFile = folder.createFile(screenshotBlob);
      screenshotFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
      urls.screenshot = screenshotFile.getDownloadUrl();
      Logger.log("Screenshot saved: " + urls.screenshot);
    }
    
    Logger.log("Files saved successfully: " + JSON.stringify(urls));
    return urls;
  } catch (error) {
    Logger.log("File save error: " + error.toString());
    return {};
  }
}
