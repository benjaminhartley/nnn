export interface WithdrawalMessage {
  type: 'WITHDRAWAL';
  data: {
    name: string;
    amount: string;
    address: string;
  };
}
