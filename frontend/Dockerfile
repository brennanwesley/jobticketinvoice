FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies from package.json
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose port 3001
EXPOSE 3001

# Run the development server with host binding to allow external connections
ENV HOST=0.0.0.0
ENV PORT=3001
ENV WDS_SOCKET_PORT=3001
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true
CMD ["npm", "start"]
