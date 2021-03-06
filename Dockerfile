FROM node:8.11.4-alpine
COPY . /app
WORKDIR /app
RUN ["npm", "install", "--production"]
ENV PORT 3000
EXPOSE 3000
CMD ["npm", "start"]

