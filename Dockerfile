FROM node:11.6

WORKDIR /home/dashboard-lala

COPY . .

RUN yarn

RUN yarn build
