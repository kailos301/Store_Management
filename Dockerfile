#############
### build ###
#############

# base image
FROM node:12.2.0 as build

ARG ENVIRONMENT=local
ARG GOOGLE_CLIENT_ID
ARG FACEBOOK_CLIENT_ID
ARG ENV_DOMAIN
ARG ADMIN_HOST_URL
ARG HUBRISE_CLIENT_ID

# install chrome for protractor tests
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update && apt-get install -yq google-chrome-stable gettext

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

# add app
COPY . /app

# run tests
# RUN npm run test:prod
# RUN npm run e2e:prod

# extract translations
RUN npm run extractAdminTranslations
RUN npm run extractPublicTranslations

# generate build
RUN if [ "$ENVIRONMENT" = "production" ]; then npm run build:prod -- --output-path=dist; fi
RUN if [ "$ENVIRONMENT" != "production" ]; then npm run build:prod:sourcemap -- --output-path=dist; fi
RUN envsubst < /app/dist/assets/env.template.js > /app/dist/assets/env.js
RUN node_modules/.bin/ngsw-config dist ngsw-config.json


############
### prod ###
############

# base image
FROM nginx:1.16.0-alpine

# copy artifact build from the 'build environment'
COPY --from=build /app/dist /usr/share/nginx/html

# copy custom nginx configuration to support angular app routing
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]
