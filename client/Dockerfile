#Base image
FROM node:18-alpine AS builder

#Working direcotry
WORKDIR /app/client

#Copy package.json
COPY package*json ./

#Install dependencies
RUN npm install --production

#Copy all files
COPY . .

#Multi stage build
FROM node:18-alpine

WORKDIR /app/client

# Copy only the node_modules from the build stage
COPY --from=builder /app/client/node_modules ./node_modules
COPY --from=builder /app/client ./

#Expose port
CMD ["npm", "start"]