const SwapService = require('../services/swap.service');

class SwapController {
  constructor(swapService) {
    this.swapService = swapService;
  }

  // Initiate a new swap
  async initiateSwap(req, res) {
    try {
      const { sourceAmount, sourceCurrency, targetCurrency, description } = req.body;
      
      // Validate required fields
      if (!sourceAmount || !sourceCurrency || !targetCurrency) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: sourceAmount, sourceCurrency, targetCurrency'
        });
      }
      
      // Validate amount
      if (isNaN(parseFloat(sourceAmount)) || parseFloat(sourceAmount) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'sourceAmount must be a positive number'
        });
      }
      
      const swap = await this.swapService.initiateSwap({
        sourceAmount: parseFloat(sourceAmount),
        sourceCurrency,
        targetCurrency,
        description: description || 'HufflePay Cross-Currency Swap'
      });
      
      res.status(201).json({
        success: true,
        message: 'Swap initiated successfully',
        data: swap
      });
    } catch (error) {
      console.error('Error initiating swap:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to initiate swap'
      });
    }
  }

  // Execute a swap
  async executeSwap(req, res) {
    try {
      const { swapId } = req.params;
      
      if (!swapId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: swapId'
        });
      }
      
      const result = await this.swapService.executeSwap(swapId);
      
      res.status(200).json({
        success: true,
        message: 'Swap executed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error executing swap:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute swap'
      });
    }
  }

  // Get details of a specific swap
  async getSwap(req, res) {
    try {
      const { swapId } = req.params;
      
      if (!swapId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: swapId'
        });
      }
      
      const swap = this.swapService.getSwap(swapId);
      
      res.status(200).json({
        success: true,
        data: swap
      });
    } catch (error) {
      console.error('Error fetching swap:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'Failed to fetch swap'
      });
    }
  }

  // List all swaps
  async listSwaps(req, res) {
    try {
      const swaps = this.swapService.listSwaps();
      
      res.status(200).json({
        success: true,
        data: swaps
      });
    } catch (error) {
      console.error('Error listing swaps:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list swaps'
      });
    }
  }
}

module.exports = SwapController;