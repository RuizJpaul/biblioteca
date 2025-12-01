// Polyfill global fetch para NeonDB en Node.js
const fetch = require('node-fetch');
if (!global.fetch) {
	global.fetch = fetch;
}
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test'

// Polyfill for Next.js
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder


