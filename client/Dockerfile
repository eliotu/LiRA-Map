FROM node:16

WORKDIR /app-client

COPY package.json /app-client/package.json

ADD . /app-client

EXPOSE 3000

RUN yarn --silent

RUN yarn build

RUN yarn global add serve

CMD ["serve", "-s", "-n", "build"]
