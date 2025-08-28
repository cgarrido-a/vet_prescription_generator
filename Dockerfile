# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Change ownership of app directory
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { \
    host: 'localhost', \
    port: process.env.PORT || 3000, \
    path: '/api/health', \
    timeout: 2000, \
  }; \
  const request = http.get(options, (res) => { \
    console.log('STATUS: ' + res.statusCode); \
    process.exitCode = (res.statusCode === 200) ? 0 : 1; \
    process.exit(); \
  }); \
  request.on('error', function(err) { \
    console.log('ERROR'); \
    process.exit(1); \
  }); \
  request.end();"

# Start application
CMD ["npm", "start"]