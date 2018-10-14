import * as cors from '@koa/cors';
import { ApolloServer } from 'apollo-server-koa';
import * as http from 'http';
import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as jwt from 'koa-jwt';
import * as logger from 'koa-logger';
import { getLogger } from 'log4js';
import { context, resolvers, typeDefs } from './module';

const log = getLogger('App');

interface ICorsOptions {
  origin: string;
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

    this.app = new Koa();

    // X-Response-Time
    this.app.use(async (ctx, next) => {
      ctx.hitTime = Date.now();
      await next();
      const ms = Date.now() - ctx.hitTime;
      ctx.set('X-Response-Time', `${ms}ms`);
    });

    if (!isProduction) {
      this.app.use(
        logger((str, args) => {
          log.info(str);
        }),
      );
    }

    this.app.use((ctx, next) =>
      next().catch(err => {
        if (err.status === 401) {
          ctx.status = 401;
          ctx.body = 'Protected resource, need Authorization.';
        } else {
          log.error(`Internal Server Error: ${err.stack || err.message}`);
          ctx.status = 500;
          ctx.body = 'Internal Server Error';
        }
      }),
    );

    this.app.use(jwt({ secret: 'secret' }).unless({ path: [/^\//] }));

    this.app.use(bodyParser());

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
  }

  public async startUpHttpServer() {
    this.port = this.port || 3000;
    this.server = http.createServer(this.app.callback());
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
