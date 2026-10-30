export type LoggerConsumer = {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (title: string, ...args: any[]) => void;
};

export class Logger {
  private loggers: LoggerConsumer[] = [];

  addLogger(logger: LoggerConsumer) {
    this.loggers.push(logger);
  }

  log(...args: any[]) {
    for (const logger of this.loggers) {
      logger.log(...args);
    }
  }

  warn(...args: any[]) {
    for (const logger of this.loggers) {
      logger.warn(...args);
    }
  }
  error(...args: any[]) {
    for (const logger of this.loggers) {
      logger.error(...args);
    }
  }
  debug(title: string, ...args: any[]) {
    for (const logger of this.loggers) {
      logger.debug(title, ...args);
    }
  }
}
