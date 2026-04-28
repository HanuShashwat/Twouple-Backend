const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  info: (message, meta = {}) => {
    if (isDev) {
      console.log(`🔵 [INFO] ${new Date().toLocaleTimeString()}: ${message}`, Object.keys(meta).length ? meta : '');
    } else {
      console.log(JSON.stringify({ level: 'info', timestamp: new Date(), message, ...meta }));
    }
  },
  warn: (message, meta = {}) => {
    if (isDev) {
      console.log(`🟠 [WARN] ${new Date().toLocaleTimeString()}: ${message}`, Object.keys(meta).length ? meta : '');
    } else {
      console.warn(JSON.stringify({ level: 'warn', timestamp: new Date(), message, ...meta }));
    }
  },
  error: (message, errorObj = {}) => {
    if (isDev) {
      console.error(`🔴 [ERROR] ${new Date().toLocaleTimeString()}: ${message}`);
      if (errorObj.stack) console.error(errorObj.stack);
    } else {
      console.error(JSON.stringify({ level: 'error', timestamp: new Date(), message, error: errorObj.message }));
    }
  }
};

module.exports = logger;