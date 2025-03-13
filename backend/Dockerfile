# 1️⃣ Use an official lightweight Node.js image
FROM node:22-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files and install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# 4️⃣ Copy the entire project to the container
COPY . .

# 6️⃣ Set environment variables
ENV NODE_ENV=production

# 7️⃣ Expose port (change if needed)
EXPOSE 3000

# 8️⃣ Start the app (Change based on your compiled output)
CMD [ "node", "--import=tsx", "--env-file=.env", "src/index.ts" ]
