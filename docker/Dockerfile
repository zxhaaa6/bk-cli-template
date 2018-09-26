FROM node:8.12.0-alpine

WORKDIR /app
COPY package.json /app/
RUN npm install

ADD . /app
RUN npm run build

HEALTHCHECK CMD curl --fail http://localhost:3000/playground || exit 1

CMD ["node", "dist/main.js"]
