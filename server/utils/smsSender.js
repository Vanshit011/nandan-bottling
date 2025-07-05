const axios = require("axios");

async function sendSms(phone, message) {
  try {
    const res = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,  // ✅ API Key from .env
        route: "v3",
        sender_id: "FSTSMS",
        message: message,
        language: "english",
        numbers: phone,
      },
    });

    console.log(`✅ SMS sent to ${phone}`);
  } catch (err) {
    console.error(`❌ SMS Error to ${phone}:`, err.response ? err.response.data : err.message);
  }
}

module.exports = sendSms;
