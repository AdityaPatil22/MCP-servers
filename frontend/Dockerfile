# Step 1: Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and clean cache
RUN npm ci && npm cache clean --force

# Copy the rest of your project
COPY . .

# Build the Vite app
RUN npm run build

# Step 2: Serve stage
FROM node:20-alpine

# Install 'serve' globally (optional if already in your package.json)
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose the port used by 'serve'
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]
