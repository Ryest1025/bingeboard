# Base image with Node 20 and ARM support
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-20-bullseye

# Avoid root permissions issues
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace
