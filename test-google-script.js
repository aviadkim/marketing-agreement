function testDoPost() {
  const testEvent = {
    postData: {
      contents: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
        phone: "0544533709",
        idNumber: "123456789",
        investmentAmount: "100000",
        bank: "leumi",
        currency: "ILS",
        purpose: ["savings"],
        timeline: "medium",
        marketExperience: "advanced",
        riskTolerance: "medium",
        lossResponse: "hold",
        investmentKnowledge: ["stocks", "bonds"],
        investmentRestrictions: "",
        riskAcknowledgement: true,
        independentDecision: true,
        updateCommitment: true,
        signature: "data:image/png;base64,...",
        formScreenshot: "data:image/png;base64,...",
        timestamp: new Date().toISOString()
      })
    }
  };
  
  Logger.log('Running test with full data');
  const result = doPost(testEvent);
  Logger.log('Test result:', result.getContent());
}
