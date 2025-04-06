const express = require('express');
const router = express.Router();

module.exports = (swapController) => {
  // Create a new swap
  router.post('/', swapController.initiateSwap.bind(swapController));
  
  // Execute a swap
  router.post('/:swapId/execute', swapController.executeSwap.bind(swapController));
  
  // Get details of a specific swap
  router.get('/:swapId', swapController.getSwap.bind(swapController));
  
  // List all swaps
  router.get('/', swapController.listSwaps.bind(swapController));
  
  return router;
};