import * as cors from 'cors';
import * as jwt from 'express-jwt';
import { GraphQLServer } from 'graphql-yoga';
import * as helmet from 'helmet';
import { getLogger } from 'log4js';
import * as morgan from 'morgan';
import { errMiddleware } from './middleware';
import { context, resolvers, typeDefs } from './module';

const log = getLogger('App');

interface IFileUploadOptions {
  maxFieldSize: number;
  maxFileSize: number;
  maxFiles: number;
}
interface ICorsOptions {
  origin: string[];
}

class App {
  public graphqlEndpoint: string;
  public port: number;
  public fileUploadOptions: IFileUploadOptions;
  public corsOptions: ICorsOptions;
  constructor(
    endpoint: string,
    port: number,
    fileUploadOptions: IFileUploadOptions,
    corsOptions: ICorsOptions,
  ) {
    this.graphqlEndpoint = endpoint;
    this.port = port;
    this.fileUploadOptions = fileUploadOptions;
    this.corsOptions = corsOptions;
  }

  public async startUpHttpServer() {
    const env = process.env;
    const isProduction = env.NODE_ENV === 'production';

    const resolverValidationOptions = {
      requireResolversForResolveType: false,
    };

    const contextMiddleware = appCtx => {
      return Object.assign({ request: appCtx.request }, context);
    };

    const server = new GraphQLServer({
      typeDefs,
      resolvers,
      context: contextMiddleware,
      resolverValidationOptions,
    });

    server.express.options('*', cors(this.corsOptions));
    server.express.use(helmet());
    server.express.use(
      morgan('dev', {
        skip: () => isProduction,
      }),
    );

    server.express.use(
      jwt({ secret: 'secret' }).unless({ path: [/^\/playground/] }),
    );

    server.express.use(errMiddleware);

    await server.start(
      {
        cors: this.corsOptions,
        port: this.port,
        endpoint: this.graphqlEndpoint,
        uploads: this.fileUploadOptions,
        playground: !isProduction && '/playground',
      },
      opts => {
        log.info(`Graphql api service listening on port: ${this.port}`);
      },
    );
  }
}

export default App;
