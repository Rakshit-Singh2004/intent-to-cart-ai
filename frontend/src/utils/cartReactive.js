/**
 * Reactive Cart System - V3
 *
 * Every cart modification triggers recalculation of:
 * - Optimization Score (dynamic, not hardcoded)
 * - Cart Health
 * - Pack Scores
 * - Recommended Pack
 * - Missing Essentials
 * - Delivery Estimate
 * - Totals
 *
 * Score formula:
 * Availability  = 40 pts
 * Delivery Speed = 30 pts
 * Budget Fit    = 20 pts
 * Intent Match  = 10 pts
 * Total         = 100 pts
 */

export function calculateCartTotal(products) {
  return products.reduce((sum, p) => sum + p.price, 0);
}

// ─── SCORE DIMENSIONS ────────────────────────────────────────────────────────

function calcAvailability(cart) {
  if (!cart.length) return 0;
  const available = cart.filter(p => p.inStock !== false).length;
  return Math.round((available / cart.length) * 40);
}

function calcDeliveryScore(cart) {
  if (!cart.length) return 0;
  const times = cart.map(p => {
    const match = String(p.deliveryTime || '').match(/(\d+)/);
    return match ? Number(match[1]) : 15;
  });
  const avgMins = times.reduce((a, b) => a + b, 0) / times.length;
  // 10 mins avg → 30 pts; 30 mins avg → 15 pts; 60+ mins → 5 pts
  const score = Math.round(30 * Math.min(1, 15 / Math.max(avgMins, 1)));
  return Math.max(5, Math.min(30, score));
}

function calcBudgetFit(cart, targetBudget) {
  const total = calculateCartTotal(cart);
  if (!targetBudget || targetBudget <= 0) return 20; // no budget limit = perfect
  if (total <= targetBudget) return 20;
  const overshoot = (total - targetBudget) / targetBudget;
  return Math.max(0, Math.round(20 - overshoot * 20));
}

function calcIntentMatch(cart, situation) {
  if (!cart.length || !situation) return 7; // neutral when no situation
  const tokens = situation.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2);
  const matching = cart.filter(p => {
    const text = `${p.name} ${(p.tags || []).join(' ')}`.toLowerCase();
    return tokens.some(t => text.includes(t));
  }).length;
  return Math.round((matching / cart.length) * 10);
}

// ─── MAIN METRICS CALCULATOR ─────────────────────────────────────────────────

export function calculateOptimizationMetrics(cart, intentResult) {
  if (!cart || cart.length === 0) {
    return {
      score: 0,
      scoreBreakdown: {
        availability: { score: 0, max: 40, label: 'Availability', reason: 'No products in cart' },
        delivery: { score: 0, max: 30, label: 'Delivery Speed', reason: 'No products in cart' },
        budget: { score: 0, max: 20, label: 'Budget Fit', reason: 'No products in cart' },
        intent: { score: 0, max: 10, label: 'Intent Match', reason: 'No products in cart' }
      },
      health: 'Needs Improvement',
      explanation: 'Cart is empty.'
    };
  }

  const situation = intentResult?.subjectDetection?.situation || intentResult?.intent?.situation || '';
  const targetBudget = intentResult?.zeroDecision?.packs?.[0]?.targetBudget || 0;

  const availability = calcAvailability(cart);
  const delivery = calcDeliveryScore(cart);
  const budget = calcBudgetFit(cart, targetBudget);
  const intent = calcIntentMatch(cart, situation);

  const total = Math.min(100, availability + delivery + budget + intent);

  const avgDelivery = Math.round(
    cart.reduce((sum, p) => {
      const match = String(p.deliveryTime || '').match(/(\d+)/);
      return sum + (match ? Number(match[1]) : 15);
    }, 0) / cart.length
  );

  const subtotal = calculateCartTotal(cart);

  return {
    score: total,
    scoreBreakdown: {
      availability: {
        score: availability,
        max: 40,
        label: 'Availability',
        reason: `${cart.filter(p => p.inStock !== false).length}/${cart.length} items in stock`
      },
      delivery: {
        score: delivery,
        max: 30,
        label: 'Delivery Speed',
        reason: `Average delivery: ${avgDelivery} mins`
      },
      budget: {
        score: budget,
        max: 20,
        label: 'Budget Fit',
        reason: targetBudget
          ? `₹${subtotal} vs ₹${targetBudget} target`
          : 'No budget constraint'
      },
      intent: {
        score: intent,
        max: 10,
        label: 'Intent Match',
        reason: `Products match detected situation: ${situation || 'unknown'}`
      }
    },
    health: getHealth(total),
    explanation: buildExplanation(total, availability, delivery, budget, intent)
  };
}

function buildExplanation(total, availability, delivery, budget, intent) {
  const parts = [];
  if (availability >= 32) parts.push('strong availability');
  if (delivery >= 24) parts.push('fast delivery');
  if (budget >= 16) parts.push('within budget');
  if (intent >= 8) parts.push('high intent match');

  if (parts.length > 0) {
    return `Cart optimized with ${parts.join(', ')}. Score: ${total}/100.`;
  }
  if (total >= 80) return 'Good cart quality with solid availability and delivery.';
  if (total >= 60) return 'Decent cart quality. Consider replacing out-of-stock items for a better score.';
  return 'Cart could be improved — some items may not be available or exceed the budget.';
}

// ─── HEALTH ──────────────────────────────────────────────────────────────────

export function getHealth(score) {
  if (score >= 95) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
}

// ─── PACK SCORES ─────────────────────────────────────────────────────────────

export function recalculatePackScores(currentCart, packs, intentResult) {
  if (!packs || packs.length === 0) return [];

  return packs.map(pack => {
    const metrics = calculateOptimizationMetrics(pack.products, intentResult);
    return {
      ...pack,
      optimization_score: metrics.score,
      cart_health: metrics.health,
      score_breakdown: metrics.scoreBreakdown,
      explanation: metrics.explanation
    };
  });
}

// ─── RECOMMENDED PACK ────────────────────────────────────────────────────────

/**
 * Recommend based on: optimization score (60%), value ratio (30%), completeness (10%)
 * Never randomly assign. Never recommend empty packs.
 */
function pickRecommendedPack(packs) {
  if (!packs || packs.length === 0) return null;

  const scored = packs.map(pack => {
    if (!pack.products || pack.products.length === 0) return { pack, score: 0 };
    const valueRatio = pack.optimization_score / Math.max(1, pack.totals?.total / 100);
    const completeness = Math.min(10, pack.products.length * 2);
    return {
      pack,
      score: (pack.optimization_score * 0.6) + (valueRatio * 0.3) + (completeness * 0.1)
    };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.pack || null;
}

// ─── MISSING ESSENTIALS ──────────────────────────────────────────────────────

const ESSENTIALS_MAP = {
  'Pet Food Refill': [
    { name: 'Dog Treats', reason: 'Complement food refills with rewarding treats.', price: 129 },
    { name: 'Dental Chews', reason: 'Dental hygiene is often overlooked during food refills.', price: 189 }
  ],
  'Movie Night': [
    { name: 'Popcorn Tub', reason: 'A classic movie-night snack.', price: 69 },
    { name: 'Disposable Cups', reason: 'Useful for sharing drinks during movie night.', price: 29 }
  ],
  'Guest Arrival': [
    { name: 'Tissues Box', reason: 'Guests often expect tissues in common areas.', price: 39 },
    { name: 'Soap Bar (Pack of 3)', reason: 'Guest hygiene essential.', price: 75 }
  ],
  'House Party': [
    { name: 'Party Cups (Pack of 25)', reason: 'Essential for serving drinks.', price: 99 },
    { name: 'Paper Plates (Pack of 20)', reason: 'Easy serving and cleanup.', price: 79 }
  ],
  'Baby Care': [
    { name: 'ORS Sachets (Pack of 10)', reason: 'Hydration support for baby.', price: 45 },
    { name: 'Wet Wipes (Pack of 72)', reason: 'Essential baby hygiene.', price: 149 }
  ],
  'Study Session': [
    { name: 'Highlighter Set (5 Colors)', reason: 'Essential for exam revision.', price: 99 },
    { name: 'Sticky Notes (Pack of 3)', reason: 'Quick memory reminders.', price: 69 }
  ],
  'Power Cut': [
    { name: 'Candles (Pack of 6)', reason: 'Backup ambient lighting during outage.', price: 49 },
    { name: 'Power Bank (10000mAh)', reason: 'Phone charging is critical during outages.', price: 799 }
  ],
  'First Aid': [
    { name: 'Antiseptic Liquid (100ml)', reason: 'Wound cleaning is essential for infection prevention.', price: 79 },
    { name: 'Band-Aid Strips (Pack of 20)', reason: 'Wound coverage and protection.', price: 65 }
  ],
  'Rainy Day': [
    { name: 'Umbrella (Compact)', reason: 'Rain protection for commuting.', price: 299 },
    { name: 'Raincoat (Disposable)', reason: 'Extended weather protection.', price: 49 }
  ]
};

export function detectMissingEssentials(cart, situation) {
  if (!situation) return [];
  const essentials = ESSENTIALS_MAP[situation] || [];
  const cartNames = new Set(cart.map(p => p.name.toLowerCase()));
  return essentials.filter(e => !cartNames.has(e.name.toLowerCase()));
}

// ─── FULL REACTIVE RECALCULATION ─────────────────────────────────────────────

export function recalculateCartMetrics(cartProducts, intentResult, selectedPackId) {
  if (!cartProducts || cartProducts.length === 0) {
    return {
      optimization: { score: 0, health: 'Needs Improvement', explanation: 'Cart is empty.', scoreBreakdown: {} },
      packs: intentResult?.zeroDecision?.packs || [],
      recommendedPackId: selectedPackId || null,
      missingEssentials: [],
      totals: { subtotal: 0, deliveryFee: 29, total: 29, itemCount: 0 }
    };
  }

  // Recalculate optimization metrics from current cart
  const optimization = calculateOptimizationMetrics(cartProducts, intentResult);

  // Recalculate pack scores
  const rawPacks = recalculatePackScores(
    cartProducts,
    intentResult?.zeroDecision?.packs || [],
    intentResult
  );

  // Pick recommended pack
  const recommendedPack = pickRecommendedPack(rawPacks);
  const recommendedPackId = recommendedPack?.id || selectedPackId;

  const packs = rawPacks.map(p => ({
    ...p,
    recommended: p.id === recommendedPackId,
    recommendedReason: p.id === recommendedPackId
      ? 'Recommended because it offers the best balance between cost, completeness, and delivery speed.'
      : null
  }));

  // Detect missing essentials based on current cart
  const situation = intentResult?.subjectDetection?.situation || intentResult?.intent?.situation;
  const missingEssentials = detectMissingEssentials(cartProducts, situation);

  const subtotal = calculateCartTotal(cartProducts);

  return {
    optimization,
    packs,
    recommendedPackId,
    missingEssentials,
    totals: {
      subtotal,
      deliveryFee: subtotal > 499 ? 0 : 29,
      total: subtotal + (subtotal > 499 ? 0 : 29),
      itemCount: cartProducts.length
    }
  };
}

export default {
  calculateCartTotal,
  calculateOptimizationMetrics,
  getHealth,
  recalculatePackScores,
  recalculateCartMetrics,
  detectMissingEssentials
};
