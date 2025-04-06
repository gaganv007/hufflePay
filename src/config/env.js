// src/config/env.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // LND connection configs
  aliceNode: {
    host: process.env.ALICE_LND_HOST || 'localhost:10009',
    macaroonPath: process.env.ALICE_MACAROON_PATH || './lnd-alice/data/chain/bitcoin/regtest/admin.macaroon',
    tlsCertPath: process.env.ALICE_TLS_CERT_PATH || './lnd-alice/tls.cert'
  },
  
  bobNode: {
    host: process.env.BOB_LND_HOST || 'localhost:10010',
    macaroonPath: process.env.BOB_MACAROON_PATH || './lnd-bob/data/chain/bitcoin/regtest/admin.macaroon',
    tlsCertPath: process.env.BOB_TLS_CERT_PATH || './lnd-bob/tls.cert'
  },
  
  edgeNode: {
    host: process.env.EDGE_LND_HOST || 'localhost:10011',
    macaroonPath: process.env.EDGE_MACAROON_PATH || './lnd-edge/data/chain/bitcoin/regtest/admin.macaroon',
    tlsCertPath: process.env.EDGE_TLS_CERT_PATH || './lnd-edge/tls.cert'
  },

  // Exchange rates (supporting both frontend and backend currency names)
  exchangeRates: {
    // Frontend currency pairs
    'USDT-EURC': 0.91, 
    'EURC-USDT': 1.10,
    'BTC-USDT': 70000,
    'USDT-BTC': 1/70000,
    'GBPT-USDT': 1.25,
    'USDT-GBPT': 0.80,
    'JPYT-USDT': 0.0067,
    'USDT-JPYT': 149.8,
    
    // Backend currency pairs
    'USD-EUR': 0.91,
    'EUR-USD': 1.10,
    'BTC-USD': 70000,
    'USD-BTC': 1/70000,
    'GBP-USD': 1.25,
    'USD-GBP': 0.80,
    'JPY-USD': 0.0067,
    'USD-JPY': 149.8
  },
  
  // Provider fee (in percentage)
  providerFee: 0.5
};