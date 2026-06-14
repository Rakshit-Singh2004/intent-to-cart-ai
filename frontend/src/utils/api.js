const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Analyzes user intent and returns a complete cart result in one call.
 * Returns: { success, needsClarification, data }
 */
export async function analyzeIntent(input) {
  const response = await fetch(`${API_BASE}/intent/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to analyze intent');
  }
  return response.json();
}

/**
 * Creates a cart from a list of products with mission metadata.
 */
export async function createCart(products, cartName, missionName, selectedPackTier) {
  const response = await fetch(`${API_BASE}/cart/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products, cartName, missionName, selectedPackTier })
  });
  if (!response.ok) throw new Error('Failed to create cart');
  return response.json();
}

/**
 * Places the order for an existing cart.
 */
export async function checkout(cartId) {
  const response = await fetch(`${API_BASE}/cart/${cartId}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Checkout failed');
  return response.json();
}

/**
 * Refines intent with additional feedback.
 */
export async function refineIntent(originalInput, feedback) {
  const response = await fetch(`${API_BASE}/intent/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalInput, feedback })
  });
  if (!response.ok) throw new Error('Failed to refine recommendations');
  return response.json();
}

/**
 * Generates zero-decision packs from an existing intent result.
 * (Kept for backwards compatibility — the analyze endpoint now includes this.)
 */
export async function generateZeroDecisionPacks(intentResult, userInput) {
  const response = await fetch(`${API_BASE}/zero-decision/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intentResult, userInput })
  });
  if (!response.ok) throw new Error('Failed to generate zero-decision packs');
  return response.json();
}
