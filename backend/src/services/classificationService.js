/**
 * Subject & Situation Detection Engine - V3
 * Runs before all other processing to determine WHO and WHAT the request is for.
 * Uses longest-match-first to prevent "i need" matching Self before Pet/Baby.
 */

// ─── SUBJECT PATTERNS ───────────────────────────────────────────────────────
// Ordered from most-specific to least-specific so precise keywords win.
const SUBJECT_PATTERNS = [
  {
    subject: 'Pet',
    keywords: [
      'dog food', 'cat food', 'pet food', 'puppy food', 'kitten food',
      'dog treats', 'cat treats', 'dog collar', 'cat litter', 'pet bowl',
      'chew toy', 'chew toys', 'dog toy', 'cat toy',
      'my dog', 'my cat', 'my puppy', 'my kitten', 'my pet',
      'for dog', 'for cat', 'for pet', 'for puppy', 'for kitten',
      'dog', 'cat', 'puppy', 'kitten', 'pet'
    ],
    petType: null, // resolved after match
    category: 'Pet Supplies',
    situation: 'Pet Food Refill',
    allowedCategories: ['Pet Care'],
    clarification: {
      question: 'What does your pet need?',
      options: ['Food', 'Treats', 'Toys', 'Grooming']
    }
  },
  {
    subject: 'Baby',
    keywords: [
      'my baby', 'the baby', 'baby has', 'baby needs', 'baby fever', 'baby sick',
      'newborn', 'infant', 'toddler',
      'baby'
    ],
    petType: null,
    category: 'Health Essentials',
    situation: 'Baby Care',
    allowedCategories: ['Health', 'Baby Care'],
    clarification: {
      question: 'What does the baby need?',
      options: ['Medicine', 'Diapers', 'Feeding', 'Hygiene']
    }
  },
  {
    subject: 'Guest',
    keywords: [
      'friends coming', 'guests coming', 'guests arriving', 'friends arriving',
      'someone staying', 'staying over', 'overnight guest', 'house party',
      'guest coming', 'visitor coming',
      'guest', 'guests', 'visitor', 'visitors'
    ],
    petType: null,
    category: 'Hosting Essentials',
    situation: 'Guest Arrival',
    allowedCategories: ['Party', 'Beverages', 'Snacks', 'Personal Care'],
    clarification: {
      question: 'What do your guests need?',
      options: ['Snacks', 'Drinks', 'Serving Items', 'Toiletries']
    }
  },
  {
    subject: 'Child',
    keywords: [
      'my child', 'my kid', 'my son', 'my daughter', 'school age',
      'child needs', 'kid needs',
      'child', 'kid', 'kids'
    ],
    petType: null,
    category: 'Child Care',
    situation: 'Study Session',
    allowedCategories: ['Stationery', 'Beverages', 'Food', 'Personal Care'],
    clarification: {
      question: 'What does your child need?',
      options: ['Food', 'Study Supplies', 'Hygiene', 'Medicine']
    }
  },
  {
    subject: 'Family',
    keywords: [
      'for my family', 'whole family', 'everyone at home', 'family needs',
      'parents need', 'my family',
      'family'
    ],
    petType: null,
    category: 'Household Essentials',
    situation: 'Grocery Refill',
    allowedCategories: ['Food', 'Cleaning', 'Personal Care', 'Health'],
    clarification: {
      question: 'What does your family need?',
      options: ['Groceries', 'Cleaning', 'Cooking', 'Medicine']
    }
  },
  {
    subject: 'Self',
    keywords: [
      'i have fever', 'i am sick', 'i hurt', 'i need', 'i want',
      'for me', 'my study', 'my work', 'my office',
      'i'
    ],
    petType: null,
    category: 'Personal Essentials',
    situation: 'Office Essentials',
    allowedCategories: ['Stationery', 'Beverages', 'Food', 'Personal Care'],
    clarification: {
      question: 'What do you need?',
      options: ['Work', 'Food', 'Health', 'Comfort']
    }
  }
];

// ─── SITUATION PATTERNS ──────────────────────────────────────────────────────
// Ordered most-specific first. Each situation carries its allowed product categories.
const SITUATION_PATTERNS = [
  {
    situation: 'Pet Food Refill',
    missionName: 'Pet Care Refill',
    keywords: ['ran out of dog food', 'out of dog food', 'ran out of cat food', 'out of cat food',
               'dog food finished', 'cat food finished', 'no dog food', 'no cat food',
               'need dog food', 'need cat food', 'dog food', 'cat food', 'pet food'],
    allowedCategories: ['Pet Care']
  },
  {
    situation: 'Study Session',
    missionName: 'Exam Preparation',
    keywords: ['exam tomorrow', 'study session', 'study for exam', 'exam preparation',
               'homework deadline', 'assignment due', 'late night study', 'all night study',
               'exam', 'study', 'homework', 'assignment'],
    allowedCategories: ['Stationery', 'Beverages', 'Food']
  },
  {
    situation: 'House Party',
    missionName: 'Quick Guest Preparation',
    keywords: ['house party tonight', 'birthday party', 'throwing a party', 'having a party',
               'party tonight', 'birthday celebration', 'house party'],
    allowedCategories: ['Party', 'Beverages', 'Snacks', 'Dessert']
  },
  {
    situation: 'Movie Night',
    missionName: 'Entertainment Essentials',
    keywords: ['movie night', 'watch movies', 'watching movies', 'home theater', 'binge watch'],
    allowedCategories: ['Snacks', 'Beverages', 'Dessert']
  },
  {
    situation: 'Rainy Day',
    missionName: 'Rain Preparedness',
    keywords: ['it is raining', 'it\'s raining', 'caught in rain', 'heavy rain', 'stuck in rain',
               'raining outside', 'rainy day', 'rain started', 'rain', 'raining', 'wet outside', 'storm'],
    allowedCategories: ['Accessories', 'Beverages', 'Personal Care']
  },
  {
    situation: 'Baby Care',
    missionName: 'Baby Care Emergency',
    keywords: ['baby has fever', 'baby is sick', 'baby needs medicine', 'infant fever',
               'toddler sick', 'baby care emergency', 'baby fever', 'baby sick', 'baby'],
    allowedCategories: ['Health', 'Baby Care']
  },
  {
    situation: 'First Aid',
    missionName: 'First Aid Response',
    keywords: ['bleeding', 'cut myself', 'injured myself', 'wound on', 'deep cut',
               'wound', 'cut', 'injury', 'hurt', 'first aid'],
    allowedCategories: ['Health']
  },
  {
    situation: 'Power Cut',
    missionName: 'Emergency Lighting',
    keywords: ['power cut', 'power outage', 'no electricity', 'electricity gone',
               'lights went out', 'blackout', 'dark at home'],
    allowedCategories: ['Electronics', 'Home']
  },
  {
    situation: 'Gym Recovery',
    missionName: 'Recovery Reset',
    keywords: ['post workout', 'after gym', 'gym recovery', 'workout recovery',
               'after workout', 'gym session ended', 'gym', 'workout', 'protein'],
    allowedCategories: ['Beverages', 'Food', 'Health']
  },
  {
    situation: 'Road Trip',
    missionName: 'Travel Essentials',
    keywords: ['going on road trip', 'road trip tomorrow', 'long drive', 'car journey',
               'road trip', 'travel', 'trip', 'journey'],
    allowedCategories: ['Snacks', 'Beverages', 'Electronics', 'Accessories']
  },
  {
    situation: 'Guest Arrival',
    missionName: 'Guest Welcome',
    keywords: ['guests coming over', 'friends coming over', 'visitor coming', 'guests arriving',
               'friends arriving', 'staying overnight', 'friends coming', 'guests coming'],
    allowedCategories: ['Party', 'Beverages', 'Personal Care']
  },
  {
    situation: 'Office Essentials',
    missionName: 'Office Readiness',
    keywords: ['office tomorrow', 'need office supplies', 'work from office',
               'office', 'work supplies', 'meeting supplies', 'stationery', 'desk supplies'],
    allowedCategories: ['Stationery', 'Beverages']
  },
  {
    situation: 'Grocery Refill',
    missionName: 'Household Refill',
    keywords: ['ran out of groceries', 'grocery refill', 'out of milk', 'no bread',
               'kitchen empty', 'groceries', 'reorder kitchen', 'grocery', 'milk', 'bread'],
    allowedCategories: ['Food']
  }
];

// ─── HELPERS ────────────────────────────────────────────────────────────────

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

/**
 * Score how well a text matches a list of keywords.
 * Longer keywords get higher weight. Exact phrase match gets bonus.
 */
function scoreKeywords(text, keywords) {
  let score = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      // Weight by keyword length: longer = more specific = more score
      score += keyword.split(' ').length >= 3 ? 5
             : keyword.split(' ').length === 2 ? 3
             : 1;
    }
  }
  return score;
}

/**
 * Detect pet type from input text.
 */
function detectPetType(text) {
  if (text.includes('dog') || text.includes('puppy')) return 'Dog';
  if (text.includes('cat') || text.includes('kitten')) return 'Cat';
  return 'Pet';
}

// ─── MAIN CLASSIFIER ────────────────────────────────────────────────────────

export function classifyShoppingNeed(input) {
  const text = normalize(input);

  // Score all subject patterns
  const scoredSubjects = SUBJECT_PATTERNS
    .map(pattern => ({ pattern, score: scoreKeywords(text, pattern.keywords) }))
    .sort((a, b) => b.score - a.score);

  // Score all situation patterns
  const scoredSituations = SITUATION_PATTERNS
    .map(pattern => ({ pattern, score: scoreKeywords(text, pattern.keywords) }))
    .sort((a, b) => b.score - a.score);

  const subjectMatch = scoredSubjects[0];
  const situationMatch = scoredSituations[0];

  // Pick best subject. If no subject keyword matched at all, default to Self only
  // when situation keywords also didn't fire strongly (avoid "dog food" → Self)
  let chosenSubject = subjectMatch.score > 0 ? subjectMatch.pattern : SUBJECT_PATTERNS.find(p => p.subject === 'Self');

  // Hard override: if situation is Pet Food Refill, subject must be Pet
  if (situationMatch.score > 0 && situationMatch.pattern.situation === 'Pet Food Refill') {
    chosenSubject = SUBJECT_PATTERNS.find(p => p.subject === 'Pet');
  }

  // Hard override: if situation is Baby Care, subject must be Baby
  if (situationMatch.score > 0 && situationMatch.pattern.situation === 'Baby Care') {
    chosenSubject = SUBJECT_PATTERNS.find(p => p.subject === 'Baby');
  }

  // Resolve situation — use best match, fall back to subject's default
  const chosenSituation = situationMatch.score > 0
    ? situationMatch.pattern
    : SITUATION_PATTERNS.find(s => s.situation === chosenSubject.situation) || SITUATION_PATTERNS[SITUATION_PATTERNS.length - 1];

  const confidence = Math.min(100, Math.round((subjectMatch.score * 10) + (situationMatch.score * 12)));
  const clarificationRequired = confidence < 20 && situationMatch.score === 0;

  // Resolve petType for Pet subject
  const petType = chosenSubject.subject === 'Pet' ? detectPetType(text) : null;

  return {
    subject: chosenSubject.subject,
    petType,
    category: chosenSubject.category,
    situation: chosenSituation.situation,
    missionName: chosenSituation.missionName,
    allowedCategories: chosenSituation.allowedCategories || chosenSubject.allowedCategories || [],
    confidence,
    clarificationRequired,
    clarification: clarificationRequired ? chosenSubject.clarification : null
  };
}

export function getClarificationPrompt(subjectDetection) {
  return subjectDetection?.clarification?.question || 'Could you clarify what you need?';
}

export default { classifyShoppingNeed, getClarificationPrompt };
