import React from 'react';

const DIMENSION_ICONS = {
  availability: '📦',
  delivery: '🚚',
  budget: '💰',
  intent: '🎯'
};

const DIMENSION_LABELS = {
  availability: 'Availability',
  delivery: 'Delivery Speed',
  budget: 'Budget Fit',
  intent: 'Intent Match'
};

function ScoreBreakdownTooltip({ breakdown }) {
  if (!breakdown) return null;

  const entries = Object.entries(breakdown);
  const finalScore = entries.reduce((sum, [, item]) => sum + (item.score || 0), 0);

  return (
    <div className="absolute z-30 right-0 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
        Optimization Score Breakdown
      </p>

      <div className="space-y-3">
        {entries.map(([key, item]) => {
          const pct = Math.round((item.score / (item.max || 40)) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <span>{DIMENSION_ICONS[key] || '•'}</span>
                  <span>{DIMENSION_LABELS[key] || item.label || key}</span>
                </span>
                <span className="font-bold text-amazon-blue tabular-nums">
                  {item.score}/{item.max || 40}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                <div
                  className="bg-amazon-orange h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{item.reason || item.explanation}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-700">Final Score</span>
        <span className="text-sm font-bold text-amazon-blue">{Math.min(100, finalScore)}/100</span>
      </div>
    </div>
  );
}

export default ScoreBreakdownTooltip;
