interface SimpleResponse {
  code: string;
  message?: string;
  errorMessage?: string;
  data?: any;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function success(data?: any): SimpleResponse {
  const res: SimpleResponse = {
    code: 'SUCCESS',
    message: 'success',
  };

  if (data) {
    res.data = data;
  }

  return res;
}

function validationError(errorMessage?: string): SimpleResponse {
  const res: SimpleResponse = {
    code: 'VALIDATION_ERROR',
  };

  if (errorMessage) {
    res.errorMessage = errorMessage;
  } else {
    res.errorMessage = 'Validation Error';
  }

  return res;
}

function unauthorized(): SimpleResponse {
  return {
    code: 'UNAUTHORIZED',
    errorMessage: 'Unauthorized',
  };
}

function notFound(errorMessage: string): SimpleResponse {
  return {
    code: 'NOT_FOUND',
    errorMessage,
  };
}

function alreadyExists(errorMessage: string): SimpleResponse {
  return {
    code: 'ALREADY_EXISTS',
    errorMessage,
  };
}

function unprocessable(errorMessage: string): SimpleResponse {
  return {
    code: 'UNPROCESSABLE',
    errorMessage,
  };
}

function serverError(): SimpleResponse {
  return {
    code: 'SERVER_ERROR',
    errorMessage: 'server error',
  };
}

function serviceUnavailable(errorMessage: string): SimpleResponse {
  return {
    code: 'SERVICE_UNAVAILABLE',
    errorMessage,
  };
}

export default {
  alreadyExists,
  notFound,
  serverError,
  serviceUnavailable,
  success,
  unauthorized,
  unprocessable,
  validationError,
};
