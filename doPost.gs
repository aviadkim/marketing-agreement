const FOLDER_NAME = "Marketing Agreement Forms";
const COMPLETED_FOLDER_NAME = "Completed Forms";

function getOrCreateFolder(name) {
  const folderIterator = DriveApp.getFoldersByName(name);
  return folderIterator.hasNext() ? folderIterator.next() : DriveApp.createFolder(name);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const timestamp = new Date();
    
    // ???? ??????
    const mainFolder = getOrCreateFolder(FOLDER_NAME);
    const completedFolder = getOrCreateFolder(COMPLETED_FOLDER_NAME);
    
    let pdfUrl = "";
    let fullPdfUrl = "";
    
    // ????? ?PDF ?? ????? ??????
    if (data.sectionPDF) {
      const pdfBlob = Utilities.newBlob(
        Utilities.base64Decode(data.sectionPDF.split(",")[1]),
        "application/pdf",
        `section${data.section}_${timestamp.getTime()}.pdf`
      );
      const pdfFile = mainFolder.createFile(pdfBlob);
      pdfUrl = pdfFile.getUrl();
    }
    
    // ?? ?? ????? ????, ???? ???? ?????
    if (data.fullFormPDF) {
      const fullPdfBlob = Utilities.newBlob(
        Utilities.base64Decode(data.fullFormPDF.split(",")[1]),
        "application/pdf",
        `complete_form_${timestamp.getTime()}.pdf`
      );
      const fullPdfFile = completedFolder.createFile(fullPdfBlob);
      fullPdfUrl = fullPdfFile.getUrl();
    }
    
    // ????? ???????
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    const rowData = [
      timestamp,
      data.section,
      ...Object.entries(data)
        .filter(([key, val]) => !key.includes("PDF") && typeof val === "string")
        .map(([_, val]) => val),
      pdfUrl,
      fullPdfUrl
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      pdfUrl: pdfUrl,
      fullPdfUrl: fullPdfUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
