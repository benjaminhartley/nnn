require('dotenv').config();
require('dotenv').config({ path: '../db/database.env' });

import cors from 'cors';
import express from 'express';

import accountsRouter from './routers/accountsRouter';

import messageController from './controllers/messageController';
import walletController from './controllers/walletController';

import publishService from './services/publishService';

import { logger } from 'bsh-shared-module';

const log = logger.getLogger();

const app = express();
app.use(cors());

app.use('/accounts', accountsRouter);

app.listen(4244, async () => {
  log.info('wallet-manager listening on port 4244');

  try {
    await messageController.pollAndHandleMessages();
    log.info('message poller set');
  } catch (e) {
    log.error('error handling messages:', e);
    await publishService.publishErrorMessage('MESSAGE_HANDLER_ERROR', e.message);
  }
});

setInterval(async () => {
  try {
    log.info('starting receive pending cron');
    await walletController.receivePending();
    log.info('receive pending cron complete');
  } catch (e) {
    log.error('RECEIVE PENDING ERROR:', e);
    await publishService.publishErrorMessage('RECEIVE_PENDING_ERROR', e.message);

  }
}, 60 * 1000);

setInterval(async () => {
  try {
    log.info('start consolidate to storage cron');
    await walletController.consolidateToStorage();
    log.info('consolidate to storage cron complete');
  } catch (e) {
    log.error('CONSOLIDATE FUNDS ERROR:', e);
    await publishService.publishErrorMessage('CONSOLIDATE_FUND_ERROR', e.message);
  }
}, 90 * 1000);
