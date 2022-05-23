FROM node:16.15-alpine3.14

COPY ./package.json /app/package.json

WORKDIR /app

COPY . /app

RUN npm i

CMD ["npm", "start"]


