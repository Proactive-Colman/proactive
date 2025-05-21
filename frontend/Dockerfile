# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Only copy package files first for better caching
COPY package*.json ./

# Use npm install with --legacy-peer-deps to match local environment
RUN npm install --legacy-peer-deps

# Now copy the rest of the source code
COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.cjs ./
COPY --from=build /app/package*.json ./
RUN npm install --production --legacy-peer-deps

EXPOSE 80
CMD ["node", "server.cjs"] 