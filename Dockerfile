# ─────────────────────────────────────────────
# Build & serve the React application
# ─────────────────────────────────────────────
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests first (layer-cache optimisation)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed by react-scripts)
RUN npm ci --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the production bundle (output goes to /app/build)
RUN npm run build

# Install a lightweight static file server
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Serve the production build
CMD ["serve", "-s", "build", "-l", "5173"]
