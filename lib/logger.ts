type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

const isDevelopment = process.env.NODE_ENV === 'development';

// Color codes for console output (development only)
const levelColors: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const resetColor = '\x1b[0m';

function formatLogEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
  if (entry.context && Object.keys(entry.context).length > 0) {
    return `${base} ${JSON.stringify(entry.context)}`;
  }
  return base;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  if (isDevelopment) {
    // Colorized console output in development
    const color = levelColors[level];
    const formatted = formatLogEntry(entry);

    switch (level) {
      case 'debug':
        console.debug(`${color}${formatted}${resetColor}`);
        break;
      case 'info':
        console.info(`${color}${formatted}${resetColor}`);
        break;
      case 'warn':
        console.warn(`${color}${formatted}${resetColor}`);
        break;
      case 'error':
        console.error(`${color}${formatted}${resetColor}`);
        break;
    }
  } else {
    // JSON output in production (for log aggregation services)
    const jsonEntry = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        // Skip debug in production
        break;
      case 'info':
        console.info(jsonEntry);
        break;
      case 'warn':
        console.warn(jsonEntry);
        break;
      case 'error':
        console.error(jsonEntry);
        break;
    }
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

// Request-specific logger with automatic context
export function createRequestLogger(requestId: string, path: string) {
  const baseContext = { requestId, path };

  return {
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext) =>
      log('error', message, { ...baseContext, ...context }),
  };
}

// API route helper
export function logApiError(
  error: unknown,
  context: { route: string; method: string; [key: string]: unknown }
): void {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(errorMessage, {
    ...context,
    stack: errorStack,
    errorType: error?.constructor?.name || 'Unknown',
  });
}

export default logger;
