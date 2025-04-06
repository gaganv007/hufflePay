const express = require('express');
const router = express.Router();

module.exports = (swapService, assetsService) => {
  // Get all swaps with full details
  router.get('/swaps', (req, res) => {
    try {
      const allSwaps = Array.from(swapService.activeSwaps.values());
      res.status(200).json({
        success: true,
        count: allSwaps.length,
        data: allSwaps
      });
    } catch (error) {
      console.error('Error fetching all swaps:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch swaps'
      });
    }
  });

  // Get all assets across all nodes
  router.get('/assets', async (req, res) => {
    try {
      const aliceAssets = await assetsService.getAssets('alice');
      const bobAssets = await assetsService.getAssets('bob');
      const edgeAssets = await assetsService.getAssets('edge');
      
      res.status(200).json({
        success: true,
        data: {
          alice: aliceAssets,
          bob: bobAssets,
          edge: edgeAssets
        }
      });
    } catch (error) {
      console.error('Error fetching all assets:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch assets'
      });
    }
  });

  // Get detailed statistics about the system
  router.get('/stats', (req, res) => {
    try {
      const allSwaps = Array.from(swapService.activeSwaps.values());
      
      // Calculate stats
      const stats = {
        totalSwaps: allSwaps.length,
        completedSwaps: allSwaps.filter(swap => swap.status === 'completed').length,
        failedSwaps: allSwaps.filter(swap => swap.status === 'failed').length,
        totalVolumeUSDT: allSwaps
          .filter(swap => swap.status === 'completed' && swap.sourceCurrency === 'USDT')
          .reduce((sum, swap) => sum + swap.sourceAmount, 0),
        totalVolumeEURC: allSwaps
          .filter(swap => swap.status === 'completed' && swap.sourceCurrency === 'EURC')
          .reduce((sum, swap) => sum + swap.sourceAmount, 0),
        lastSwap: allSwaps.length > 0 ? 
          allSwaps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] : null
      };
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch stats'
      });
    }
  });

  return router;
};