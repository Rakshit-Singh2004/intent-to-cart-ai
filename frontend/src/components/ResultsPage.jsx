import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, BadgeInfo, CheckCircle2, ChevronDown,
  Trash2, RefreshCw, HelpCircle, ArrowRight
} from 'lucide-react';
import CartSummary from './CartSummary';
import SituationPacks from './SituationPacks';
import ScoreBreakdownTooltip from './ScoreBreakdownTooltip';
import CartHealthBadge from './CartHealthBadge';
import MissingEssentials from './MissingEssentials';
import { recalculateCartMetrics } from '../utils/cartReactive';

// ─── REPLACEMENT CATALOG ─────────────────────────────────────────────────────
// Category-aware replacements. Only same-category swaps are allowed.
const CATEGORY_REPLACEMENTS = {
  'Pet Care': [
    { id: 'prod_080', name: 'Dog Food (1kg Premium)', category: 'Pet Care', price: 349, inStock: true, deliveryTime: '10 mins', tags: ['pet', 'dog', 'food'] },
    { id: 'prod_081', name: 'Cat Food (500g)', category: 'Pet Care', price: 249, inStock: true, deliveryTime: '10 mins', tags: ['pet', 'cat', 'food'] },
    { id: 'prod_023a', name: 'Dog Treats', category: 'Pet Care', price: 129, inStock: true, deliveryTime: '10 mins', tags: ['pet', 'dog', 'treats'] },
    { id: 'prod_023b', name: 'Chew Sticks', category: 'Pet Care', price: 159, inStock: true, deliveryTime: '10 mins', tags: ['pet', 'dog', 'chew'] },
    { id: 'prod_023c', name: 'Pet Bowl', category: 'Pet Care', price: 119, inStock: true, deliveryTime: '10 mins', tags: ['pet', 'dog', 'bowl'] },
    { id: 'prod_023d', name: 'Dental Chews', category: 'Pet Care', price: 189, inStock: true, deliveryTime: '10 mins', tags: ['pet', 'dog', 'dental'] }
  ],
  'Health': [
    { id: 'prod_001', name: 'Digital Thermometer', category: 'Health', price: 299, inStock: true, deliveryTime: '10 mins', tags: ['health', 'fever'] },
    { id: 'prod_002', name: 'Paracetamol Syrup (Kids)', category: 'Health', price: 89, inStock: true, deliveryTime: '10 mins', tags: ['health', 'medicine'] },
    { id: 'prod_003', name: 'ORS Sachets (Pack of 10)', category: 'Health', price: 45, inStock: true, deliveryTime: '10 mins', tags: ['health', 'hydration'] },
    { id: 'prod_005', name: 'Band-Aid Strips (Pack of 20)', category: 'Health', price: 65, inStock: true, deliveryTime: '10 mins', tags: ['health', 'first-aid'] },
    { id: 'prod_006', name: 'Antiseptic Liquid (100ml)', category: 'Health', price: 79, inStock: true, deliveryTime: '10 mins', tags: ['health', 'antiseptic'] }
  ],
  'Stationery': [
    { id: 'prod_070', name: 'Notebook (200 Pages)', category: 'Stationery', price: 89, inStock: true, deliveryTime: '10 mins', tags: ['study', 'notes'] },
    { id: 'prod_071', name: 'Pen Set (Blue, Black, Red)', category: 'Stationery', price: 45, inStock: true, deliveryTime: '10 mins', tags: ['study', 'writing'] },
    { id: 'prod_072', name: 'Highlighter Set (5 Colors)', category: 'Stationery', price: 99, inStock: true, deliveryTime: '10 mins', tags: ['study', 'highlight'] },
    { id: 'prod_073', name: 'Sticky Notes (Pack of 3)', category: 'Stationery', price: 69, inStock: true, deliveryTime: '10 mins', tags: ['study', 'notes'] }
  ],
  'Beverages': [
    { id: 'prod_074', name: 'Coffee (Instant, 50g)', category: 'Beverages', price: 125, inStock: true, deliveryTime: '10 mins', tags: ['coffee', 'energy'] },
    { id: 'prod_075', name: 'Energy Drink (250ml)', category: 'Beverages', price: 99, inStock: true, deliveryTime: '10 mins', tags: ['energy', 'drink'] },
    { id: 'prod_022', name: 'Soft Drinks (6 Pack)', category: 'Beverages', price: 210, inStock: true, deliveryTime: '10 mins', tags: ['drinks', 'cold'] }
  ],
  'Snacks': [
    { id: 'prod_023', name: 'Chips (Large, Assorted)', category: 'Snacks', price: 150, inStock: true, deliveryTime: '10 mins', tags: ['snacks', 'chips'] },
    { id: 'prod_019a', name: 'Popcorn Tub', category: 'Snacks', price: 69, inStock: true, deliveryTime: '10 mins', tags: ['snack', 'popcorn'] }
  ]
};

function getReplacementsForProduct(product) {
  const catReplacements = CATEGORY_REPLACEMENTS[product.category] || [];
  return catReplacements.filter(r => r.id !== product.id);
}

// ─── URGENCY BADGE COLORS ────────────────────────────────────────────────────
const urgencyColors = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200'
};

// ─── PRODUCT CARD WITH REMOVE / REPLACE / WHY ────────────────────────────────

function EditableProductCard({ product, onRemove, onReplace }) {
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showReplaceMenu, setShowReplaceMenu] = useState(false);
  const replacements = getReplacementsForProduct(product);
  const hasReplacements = replacements.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
          <p className="text-xs text-gray-500">{product.category}</p>
        </div>
        <p className="text-sm font-bold text-amazon-blue flex-shrink-0">₹{product.price}</p>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => onRemove(product.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-100"
          title="Remove this item"
        >
          <Trash2 className="w-3 h-3" />
          Remove
        </button>

        {hasReplacements ? (
          <div className="relative">
            <button
              onClick={() => setShowReplaceMenu(!showReplaceMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-blue-100"
              title="Replace with a similar item"
            >
              <RefreshCw className="w-3 h-3" />
              Replace
            </button>
            {showReplaceMenu && (
              <div className="absolute z-20 left-0 top-8 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase px-2 mb-2">
                  Same category replacements
                </p>
                {replacements.slice(0, 5).map(r => (
                  <button
                    key={r.id}
                    onClick={() => { onReplace(product.id, r); setShowReplaceMenu(false); }}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <span className="text-xs font-medium text-gray-700 flex-1 mr-1 truncate">{r.name}</span>
                    <span className="text-xs font-bold text-amazon-blue flex-shrink-0">₹{r.price}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowReplaceMenu(false)}
                  className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 pt-1 pb-0.5"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="px-2.5 py-1.5 text-xs text-gray-400 border border-gray-100 rounded-lg">
            No alternative available
          </span>
        )}

        <button
          onClick={() => setShowWhyModal(!showWhyModal)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all border border-gray-200"
          title="Why was this item recommended?"
        >
          <HelpCircle className="w-3 h-3" />
          Why?
        </button>
      </div>

      {/* Why Modal */}
      {showWhyModal && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 mb-1">Why this item?</p>
          <p className="text-xs text-blue-600">
            {product.reason
              || `${product.name} was recommended based on your detected situation and category (${product.category}).`}
          </p>
          <button
            onClick={() => setShowWhyModal(false)}
            className="mt-1 text-[10px] text-blue-400 hover:text-blue-600"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// ─── RESULTS PAGE ────────────────────────────────────────────────────────────

function ResultsPage({ intentResult, userInput, onCheckout, onReset }) {
  // Initialize cart from best pack products (Standard pack if available, else first pack)
  const getInitialProducts = () => {
    const packs = intentResult?.zeroDecision?.packs || [];
    if (packs.length > 0) {
      const standardPack = packs.find(p => p.tier === 'Standard') || packs[0];
      return standardPack.products || [];
    }
    return intentResult?.cart?.products || [];
  };

  const getInitialPackId = () => {
    const primaryId = intentResult?.zeroDecision?.primary_pack_id;
    return primaryId || intentResult?.zeroDecision?.packs?.[0]?.id || null;
  };

  const [cartProducts, setCartProducts] = useState(getInitialProducts);
  const [selectedPackId, setSelectedPackId] = useState(getInitialPackId);
  const [metrics, setMetrics] = useState(() =>
    recalculateCartMetrics(getInitialProducts(), intentResult, getInitialPackId())
  );
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  // ── Reactive: recalculate on every cart/pack change ──────────────────────
  useEffect(() => {
    setMetrics(recalculateCartMetrics(cartProducts, intentResult, selectedPackId));
  }, [cartProducts, selectedPackId, intentResult]);

  const handleRemoveProduct = useCallback((productId) => {
    setCartProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const handleReplaceProduct = useCallback((productId, replacement) => {
    setCartProducts(prev =>
      prev.map(p => p.id === productId ? { ...replacement } : p)
    );
  }, []);

  const handleSelectPack = useCallback((pack) => {
    setSelectedPackId(pack.id);
    setCartProducts(pack.products);
  }, []);

  const handleAddMissingEssential = useCallback((item) => {
    // Only add if not already in cart
    setCartProducts(prev => {
      if (prev.find(p => p.name.toLowerCase() === item.name.toLowerCase())) return prev;
      return [...prev, {
        id: `essential-${Date.now()}`,
        name: item.name,
        category: item.category || 'Essentials',
        price: item.price || 99,
        inStock: true,
        deliveryTime: '10 mins',
        tags: [],
        reason: item.reason
      }];
    });
  }, []);

  const handleCheckout = useCallback(() => {
    const activePack = metrics.packs?.find(p => p.id === selectedPackId);
    onCheckout(cartProducts, activePack);
  }, [cartProducts, selectedPackId, metrics.packs, onCheckout]);

  const { intent, reasoning, cart, subjectDetection } = intentResult;
  const { optimization, packs, missingEssentials } = metrics;
  const activePack = packs?.find(p => p.id === selectedPackId);
  const missionName = intentResult?.zeroDecision?.scenario?.missionName
    || subjectDetection?.missionName
    || 'Shopping Mission';

  return (
    <div className="animate-fade-in space-y-6">

      {/* User Input Echo */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amazon-blue flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">U</span>
        </div>
        <div className="bg-white rounded-2xl rounded-tl-md px-5 py-3 shadow-sm border border-gray-100 max-w-[85%]">
          <p className="text-gray-800 font-medium">{userInput}</p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full amazon-gradient flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 space-y-5">

          {/* ── SECTION 1: AI Understanding Panel ── */}
          <div className="bg-white rounded-2xl rounded-tl-md p-5 shadow-sm border border-gray-100 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amazon-orange" />
              <span className="text-sm font-semibold text-gray-700">AI Understanding</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Subject</p>
                <p className="text-sm font-bold text-amazon-blue">
                  {subjectDetection?.subject || intent?.subject || '—'}
                  {subjectDetection?.petType ? ` (${subjectDetection.petType})` : ''}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Situation</p>
                <p className="text-sm font-bold text-amazon-blue">
                  {subjectDetection?.situation || intent?.situation || '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Urgency</p>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${urgencyColors[intent?.urgency] || urgencyColors.Medium}`}>
                  {intent?.urgency || 'Medium'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Category</p>
                <p className="text-sm font-bold text-amazon-blue">
                  {subjectDetection?.category || intent?.type || '—'}
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="mb-3">
              <p className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Mission</p>
              <p className="text-lg font-bold text-amazon-blue">{missionName}</p>
            </div>

            {/* Reasoning */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-600 flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">ℹ️</span>
                <span><strong>AI Reasoning:</strong> {reasoning}</span>
              </p>
            </div>
          </div>

          {/* ── SECTION 2: Generated Cart Header ── */}
          <div className="bg-gradient-to-r from-amazon-orange/10 to-yellow-50 rounded-xl p-4 border border-amazon-orange/20 animate-slide-up">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <h3 className="font-bold text-amazon-blue">{cart?.name || 'Generated Cart'}</h3>
                  <p className="text-xs text-gray-500">Curated for your situation</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                🚚 {cart?.estimatedNeedTime || '10-15 mins'}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Editable Product List ── */}
          <div className="space-y-3 animate-slide-up">
            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <span>Products ({cartProducts.length})</span>
              <ArrowRight className="w-3 h-3" />
            </h4>
            {cartProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Cart is empty. Select a pack below to repopulate.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cartProducts.map((product) => (
                  <EditableProductCard
                    key={product.id}
                    product={product}
                    onRemove={handleRemoveProduct}
                    onReplace={handleReplaceProduct}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── SECTION 4: Optimization Score ── */}
          {optimization && (
            <div className="bg-white rounded-2xl rounded-tl-md p-5 shadow-sm border border-gray-100 animate-slide-up space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BadgeInfo className="w-4 h-4 text-amazon-orange" />
                  <span className="text-sm font-semibold text-gray-700">Cart Optimization</span>
                </div>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowScoreBreakdown(true)}
                    onMouseLeave={() => setShowScoreBreakdown(false)}
                    className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-green-700 border border-green-100 hover:bg-green-100 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Score {Math.round(optimization.score)}/100</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showScoreBreakdown && (
                    <ScoreBreakdownTooltip breakdown={optimization.scoreBreakdown} />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">{optimization.explanation}</p>
              <CartHealthBadge health={optimization.health} score={Math.round(optimization.score)} />
            </div>
          )}

          {/* ── SECTION 5: Smart Shopping Packs ── */}
          {packs && packs.length > 0 && (
            <div className="bg-white rounded-2xl rounded-tl-md p-5 shadow-sm border border-gray-100 animate-slide-up space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amazon-orange" />
                  <span className="text-sm font-semibold text-gray-700">Smart Shopping Packs</span>
                </div>
                <span className="text-xs text-gray-400">Select to update cart</span>
              </div>
              <SituationPacks
                packs={packs}
                selectedPackId={selectedPackId}
                onSelectPack={handleSelectPack}
              />
            </div>
          )}

          {/* ── SECTION 6: Missing Essentials ── */}
          {missingEssentials && missingEssentials.length > 0 && (
            <div className="animate-slide-up">
              <MissingEssentials
                suggestions={missingEssentials}
                onAddSuggestion={handleAddMissingEssential}
              />
            </div>
          )}

          {/* ── SECTION 7: Checkout ── */}
          <CartSummary
            products={cartProducts}
            optimization={optimization}
            selectedPack={activePack}
            onCheckout={handleCheckout}
            onReset={onReset}
          />

        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
