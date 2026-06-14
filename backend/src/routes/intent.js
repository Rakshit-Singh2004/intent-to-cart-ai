import { Router } from 'express';
import { analyzeIntent } from '../services/bedrockService.js';
import { matchProducts, calculateCartTotal } from '../services/cartService.js';
import { optimizeCart } from '../services/optimizationService.js';
import { generateZeroDecisionEngine } from '../services/zeroDecisionService.js';
import { classifyShoppingNeed, getClarificationPrompt } from '../services/classificationService.js';
import { detectMissingEssentials } from '../services/validationService.js';

const router = Router();

/**
 * POST /api/intent/analyze
 * Main endpoint — classifies subject/situation, runs AI analysis,
 * matches products, optimizes, and generates zero-decision packs.
 * All in one shot, no intermediate Continue steps.
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { input } = req.body;

    if (!input || input.trim().length === 0) {
      return res.status(400).json({ error: 'Please describe what you need help with' });
    }

    console.log(`\n🧠 Analyzing intent: "${input}"`);
    const startTime = Date.now();

    // ── STEP 1: Subject & Situation Detection ────────────────────────────
    const subjectDetection = classifyShoppingNeed(input);
    console.log(`🎯 Subject: ${subjectDetection.subject} | Situation: ${subjectDetection.situation} | Confidence: ${subjectDetection.confidence}`);

    // Only ask for clarification if confidence is very low AND no situation was detected
    if (subjectDetection.clarificationRequired) {
      return res.json({
        success: true,
        needsClarification: true,
        data: {
          subjectDetection,
          clarification: {
            question: getClarificationPrompt(subjectDetection),
            options: subjectDetection.clarification?.options || ['Food', 'Medicine', 'Toys', 'Grooming']
          },
          metadata: {
            processingTime: `${Date.now() - startTime}ms`,
            source: 'classifier'
          }
        }
      });
    }

    // ── STEP 2: AI Intent Analysis (with subject context) ────────────────
    const intentAnalysis = await analyzeIntent(input, { subjectDetection });

    // Ensure intent object carries the detected situation
    const enrichedIntent = {
      ...intentAnalysis,
      intent: {
        ...intentAnalysis.intent,
        subject: subjectDetection.subject,
        situation: subjectDetection.situation
      }
    };

    // ── STEP 3: Product Matching (category-validated) ────────────────────
    const matchedProducts = matchProducts(
      enrichedIntent.recommended_products,
      { subjectDetection }
    );

    console.log(`📦 Matched ${matchedProducts.length} products for category: ${subjectDetection.allowedCategories.join(', ')}`);

    // ── STEP 4: Cart Optimization ────────────────────────────────────────
    const optimization = optimizeCart(enrichedIntent, matchedProducts, {
      userInput: input,
      subjectDetection
    });

    // ── STEP 5: Zero-Decision Pack Generation ────────────────────────────
    // Pass subjectDetection inside so scenario selection uses it
    const intentResultForPacks = {
      ...enrichedIntent,
      subjectDetection,
      cart: {
        name: enrichedIntent.cart_name,
        estimatedNeedTime: enrichedIntent.estimated_need_time,
        products: matchedProducts,
        totals: calculateCartTotal(matchedProducts)
      }
    };
    const zeroDecision = generateZeroDecisionEngine(intentResultForPacks, input);

    // ── STEP 6: Missing Essentials ────────────────────────────────────────
    const missingEssentials = detectMissingEssentials(matchedProducts, subjectDetection.situation);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Intent analyzed in ${processingTime}ms`);

    res.json({
      success: true,
      data: {
        intent: enrichedIntent.intent,
        subjectDetection,
        reasoning: enrichedIntent.reasoning,
        cart: {
          name: enrichedIntent.cart_name,
          estimatedNeedTime: enrichedIntent.estimated_need_time,
          products: matchedProducts,
          totals: calculateCartTotal(matchedProducts)
        },
        optimization,
        zeroDecision,
        missingEssentials,
        metadata: {
          processingTime: `${processingTime}ms`,
          source: process.env.AWS_ACCESS_KEY_ID ? 'bedrock' : 'fallback',
          modelId: process.env.BEDROCK_MODEL_ID || 'fallback-engine'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/intent/refine
 * Accepts additional context and re-runs the full analysis pipeline.
 */
router.post('/refine', async (req, res, next) => {
  try {
    const { originalInput, feedback } = req.body;
    const refinedInput = `${originalInput}. Additional context: ${feedback}`;

    const subjectDetection = classifyShoppingNeed(refinedInput);
    const intentAnalysis = await analyzeIntent(refinedInput, { subjectDetection });

    const enrichedIntent = {
      ...intentAnalysis,
      intent: {
        ...intentAnalysis.intent,
        subject: subjectDetection.subject,
        situation: subjectDetection.situation
      }
    };

    const matchedProducts = matchProducts(enrichedIntent.recommended_products, { subjectDetection });
    const cartTotals = calculateCartTotal(matchedProducts);
    const optimization = optimizeCart(enrichedIntent, matchedProducts, {
      userInput: refinedInput,
      subjectDetection
    });

    const intentResultForPacks = {
      ...enrichedIntent,
      subjectDetection,
      cart: {
        name: enrichedIntent.cart_name,
        estimatedNeedTime: enrichedIntent.estimated_need_time,
        products: matchedProducts,
        totals: cartTotals
      }
    };
    const zeroDecision = generateZeroDecisionEngine(intentResultForPacks, refinedInput);
    const missingEssentials = detectMissingEssentials(matchedProducts, subjectDetection.situation);

    res.json({
      success: true,
      data: {
        intent: enrichedIntent.intent,
        subjectDetection,
        reasoning: enrichedIntent.reasoning,
        cart: {
          name: enrichedIntent.cart_name,
          estimatedNeedTime: enrichedIntent.estimated_need_time,
          products: matchedProducts,
          totals: cartTotals
        },
        optimization,
        zeroDecision,
        missingEssentials
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
