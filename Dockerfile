# ---------- Build Stage ----------
FROM node:20-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy package.json & package-lock.json for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the React app
# ⚠️ CRA -> npm run build creates 'build'
# ⚠️ Vite -> npm run build creates 'dist'
RUN npm run build

# ---------- Serve Stage ----------
FROM nginx:alpine

# Copy built files from build stage to Nginx html folder
# ⚠️ Adjust folder based on your setup:
# For CRA:
COPY --from=build /app/build /usr/share/nginx/html
# For Vite, uncomment below and comment the above:
# COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
