import { ApolloServer } from 'apollo-server-express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as jwt from 'express-jwt';
import * as helmet from 'helmet';
import * as http from 'http';
import { getLogger } from 'log4js';
import * as morgan from 'morgan';
import { errMiddleware } from './middleware';
import { context, resolvers, typeDefs } from './module';

const log = getLogger('App');

interface ICorsOptions {
  origin: string[];
}

class App {
  public graphqlEndpoint: string;
  public port: number;
  public corsOptions: ICorsOptions;
  public app;
  public server;
  public apolloServer;
  constructor(endpoint: string, port: number, corsOptions: ICorsOptions) {
    this.graphqlEndpoint = endpoint;
    this.port = port;
    this.corsOptions = corsOptions;

    const env = process.env;
    const isProduction = env.NODE_ENV === 'production';

    this.app = express();

    this.app.options('*', cors(this.corsOptions));
    this.app.use(helmet());
    this.app.use(
      morgan('dev', {
        skip: () => isProduction,
      }),
    );

    this.app.use(jwt({ secret: 'secret' }).unless({ path: [/^\//] }));

    this.app.use(bodyParser.json());

    this.apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context,
      playground: !isProduction,
    });
    this.apolloServer.applyMiddleware({
      app: this.app,
      path: this.graphqlEndpoint,
      cors: this.corsOptions,
    });

    this.app.use(errMiddleware);
  }

  public async startUpHttpServer() {
    this.port = this.port || 3000;
    this.server = http.createServer(this.app);
    this.server.listen(this.port);
    this.server.on('error', err => {
      this.reportError(err);
    });
    this.server.on('listening', () => {
      this.reportListening('http');
    });
  }

  public reportListening(type) {
    const addr = this.server.address();
    const bind =
      typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    if (process.env.NODE_ENV === 'production') {
      log.info(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
    } else {
      log.warn(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
    }
    log.info(`🚀 Graphql api service listening on [${type}] ${bind}`);
  }

  public reportError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        log.error(`Port ${this.port} requires elevated privileges.`);
        log.error('-----= Graphql api service Startup Failed =-----');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        log.error(`Port ${this.port} is already in use.`);
        log.error('-----= Graphql api service Startup Failed =-----');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}

export default App;
