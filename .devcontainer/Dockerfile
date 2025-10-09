# Base image with Node 20 and ARM support
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-20-bullseye

# Avoid root permissions issues
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install dependencies including GitHub CLI
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    python3 \
    gnupg \
    software-properties-common \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
       | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Verify GitHub CLI installation
RUN gh --version

# Set working directory
WORKDIR /workspace
