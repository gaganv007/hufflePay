// src/services/swap.service.js
const crypto = require('crypto');
const winston = require('winston');
const config = require('../config/env');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/swap.log' })
  ],
});

// Currency name mapping between frontend and backend
const currencyMapping = {
  'USDT': 'USD',
  'EURC': 'EUR',
  'GBPT': 'GBP',
  'JPYT': 'JPY',
  'USD': 'USDT',
  'EUR': 'EURC',
  'GBP': 'GBPT',
  'JPY': 'JPYT'
};

class SwapService {
  constructor({ aliceService, bobService, edgeService, assetsService }) {
    this.aliceService = aliceService;
    this.bobService = bobService;
    this.edgeService = edgeService;
    this.assetsService = assetsService;
    this.activeSwaps = new Map();
  }

  // Calculate exchange amount based on rate and fee
  calculateExchangeAmount(amount, sourceCurrency, targetCurrency) {
    const rateKey = `${sourceCurrency}-${targetCurrency}`;
    const mappedRateKey = `${currencyMapping[sourceCurrency] || sourceCurrency}-${currencyMapping[targetCurrency] || targetCurrency}`;
    
    // Try to find the rate with various combinations
    let rate = config.exchangeRates[rateKey];
    if (!rate) {
      rate = config.exchangeRates[mappedRateKey];
    }
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${rateKey}`);
    }
    
    // Apply the exchange rate
    const convertedAmount = amount * rate;
    
    // Apply provider fee
    const feePercentage = config.providerFee / 100;
    const feeAmount = convertedAmount * feePercentage;
    const finalAmount = convertedAmount - feeAmount;
    
    return {
      originalAmount: amount,
      convertedAmount,
      feeAmount,
      finalAmount,
      rate,
      feePercentage: config.providerFee
    };
  }

  // Generate a random preimage and its hash
  generatePreimageAndHash() {
    const preimage = crypto.randomBytes(32);
    const hash = crypto.createHash('sha256').update(preimage).digest();
    
    return {
      preimage: preimage.toString('hex'),
      hash: hash.toString('hex')
    };
  }

  // Initiate a swap between two currencies
  async initiateSwap({
    sourceAmount,
    sourceCurrency,
    targetCurrency,
    description = 'HufflePay Cross-Currency Swap'
  }) {
    try {
      logger.info(`Initiating swap: ${sourceAmount} ${sourceCurrency} -> ${targetCurrency}`);
      
      // Map frontend currency names to backend currency names if needed
      const backendSourceCurrency = currencyMapping[sourceCurrency] || sourceCurrency;
      const backendTargetCurrency = currencyMapping[targetCurrency] || targetCurrency;
      
      logger.info(`Using backend currencies: ${backendSourceCurrency} -> ${backendTargetCurrency}`);
      
      // Generate preimage and hash for HTLC
      const { preimage, hash } = this.generatePreimageAndHash();
      
      // Calculate exchange amount
      const exchangeDetails = this.calculateExchangeAmount(
        sourceAmount,
        sourceCurrency,
        targetCurrency
      );
      
      logger.info(`Exchange details: ${JSON.stringify(exchangeDetails)}`);
      
      // Get assets for all nodes
      console.log("DEBUG: Starting asset lookup");
      console.log("DEBUG: Looking for sourceCurrency:", sourceCurrency);
      console.log("DEBUG: Mapped to backendSourceCurrency:", backendSourceCurrency);
      
      const aliceAssets = await this.assetsService.getAssets('alice');
      const bobAssets = await this.assetsService.getAssets('bob');
      const edgeAssets = await this.assetsService.getAssets('edge');
      
      console.log("DEBUG: Alice assets:", JSON.stringify(aliceAssets, null, 2));
      console.log("DEBUG: Bob assets:", JSON.stringify(bobAssets, null, 2));
      console.log("DEBUG: Edge assets:", JSON.stringify(edgeAssets, null, 2));
      
      // Try to find assets with both original and mapped names
      // Alice's source asset
      let aliceSourceAsset = aliceAssets.find(a => a.name.toUpperCase() === sourceCurrency.toUpperCase());
      if (!aliceSourceAsset) {
        aliceSourceAsset = aliceAssets.find(a => a.name.toUpperCase() === backendSourceCurrency.toUpperCase());
      }
      
      // Edge node assets
      let edgeSourceAsset = edgeAssets.find(a => a.name.toUpperCase() === sourceCurrency.toUpperCase());
      if (!edgeSourceAsset) {
        edgeSourceAsset = edgeAssets.find(a => a.name.toUpperCase() === backendSourceCurrency.toUpperCase());
      }
      
      let edgeTargetAsset = edgeAssets.find(a => a.name.toUpperCase() === targetCurrency.toUpperCase());
      if (!edgeTargetAsset) {
        edgeTargetAsset = edgeAssets.find(a => a.name.toUpperCase() === backendTargetCurrency.toUpperCase());
      }
      
      // Bob's target asset
      let bobTargetAsset = bobAssets.find(a => a.name.toUpperCase() === targetCurrency.toUpperCase());
      if (!bobTargetAsset) {
        bobTargetAsset = bobAssets.find(a => a.name.toUpperCase() === backendTargetCurrency.toUpperCase());
      }
      
      console.log("DEBUG: Found aliceSourceAsset:", aliceSourceAsset);
      console.log("DEBUG: Found edgeSourceAsset:", edgeSourceAsset);
      console.log("DEBUG: Found edgeTargetAsset:", edgeTargetAsset);
      console.log("DEBUG: Found bobTargetAsset:", bobTargetAsset);
      
      // Validate all assets exist
      if (!aliceSourceAsset) {
        console.log("DEBUG: All alice assets by name:", aliceAssets.map(a => a.name));
        throw new Error(`${sourceCurrency} asset not found in Alice's wallet`);
      }
      
      if (!edgeSourceAsset) {
        throw new Error(`${sourceCurrency} asset not found in Edge node`);
      }
      
      if (!edgeTargetAsset) {
        throw new Error(`${targetCurrency} asset not found in Edge node`);
      }
      
      if (!bobTargetAsset) {
        throw new Error(`${targetCurrency} asset not found in Bob's wallet`);
      }
      
      // Create records for the swap
      const swapId = `swap_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const swapData = {
        id: swapId,
        sourceAmount,
        sourceCurrency,
        backendSourceCurrency,
        aliceSourceAssetId: aliceSourceAsset.id,
        edgeSourceAssetId: edgeSourceAsset.id,
        targetAmount: exchangeDetails.finalAmount,
        targetCurrency,
        backendTargetCurrency,
        edgeTargetAssetId: edgeTargetAsset.id,
        bobTargetAssetId: bobTargetAsset.id,
        preimage,
        hash,
        status: 'initiated',
        timestamp: new Date().toISOString(),
        exchangeDetails
      };
      
      // Store the swap details
      this.activeSwaps.set(swapId, swapData);
      
      // Create hold invoice at the edge node for the source currency
      // This holds Alice's payment until Bob is paid
      const sourceHoldInvoice = await this.edgeService.createHoldInvoice({
        amount: sourceAmount,
        hash,
        description: `HufflePay: Hold payment from Alice (${sourceCurrency})`,
      });
      
      // Create a regular invoice for Bob to receive the target currency
      const targetInvoice = await this.bobService.createInvoice({
        amount: exchangeDetails.finalAmount,
        description: `HufflePay: Payment to Bob (${targetCurrency})`,
      });
      
      // Update swap data with invoices
      swapData.sourceInvoice = sourceHoldInvoice;
      swapData.targetInvoice = targetInvoice;
      this.activeSwaps.set(swapId, swapData);
      
      logger.info(`Swap initiated with ID: ${swapId}`);
      
      return {
        swapId,
        sourceInvoice: sourceHoldInvoice,
        targetInvoice: targetInvoice,
        exchangeDetails
      };
    } catch (error) {
      logger.error(`Failed to initiate swap: ${error.message}`);
      throw error;
    }
  }

  // Execute the swap process
  async executeSwap(swapId) {
    try {
      if (!this.activeSwaps.has(swapId)) {
        throw new Error(`Swap with ID ${swapId} not found`);
      }
      
      const swap = this.activeSwaps.get(swapId);
      logger.info(`Executing swap ${swapId}: ${swap.sourceAmount} ${swap.sourceCurrency} -> ${swap.targetAmount} ${swap.targetCurrency}`);
      
      // Update status
      swap.status = 'executing';
      this.activeSwaps.set(swapId, swap);
      
      // Simulate the transfer of assets between nodes
      logger.info(`Transferring assets for swap ${swapId}`);
      
      // 1. Transfer source currency from Alice to Edge node
      logger.info(`Transferring ${swap.sourceAmount} ${swap.sourceCurrency} from Alice to Edge`);
      await this.assetsService.transferAsset(
        swap.aliceSourceAssetId,  // Use Alice's asset ID now
        swap.sourceAmount,
        'alice',
        'edge'
      );
      
      // 2. Transfer target currency from Edge to Bob node
      logger.info(`Transferring ${swap.targetAmount} ${swap.targetCurrency} from Edge to Bob`);
      await this.assetsService.transferAsset(
        swap.edgeTargetAssetId,  // Use Edge's target asset ID
        swap.targetAmount,
        'edge',
        'bob'
      );
      
      // 3. Pay the target invoice from edge node to Bob
      logger.info(`Paying target invoice for Bob (${swap.targetAmount} ${swap.targetCurrency})`);
      try {
        const targetPayment = await this.edgeService.payInvoice(swap.targetInvoice.request);
        
        // 4. Settle the hold invoice to claim Alice's payment
        logger.info(`Payment to Bob successful, settling hold invoice from Alice`);
        await this.edgeService.settleHoldInvoice(swap.preimage);
        
        // Update swap status
        swap.status = 'completed';
        swap.completedAt = new Date().toISOString();
        this.activeSwaps.set(swapId, swap);
        
        logger.info(`Swap ${swapId} completed successfully`);
        return { success: true, swap };
      } catch (error) {
        // If payment fails, we need to revert the asset transfers
        logger.error(`Payment failed: ${error.message}, reverting asset transfers`);
        
        // Revert the transfers
        await this.assetsService.transferAsset(
          swap.edgeSourceAssetId,  // Use Edge's source asset ID for reverting
          swap.sourceAmount,
          'edge',
          'alice'
        );
        
        await this.assetsService.transferAsset(
          swap.bobTargetAssetId,  // Use Bob's target asset ID for reverting
          swap.targetAmount,
          'bob',
          'edge'
        );
        
        // Cancel the hold invoice
        await this.edgeService.cancelHoldInvoice(swap.hash);
        
        // Update swap status
        swap.status = 'failed';
        swap.error = `Payment failed: ${error.message}`;
        this.activeSwaps.set(swapId, swap);
        
        logger.error(`Swap ${swapId} failed: ${error.message}`);
        return { success: false, error: error.message, swap };
      }
    } catch (error) {
      logger.error(`Error executing swap ${swapId}: ${error.message}`);
      
      // Try to cancel the hold invoice if it exists
      try {
        const swap = this.activeSwaps.get(swapId);
        if (swap && swap.hash) {
          await this.edgeService.cancelHoldInvoice(swap.hash);
        }
      } catch (cancelError) {
        logger.error(`Failed to cancel hold invoice: ${cancelError.message}`);
      }
      
      // Update swap status
      if (this.activeSwaps.has(swapId)) {
        const swap = this.activeSwaps.get(swapId);
        swap.status = 'failed';
        swap.error = error.message;
        this.activeSwaps.set(swapId, swap);
      }
      
      throw error;
    }
  }

  // Get details of a specific swap
  getSwap(swapId) {
    if (!this.activeSwaps.has(swapId)) {
      throw new Error(`Swap with ID ${swapId} not found`);
    }
    
    return this.activeSwaps.get(swapId);
  }

  // List all active swaps
  listSwaps() {
    return Array.from(this.activeSwaps.values());
  }
}

module.exports = SwapService;