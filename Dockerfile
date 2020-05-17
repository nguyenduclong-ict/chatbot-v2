FROM node:12
ENV NODE_ENV production
RUN mkdir -p /upload
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3000
CMD npm start