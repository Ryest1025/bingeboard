ARG BASE_IMAGE=ubuntu:22.04
FROM ${BASE_IMAGE}
SHELL ["/bin/bash", "-c"]

LABEL maintainer="Rachel Gubin <you@example.com>"

RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    unzip \
    libssl-dev \
    zlib1g-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=1000

RUN id -u $USERNAME &>/dev/null || \
    (groupadd --gid $USER_GID $USERNAME \
     && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
     && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers)

ENV HOME=/home/$USERNAME
WORKDIR /workspaces/bingeboard-local

USER $USERNAME

ENV NVM_DIR="$HOME/.nvm"
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
    source $NVM_DIR/nvm.sh && nvm install 20 && nvm install 18

RUN echo 'export NVM_DIR="$HOME/.nvm"' >> $HOME/.bashrc && \
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> $HOME/.bashrc

RUN source $NVM_DIR/nvm.sh && nvm use 20 && node -v && npm -v && nvm use 18 && node -v && npm -v