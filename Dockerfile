FROM node:21
WORKDIR /app
COPY dist/package.json .
RUN npm install
COPY ./dist .
EXPOSE 3003
CMD ["npm", "start"]