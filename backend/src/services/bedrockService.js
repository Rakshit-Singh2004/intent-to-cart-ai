import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';

dotenv.config();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  } : {})
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

/**
 * Analyzes user intent using Amazon Bedrock (Claude).
 * Pre-classification context is injected to enforce subject/situation accuracy.
 */
export async function analyzeIntent(userInput, context = {}) {
  const { subjectDetection } = context;

  const subjectContext = subjectDetection ? `
Pre-Classification Results (MUST be respected):
- Subject: ${subjectDetection.subject}
- Pet Type: ${subjectDetection.petType || 'N/A'}
- Category: ${subjectDetection.category}
- Situation: ${subjectDetection.situation}
- Mission: ${subjectDetection.missionName}
- Allowed Product Categories: ${subjectDetection.allowedCategories.join(', ')}
- Confidence: ${subjectDetection.confidence}
` : '';

  const allowedCategoriesNote = subjectDetection?.allowedCategories?.length
    ? `\n\nCRITICAL: Only recommend products from these categories: ${subjectDetection.allowedCategories.join(', ')}. Never recommend products from other categories (no stationery for pet requests, no pet food for study requests, etc.).`
    : '';

  const prompt = `You are an AI assistant for a quick-commerce platform. A customer described a real-life situation and you must understand their intent and recommend the most relevant products they need RIGHT NOW.

Customer Input: "${userInput}"
${subjectContext}
Analyze this input and respond with ONLY a valid JSON object (no other text, no markdown) with this exact structure:
{
  "intent": {
    "type": "string (one of: Health, Food, Emergency, Celebration, Cleaning, Personal Care, Work, Pet Care, Weather, Baby Care)",
    "urgency": "string (one of: Critical, High, Medium, Low)",
    "subject": "string (MUST match pre-classification subject: ${subjectDetection?.subject || 'Self'})",
    "situation": "string (MUST match pre-classification situation: ${subjectDetection?.situation || 'detect from input'})",
    "emotion": "string (e.g. Worried, Stressed, Excited, Caring)"
  },
  "reasoning": "string (specific reasoning explaining WHY these products for THIS situation - reference the subject and situation explicitly, never use generic phrases like 'Needs food' or 'Hungry' for non-food situations)",
  "recommended_products": [
    {
      "name": "string (product name that exists in ${subjectDetection?.allowedCategories?.join(', ') || 'the relevant'} category)",
      "reason": "string (specific reason this product is needed for the detected situation)",
      "priority": "number (1 = most important)",
      "tags": ["relevant product tags matching the catalog"]
    }
  ],
  "cart_name": "string (specific cart name based on the mission, e.g. 'Pet Care Refill Kit' NOT 'Shopping Cart')",
  "estimated_need_time": "string (e.g. 'Immediately', 'Within 30 mins', 'Today')"
}

Guidelines:
- CRITICAL: If subject is Pet, ONLY recommend Pet Care products (dog food, treats, toys, bowls). Never recommend bread, coffee, notebooks for pet requests.
- CRITICAL: If subject is Baby, ONLY recommend Health or Baby Care products.
- CRITICAL: If situation is Study Session, ONLY recommend Stationery, Beverages, Food products.
- CRITICAL: If situation is Power Cut, ONLY recommend Electronics or Home emergency products.
- Recommend 3-6 products that directly serve the detected situation
- Prioritize essentials first, comfort items second
- The cart_name must reflect the specific mission, never a generic name${allowedCategoriesNote}`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  };

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify(payload),
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const assistantMessage = responseBody.content[0].text;

    // Strip any markdown code fences if present
    const cleaned = assistantMessage.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Bedrock API Error:', error.message);
    return fallbackIntentAnalysis(userInput, context);
  }
}

/**
 * Fallback intent analysis when Bedrock is unavailable.
 * All pattern matching respects the pre-classification subject/situation.
 */
function fallbackIntentAnalysis(userInput, context = {}) {
  const input = userInput.toLowerCase();
  const { subjectDetection } = context;

  // ── PET CARE ─────────────────────────────────────────────────────────────
  if (subjectDetection?.subject === 'Pet' || subjectDetection?.situation === 'Pet Food Refill') {
    const petType = subjectDetection?.petType || 'Dog';
    const isdog = petType === 'Dog' || input.includes('dog') || input.includes('puppy');
    return {
      intent: { type: 'Pet Care', urgency: 'High', subject: 'Pet', situation: 'Pet Food Refill', emotion: 'Caring' },
      reasoning: `Detected that the ${petType.toLowerCase()}'s food supply is depleted and needs immediate replenishment. Recommending essential pet food and supplementary treats.`,
      recommended_products: [
        { name: isdog ? 'Dog Food (1kg Premium)' : 'Cat Food (500g)', reason: `Primary nutrition for the ${petType.toLowerCase()}`, priority: 1, tags: ['pet', isdog ? 'dog' : 'cat', 'food'] },
        { name: 'Dog Treats', reason: 'Reward and supplement for the pet', priority: 2, tags: ['pet', 'dog', 'treats'] },
        { name: 'Pet Bowl', reason: 'Required for serving food and water', priority: 3, tags: ['pet', 'dog', 'bowl'] }
      ],
      cart_name: `${petType} Care Refill Kit`,
      estimated_need_time: 'Within 30 mins'
    };
  }

  // ── BABY CARE ────────────────────────────────────────────────────────────
  if (subjectDetection?.subject === 'Baby' || subjectDetection?.situation === 'Baby Care') {
    return {
      intent: { type: 'Baby Care', urgency: 'Critical', subject: 'Baby', situation: 'Baby Care', emotion: 'Worried' },
      reasoning: 'Detected a baby health emergency requiring immediate care supplies. Prioritizing fever management, hydration, and hygiene products.',
      recommended_products: [
        { name: 'Digital Thermometer', reason: 'Essential for monitoring baby temperature', priority: 1, tags: ['fever', 'thermometer', 'baby', 'health'] },
        { name: 'Paracetamol Syrup (Kids)', reason: 'Safe fever reduction for babies', priority: 1, tags: ['fever', 'baby', 'medicine', 'paracetamol'] },
        { name: 'ORS Sachets (Pack of 10)', reason: 'Prevent dehydration during fever', priority: 2, tags: ['baby', 'ors', 'electrolyte', 'fever'] },
        { name: 'Wet Wipes (Pack of 72)', reason: 'Cooling and cleaning for baby comfort', priority: 3, tags: ['baby', 'wipes', 'hygiene'] }
      ],
      cart_name: 'Baby Fever Care Kit',
      estimated_need_time: 'Immediately'
    };
  }

  // ── STUDY SESSION ────────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Study Session') {
    return {
      intent: { type: 'Work', urgency: 'High', subject: 'Self', situation: 'Study Session', emotion: 'Stressed' },
      reasoning: 'Detected an upcoming exam or study session requiring focus, alertness, and study supplies. Prioritizing energy drinks and stationery.',
      recommended_products: [
        { name: 'Coffee (Instant, 50g)', reason: 'Maintain alertness during long study hours', priority: 1, tags: ['coffee', 'study', 'awake', 'energy'] },
        { name: 'Notebook (200 Pages)', reason: 'Essential for taking study notes', priority: 1, tags: ['study', 'notes', 'writing', 'notebook'] },
        { name: 'Highlighter Set (5 Colors)', reason: 'Mark important sections for revision', priority: 2, tags: ['study', 'highlight', 'exam'] },
        { name: 'Energy Drink (250ml)', reason: 'Quick energy boost during intensive study', priority: 2, tags: ['energy', 'study', 'awake'] },
        { name: 'Sticky Notes (Pack of 3)', reason: 'Quick reminders and memory aids', priority: 3, tags: ['study', 'notes', 'reminder'] }
      ],
      cart_name: 'Exam Preparation Kit',
      estimated_need_time: 'Within 15 mins'
    };
  }

  // ── POWER CUT ────────────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Power Cut') {
    return {
      intent: { type: 'Emergency', urgency: 'Critical', subject: 'Self', situation: 'Power Cut', emotion: 'Stressed' },
      reasoning: 'Power outage detected requiring immediate emergency lighting and charging solutions.',
      recommended_products: [
        { name: 'LED Flashlight', reason: 'Immediate portable light source', priority: 1, tags: ['power-cut', 'flashlight', 'emergency', 'light'] },
        { name: 'Candles (Pack of 6)', reason: 'Ambient backup lighting during outage', priority: 1, tags: ['power-cut', 'candle', 'light'] },
        { name: 'AA Batteries (Pack of 4)', reason: 'Power supply for flashlight', priority: 2, tags: ['battery', 'power', 'emergency'] },
        { name: 'Power Bank (10000mAh)', reason: 'Keep phone charged for communication', priority: 2, tags: ['phone', 'charge', 'power', 'emergency'] }
      ],
      cart_name: 'Power Outage Emergency Kit',
      estimated_need_time: 'Immediately'
    };
  }

  // ── MOVIE NIGHT ──────────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Movie Night') {
    return {
      intent: { type: 'Celebration', urgency: 'Medium', subject: 'Self', situation: 'Movie Night', emotion: 'Excited' },
      reasoning: 'Detected a planned movie night requiring snacks and beverages for entertainment.',
      recommended_products: [
        { name: 'Chips (Large, Assorted)', reason: 'Classic movie snack', priority: 1, tags: ['snacks', 'chips', 'movie'] },
        { name: 'Soft Drinks (6 Pack)', reason: 'Beverages for the movie', priority: 1, tags: ['drinks', 'movie', 'cold'] },
        { name: 'Popcorn Tub', reason: 'Quintessential movie snack', priority: 1, tags: ['popcorn', 'movie', 'snack'] },
        { name: 'Chocolate Cake Slice', reason: 'Sweet treat for the evening', priority: 2, tags: ['dessert', 'cake', 'sweet'] }
      ],
      cart_name: 'Movie Night Entertainment Kit',
      estimated_need_time: 'Within 30 mins'
    };
  }

  // ── HOUSE PARTY / GUEST ARRIVAL ──────────────────────────────────────────
  if (subjectDetection?.situation === 'House Party' || subjectDetection?.situation === 'Guest Arrival') {
    return {
      intent: { type: 'Celebration', urgency: 'High', subject: 'Guest', situation: subjectDetection.situation, emotion: 'Excited' },
      reasoning: 'Detected guests arriving or a party being hosted. Prioritizing drinks, snacks, and serving supplies.',
      recommended_products: [
        { name: 'Soft Drinks (6 Pack)', reason: 'Beverages for guests', priority: 1, tags: ['party', 'drinks', 'guests'] },
        { name: 'Chips (Large, Assorted)', reason: 'Snacks for everyone', priority: 1, tags: ['party', 'snacks', 'guests'] },
        { name: 'Party Cups (Pack of 25)', reason: 'Serving cups for guests', priority: 2, tags: ['party', 'cups', 'guests'] },
        { name: 'Paper Plates (Pack of 20)', reason: 'Easy serving and cleanup', priority: 2, tags: ['party', 'plates', 'guests'] }
      ],
      cart_name: subjectDetection.situation === 'House Party' ? 'Instant Party Kit' : 'Quick Guest Preparation Kit',
      estimated_need_time: 'Within 30 mins'
    };
  }

  // ── RAINY DAY ────────────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Rainy Day') {
    return {
      intent: { type: 'Weather', urgency: 'High', subject: 'Self', situation: 'Rainy Day', emotion: 'Stressed' },
      reasoning: 'Rainy conditions detected requiring protective gear for going outside.',
      recommended_products: [
        { name: 'Umbrella (Compact)', reason: 'Essential rain protection for commuting', priority: 1, tags: ['rain', 'umbrella', 'weather'] },
        { name: 'Raincoat (Disposable)', reason: 'Full body protection from heavy rain', priority: 2, tags: ['rain', 'raincoat', 'weather'] }
      ],
      cart_name: 'Rain Protection Kit',
      estimated_need_time: 'Immediately'
    };
  }

  // ── FIRST AID ────────────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'First Aid') {
    return {
      intent: { type: 'Health', urgency: 'Critical', subject: 'Self', situation: 'First Aid', emotion: 'Worried' },
      reasoning: 'Minor injury detected requiring immediate first aid supplies for wound care and infection prevention.',
      recommended_products: [
        { name: 'Band-Aid Strips (Pack of 20)', reason: 'Cover and protect the wound', priority: 1, tags: ['wound', 'bandage', 'first-aid'] },
        { name: 'Antiseptic Liquid (100ml)', reason: 'Prevent infection at the wound site', priority: 1, tags: ['wound', 'antiseptic', 'first-aid'] },
        { name: 'Cotton Balls (Pack of 50)', reason: 'Clean the wound area', priority: 2, tags: ['wound', 'cotton', 'first-aid'] }
      ],
      cart_name: 'First Aid Emergency Kit',
      estimated_need_time: 'Immediately'
    };
  }

  // ── GYM RECOVERY ─────────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Gym Recovery') {
    return {
      intent: { type: 'Health', urgency: 'Medium', subject: 'Self', situation: 'Gym Recovery', emotion: 'Tired' },
      reasoning: 'Post-workout recovery session detected. Prioritizing protein, hydration, and energy replenishment.',
      recommended_products: [
        { name: 'Energy Drink (250ml)', reason: 'Replenish energy after intense workout', priority: 1, tags: ['energy', 'recovery', 'gym'] },
        { name: 'ORS Sachets (Pack of 10)', reason: 'Electrolyte replenishment after exercise', priority: 1, tags: ['ors', 'hydration', 'recovery'] },
        { name: 'Protein Bar (Pack of 4)', reason: 'Protein intake for muscle recovery', priority: 2, tags: ['protein', 'recovery', 'gym'] },
        { name: 'Milk (1 Liter)', reason: 'Natural protein source for recovery', priority: 3, tags: ['milk', 'protein', 'recovery'] }
      ],
      cart_name: 'Gym Recovery Kit',
      estimated_need_time: 'Within 30 mins'
    };
  }

  // ── ROAD TRIP ────────────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Road Trip') {
    return {
      intent: { type: 'Work', urgency: 'Medium', subject: 'Self', situation: 'Road Trip', emotion: 'Excited' },
      reasoning: 'Road trip detected requiring travel snacks, beverages, and charging essentials.',
      recommended_products: [
        { name: 'Chips (Large, Assorted)', reason: 'Travel snack for the journey', priority: 1, tags: ['snacks', 'chips', 'travel'] },
        { name: 'Soft Drinks (6 Pack)', reason: 'Beverages for the road', priority: 1, tags: ['drinks', 'travel', 'cold'] },
        { name: 'Power Bank (10000mAh)', reason: 'Phone charging and navigation during travel', priority: 2, tags: ['power', 'charge', 'travel'] },
        { name: 'Coffee (Instant, 50g)', reason: 'Energy boost for long drive', priority: 2, tags: ['coffee', 'energy', 'travel'] }
      ],
      cart_name: 'Road Trip Essentials Kit',
      estimated_need_time: 'Within 30 mins'
    };
  }

  // ── OFFICE ESSENTIALS ────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Office Essentials') {
    return {
      intent: { type: 'Work', urgency: 'Low', subject: 'Self', situation: 'Office Essentials', emotion: 'Neutral' },
      reasoning: 'Office work session detected requiring stationery and beverages for productivity.',
      recommended_products: [
        { name: 'Notebook (200 Pages)', reason: 'Note-taking for meetings and work', priority: 1, tags: ['notes', 'writing', 'stationery', 'work'] },
        { name: 'Pen Set (Blue, Black, Red)', reason: 'Essential writing tools', priority: 1, tags: ['writing', 'pen', 'stationery', 'work'] },
        { name: 'Coffee (Instant, 50g)', reason: 'Stay focused during work hours', priority: 2, tags: ['coffee', 'energy', 'work'] },
        { name: 'Sticky Notes (Pack of 3)', reason: 'Quick task reminders', priority: 3, tags: ['notes', 'reminder', 'work'] }
      ],
      cart_name: 'Office Readiness Kit',
      estimated_need_time: 'Within 15 mins'
    };
  }

  // ── GROCERY REFILL ───────────────────────────────────────────────────────
  if (subjectDetection?.situation === 'Grocery Refill') {
    return {
      intent: { type: 'Food', urgency: 'Medium', subject: 'Family', situation: 'Grocery Refill', emotion: 'Neutral' },
      reasoning: 'Grocery restock required. Recommending kitchen staples and daily essentials.',
      recommended_products: [
        { name: 'Milk (1 Liter)', reason: 'Daily dairy staple', priority: 1, tags: ['milk', 'dairy', 'breakfast'] },
        { name: 'Bread (White, Sliced)', reason: 'Versatile daily staple', priority: 1, tags: ['bread', 'breakfast', 'food'] },
        { name: 'Eggs (Pack of 6)', reason: 'Protein staple for cooking', priority: 2, tags: ['eggs', 'protein', 'cooking'] },
        { name: 'Butter (200g)', reason: 'Essential for cooking and breakfast', priority: 2, tags: ['butter', 'breakfast', 'food'] }
      ],
      cart_name: 'Grocery Refill Kit',
      estimated_need_time: 'Today'
    };
  }

  // ── GENERIC FALLBACK (should rarely reach here) ──────────────────────────
  const subject = subjectDetection?.subject || 'Self';
  const situation = subjectDetection?.situation || 'Office Essentials';
  const missionName = subjectDetection?.missionName || 'Office Readiness';

  return {
    intent: { type: 'Work', urgency: 'Low', subject, situation, emotion: 'Neutral' },
    reasoning: `Detected situation: ${situation}. Preparing essential items for the ${missionName} mission.`,
    recommended_products: [
      { name: 'Notebook (200 Pages)', reason: 'General purpose note-taking', priority: 1, tags: ['notes', 'writing', 'stationery'] },
      { name: 'Coffee (Instant, 50g)', reason: 'Stay productive and focused', priority: 2, tags: ['coffee', 'energy', 'work'] }
    ],
    cart_name: `${missionName} Kit`,
    estimated_need_time: 'Within 15 mins'
  };
}

export default { analyzeIntent };
