import React, { useState } from 'react';
import Header from './components/Header';
import IntentInput from './components/IntentInput';
import ResultsPage from './components/ResultsPage';
import OrderConfirmation from './components/OrderConfirmation';
import ExamplePrompts from './components/ExamplePrompts';
import LoadingSequence from './components/LoadingSequence';
import { analyzeIntent, createCart, checkout } from './utils/api';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [intentResult, setIntentResult] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [clarification, setClarification] = useState(null);

  // ── INTENT SUBMISSION ─────────────────────────────────────────────────────

  const handleIntentSubmit = async (input) => {
    setUserInput(input);
    setError(null);
    setCurrentView('loading');

    try {
      const result = await analyzeIntent(input);

      if (result.needsClarification) {
        setClarification(result.data);
        setCurrentView('clarify');
        return;
      }

      setIntentResult(result.data);

      // Loading sequence takes ~4s — show results when it completes
      setTimeout(() => {
        setCurrentView('results');
      }, 4200);
    } catch (err) {
      setError(err.message || 'Failed to analyze intent. Please try again.');
      setCurrentView('home');
    }
  };

  // ── CHECKOUT ──────────────────────────────────────────────────────────────

  const handleCheckout = async (cartProducts, selectedPack) => {
    try {
      const missionName = intentResult?.zeroDecision?.scenario?.missionName
        || intentResult?.subjectDetection?.missionName
        || 'Shopping Mission';

      const cartResult = await createCart(
        cartProducts,
        missionName,
        missionName,
        selectedPack?.tier || 'Custom'
      );

      const orderResult = await checkout(cartResult.data.id);

      setOrderInfo({
        ...orderResult.data,
        missionName,
        selectedPackTier: selectedPack?.tier || 'Custom',
        products: cartProducts,
        totals: {
          subtotal: cartProducts.reduce((s, p) => s + p.price, 0),
          total: orderResult.data?.totals?.total
            ?? cartProducts.reduce((s, p) => s + p.price, 0)
        }
      });

      setCurrentView('ordered');
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    }
  };

  // ── RESET ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setCurrentView('home');
    setIntentResult(null);
    setOrderInfo(null);
    setClarification(null);
    setError(null);
    setUserInput('');
  };

  // ── CLARIFICATION ─────────────────────────────────────────────────────────

  const handleClarificationSubmit = async (answer) => {
    if (!userInput) return;
    setClarification(null);
    await handleIntentSubmit(`${userInput}. ${answer}`);
  };

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={handleReset} />

      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fade-in">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── HOME ── */}
        {currentView === 'home' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-amazon-blue mb-3">
                Intent-to-Cart AI
              </h1>
              <p className="text-xl text-gray-600 mb-3">
                Turn real-life situations into ready-to-checkout carts in seconds.
              </p>
              <p className="text-gray-500 text-sm">
                No searching. No browsing. No comparing.<br />
                Just describe the situation.
              </p>
            </div>

            <IntentInput onSubmit={handleIntentSubmit} />
            <ExamplePrompts onSelect={handleIntentSubmit} />
          </div>
        )}

        {/* ── LOADING ── */}
        {currentView === 'loading' && (
          <LoadingSequence />
        )}

        {/* ── CLARIFICATION ── */}
        {currentView === 'clarify' && clarification && (
          <div className="mx-auto max-w-2xl animate-fade-in">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-amazon-orange mb-2">
                Quick clarification
              </p>
              <h2 className="text-2xl font-bold text-amazon-blue mb-3">
                {clarification.clarification?.question || 'What do you need help with?'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(clarification.clarification?.options || ['Food', 'Medicine', 'Toys', 'Other']).map(option => (
                  <button
                    key={option}
                    onClick={() => handleClarificationSubmit(option)}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-700 hover:border-amazon-orange hover:bg-orange-50 transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS (single page, all sections visible) ── */}
        {currentView === 'results' && intentResult && (
          <ResultsPage
            intentResult={intentResult}
            userInput={userInput}
            onCheckout={handleCheckout}
            onReset={handleReset}
          />
        )}

        {/* ── ORDER CONFIRMATION + DELIVERY TRACKING ── */}
        {currentView === 'ordered' && orderInfo && (
          <OrderConfirmation
            orderInfo={orderInfo}
            onReset={handleReset}
          />
        )}

      </main>
    </div>
  );
}

export default App;
