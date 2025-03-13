FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the frontend application
RUN npm run build

# Expose the port that Vite serves on
EXPOSE 5173

# Command to start the preview server (match the port in docker-compose)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]