import React from 'react';
import { Zap, RotateCcw } from 'lucide-react';

function Header({ onReset }) {
  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 amazon-gradient rounded-lg flex items-center justify-center shadow-md">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Intent-to-Cart AI</h1>
            <p className="text-xs text-gray-300">Quick Commerce | Powered by Amazon Bedrock</p>
          </div>
        </div>
        <button onClick={onReset} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
