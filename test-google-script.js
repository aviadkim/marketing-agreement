function testFolderAccess() {
  const folder = DriveApp.getFoldersByName("Marketing Agreement Forms").next();
  Logger.log("Folder URL: " + folder.getUrl());
  Logger.log("Folder access: " + folder.getSharingAccess());
  Logger.log("Folder permissions: " + folder.getSharingPermission());
  
  // Test file creation
  const testBlob = Utilities.newBlob("Test content", "text/plain", "test.txt");
  const testFile = folder.createFile(testBlob);
  testFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  Logger.log("Test file URL: " + testFile.getUrl());
  Logger.log("Test file download URL: " + testFile.getDownloadUrl());
}

// Run test
testFolderAccess();
