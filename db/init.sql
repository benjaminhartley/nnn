BEGIN;

CREATE TABLE IF NOT EXISTS users (
   name VARCHAR(40) PRIMARY KEY UNIQUE NOT NULL,
   id VARCHAR(40) UNIQUE NOT NULL,
   password VARCHAR(256) NOT NULL,
   email VARCHAR(100),
   deposit_address VARCHAR(128) UNIQUE,
   balance NUMERIC(40) NOT NULL,
   created_at VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS deposits (
   id SERIAL PRIMARY KEY,
   amount NUMERIC(40) NOT NULL,
   source VARCHAR(128) NOT NULL,
   deposit_address VARCHAR(128) NOT NULL REFERENCES users(deposit_address),
   block VARCHAR(128) NOT NULL,
   created_at VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS withdrawals (
   id SERIAL PRIMARY KEY,
   name VARCHAR(40) NOT NULL REFERENCES users(name),
   amount NUMERIC(40) NOT NULL,
   source VARCHAR(128) NOT NULL,
   withdrawal_address VARCHAR(128) NOT NULL,
   block VARCHAR(128) NOT NULL,
   created_at VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS account_transfers (
   id SERIAL PRIMARY KEY,
   transferId VARCHAR(40) NOT NULL,
   amount NUMERIC(40) NOT NULL,
   source VARCHAR(128) NOT NULL,
   destination VARCHAR(128) NOT NULL,
   block VARCHAR(128) NOT NULL,
   created_at VARCHAR(30) NOT NULL
);

COMMIT;
