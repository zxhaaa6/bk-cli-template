import { getLogger } from 'log4js';

const log = getLogger('error-middleware');

const errMiddleware = (err, req, res, next) => {
  let level = 'warn';
  let status = 500;
  if (err.name === 'UnauthorizedError') {
    status = 401;
  } else {
    level = 'error';
  }
  log[level](`${req.url} Error: ${err}`);
  res.status(status).send(err.message);
};

export default errMiddleware;
