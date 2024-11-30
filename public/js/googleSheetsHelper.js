const { GoogleSpreadsheet } = require('google-spreadsheet');

async function addRowToGoogleSheet(row) {
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.addRow(row);
}

module.exports = { addRowToGoogleSheet };
