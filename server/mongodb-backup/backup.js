require('dotenv').config(); // Load environment variables from .env file

const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs'); // For checking/creating directories

// Access variables from environment
const DB_NAME = process.env.DB_NAME;
const MONGO_URI = process.env.MONGODB_LIVE;
const BACKUP_DIR = path.join(__dirname, 'backups'); // Matches your folder (plural)
const ARCHIVE_PATH = path.join(BACKUP_DIR, `${DB_NAME}-${new Date().toISOString()}.gzip`); // Adds timestamp to avoid overwriting

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
  console.log('Backups directory created:', BACKUP_DIR);
} else {
  console.log('Backups directory already exists:', BACKUP_DIR);
}

// Schedule backup daily at 10 AM (10:00 in 24-hour format)
cron.schedule('0 20 10 * * *', () => backupMongoDB());

function backupMongoDB() {
  const child = spawn('mongodump', [
    `--uri=${MONGO_URI}/${DB_NAME}`, // Append DB_NAME to URI here
    `--archive=${ARCHIVE_PATH}`,
    '--gzip',
  ]);

  child.stdout.on('data', (data) => {
    console.log('stdout:\n', data.toString());
  });
  child.stderr.on('data', (data) => {
    console.error('stderr:\n', data.toString());
  });
  child.on('error', (error) => {
    console.error('error:\n', error);
  });
  child.on('exit', (code, signal) => {
    if (code) console.log('Process exit with code:', code);
    else if (signal) console.log('Process killed with signal:', signal);
    else console.log('Backup successful 🎉');
  });
}

// Keep the script running for cron
console.log('Backup scheduler started. Waiting for 10 AM...');
