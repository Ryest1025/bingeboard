/**
 * 🧪 A/B Testing API Routes
 * Production-ready experiment management and analytics
 */

import { Router, Request, Response } from 'express';
import { ABTestingFramework, MLAlgorithmPresets } from '../services/abTestingFramework.js';
import { DatabaseIntegrationService } from '../services/databaseIntegration.js';

export function registerABTestingRoutes(app: any, dbService: DatabaseIntegrationService): void {
  const router = Router();
  const abTesting = new ABTestingFramework(dbService);

  /**
   * 🚀 Create a new A/B test experiment
   */
  router.post('/experiments', async (req: Request, res: Response) => {
    try {
      const config = req.body;
      await abTesting.createExperiment(config);
      
      res.json({
        success: true,
        message: `Experiment "${config.experimentName}" created successfully`,
        experiment: config
      });
    } catch (error: any) {
      console.error('Error creating experiment:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * 🎲 Get user's variant assignment for an experiment
   */
  router.post('/assign', async (req: Request, res: Response) => {
    try {
      const { userId, experimentName, context } = req.body;
      
      if (!userId || !experimentName) {
        return res.status(400).json({
          success: false,
          error: 'userId and experimentName are required'
        });
      }

      const variant = await abTesting.assignUserToVariant(userId, experimentName, context);
      
      res.json({
        success: true,
        userId,
        experimentName,
        variant,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error assigning user to variant:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * 📈 Record conversion event
   */
  router.post('/conversion', async (req: Request, res: Response) => {
    try {
      const { userId, experimentName, metricName, value = 1 } = req.body;
      
      if (!userId || !experimentName || !metricName) {
        return res.status(400).json({
          success: false,
          error: 'userId, experimentName, and metricName are required'
        });
      }

      await abTesting.recordConversion(userId, experimentName, metricName, value);
      
      res.json({
        success: true,
        message: 'Conversion recorded successfully',
        userId,
        experimentName,
        metricName,
        value
      });
    } catch (error: any) {
      console.error('Error recording conversion:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * 📊 Get experiment results and analytics
   */
  router.get('/experiments/:experimentName/results', async (req: Request, res: Response) => {
    try {
      const { experimentName } = req.params;
      const { startDate, endDate } = req.query;
      
      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const results = await abTesting.getExperimentResults(experimentName, dateRange);
      const winner = await abTesting.getWinningVariant(experimentName);
      
      res.json({
        success: true,
        experimentName,
        results,
        winner,
        summary: {
          totalVariants: results.length,
          hasSignificantWinner: !!winner,
          bestPerformingVariant: results[0]?.variant,
          totalSampleSize: results.reduce((sum, r) => sum + r.sampleSize, 0)
        }
      });
    } catch (error: any) {
      console.error('Error getting experiment results:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * 🎯 Quick setup for ML algorithm testing
   */
  router.post('/experiments/ml-preset', async (req: Request, res: Response) => {
    try {
      const { presetName, customAlgorithms } = req.body;
      
      let preset = MLAlgorithmPresets[presetName as keyof typeof MLAlgorithmPresets];
      
      if (!preset && !customAlgorithms) {
        return res.status(400).json({
          success: false,
          error: `Invalid preset "${presetName}". Available presets: ${Object.keys(MLAlgorithmPresets).join(', ')}`
        });
      }

      if (customAlgorithms) {
        preset = {
          name: req.body.experimentName || 'custom_ml_test',
          algorithms: customAlgorithms
        };
      }

      await abTesting.createMLAlgorithmTest(preset!.name, preset!.algorithms);
      
      res.json({
        success: true,
        message: `ML algorithm test "${preset!.name}" created successfully`,
        preset: preset,
        availablePresets: Object.keys(MLAlgorithmPresets)
      });
    } catch (error: any) {
      console.error('Error creating ML preset experiment:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * 🎨 Quick setup for UI variant testing
   */
  router.post('/experiments/ui-preset', async (req: Request, res: Response) => {
    try {
      const { experimentName, uiVariants } = req.body;
      
      if (!experimentName || !uiVariants || !Array.isArray(uiVariants)) {
        return res.status(400).json({
          success: false,
          error: 'experimentName and uiVariants array are required'
        });
      }

      await abTesting.createUIVariantTest(experimentName, uiVariants);
      
      res.json({
        success: true,
        message: `UI variant test "${experimentName}" created successfully`,
        variants: uiVariants
      });
    } catch (error: any) {
      console.error('Error creating UI variant experiment:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  app.use('/api/ab-testing', router);
  console.log('🧪 A/B Testing routes registered');
}
