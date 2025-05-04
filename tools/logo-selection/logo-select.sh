#!/bin/bash

# Script to run the logo selection CLI tool

# Navigate to the tool directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Run the CLI tool
echo "Starting logo selection tool..."
pnpm start