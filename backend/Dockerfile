#Base image
FROM node:18-alpine AS builder

#Working direcotry
WORKDIR /app/backend

#Copy package.json
COPY package*json ./

#Install dependencies
RUN npm install --production

#Copy all files
COPY . .

#Multi stage build
FROM node:18-alpine

WORKDIR /app/backend

# Copy only the node_modules from the build stage
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend ./

#Expose port
CMD ["npm", "start"]