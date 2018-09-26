import { getLogger } from 'log4js';

const log = getLogger('error-middleware');

const errMiddleware = (err, req, res, next) => {
  log.error(err.message);
  res.status(500).send(err.message);
};

export default errMiddleware;
