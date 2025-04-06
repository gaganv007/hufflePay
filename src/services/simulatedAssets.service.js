const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');

// Configure logger
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
    new winston.transports.File({ filename: 'logs/simulated-assets.log' })
  ],
});

// File to store our simulated assets
const ASSETS_FILE = path.join(__dirname, '../../data/simulated_assets.json');

class SimulatedAssetsService {
  constructor() {
    this.assets = {
      alice: {},
      bob: {},
      edge: {}
    };
    this.loadAssets();
  }

  // Load assets from JSON file or create default if not exists
  async loadAssets() {
    try {
      // Ensure the data directory exists
      await fs.mkdir(path.join(__dirname, '../../data'), { recursive: true });
      
      try {
        const data = await fs.readFile(ASSETS_FILE, 'utf8');
        this.assets = JSON.parse(data);
        logger.info('Loaded simulated assets from file');
      } catch (e) {
        // Create default assets if file doesn't exist
        logger.info('Creating default simulated assets');
        await this.createDefaultAssets();
      }
    } catch (error) {
      logger.error(`Error loading assets: ${error.message}`);
      throw error;
    }
  }

  // Save assets to JSON file
  async saveAssets() {
    try {
      await fs.writeFile(ASSETS_FILE, JSON.stringify(this.assets, null, 2));
      logger.info('Saved simulated assets to file');
    } catch (error) {
      logger.error(`Error saving assets: ${error.message}`);
      throw error;
    }
  }

  // Create default assets for demonstration
  async createDefaultAssets() {
    this.assets = {
      alice: {},
      bob: {},
      edge: {
        'asset_usd_default': {
          id: 'asset_usd_default',
          name: 'USD',
          amount: 10000,
          created_at: new Date().toISOString()
        },
        'asset_eur_default': {
          id: 'asset_eur_default',
          name: 'EUR',
          amount: 9000,
          created_at: new Date().toISOString()
        },
        'asset_btc_default': {
          id: 'asset_btc_default',
          name: 'BTC',
          amount: 1,
          created_at: new Date().toISOString()
        }
      }
    };
    
    await this.saveAssets();
    return this.assets;
  }

  // Get all assets for a node
  async getAssets(nodeType) {
    if (!this.assets[nodeType.toLowerCase()]) {
      throw new Error(`Invalid node type: ${nodeType}`);
    }
    
    return Object.values(this.assets[nodeType.toLowerCase()]);
  }

  // Mint a new asset
  async mintAsset(name, amount, nodeType) {
    if (!this.assets[nodeType.toLowerCase()]) {
      throw new Error(`Invalid node type: ${nodeType}`);
    }
    
    const assetId = `asset_${name.toLowerCase()}_${Date.now()}`;
    const asset = {
      id: assetId,
      name,
      amount: parseFloat(amount),
      created_at: new Date().toISOString()
    };
    
    this.assets[nodeType.toLowerCase()][assetId] = asset;
    await this.saveAssets();
    
    logger.info(`Minted ${amount} of ${name} for ${nodeType}`);
    return asset;
  }

  // Transfer an asset from one node to another
  async transferAsset(assetId, amount, fromNode, toNode) {
    const sourceAssets = this.assets[fromNode.toLowerCase()];
    const targetAssets = this.assets[toNode.toLowerCase()];
    
    if (!sourceAssets || !targetAssets) {
      throw new Error('Invalid source or target node');
    }
    
    const asset = sourceAssets[assetId];
    if (!asset) {
      throw new Error(`Asset ${assetId} not found in ${fromNode} node`);
    }
    
    if (asset.amount < amount) {
      throw new Error(`Insufficient balance: ${asset.amount} < ${amount}`);
    }
    
    // Decrease source amount
    asset.amount -= parseFloat(amount);
    
    // Add or update the asset in target node
    if (targetAssets[assetId]) {
      targetAssets[assetId].amount += parseFloat(amount);
    } else {
      targetAssets[assetId] = {
        id: assetId,
        name: asset.name,
        amount: parseFloat(amount),
        created_at: new Date().toISOString()
      };
    }
    
    await this.saveAssets();
    
    logger.info(`Transferred ${amount} of ${asset.name} from ${fromNode} to ${toNode}`);
    
    return {
      id: `transfer_${Date.now()}`,
      assetId,
      amount: parseFloat(amount),
      fromNode,
      toNode,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = SimulatedAssetsService;