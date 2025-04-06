const express = require('express');
const router = express.Router();

module.exports = (taprootController) => {
  // Mint a new asset
  router.post('/mint', taprootController.mintAsset.bind(taprootController));
  
  // List all assets
  router.get('/assets', taprootController.listAssets.bind(taprootController));
  
  // Send an asset
  router.post('/send', taprootController.sendAsset.bind(taprootController));
  
  return router;
};