const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Backup folder (inside server - TEMPORARY only!)
const backupPath = path.join(__dirname, "backups");

// Ensure backup folder exists
if (!fs.existsSync(backupPath)) {
  fs.mkdirSync(backupPath);
}

// MongoDB connection string
const mongoURI = process.env.MONGODB_LIVE; // replace with your Mongo URI

// Run every day at 10 PM IST (Render = UTC, so use 16:30 UTC = 10:00 PM IST)
cron.schedule("0 16 * * *", () => {
  console.log("Starting MongoDB backup...");

  // Command to run mongodump
  const cmd = `mongodump --uri="${mongoURI}" --out=${backupPath}/backup-\`date +%Y-%m-%d-%H-%M\``;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Backup stderr: ${stderr}`);
      return;
    }
    console.log(`Backup successful: ${stdout}`);
  });
});
