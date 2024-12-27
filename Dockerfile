# Frontend Dockerfile

# Build step
FROM node:20 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production image to serve the static build
FROM node:20-slim

# We'll use a simple 'serve' package to host static files
RUN npm install -g serve

WORKDIR /app
COPY --from=build /app/dist ./dist

# Expose the frontend on port 3000 internally
EXPOSE 3000

# Serve the compiled React app from /app/dist
CMD ["serve", "-s", "dist", "-l", "3000"]
