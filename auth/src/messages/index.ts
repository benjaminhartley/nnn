import { DepositMessage } from './Deposit';
import { ErrorMessage } from './Error';
import { WithdrawalMessage } from './Withdrawal';

export * from './Deposit';
export * from './Error';
export * from './Withdrawal';

export type Message = DepositMessage | WithdrawalMessage | ErrorMessage;
