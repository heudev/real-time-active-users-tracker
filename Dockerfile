FROM node:22-alpine
WORKDIR /opt/active-users
COPY . .
RUN npm install
CMD ["node", "src/app.js"]