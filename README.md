# HufflePay - Cross-Currency Bitcoin Lightning & Taproot Payments

HufflePay is a platform that leverages Bitcoin Lightning Network and Taproot to enable instant cross-currency payments and asset transfers on Bitcoin. It allows users to send payments in one currency (e.g., USD stablecoins) and have the recipient receive them in another currency (e.g., BTC or EUR stablecoins).

## Project Structure

The project consists of two main parts:
1. **Backend**: A Node.js API server that handles the actual currency swaps using Lightning Network and Taproot Assets
2. **Frontend**: A web interface for users to interact with the system

## Features

- Cross-currency transfers using Bitcoin Lightning Network
- Real-time currency conversion
- Low-fee transactions
- Educational content about cryptocurrencies and finance
- User dashboard with transaction history
- Social feed for sharing financial journeys

## Prerequisites

- Node.js (v16+)
- npm
- Docker and Docker Compose (for running the Bitcoin and Lightning nodes)

## Running the Backend

1. Navigate to the app directory:
   ```bash
   cd hufflepay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Bitcoin and Lightning nodes:
   ```bash
   docker-compose up -d
   ```

4. Create a wallet for each Lightning node:
   ```bash
   # Create a new wallet with the docker-compose container names
   docker exec -it hufflepay-lnd-alice-1 lncli --network=regtest create
   docker exec -it hufflepay-lnd-bob-1 lncli --network=regtest create
   docker exec -it hufflepay-lnd-edge-1 lncli --network=regtest create
   ```

5. Fund the nodes:
   ```bash
   # Create a Bitcoin wallet
   docker exec -it hufflepay-bitcoind-1 bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoin createwallet "mywallet"
   
   # Generate an address
   NEW_ADDRESS=$(docker exec -it hufflepay-bitcoind-1 bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoin -rpcwallet=mywallet getnewaddress)
   
   # Generate blocks
   docker exec -it hufflepay-bitcoind-1 bitcoin-cli -regtest -rpcuser=bitcoin -rpcpassword=bitcoin -rpcwallet=mywallet generatetoaddress 101 "$NEW_ADDRESS"
   ```

6. Start the server:
   ```bash
   npm start
   ```

7. The backend API will be available at http://localhost:3000/api

## Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd hufflepay/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend server:
   ```bash
   npm start
   ```

4. The frontend will be available at http://localhost:8080

## Testing the Application

1. Open your browser and go to http://localhost:8080
2. You can navigate through the different pages:
   - Home page: View educational content and social feed
   - Exchange page: Perform currency exchanges
   - Dashboard: View transaction history and account information
   - Reels: Educational videos about finance and crypto

## Demo Account

For demo purposes, you can use the following account:
- Username: demouser
- Password: demopassword

## Project Images

### Home Page
![Home Page](screenshot_home.png)

### Exchange Page
![Exchange Page](screenshot_exchange.png)

### Dashboard
![Dashboard](screenshot_dashboard.png)

## Acknowledgments

- Bitcoin Lightning Network
- Taproot Assets protocol
- All contributors @shwethasaravanan, @KunalVishwaSivakumar, @akshaykumaran705
