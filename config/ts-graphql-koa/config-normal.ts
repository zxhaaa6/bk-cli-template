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
    origin: ['http://localhost:3000']
  }
};
