// demo/test-swap.js
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_URL = 'http://localhost:3000/api';

// Helper function to log with timestamp
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

// Helper function to save response data to JSON file
const saveToFile = async (data, filename) => {
  const outputDir = path.join(__dirname, 'output');
  
  try {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(
      path.join(outputDir, filename), 
      JSON.stringify(data, null, 2)
    );
    log(`Data saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving to file: ${error.message}`);
  }
};

// Main function to test the swap flow
const testSwap = async () => {
  try {
    log('Starting HufflePay demo...');
    
    // 1. First, check node info to ensure connectivity
    log('Checking node info...');
    const infoResponse = await axios.get(`${API_URL}/lightning/info`);
    log('Node info received:');
    console.log(JSON.stringify(infoResponse.data, null, 2));
    await saveToFile(infoResponse.data, 'node-info.json');
    
    // 2. List existing assets for all nodes
    log('Listing available assets for edge node...');
    const edgeAssetsResponse = await axios.get(`${API_URL}/taproot/assets?nodeType=edge`);
    log('Edge node assets:');
    console.log(JSON.stringify(edgeAssetsResponse.data, null, 2));
    await saveToFile(edgeAssetsResponse.data, 'edge-assets.json');
    
    log('Listing available assets for Alice node...');
    const aliceAssetsResponse = await axios.get(`${API_URL}/taproot/assets?nodeType=alice`);
    log('Alice node assets:');
    console.log(JSON.stringify(aliceAssetsResponse.data, null, 2));
    await saveToFile(aliceAssetsResponse.data, 'alice-assets.json');
    
    log('Listing available assets for Bob node...');
    const bobAssetsResponse = await axios.get(`${API_URL}/taproot/assets?nodeType=bob`);
    log('Bob node assets:');
    console.log(JSON.stringify(bobAssetsResponse.data, null, 2));
    await saveToFile(bobAssetsResponse.data, 'bob-assets.json');
    
    // 3. Mint assets for all nodes if needed
    log('Minting USD assets for Alice...');
    const mintAliceUsdResponse = await axios.post(`${API_URL}/taproot/mint`, {
      name: 'USD',
      amount: 10000,
      nodeType: 'alice'
    });
    log('USD asset minted for Alice:');
    console.log(JSON.stringify(mintAliceUsdResponse.data, null, 2));
    
    log('Minting EUR assets for Bob...');
    const mintBobEurResponse = await axios.post(`${API_URL}/taproot/mint`, {
      name: 'EUR',
      amount: 10000,
      nodeType: 'bob'
    });
    log('EUR asset minted for Bob:');
    console.log(JSON.stringify(mintBobEurResponse.data, null, 2));
    
    log('Minting USD and EUR assets for Edge node...');
    const mintEdgeUsdResponse = await axios.post(`${API_URL}/taproot/mint`, {
      name: 'USD',
      amount: 10000,
      nodeType: 'edge'
    });
    log('USD asset minted for Edge:');
    console.log(JSON.stringify(mintEdgeUsdResponse.data, null, 2));
    
    const mintEdgeEurResponse = await axios.post(`${API_URL}/taproot/mint`, {
      name: 'EUR',
      amount: 9000,
      nodeType: 'edge'
    });
    log('EUR asset minted for Edge:');
    console.log(JSON.stringify(mintEdgeEurResponse.data, null, 2));
    
    // 4. Initiate a swap (USD -> EUR)
    log('Initiating USD -> EUR swap...');
    const swapResponse = await axios.post(`${API_URL}/swaps`, {
      sourceAmount: 100,
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      description: 'HufflePay Demo: USD to EUR Swap'
    });
    
    log('Swap initiated:');
    console.log(JSON.stringify(swapResponse.data, null, 2));
    await saveToFile(swapResponse.data, 'swap-initiated.json');
    
    const swapId = swapResponse.data.data.swapId;
    
    // 5. Execute the swap
    log(`Executing swap with ID: ${swapId}...`);
    const executeResponse = await axios.post(`${API_URL}/swaps/${swapId}/execute`);
    
    log('Swap executed:');
    console.log(JSON.stringify(executeResponse.data, null, 2));
    await saveToFile(executeResponse.data, 'swap-executed.json');
    
    // 6. Get final swap details
    log(`Getting details for swap ${swapId}...`);
    const detailsResponse = await axios.get(`${API_URL}/swaps/${swapId}`);
    
    log('Final swap details:');
    console.log(JSON.stringify(detailsResponse.data, null, 2));
    await saveToFile(detailsResponse.data, 'swap-details.json');
    
    // 7. List all swaps
    log('Listing all swaps...');
    const allSwapsResponse = await axios.get(`${API_URL}/swaps`);
    
    log('All swaps:');
    console.log(JSON.stringify(allSwapsResponse.data, null, 2));
    await saveToFile(allSwapsResponse.data, 'all-swaps.json');
    
    // 8. Check final asset balances after swap
    log('Checking final asset balances after swap...');
    
    log('Alice node assets after swap:');
    const aliceFinalAssetsResponse = await axios.get(`${API_URL}/taproot/assets?nodeType=alice`);
    console.log(JSON.stringify(aliceFinalAssetsResponse.data, null, 2));
    await saveToFile(aliceFinalAssetsResponse.data, 'alice-assets-final.json');
    
    log('Bob node assets after swap:');
    const bobFinalAssetsResponse = await axios.get(`${API_URL}/taproot/assets?nodeType=bob`);
    console.log(JSON.stringify(bobFinalAssetsResponse.data, null, 2));
    await saveToFile(bobFinalAssetsResponse.data, 'bob-assets-final.json');
    
    log('Edge node assets after swap:');
    const edgeFinalAssetsResponse = await axios.get(`${API_URL}/taproot/assets?nodeType=edge`);
    console.log(JSON.stringify(edgeFinalAssetsResponse.data, null, 2));
    await saveToFile(edgeFinalAssetsResponse.data, 'edge-assets-final.json');
    
    log('HufflePay demo completed successfully!');
    
  } catch (error) {
    console.error('Error in HufflePay demo:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

// Run the demo
testSwap();