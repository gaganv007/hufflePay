/**
 * API Utility Functions for HufflePay
 * This file contains all the functions to communicate with the backend API
 */

const API_URL = '/api';

const api = {
  // Get exchange rates
  getExchangeRates: async () => {
    try {
      // In a real app, you'd fetch these from your backend
      return {
        'USDT-EURC': 0.91,
        'EURC-USDT': 1.10,
        'BTC-USDT': 70000,
        'USDT-BTC': 1/70000,
        'GBPT-USDT': 1.25,
        'USDT-GBPT': 0.80,
        'JPYT-USDT': 0.0067,
        'USDT-JPYT': 149.8,
        // Include these for backward compatibility
        'USD-EUR': 0.91,
        'EUR-USD': 1.10,
        'BTC-USD': 70000,
        'USD-BTC': 1/70000
      };
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  },
  // Get trending stablecoins
  getTrendingStablecoins: async () => {
    try {
      // In a real app, you'd fetch from your backend or external API
      return [
        { code: 'BTC', name: 'Bitcoin', change: '+3.2%' },
        { code: 'EURC', name: 'Euro Coin', change: '-0.5%' },
        { code: 'JPYT', name: 'Japanese Yen Token', change: '+0.8%' },
        { code: 'GBPT', name: 'British Pound Token', change: '+0.3%' }
      ];
    } catch (error) {
      console.error('Error fetching trending stablecoins:', error);
      throw error;
    }
  },

  // List all assets for a node (Alice, Bob, or Edge)
  getAssets: async (nodeType) => {
    try {
      const response = await fetch(`${API_URL}/taproot/assets?nodeType=${nodeType}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching assets for ${nodeType}:`, error);
      throw error;
    }
  },

  // Mint new assets
  mintAsset: async (name, amount, nodeType) => {
    try {
      const response = await fetch(`${API_URL}/taproot/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, amount, nodeType })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error minting asset:', error);
      throw error;
    }
  },

  // Initiate a swap
  initiateSwap: async (sourceAmount, sourceCurrency, targetCurrency, description) => {
    try {
      const response = await fetch(`${API_URL}/swaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceAmount,
          sourceCurrency,
          targetCurrency,
          description: description || 'HufflePay Lightning-FX Swap'
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initiating swap:', error);
      throw error;
    }
  },

  // Execute a swap
  executeSwap: async (swapId) => {
    try {
      const response = await fetch(`${API_URL}/swaps/${swapId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  },

  // Get swap details
  getSwap: async (swapId) => {
    try {
      const response = await fetch(`${API_URL}/swaps/${swapId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching swap details:', error);
      throw error;
    }
  },

  // List all swaps
  listSwaps: async () => {
    try {
      const response = await fetch(`${API_URL}/swaps`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching swaps:', error);
      throw error;
    }
  },

  // Get lightning node info
  getLightningInfo: async () => {
    try {
      const response = await fetch(`${API_URL}/lightning/info`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching lightning info:', error);
      
      // Fallback mock data
      return {
        success: true,
        data: {
          alice: { identity_pubkey: "alice_mock_pubkey", alias: "Alice Node" },
          bob: { identity_pubkey: "bob_mock_pubkey", alias: "Bob Node" },
          edge: { identity_pubkey: "edge_mock_pubkey", alias: "Edge Node" }
        }
      };
    }
  },

  // Get recent transactions (for dashboard)
  getRecentTransactions: async () => {
    try {
      // In a real app, this would come from your backend
      return [
        { id: 'TX123456', date: '2025-04-01', amount: 200, fromCurrency: 'USDT', toCurrency: 'EURC' },
        { id: 'TX123457', date: '2025-04-02', amount: 150, fromCurrency: 'EURC', toCurrency: 'USDT' },
        { id: 'TX123458', date: '2025-04-03', amount: 300, fromCurrency: 'USDT', toCurrency: 'GBPT' },
        { id: 'TX123459', date: '2025-04-03', amount: 180, fromCurrency: 'GBPT', toCurrency: 'USDT' },
        { id: 'TX123460', date: '2025-04-04', amount: 400, fromCurrency: 'USDT', toCurrency: 'JPYT' },
        { id: 'TX123461', date: '2025-04-05', amount: 220, fromCurrency: 'USDT', toCurrency: 'EURC' },
        { id: 'TX123462', date: '2025-04-06', amount: 280, fromCurrency: 'BTC', toCurrency: 'USDT' }
      ];
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  // Execute a complete stablecoin swap (Alice -> Bob) with all steps
  executeFullSwap: async (amount, fromCurrency, toCurrency, receiverUsername) => {
    try {
      // 1. Initiate the swap
      const swapResponse = await api.initiateSwap(
        parseFloat(amount),
        fromCurrency,
        toCurrency,
        `HufflePay Swap: ${amount} ${fromCurrency} from Alice to Bob (${receiverUsername})`
      );
      
      if (!swapResponse.success) {
        throw new Error(swapResponse.error || 'Failed to initiate swap');
      }
      
      const swapId = swapResponse.data.swapId;
      console.log(`Swap initiated with ID: ${swapId}`);
      
      // 2. Execute the swap
      const executeResponse = await api.executeSwap(swapId);
      
      if (!executeResponse.success) {
        throw new Error(executeResponse.error || 'Failed to execute swap');
      }

      console.log("Swap execution response:", executeResponse);
      
      // 3. Get final swap details
      const swapDetails = await api.getSwap(swapId);
      console.log("Final swap details:", swapDetails);
      
      // 4. Return transaction result
      return {
        success: true,
        transactionId: `HP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        amount,
        fromCurrency,
        toCurrency,
        sender: 'Alice',
        receiver: receiverUsername || 'Bob',
        date: new Date().toLocaleDateString(),
        details: swapDetails.data
      };
    } catch (error) {
      console.error('Error executing swap transaction:', error);
      throw error;
    }
  }
};