FROM node:21

WORKDIR /kmon

COPY package.json .
COPY yarn.lock .

COPY src src

RUN yarn

