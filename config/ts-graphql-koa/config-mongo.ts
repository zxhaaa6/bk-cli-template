export default {
  host: '',
  port: 3000,
  graphqlEndpoint: '/graphql',
  log4js: {
    logging: false
  },
  fileUploadOptions: {
    maxFieldSize: 1 * 1024 * 1024,
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 1
  },
  corsOptions: {
    origin: 'http://localhost:3000'
  },
  mongodb: {
    host: 'localhost',
    port: '27017',
    db: 'sample',
    options: {
      autoIndex: true,
      reconnectTries: 20,
      reconnectInterval: 2000,
      poolSize: 10
    }
  }
};
