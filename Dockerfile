FROM node:16-alpine as builder
WORKDIR /app

ARG NETWORK
ENV VUE_APP_NETWORK=$NETWORK

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN apk --no-cache add git
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && npm install \
    && apk del .gyp

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]