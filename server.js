// Environment variable checks (add these after the middleware section)
if (!process.env.GOOGLE_PRIVATE_KEY) {
    console.error('GOOGLE_PRIVATE_KEY is missing from environment variables');
    process.exit(1);
}

if (!process.env.GOOGLE_SPREADSHEET_ID) {
    console.error('GOOGLE_SPREADSHEET_ID is missing from environment variables');
    process.exit(1);
}

if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.error('GOOGLE_SERVICE_ACCOUNT_EMAIL is missing from environment variables');
    process.exit(1);
}

// Add debug logging to appendToSheet function
async function appendToSheet(data) {
    try {
        console.log('Creating new GoogleSpreadsheet instance...');
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        
        console.log('Authenticating with service account...');
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY,
        });

        console.log('Loading document info...');
        await doc.loadInfo();

        console.log('Accessing first sheet...');
        const sheet = doc.sheetsByIndex[0];
        
        console.log('Adding row to sheet...');
        await sheet.addRow({
            // ... your existing row data ...
        });
        
        console.log('Row added successfully');
    } catch (error) {
        console.error('Error in appendToSheet:', error);
        throw error;
    }
}
