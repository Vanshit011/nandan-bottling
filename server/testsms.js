require("dotenv").config(); // To load your .env API Key
const sendSms = require("./utils/smsSender");  // ✅ Importing SMS Sender

// ✅ Replace below phone number with YOUR REAL Indian number (only 10-digit, no +91)
sendSms("9499558009", "Test message from Nanadan Bottling CRM");
