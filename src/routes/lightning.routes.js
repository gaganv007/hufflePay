const express = require('express');
const router = express.Router();

module.exports = (lightningController) => {
  // Get information about all nodes
  router.get('/info', lightningController.getNodesInfo.bind(lightningController));
  
  // Create an invoice
  router.post('/invoice', lightningController.createInvoice.bind(lightningController));
  
  // Pay an invoice
  router.post('/pay', lightningController.payInvoice.bind(lightningController));
  
  return router;
};