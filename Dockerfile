FROM node:lts-stretch as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

ENTRYPOINT ["npm", "start"]
