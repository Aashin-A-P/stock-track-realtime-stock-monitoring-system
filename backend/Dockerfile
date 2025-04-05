# 1️⃣ Use an official lightweight Node.js image
FROM node:22-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files and install all dependencies (including devDependencies)
COPY package.json package-lock.json ./
RUN npm install

# 4️⃣ Copy the entire project to the container
COPY . .

# 5️⃣ Set environment variables
ENV NODE_ENV=production

# 6️⃣ Expose port (change if needed)
EXPOSE 3000

# 7️⃣ Start the app using npm (ensures TSX is used properly)
CMD ["npm", "run", "build"]
