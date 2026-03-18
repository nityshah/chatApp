FROM node:alpine AS base_image

WORKDIR /app 

COPY package.json package-lock.json .

RUN  npm ci

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL  

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=base_image /app/dist /usr/share/nginx/html/ 

