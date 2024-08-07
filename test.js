// testEnv.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

console.log('Environment Variables:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: "reminderoo" // Check if this is undefined
});
