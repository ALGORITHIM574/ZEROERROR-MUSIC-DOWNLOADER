
FROM node:24-bookworm-slim

# Install FFmpeg and Python for yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp in the Linux container
RUN python3 -m pip install --no-cache-dir --break-system-packages yt-dlp

# Set the backend working directory
WORKDIR /app/backend

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source files
COPY backend/ ./

# Store downloads inside the container
RUN mkdir -p downloads

# Render provides PORT at runtime
CMD ["npm", "start"]
