import BigNumber from 'bignumber.js';
import { json, Response, Router } from 'express';

import { RequestWithToken } from '../interfaces';

import userController from '../controllers/userController';
import walletController from '../controllers/walletController';

import { http, logger } from 'bsh-shared-module';

import middleware from '../utils/middleware';

import { User } from '../interfaces';
import { validationOptions, WithdrawalSchema } from '../schemas';

const log = logger.getLogger();

const userRouter = Router();
userRouter.use(json());
userRouter.use(middleware.authMiddleware);

userRouter.get(
  '/:name',
  async (req: RequestWithToken, res: Response) => {
    log.debug('GET /user/:name');

    const { token } = req;
    const { name } = req.params;

    if (!token || name !== token.user.name) {
      res.status(401);
      return res.json({
        code: 'UNAUTHORIZED',
        errorMessage: 'Unauthorized',
      });
    }

    try {
      const user = await userController.getUser(name);
      log.debug(user);

      if (!user) {
        res.status(404);
        return res.json({
          code: 'NOT_FOUND',
          message: 'user not found',
        });
      }

      res.status(200);
      res.json({
        code: 'SUCCESS',
        message: 'success',
        data: formatUser(user),
      });
    } catch (e) {
      log.error(e);

      res.status(500);
      res.json({
        code: 'SERVER_ERROR',
        message: 'server error',
      });
    }
  },
);

function formatUser(user: User): any {
  return {
    ...user,
    rawAmount: user.rawAmount.toFixed(),
  };
}

userRouter.post(
  '/:name/withdraw',
  async (req: RequestWithToken, res: Response) => {
    log.debug('POST /user/:name/withdraw');

    const validationResult = WithdrawalSchema.validate(
      req.body,
      validationOptions,
    );

    if (validationResult.error) {
      log.error(validationResult.error);
      res.status(400);
      return res.json(http.validationError());
    }

    const { token } = req;
    const { name } = req.params;

    if (!token || name !== token.user.name) {
      res.status(401);
      return res.json(http.unauthorized());
    }

    const { rawAmount, withdrawalAddress } = req.body;

    try {
      await walletController.withdraw({
        rawAmount: new BigNumber(rawAmount),
        withdrawalAddress,
        name,
      });

      res.status(200);
      res.json(http.success());
    } catch (e) {
      log.error(e);

      if (e.message === 'invalid address') {
        res.status(422);
        return res.json(http.unprocessable(e.message));
      }

      if (e.message === 'withdrawal amount must be greater than zero') {
        res.status(422);
        return res.json(http.unprocessable(e.message));
      }

      if (e.message === 'user not found') {
        res.status(404);
        return res.json(http.notFound(e.message));
      }

      if (e.message === 'insufficient funds') {
        res.status(422);
        return res.json(http.unprocessable(e.message));
      }

      if (e.message === 'first account has low balance') {
        res.status(503);
        return res.json(
          http.serviceUnavailable(
            'wallet funds in consolidation, withdrawal temporarily unavailable',
          ),
        );
      }

      res.status(500);
      res.json(http.serverError());
    }
  },
);

export default userRouter;
