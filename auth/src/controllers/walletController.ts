import BigNumber from 'bignumber.js';

import { logger, nano } from 'bsh-shared-module';

import publishService from '../services/publishService';
import userService from '../services/userService';

const log = logger.getLogger();

export interface WithdrawalRequest {
  name: string;
  rawAmount: BigNumber;
  withdrawalAddress: string;
}

async function withdraw(req: WithdrawalRequest): Promise<void> {
  if (req.rawAmount.isLessThanOrEqualTo(0)) {
    throw new Error('withdrawal amount must be greater than zero');
  }

  if (!nano.isValidNanoAddress(req.withdrawalAddress)) {
    log.warn(`invalid address: ${req.withdrawalAddress}`);
    throw new Error('invalid address');
  }

  const user = await userService.getUser(req.name);

  if (!user) {
    throw new Error('user not found');
  }

  if (req.rawAmount.isGreaterThan(user.rawAmount)) {
    throw new Error('insufficient funds');
  }

  try {
    await userService.decrementBalance(req.name, req.rawAmount);
  } catch (e) {
    await publishService.publishErrorMessage('DB_ERROR', e.message);
    throw e;
  }

  await publishService.publishWithdrawal({
    type: 'WITHDRAWAL',
    data: {
      name: req.name,
      amount: req.rawAmount.toFixed(),
      address: req.withdrawalAddress,
    },
  });
}

export default {
  withdraw,
};
