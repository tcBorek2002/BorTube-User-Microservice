FROM node:20.11.1-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000

RUN npx prisma generate

CMD [ "npm", "start" ]