// lib/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
  [key: string]: any;
}

const isDev = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.DEBUG_LOGS === 'true';

const log = (level: LogLevel, message: string, meta?: LogMeta) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (isDev || level === 'error') {
    const consoleMethod = console[level] || console.log;
    consoleMethod(JSON.stringify(logEntry, null, isDev ? 2 : 0));
  }
};

export const logger = {
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
  debug: (message: string, meta?: LogMeta) => {
    if (isDev || isDebugEnabled) log('debug', message, meta);
  },
};
