const LightningService = require('../services/lightning.service');

class LightningController {
  constructor(aliceService, bobService, edgeService) {
    this.aliceService = aliceService;
    this.bobService = bobService;
    this.edgeService = edgeService;
  }

  // Get information about the nodes
  async getNodesInfo(req, res) {
    try {
      const aliceInfo = await this.aliceService.getInfo();
      const bobInfo = await this.bobService.getInfo();
      const edgeInfo = await this.edgeService.getInfo();
      
      res.status(200).json({
        success: true,
        data: {
          alice: aliceInfo,
          bob: bobInfo,
          edge: edgeInfo
        }
      });
    } catch (error) {
      console.error('Error fetching node info:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch node info'
      });
    }
  }

  // Create an invoice (for testing)
  async createInvoice(req, res) {
    try {
      const { amount, description, nodeType } = req.body;
      
      if (!amount || !nodeType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: amount, nodeType'
        });
      }
      
      let service;
      switch (nodeType.toLowerCase()) {
        case 'alice':
          service = this.aliceService;
          break;
        case 'bob':
          service = this.bobService;
          break;
        case 'edge':
          service = this.edgeService;
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid nodeType. Must be one of: alice, bob, edge'
          });
      }
      
      const invoice = await service.createInvoice({
        amount: parseFloat(amount),
        description: description || 'HufflePay Test Invoice'
      });
      
      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to create invoice'
        });
      }
    }
  
    // Pay an invoice (for testing)
    async payInvoice(req, res) {
      try {
        const { paymentRequest, nodeType } = req.body;
        
        if (!paymentRequest || !nodeType) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: paymentRequest, nodeType'
          });
        }
        
        let service;
        switch (nodeType.toLowerCase()) {
          case 'alice':
            service = this.aliceService;
            break;
          case 'bob':
            service = this.bobService;
            break;
          case 'edge':
            service = this.edgeService;
            break;
          default:
            return res.status(400).json({
              success: false,
              error: 'Invalid nodeType. Must be one of: alice, bob, edge'
            });
        }
        
        const payment = await service.payInvoice(paymentRequest);
        
        res.status(200).json({
          success: true,
          message: 'Payment successful',
          data: payment
        });
      } catch (error) {
        console.error('Error paying invoice:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to pay invoice'
        });
      }
    }
  }
  
  module.exports = LightningController;