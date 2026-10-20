# Use a lightweight Node image
FROM node:18-slim

# Install system dependencies: Python3, pip, and ffmpeg (required for yt-dlp)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally so your Node app can run it
RUN pip3 install --no-cache-dir yt-dlp --break-system-packages

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Render dynamically assigns a port, but defaults to 10000 often. 
# Express should use process.env.PORT || 10000
ENV PORT=10000
EXPOSE 10000

# Start your application
CMD ["npm", "start"]