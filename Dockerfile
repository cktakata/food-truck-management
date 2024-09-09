# Step 1: Use an official Node.js runtime as a parent image
FROM node:18 AS builder

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code to the working directory
COPY . .

# Step 6: Build the NestJS application
RUN npm run build

# Step 7: Use a smaller base image for the runtime environment
FROM node:18-slim

# Step 8: Set the working directory inside the runtime container
WORKDIR /app

# Step 9: Copy the built application and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Step 10: Expose the port that the application will run on
EXPOSE 3000

# Step 11: Command to run the NestJS application
CMD ["node", "dist/main"]
