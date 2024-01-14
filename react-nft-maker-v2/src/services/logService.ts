import Rollbar from 'rollbar';

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ID,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export const logInfo = (log?: string) => {
  rollbar.info(log ?? 'Next test log');
};

export const logError = (err?: string) => {
  rollbar.error(err ?? 'error');
};
