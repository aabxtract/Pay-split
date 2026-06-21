# Stacks Contract Deployment

This folder contains the Stacks smart contracts and deployment configuration files.

## Contracts

- `read-only-stx-dispersion.clar` - Read-only STX dispersion preview contract

## Configuration Files

- `Clarinet.toml` - Clarinet development environment configuration
- `settings.yaml` - Deployment settings for testnet
- `deployment.yaml` - Multi-network deployment configuration

## Deployment

### Using Clarinet

```bash
# Install Clarinet
npm install -g @hirosystems/clarinet

# Test contracts
clarinet check

# Deploy to testnet
clarinet deploy --testnet
```

### Manual Deployment

1. Set your secret key and deployer address in `settings.yaml`
2. Use the Stacks CLI or Hiro platform to deploy the contract

## Environment Variables

Create a `.env` file with your credentials:

```
TESTNET_SECRET_KEY=your_testnet_secret_key
TESTNET_DEPLOYER_ADDRESS=your_testnet_address
MAINNET_SECRET_KEY=your_mainnet_secret_key
MAINNET_DEPLOYER_ADDRESS=your_mainnet_address
```
