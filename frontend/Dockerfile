FROM node:19

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG REACT_APP_AXIOS_URL

ENV REACT_APP_AXIOS_URL $REACT_APP_AXIOS_URL

RUN npm run build

CMD ["npm", "run", "prod"]