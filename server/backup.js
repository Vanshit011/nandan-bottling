const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');

const DB_NAME = 'test'; // Replace with your DB name
const ARCHIVE_PATH = path.join(__dirname, 'backup', `${DB_NAME}.gzip`);
const MONGO_URI = 'mongodb+srv://vanshitpatel10:Vanshit12345@cluster1.mlt3qae.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

// Schedule backup daily at 10 PM (22:00 in 24-hour format)
cron.schedule('0 0 22 * * *', () => backupMongoDB());

function backupMongoDB() {
  const child = spawn('mongodump', [
    `--uri=${MONGO_URI}/${DB_NAME}`,
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
console.log('Backup scheduler started. Waiting for 10 PM...');
