// src/utils/initAssets.js
const SimulatedAssetsService = require('../services/simulatedAssets.service');

async function initializeAssets() {
  try {
    console.log('Starting asset initialization...');
    
    // Create the asset service
    const assetsService = new SimulatedAssetsService();
    
    // Get current assets to see what already exists
    const aliceAssets = await assetsService.getAssets('alice');
    const bobAssets = await assetsService.getAssets('bob');
    const edgeAssets = await assetsService.getAssets('edge');
    
    console.log('Current assets:');
    console.log('Alice:', aliceAssets);
    console.log('Bob:', bobAssets);
    console.log('Edge:', edgeAssets);
    
    // Mint assets for Alice if needed
    if (!aliceAssets.find(a => a.name === 'USDT' || a.name === 'USD')) {
      console.log('Minting USD for Alice...');
      await assetsService.mintAsset('USD', 10000, 'alice');
    }
    
    // Mint assets for Bob if needed
    if (!bobAssets.find(a => a.name === 'EURC' || a.name === 'EUR')) {
      console.log('Minting EUR for Bob...');
      await assetsService.mintAsset('EUR', 10000, 'bob');
    }
    
    // Make sure Edge node has the necessary assets
    // It already has USD, EUR, BTC based on the response
    
    // Double-check all assets after initialization
    const finalAliceAssets = await assetsService.getAssets('alice');
    const finalBobAssets = await assetsService.getAssets('bob');
    const finalEdgeAssets = await assetsService.getAssets('edge');
    
    console.log('\nFinal asset state:');
    console.log('Alice:', finalAliceAssets);
    console.log('Bob:', finalBobAssets);
    console.log('Edge:', finalEdgeAssets);
    
    console.log('Asset initialization completed!');
    return true;
  } catch (error) {
    console.error('Error initializing assets:', error);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  initializeAssets();
}

module.exports = initializeAssets;