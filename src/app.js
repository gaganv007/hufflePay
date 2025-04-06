const express = require('express');
const cors = require('cors');
const winston = require('winston');
const config = require('./config/env');

// Import services
const LightningService = require('./services/lightning.service');
const SimulatedAssetsService = require('./services/simulatedAssets.service');
const SwapService = require('./services/swap.service');

// Import controllers
const SwapController = require('./controllers/swap.controller');
const LightningController = require('./controllers/lightning.controller');
const TaprootController = require('./controllers/taproot.controller');

// Import route factories
const swapRoutes = require('./routes/swap.routes');
const lightningRoutes = require('./routes/lightning.routes');
const taprootRoutes = require('./routes/taproot.routes');
const adminRoutes = require('./routes/admin.routes');

// Import asset initialization utility
const initializeAssets = require('./utils/initAssets');

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
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

// Initialize Express app
const app = express();
const PORT = config.port;

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Initialize services
let aliceService, bobService, edgeService, assetsService, swapService;

try {
  // For the actual demonstration, we'll use simulated services
  
  // Initialize Lightning services with our mocked implementation
  aliceService = new LightningService(config.aliceNode);
  bobService = new LightningService(config.bobNode);
  edgeService = new LightningService(config.edgeNode);
  
  // Initialize Simulated Assets service
  assetsService = new SimulatedAssetsService();
  
  // Initialize Swap service
  swapService = new SwapService({
    aliceService,
    bobService,
    edgeService,
    assetsService
  });
  
  logger.info('Services initialized successfully');
} catch (error) {
  logger.error(`Failed to initialize services: ${error.message}`);
  process.exit(1);
}

// Initialize controllers
const swapController = new SwapController(swapService);
const lightningController = new LightningController(aliceService, bobService, edgeService);
const taprootController = new TaprootController(assetsService);

// Configure routes
app.use('/api/swaps', swapRoutes(swapController));
app.use('/api/lightning', lightningRoutes(lightningController));
app.use('/api/taproot', taprootRoutes(taprootController));
app.use('/api/admin', adminRoutes(swapService, assetsService));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'HufflePay API',
    description: 'Cross-Currency Bitcoin Lightning & Taproot Swap API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Modified server startup to initialize assets first
async function startServer() {
  try {
    // Initialize assets
    logger.info('Initializing assets...');
    await initializeAssets();
    logger.info('Assets initialized successfully');
    
    // Start server as usual
    app.listen(PORT, () => {
      logger.info(`HufflePay server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;