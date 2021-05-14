import express from 'express';

import { logger } from 'bsh-shared-module';

import walletService from '../services/walletService';

const log = logger.getLogger();

const accountsRouter = express.Router();

accountsRouter.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const accounts = await walletService.getAccounts();
    log.debug('accounts:', accounts);

    res.status(200);
    res.json({
      code: 'SUCCESS',
      data: accounts,
    });
  } catch (e) {
    log.error('error getting accounts:', e);

    res.status(500);
    res.json({
      code: 'SERVER_ERROR',
      errorMessage: 'server error',
    });
  }
});

accountsRouter.get('/:account', async (req: express.Request, res: express.Response) => {
  try {
    const accountData = await walletService.getAccountBalance(req.params.account);
    log.debug('accountData:', accountData);

    res.status(200);
    res.json({
      code: 'SUCCESS',
      data: accountData,
    });
  } catch (e) {
    log.error('error getting account data:', e);

    res.status(500);
    res.json({
      code: 'SERVER_ERROR',
      errorMessage: 'server error',
    });
  }
});

accountsRouter.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const account = await walletService.getNewAccount();
    log.debug('new account:', account);

    res.status(200);
    res.json({
      code: 'SUCCESS',
      data: account,
    });
  } catch (e) {
    log.error('error getting new account:', e);

    res.status(500);
    res.json({
      code: 'SERVER_ERROR',
      errorMessage: 'server error',
    });
  }
});

export default accountsRouter;
