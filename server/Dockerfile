FROM node:16.15-alpine3.14

WORKDIR .

COPY . .

RUN npm i
RUN npm run build

EXPOSE 50520

CMD ["npm", "start"]
