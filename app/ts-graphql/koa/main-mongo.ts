import { configure, getLogger } from 'log4js';
import App from './app';
import config from './config/config';
import MongodbManager from './system/MongoManager';

// tslint:disable-next-line
require('dotenv').config();

// ===================== log module =========================
if (config.log4js.logging) {
  configure(`${__dirname}/config/log4js.json`);
} else {
  configure({
    appenders: {
      console: {
        type: 'console',
        layout: {
          type: 'pattern',
          pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] [%c] %m%]',
        },
      },
    },
    categories: { default: { appenders: ['console'], level: 'info' } },
  });
}
// ==================== log module =========================

const log = getLogger('main');

async function startUp() {
  await MongodbManager.connectMongodbServer();

  const app = new App(config.graphqlEndpoint, config.port, config.corsOptions);
  await app.startUpHttpServer();
}

startUp().catch(err => {
  log.error(err);
  log.error('Fatal error was encountered. GraphQL api service cannot started.');
  process.exit(0);
});
