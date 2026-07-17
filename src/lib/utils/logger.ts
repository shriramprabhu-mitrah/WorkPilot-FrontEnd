type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

function createLogger(level: LogLevel) {
  return (...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console[level](...args);
  };
}

export const logger = {
  log: createLogger('log'),
  error: createLogger('error'),
  warn: createLogger('warn'),
  info: createLogger('info'),
  debug: createLogger('debug'),
};

export default logger.log;
