export interface ErrorMessage {
  type: 'ERROR';
  data: {
    code: string;
    message: string;
  };
}
