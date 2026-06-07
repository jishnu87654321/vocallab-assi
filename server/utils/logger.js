// ANSI Color escape codes
const COLORS = {
  RESET: '\x1b[0m',
  CYAN: '\x1b[36m',   // [FETCH] / info
  GREEN: '\x1b[32m',  // [SUCCESS]
  YELLOW: '\x1b[33m', // [WARN] / [SAVE]
  RED: '\x1b[31m',    // [ERROR] / [FAIL]
  MAGENTA: '\x1b[35m',// [PROCESS]
  WHITE: '\x1b[37m',  // [INIT]
  DIM: '\x1b[2m'
};

const formatPrefix = (tag, color) => `${color}[${tag}]${COLORS.RESET}`;

export const logger = {
  info: (msg) => {
    console.log(`${formatPrefix('INFO', COLORS.CYAN)} ${msg}`);
  },
  init: (msg) => {
    console.log(`${formatPrefix('INIT', COLORS.WHITE)} ${msg}`);
  },
  fetch: (msg) => {
    console.log(`${formatPrefix('FETCH', COLORS.CYAN)} ${msg}`);
  },
  process: (msg) => {
    console.log(`${formatPrefix('PROCESS', COLORS.MAGENTA)} ${msg}`);
  },
  save: (msg) => {
    console.log(`${formatPrefix('SAVE', COLORS.YELLOW)} ${msg}`);
  },
  warn: (msg) => {
    console.log(`${formatPrefix('WARN', COLORS.YELLOW)} ${msg}`);
  },
  success: (msg) => {
    console.log(`${formatPrefix('SUCCESS', COLORS.GREEN)} ${msg}`);
  },
  error: (msg) => {
    console.error(`${formatPrefix('ERROR', COLORS.RED)} ${msg}`);
  },
  http: (method, url) => {
    console.log(`${COLORS.DIM}[HTTP] ${method.toUpperCase()} ${url}${COLORS.RESET}`);
  }
};

export default logger;
