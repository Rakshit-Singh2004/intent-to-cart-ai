import React, { useState, useEffect } from 'react';
import { Zap, Search, ShoppingCart, MapPin, Sparkles } from 'lucide-react';

function Header({
  onReset,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSmartSearch,
  cartCount = 0,
  onCartClick,
  categories = [],
  activeCategory = 'All',
  onCategorySelect
}) {
  const [localQuery, setLocalQuery] = useState(searchQuery || '');

  // Keep the local input in sync if the parent resets the query
  useEffect(() => { setLocalQuery(searchQuery || ''); }, [searchQuery]);

  const handleChange = (value) => {
    setLocalQuery(value);
    onSearchChange?.(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) onSearchSubmit?.(localQuery.trim());
  };

  return (
    <header className="sticky top-0 z-40 shadow-lg">
      {/* ── MAIN NAV BAR ── */}
      <div className="gradient-bg text-white">
        <div className="w-full px-4 lg:px-6 py-2.5 flex items-center gap-3 lg:gap-6">

          {/* LEFT: Brand / project name */}
          <button
            onClick={onReset}
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 amazon-gradient rounded-lg flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-left leading-tight">
              <h1 className="text-base lg:text-lg font-bold tracking-tight">Intent-to-Cart</h1>
              <p className="hidden sm:block text-[10px] text-gray-300 -mt-0.5">Quick Commerce</p>
            </div>
          </button>

          {/* Deliver-to (decorative, Amazon-style) */}
          <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0 text-gray-200 hover:text-white cursor-default">
            <MapPin className="w-4 h-4" />
            <div className="leading-tight">
              <p className="text-[10px] text-gray-400">Deliver in</p>
              <p className="text-xs font-bold">10–15 mins</p>
            </div>
          </div>

          {/* CENTER: Search bar */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-3xl">
            <div className="flex items-stretch rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-amazon-orange">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search products or describe a situation…"
                className="flex-1 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              {localQuery.trim() && (
                <button
                  type="button"
                  onClick={() => onSmartSearch?.(localQuery.trim())}
                  title="Build a smart cart from your situation"
                  className="hidden sm:flex items-center gap-1.5 px-3 bg-amazon-blue/90 text-white text-xs font-semibold hover:bg-amazon-blue transition-colors border-l border-white/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amazon-orange" />
                  Smart Cart
                </button>
              )}
              <button
                type="submit"
                className="flex items-center justify-center px-4 amazon-gradient text-white hover:brightness-105 transition-all"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* RIGHT: Cart */}
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 flex-shrink-0 px-2 lg:px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-amazon-orange text-amazon-darkBlue text-[11px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-sm font-semibold">Cart</span>
          </button>
        </div>
      </div>

      {/* ── CATEGORY STRIP ── */}
      {categories.length > 0 && (
        <div className="bg-amazon-lightBlue text-white">
          <div className="w-full px-4 lg:px-6">
            <div className="flex items-center gap-1 overflow-x-auto scroll-hidden py-1.5">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategorySelect?.(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-amazon-orange text-amazon-darkBlue'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
