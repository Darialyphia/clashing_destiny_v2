export type LoggerConsumer = {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (title: string, ...args: any[]) => void;
};

// prints to the console, debug entries go in a collapsed group
// console is read at call time, so tools that wrap it later still see the logs
export const consoleLogger: LoggerConsumer = {
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  debug: (title, ...args) => {
    console.groupCollapsed(title);
    args.forEach(arg => console.log(arg));
    console.groupEnd();
  }
};

// a Logger is also a LoggerConsumer, so one logger can forward to another
export class Logger implements LoggerConsumer {
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
