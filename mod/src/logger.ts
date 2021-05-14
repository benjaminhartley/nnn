import log4js from 'log4js';

function getLogger(level?: string): log4js.Logger {
  const opts = {
    level: getLevelForStage(), // start with default level for stage
  };

  const procLogLevel = getProcessLogLevel();
  if (procLogLevel) {
    // override stage log level if process wants
    opts.level = procLogLevel;
  }

  if (level) {
    // allow level override on individual loggers
    opts.level = level;
  }

  const log = log4js.getLogger();
  log.level = opts.level;

  return log;
}

function getLevelForStage(): string {
  const stage = process.env.STAGE?.toLowerCase();

  if (stage === 'prod') {
    return 'info';
  }

  if (stage === 'staging') {
    return 'debug';
  }

  return 'off';
}

function getProcessLogLevel(): string | undefined {
  const { LOG_LEVEL } = process.env;

  if (!LOG_LEVEL) {
    return;
  }

  const logLevel = LOG_LEVEL.toLowerCase();
  switch (logLevel) {
    case 'fatal':
      return 'fatal';

    case 'error':
      return 'error';

    case 'warn':
      return 'warn';

    case 'info':
      return 'info';

    case 'debug':
      return 'debug';

    case 'trace':
      return 'trace';

    default:
      return;
  }
}

export default {
  getLogger,
};
