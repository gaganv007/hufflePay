class TaprootController {
    constructor(assetsService) {
      this.assetsService = assetsService;
    }
  
    // Mint a new Taproot asset
    async mintAsset(req, res) {
      try {
        const { name, amount, nodeType } = req.body;
        
        if (!name || !amount || !nodeType) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: name, amount, nodeType'
          });
        }
        
        const asset = await this.assetsService.mintAsset(name, parseFloat(amount), nodeType);
        
        res.status(201).json({
          success: true,
          message: 'Asset minted successfully',
          data: asset
        });
      } catch (error) {
        console.error('Error minting asset:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to mint asset'
        });
      }
    }
  
    // List all assets
    async listAssets(req, res) {
      try {
        const { nodeType } = req.query;
        
        if (!nodeType) {
          return res.status(400).json({
            success: false,
            error: 'Missing required query parameter: nodeType'
          });
        }
        
        const assets = await this.assetsService.getAssets(nodeType);
        
        res.status(200).json({
          success: true,
          data: assets
        });
      } catch (error) {
        console.error('Error listing assets:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to list assets'
        });
      }
    }
  
    // Send a Taproot asset
    async sendAsset(req, res) {
      try {
        const { assetId, amount, fromNode, toNode } = req.body;
        
        if (!assetId || !amount || !fromNode || !toNode) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: assetId, amount, fromNode, toNode'
          });
        }
        
        const result = await this.assetsService.transferAsset(
          assetId, 
          parseFloat(amount), 
          fromNode, 
          toNode
        );
        
        res.status(200).json({
          success: true,
          message: 'Asset transferred successfully',
          data: result
        });
      } catch (error) {
        console.error('Error sending asset:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to send asset'
        });
      }
    }
  }
  
  module.exports = TaprootController;