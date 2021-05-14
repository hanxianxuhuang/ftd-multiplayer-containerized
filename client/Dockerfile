FROM node:12.18-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/client
ENV PATH /usr/src/client/node_modules/.bin:$PATH
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && cp -r node_modules ../
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
