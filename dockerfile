FROM node:21-alpine3.19

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install -g npm@10.9.1
RUN npm install

COPY . .

EXPOSE 3012 