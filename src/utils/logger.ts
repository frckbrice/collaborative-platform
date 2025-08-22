/**
 * Custom logging utility that only logs in development environments
 * Prevents accidental logging in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  timestamp?: boolean;
  showLevel?: boolean;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Check if logging is enabled for current environment
   */
  private shouldLog(): boolean {
    return this.isDevelopment || this.isTest;
  }

  /**
   * Format the log message with context and timestamp
   */
  private formatMessage(level: LogLevel, message: string, options: LogOptions = {}): string {
    const parts: string[] = [];

    // Add timestamp if requested
    if (options.timestamp !== false) {
      const now = new Date().toISOString();
      parts.push(`[${now}]`);
    }

    // Add log level if requested
    if (options.showLevel !== false) {
      parts.push(`[${level.toUpperCase()}]`);
    }

    // Add context if provided
    if (options.context) {
      parts.push(`[${options.context}]`);
    }

    // Add the actual message
    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('debug', message, options);
    console.log(`🐛 ${formattedMessage}`, data || '');
  }

  /**
   * Log info messages (only in development)
   */
  info(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, options);
    console.log(`ℹ️ ${formattedMessage}`, data || '');
  }

  /**
   * Log warning messages (only in development)
   */
  warn(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('warn', message, options);
    console.warn(`⚠️ ${formattedMessage}`, data || '');
  }

  /**
   * Log error messages (only in development)
   */
  error(message: string, error?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('error', message, options);
    console.error(`❌ ${formattedMessage}`, error || '');
  }

  /**
   * Log authentication-related messages
   */
  auth(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, {
      ...options,
      context: 'AUTH',
      showLevel: false,
    });
    console.log(`🔐 ${formattedMessage}`, data || '');
  }

  /**
   * Log middleware-related messages
   */
  middleware(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, {
      ...options,
      context: 'MIDDLEWARE',
      showLevel: false,
    });
    console.log(`🛡️ ${formattedMessage}`, data || '');
  }

  /**
   * Log API-related messages
   */
  api(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, {
      ...options,
      context: 'API',
      showLevel: false,
    });
    console.log(`🌐 ${formattedMessage}`, data || '');
  }

  /**
   * Log database-related messages
   */
  db(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, {
      ...options,
      context: 'DATABASE',
      showLevel: false,
    });
    console.log(`🗄️ ${formattedMessage}`, data || '');
  }

  /**
   * Log component lifecycle messages
   */
  component(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, {
      ...options,
      context: 'COMPONENT',
      showLevel: false,
    });
    console.log(`🧩 ${formattedMessage}`, data || '');
  }

  /**
   * Log performance-related messages
   */
  perf(message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, {
      ...options,
      context: 'PERFORMANCE',
      showLevel: false,
    });
    console.log(`⚡ ${formattedMessage}`, data || '');
  }

  /**
   * Log with custom emoji and context
   */
  custom(emoji: string, message: string, data?: any, options: LogOptions = {}): void {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage('info', message, options);
    console.log(`${emoji} ${formattedMessage}`, data || '');
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void): void {
    if (!this.shouldLog()) return;

    console.group(`📁 ${label}`);
    callback();
    console.groupEnd();
  }

  /**
   * Log a table of data
   */
  table(data: any, columns?: string[]): void {
    if (!this.shouldLog()) return;

    console.table(data, columns);
  }

  /**
   * Log the current time
   */
  time(label: string): void {
    if (!this.shouldLog()) return;

    console.time(`⏱️ ${label}`);
  }

  /**
   * End a timer
   */
  timeEnd(label: string): void {
    if (!this.shouldLog()) return;

    console.timeEnd(`⏱️ ${label}`);
  }

  /**
   * Log a trace (stack trace)
   */
  trace(message?: string): void {
    if (!this.shouldLog()) return;

    if (message) {
      console.log(`🔍 ${message}`);
    }
    console.trace();
  }

  /**
   * Log with count (useful for tracking function calls)
   */
  count(label: string): void {
    if (!this.shouldLog()) return;

    console.count(`🔢 ${label}`);
  }

  /**
   * Reset a counter
   */
  countReset(label: string): void {
    if (!this.shouldLog()) return;

    console.countReset(`🔢 ${label}`);
  }
}

// Create and export a singleton instance
export const logger = new Logger();

// Export the class for testing or custom instances
export { Logger };

// Convenience functions for common use cases
export const log = {
  debug: (message: string, data?: any, options?: LogOptions) =>
    logger.debug(message, data, options),
  info: (message: string, data?: any, options?: LogOptions) => logger.info(message, data, options),
  warn: (message: string, data?: any, options?: LogOptions) => logger.warn(message, data, options),
  error: (message: string, error?: any, options?: LogOptions) =>
    logger.error(message, error, options),
  auth: (message: string, data?: any, options?: LogOptions) => logger.auth(message, data, options),
  middleware: (message: string, data?: any, options?: LogOptions) =>
    logger.middleware(message, data, options),
  api: (message: string, data?: any, options?: LogOptions) => logger.api(message, data, options),
  db: (message: string, data?: any, options?: LogOptions) => logger.db(message, data, options),
  component: (message: string, data?: any, options?: LogOptions) =>
    logger.component(message, data, options),
  perf: (message: string, data?: any, options?: LogOptions) => logger.perf(message, data, options),
  custom: (emoji: string, message: string, data?: any, options?: LogOptions) =>
    logger.custom(emoji, message, data, options),
  group: (label: string, callback: () => void) => logger.group(label, callback),
  table: (data: any, columns?: string[]) => logger.table(data, columns),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
  trace: (message?: string) => logger.trace(message),
  count: (label: string) => logger.count(label),
  countReset: (label: string) => logger.countReset(label),
};

// Default export for backward compatibility
export default logger;
