# Stage 1: Build the application
FROM node:20-alpine AS builder

# Install required system dependencies
RUN apk add --no-cache python3 make g++ 

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies and rebuild bcrypt
RUN npm install && \
    npm rebuild bcrypt --build-from-source

# Copy application code
COPY . .

# Disable ESLint checks during build
ENV NEXT_DISABLE_ESLINT=1

# Build Next.js application
RUN npm run build

# Stage 2: Run the application in production
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose the port your server listens on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Run the server in production mode
CMD ["npm", "run", "dev:server"]