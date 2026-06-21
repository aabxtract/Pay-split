#!/bin/bash

# Stacks Contract Deployment Script

NETWORK=${1:-testnet}

echo "Deploying to $NETWORK..."

if [ "$NETWORK" = "testnet" ]; then
    clarinet deploy --testnet
elif [ "$NETWORK" = "mainnet" ]; then
    clarinet deploy --mainnet
else
    echo "Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

echo "Deployment complete!"
