FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./server/package.json ./

RUN npm install --omit=dev && npm cache clean --force

COPY ./server/index.js ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

EXPOSE 8000

CMD ["node", "index.js"]