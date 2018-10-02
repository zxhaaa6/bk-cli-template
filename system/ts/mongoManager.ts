import { getLogger } from 'log4js';
import * as mongoose from 'mongoose';
import config from '../config/config';

const dbConfig = config.mongodb;
const log = getLogger('MongodbManager');

class MongodbManager {
  public static connectMongodbServer() {
    const host = process.env.MONGODB_HOST || dbConfig.host;
    const port = process.env.MONGODB_PORT || dbConfig.port;
    const dbName = process.env.MONGODB_DB || dbConfig.db;
    const user = process.env.MONGODB_ROOT_USER;
    const pass = process.env.MONGODB_ROOT_PASS;

    const uri = `mongodb://${host}:${port}`;
    let options = {};
    if (user && pass) {
      options = Object.assign(
        {
          useNewUrlParser: true,
          dbName,
          authSource: 'admin',
          user,
          pass,
        },
        dbConfig.options,
      );
    }
    return mongoose
      .connect(
        uri,
        options,
      )
      .then(() => {
        log.info('[Mongodb]DB connection has been established successfully.');
      })
      .catch(err => {
        throw err;
      });
  }
}

export default MongodbManager;
