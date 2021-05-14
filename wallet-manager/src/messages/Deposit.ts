export interface DepositMessage {
  type: 'DEPOSIT';
  data: {
    address: string;
    amount: string;
  };
}
