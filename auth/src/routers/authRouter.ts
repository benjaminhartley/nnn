import { json, Request, Response, Router } from 'express';

import authController from '../controllers/authController';

import { LoginSchema, SignupSchema, validationOptions } from '../schemas';

import { http, logger } from 'bsh-shared-module';

const log = logger.getLogger();

const authRouter = Router();
authRouter.use(json());

authRouter.post('/signup', async (req: Request, res: Response) => {
  log.debug('/signup');
  log.debug(req.body);

  const validationResult = SignupSchema.validate(req.body, validationOptions);
  if (validationResult.error) {
    log.error(validationResult.error);
    res.status(400);
    return res.json(http.validationError());
  }

  try {
    const signupResponse = await authController.handleSignup({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
    });

    res.status(200);
    res.json(http.success(signupResponse));
  } catch (e) {
    log.error(e);

    if (e.message === 'user already exists') {
      res.status(409);
      return res.json(http.alreadyExists(e.message));
    }

    res.status(401);
    res.json(http.unauthorized());
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  log.debug('/login');
  log.debug(req.body);

  const validationResult = LoginSchema.validate(req.body, validationOptions);
  if (validationResult.error) {
    log.error(validationResult.error);
    res.status(400);
    return res.json(http.validationError());
  }

  try {
    const loginResponse = await authController.handleLogin({
      name: req.body.name,
      password: req.body.password,
    });

    log.debug(loginResponse);

    res.status(200);
    res.json(http.success(loginResponse));
  } catch (e) {
    log.error(e);
    res.status(401);
    res.json(http.unauthorized());
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  log.debug('/refresh');

  const { token } = req.body;

  if (!token) {
    res.status(400);
    return res.json(http.validationError());
  }

  try {
    const refreshResponse = await authController.refreshToken(token);
    log.debug(refreshResponse);

    res.status(200);
    res.json(http.success(refreshResponse));
  } catch (e) {
    log.error(e);
    res.status(401);
    res.json(http.unauthorized());
  }
});

export default authRouter;
