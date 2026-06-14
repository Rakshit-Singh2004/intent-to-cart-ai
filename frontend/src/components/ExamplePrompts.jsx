import React from 'react';

// Quick-action chips (above examples)
const quickChips = [
  { label: 'Baby Care', emoji: '👶', query: 'My baby has a high fever and needs medicine' },
  { label: 'Guest Arrival', emoji: '🎉', query: 'Friends coming over in 30 mins, need snacks and drinks' },
  { label: 'Movie Night', emoji: '🎬', query: 'Setting up for movie night, need snacks' },
  { label: 'Study Session', emoji: '📚', query: 'Exam tomorrow, need coffee and stationery' },
  { label: 'Pet Care', emoji: '🐶', query: 'Ran out of dog food' },
  { label: 'Power Cut', emoji: '⚡', query: 'Power cut at home, need candles and flashlight' },
  { label: 'Rainy Day', emoji: '🌧️', query: 'It\'s raining and I need to go out' }
];

// Detailed example prompts (below chips)
const examples = [
  { text: '👶 Baby has fever since morning', query: 'My baby has had a fever since morning and needs medicine' },
  { text: '🎉 Friends coming over in 30 mins', query: 'Friends coming over in 30 mins, need snacks and drinks' },
  { text: '📚 Late night study session for exam', query: 'Exam tomorrow, need coffee and stationery for late night study' },
  { text: '🐶 Ran out of dog food', query: 'Ran out of dog food, need to restock for my dog' },
  { text: '⚡ Power cut at home', query: 'Power cut at home, need emergency lighting and charging' },
  { text: '🌧️ It\'s raining and I need to go out', query: 'It\'s raining heavily outside and I need to commute' }
];

function ExamplePrompts({ onSelect }) {
  return (
    <div className="mb-10 space-y-6">
      {/* Quick Action Chips */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
          Quick situations
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => onSelect(chip.query)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-amazon-orange hover:bg-orange-50 hover:text-amazon-blue transition-all shadow-sm"
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Example Prompts Grid */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
          Try these examples
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => onSelect(example.query)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white text-left transition-all hover:border-amazon-orange hover:bg-orange-50 hover:shadow-md active:scale-[0.98] shadow-sm"
            >
              <span className="text-sm font-medium text-gray-700">{example.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExamplePrompts;
