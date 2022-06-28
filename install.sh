#!/bin/bash

echo 'Installing PaperPlane...'

# Variables
COMMAND="docker run --name=paperplane -d -v ~/paperplane:/paperplane/data -p 3000:3000 ghcr.io/ijskoud/paperplane"

# Script
echo "Creating a shared data directory: ~/paperplane"
mkdir -p ~/paperplane
chown 1639:1639 ~/paperplane

echo 'Pulling latest image from Docker'
docker pull ghcr.io/ijskoud/paperplane:v1

echo 'Running Docker container'
if [[ -n "$1" ]]; then
	COMMAND="docker run --name=paperplane -d -v ~/paperplane:/paperplane/data -p 3000:$1 ghcr.io/ijskoud/paperplane"
fi

eval $COMMAND

echo "Installation complete, PaperPlane is now ready to be used!\n\nIf you run into a situation where the container is shutdown use the following command: '$COMMAND'"
exit 0
