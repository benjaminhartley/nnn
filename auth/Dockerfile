FROM node:14.16.0

WORKDIR /home/nodejs/app

COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

RUN npm run build

CMD ["./start.sh"]
