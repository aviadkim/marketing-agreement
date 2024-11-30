const { GoogleSpreadsheet } = require('google-spreadsheet');

const SPREADSHEET_ID = '11z5zIfLN8ViVPQUGfjfxC9vJp4P_Dsu9CpcLuiq2u5s';

async function addRowToGoogleSheet(formData) {
    try {
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // Prepare row data from all form sections
        const row = {
            timestamp: new Date().toISOString(),
            
            // Personal Details (Section 1)
            firstName: formData.firstName || '',
            lastName: formData.lastName || '',
            idNumber: formData.idNumber || '',
            email: formData.email || '',
            phone: formData.phone || '',
            
            // Investment Details (Section 2)
            investmentAmount: formData.investmentAmount || '',
            bank: formData.bank || '',
            currency: formData.currency || '',
            purpose: Array.isArray(formData.purpose) ? formData.purpose.join(', ') : formData.purpose || '',
            purposeOther: formData.purposeOther || '',
            timeline: formData.timeline || '',
            
            // Risk Assessment (Section 3)
            marketExperience: Array.isArray(formData.marketExperience) ? formData.marketExperience.join(', ') : formData.marketExperience || '',
            riskTolerance: formData.riskTolerance || '',
            lossResponse: formData.lossResponse || '',
            investmentKnowledge: Array.isArray(formData.investmentKnowledge) ? formData.investmentKnowledge.join(', ') : formData.investmentKnowledge || '',
            investmentRestrictions: formData.investmentRestrictions || '',
            
            // Declarations (Section 4)
            riskAcknowledgement: formData.riskAcknowledgement ? 'כן' : 'לא',
            independentDecision: formData.independentDecision ? 'כן' : 'לא',
            updateCommitment: formData.updateCommitment ? 'כן' : 'לא',
            
            // Form Screenshots and Signature
            section1Screenshot: formData.section1Screenshot || '',
            section2Screenshot: formData.section2Screenshot || '',
            section3Screenshot: formData.section3Screenshot || '',
            section4Screenshot: formData.section4Screenshot || '',
            signature: formData.finalSignature || '',
            
            // General
            submissionDate: new Date().toLocaleDateString('he-IL'),
            fullFormScreenshot: formData.fullFormScreenshot || ''
        };

        await sheet.addRow(row);
        return true;
    } catch (error) {
        console.error('Error adding row to Google Sheet:', error);
        throw error;
    }
}

module.exports = { addRowToGoogleSheet };
