# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY src/ ./src/
COPY public/ ./public/

# Cloud Run sets the PORT environment variable to 8080 by default.
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "src/server.js"]
