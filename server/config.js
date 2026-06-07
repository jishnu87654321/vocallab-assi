import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from the server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const REQUIRED_KEYS = [
  'OCEAN_API_KEY',
  'PROSPEO_API_KEY',
  'BREVO_API_KEY',
  'SENDER_EMAIL',
  'SENDER_NAME',
  'MONGODB_URI',
  'BREVO_SMTP_USER',
  'BREVO_SMTP_PASS'
];

const config = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Optional — Eazyreach (no known endpoint, used as identity reference)
  EAZYREACH_API_KEY: process.env.EAZYREACH_API_KEY || '',
  EAZYREACH_CLIENT_ID: process.env.EAZYREACH_CLIENT_ID || '',
};

for (const key of REQUIRED_KEYS) {
  if (!process.env[key]) {
    throw new Error(`Configuration Error: Missing required environment variable "${key}"`);
  }
  config[key] = process.env[key];
}

export default Object.freeze(config);
