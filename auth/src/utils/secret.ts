function getSecret(): string {
  return process.env.SECRET;
}

export default {
  getSecret,
};
