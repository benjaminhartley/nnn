require('dotenv').config();
require('dotenv').config({ path: '../db/database.env' });

import cors from 'cors';
import express from 'express';

import authRouter from './routers/authRouter';
import userRouter from './routers/userRouter';

import messageController from './controllers/messageController';

import { logger } from 'bsh-shared-module';

const log = logger.getLogger();

const app = express();
app.use(cors());

app.use('/auth', authRouter);
app.use('/users', userRouter);

app.listen(4243, async () => {
  log.info('auth listening on 4243');

  try {
    await messageController.pollAndHandleMessages();
    log.info('message poller set');
  } catch (e) {
    log.error('error handling messages:', e);
    process.exit(1);
  }
});
