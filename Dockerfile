FROM node:18-alpine

# Install pm2 globally (optional) and ensure a clean npm state to avoid idealTree cache issues
RUN npm install -g pm2 && npm cache clean --force

WORKDIR /src

# Workaround for OpenSSL 3 + older webpack (react-scripts 4) hashing issue
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY . .

RUN npm run setup

CMD ["npm", "run", "start"]

EXPOSE 3000