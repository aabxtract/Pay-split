#!/bin/bash

# Stacks Contract Deployment Script
# Usage: ./deploy-contract.sh [testnet|mainnet]

set -e

NETWORK=${1:-testnet}
CONTRACT_FILE="read-only-stx-dispersion.clar"
CONTRACT_NAME="read-only-stx-dispersion"

echo "==================================="
echo "Stacks Contract Deployment"
echo "==================================="
echo "Network: $NETWORK"
echo "Contract: $CONTRACT_FILE"
echo "==================================="

# Check if Clarinet is installed
if ! command -v clarinet &> /dev/null; then
    echo "Error: Clarinet is not installed"
    echo "Install with: npm install -g @hirosystems/clarinet"
    exit 1
fi

# Check if contract file exists
if [ ! -f "$CONTRACT_FILE" ]; then
    echo "Error: Contract file not found: $CONTRACT_FILE"
    exit 1
fi

# Validate contract syntax
echo "Validating contract syntax..."
clarinet check

if [ $? -ne 0 ]; then
    echo "Error: Contract validation failed"
    exit 1
fi

echo "Contract validation passed!"

# Deploy based on network
if [ "$NETWORK" = "testnet" ]; then
    echo "Deploying to testnet..."
    clarinet deploy --testnet
elif [ "$NETWORK" = "mainnet" ]; then
    echo "Deploying to mainnet..."
    clarinet deploy --mainnet
else
    echo "Error: Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

echo "==================================="
echo "Deployment completed successfully!"
echo "==================================="
