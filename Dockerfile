FROM node:21
WORKDIR /app
COPY dist/package.json .
RUN npm install -g pnpm && pnpm install --prod
COPY ./dist .
EXPOSE 3003
CMD ["npm", "start"]