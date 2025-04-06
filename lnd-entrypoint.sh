#!/bin/bash
set -e

# LND startup script with Taproot enabled
mkdir -p /root/.lnd
cat > /root/.lnd/lnd.conf << EOF
[Application Options]
debuglevel=info
maxpendingchannels=10
listen=0.0.0.0:9735
rpclisten=0.0.0.0:10009
restlisten=0.0.0.0:8080
tlsextraip=0.0.0.0
allow-circular-route=true

[Bitcoin]
bitcoin.active=1
bitcoin.regtest=1
bitcoin.node=bitcoind

[Bitcoind]
bitcoind.rpchost=${BITCOIND_HOST}:18443
bitcoind.rpcuser=${BITCOIND_RPCUSER}
bitcoind.rpcpass=${BITCOIND_RPCPASS}
bitcoind.zmqpubrawblock=tcp://${BITCOIND_HOST}:28332
bitcoind.zmqpubrawtx=tcp://${BITCOIND_HOST}:28333

[protocol]
protocol.wumbo-channels=true
protocol.simple-taproot-chans=true
EOF

# Start LND with Taproot enabled
exec lnd