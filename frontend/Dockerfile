FROM node:alpine AS base_image

WORKDIR /app 

COPY package.json package-lock.json .

RUN  npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL  

ARG BASE_URL
ENV BASE_URL=$BASE_URL  

COPY --from=base_image /app/dist /usr/share/nginx/html/ 

