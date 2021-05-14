import BigNumber from 'bignumber.js';
import request from 'got';

const { WALLET_URL, WALLET_ID } = process.env;

async function getNewAccount(): Promise<string> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'account_create',
      wallet: WALLET_ID,
    },
    responseType: 'json',
  });

  const account = response?.body?.account;
  if (!account) {
    throw new Error('unable to get new account');
  }

  return account;
}

async function getAccounts(): Promise<string[]> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'account_list',
      wallet: WALLET_ID,
    },
    responseType: 'json',
  });

  return response?.body?.accounts || [];
}

interface AccountBalance {
  pending: BigNumber;
  balance: BigNumber;
}

async function getAccountBalance(account: string, ): Promise<AccountBalance> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'account_balance',
      account,
    },
    responseType: 'json',
  });

  if (response.error) {
    throw response.error;
  }

  return {
    pending: new BigNumber(response?.body?.pending),
    balance: new BigNumber(response?.body?.balance),
  };
}

interface GetWalletBalancesResponse {
  firstAccount?: string;
  balances: { [key: string]: BigNumber };
}

async function getWalletBalances(): Promise<GetWalletBalancesResponse> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'wallet_balances',
      wallet: WALLET_ID,
    },
    responseType: 'json',
  });

  const res: GetWalletBalancesResponse = {
    balances: {},
  };

  for (const account of Object.keys(response?.body?.balances)) {
    const balance = new BigNumber(response.body.balances?.[account]?.balance || 0);

    if (!res.firstAccount) {
      res.firstAccount = account;
      res.balances[account] = balance;
    } else if (balance.isGreaterThan(0)) {
      res.balances[account] = balance;
    }
  }

  return res;
}

export interface PendingBlocksResponse {
  blocks: {
    [key: string]: string[];
  };
}

async function pending(): Promise<PendingBlocksResponse> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'wallet_pending',
      wallet: WALLET_ID,
    },
    responseType: 'json',
  });

  return response?.body;
}

export interface ReceiveBlockRequest {
  account: string;
  block: string;
}

interface ReceiveBlockResponse {
  block: string;
}

async function receive(req: ReceiveBlockRequest): Promise<ReceiveBlockResponse> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'receive',
      wallet: WALLET_ID,
      account: req.account,
      block: req.block,
    },
    responseType: 'json',
  });

  return response?.body;
}

export interface BlockData {
  block_account: string;
  amount: BigNumber;
  balance: BigNumber;
  height: string;
  local_timestamp: string;
  confirmed: string;
  contents: {
    type: string;
    account: string;
    previous: string;
    representative: string;
    balance: BigNumber;
    link: string;
    link_as_account: string;
    signature: string;
    work: string;
  };
  subtype: string;
}

async function getBlockInfo(hash: string, ): Promise<BlockData> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'block_info', // blocks for batch
      json_block: true,
      hash,
    },
    responseType: 'json',
  });

  return formatBlockData(response?.body);
}

function formatBlockData(data?: any): BlockData {
  return {
    ...data,
    amount: new BigNumber(data?.amount),
    balance: new BigNumber(data?.balance),
    contents: {
      ...data?.contents,
      // todo: check for hex for legacy reasons ?
      balance: new BigNumber(data?.contents?.balance),
    },
  } as BlockData;
}

export interface SendRequest {
  source: string;
  destination: string;
  id: string;
  rawAmount: BigNumber;
}

async function sendRaw(req: SendRequest, ): Promise<string> {
  const response: any = await request.post(WALLET_URL, {
    json: {
      action: 'send',
      wallet: WALLET_ID,
      source: req.source,
      destination: req.destination,
      id: req.id,
      amount: req.rawAmount.toFixed(),
    },
    responseType: 'json',
  });

  if (response?.body?.block) {
    return response.body.block;
  }

  console.log(response.error);
  throw new Error('not sent');
}

export default {
  getAccounts,
  getBlockInfo,
  getNewAccount,
  getAccountBalance,
  getWalletBalances,
  pending,
  receive,
  sendRaw,
};
