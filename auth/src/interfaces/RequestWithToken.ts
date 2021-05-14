import express from 'express';

export interface RequestWithToken extends express.Request {
  token: any;
}
