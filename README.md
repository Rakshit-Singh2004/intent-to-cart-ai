# Intent-to-Cart AI — V3

> Turn real-life situations into ready-to-checkout carts in seconds.
> No searching. No browsing. No comparing. Just describe the situation.

---

## What It Does

**Intent-to-Cart AI** understands a natural language situation and automatically builds, optimizes, and presents a complete shopping cart — with zero manual steps from the user.

```
Describe Situation
       ↓
AI Detects Subject + Situation
       ↓
AI Builds Category-Validated Cart
       ↓
AI Optimizes Cart (Dynamic Scoring)
       ↓
AI Generates Budget / Standard / Premium Packs
       ↓
User Reviews — Edits Optional
       ↓
Checkout → Order Confirmation → Delivery Tracking
```

---

## Demo Examples

| User Says | Subject | Situation | Mission |
|-----------|---------|-----------|---------|
| "Ran out of dog food" | Pet (Dog) | Pet Food Refill | Pet Care Refill |
| "My baby has fever" | Baby | Baby Care | Baby Care Emergency |
| "Friends coming over in 30 mins" | Guest | Guest Arrival | Guest Welcome |
| "Exam tomorrow, need coffee" | Self | Study Session | Exam Preparation |
| "Power cut at home" | Self | Power Cut | Emergency Lighting |
| "Movie night snacks needed" | Self | Movie Night | Entertainment Essentials |
| "It's raining and I need to go out" | Self | Rainy Day | Rain Preparedness |
| "Gym session done, need recovery" | Self | Gym Recovery | Recovery Reset |

---

## V3 Features

### 1. Subject Detection Engine
Detects who the shopping is for before anything else runs.

Supported subjects: **Self · Family · Guest · Baby · Child · Pet**

```
"Ran out of dog food"  →  Subject: Pet  |  Pet Type: Dog
"My baby has fever"    →  Subject: Baby
"Friends coming over"  →  Subject: Guest
```

Subject detection uses specificity-weighted keyword scoring — longer, more specific phrases score higher, preventing false matches (e.g. "I need" never overrides "dog food").

---

### 2. Situation Detection Engine
Classifies the exact real-world scenario from 13 supported situations.

| Situation | Mission Name |
|-----------|-------------|
| Pet Food Refill | Pet Care Refill |
| Guest Arrival | Guest Welcome |
| House Party | Quick Guest Preparation |
| Movie Night | Entertainment Essentials |
| Study Session | Exam Preparation |
| Rainy Day | Rain Preparedness |
| Baby Care | Baby Care Emergency |
| First Aid | First Aid Response |
| Power Cut | Emergency Lighting |
| Gym Recovery | Recovery Reset |
| Road Trip | Travel Essentials |
| Office Essentials | Office Readiness |
| Grocery Refill | Household Refill |

The situation `General` is never used. Every input maps to one of the above.

---

### 3. Automatic Workflow — Zero Continue Buttons
The user clicks **Go** once. The AI handles everything automatically.

Loading sequence shown while processing:
```
🧠 Analyzing your situation...
✓ Subject detected
✓ Situation identified
✓ Cart generated
✓ Cart optimized
✓ Smart packs prepared
→ Results displayed
```

No intermediate Continue buttons. No manual workflow advancement.

---

### 4. Category Validation Engine
Every recommended product is validated against the detected situation's allowed categories. Invalid products are filtered before display.

| Situation | Allowed Categories | Never Includes |
|-----------|-------------------|----------------|
| Pet Food Refill | Pet Care | Stationery, Food, Cleaning |
| Study Session | Stationery, Beverages | Pet Care, Party |
| Power Cut | Electronics, Home | Food, Pet Care |
| Baby Care | Health, Baby Care | Stationery, Snacks |

---

### 5. Editable Cart with Remove / Replace / Why
Every product card has three actions:

- **Remove** — removes the item; all scores recalculate instantly
- **Replace** — shows category-matched alternatives only (Pet Care → Pet Care, never Pet Care → Stationery)
- **Why?** — explains why this specific product was recommended

If no valid replacement exists, the UI shows: *"No alternative available"*

---

### 6. Reactive Cart State Management
Every cart modification triggers automatic recalculation of:

- Optimization Score
- Cart Health
- Pack Scores
- Recommended Pack
- Missing Essentials
- Delivery Estimate
- Order Total

No manual refresh. No page reload. Fully event-driven.

---

### 7. Dynamic Optimization Score
Score is calculated live from the actual cart contents. Never hardcoded.

| Dimension | Max Points | How It's Calculated |
|-----------|-----------|---------------------|
| Availability | 40 | % of items in stock |
| Delivery Speed | 30 | Average delivery time vs urgency window |
| Budget Fit | 20 | Cart total vs pack target budget |
| Intent Match | 10 | % of items matching detected situation tokens |
| **Total** | **100** | Sum of all dimensions |

Hover the score badge to see a full breakdown with per-dimension scores and reasons.

---

### 8. Cart Health
Derived from optimization score. Only one health status exists at a time.

| Score | Health |
|-------|--------|
| 95–100 | 🟢 Excellent |
| 80–94 | 🟡 Good |
| 60–79 | 🟠 Fair |
| Below 60 | 🔴 Needs Improvement |

---

### 9. Zero-Decision Pack System
Every situation generates exactly three packs with enforced price ordering.

```
Budget Pack  <  Standard Pack  <  Premium Pack
  (price)          (price)          (price)
```

**Example — Pet Food Refill:**
| Pack | Contents | Price |
|------|----------|-------|
| Budget | Dog Food + Poop Bags | ~₹427 |
| Standard | Dog Food + Treats + Poop Bags | ~₹557 |
| Premium | Dog Food + Treats + Dental Chews + Bowl + Chew Sticks | ~₹816 |

All items are strictly from the Pet Care category.

---

### 10. Recommended Pack Logic
The recommended pack is determined by a weighted formula — never random.

```
Final Score = (Optimization Score × 0.6) + (Value Ratio × 0.3) + (Completeness × 0.1)
```

The recommended pack badge shows: *"Recommended because it offers the best balance between cost, completeness, and delivery speed."*

---

### 11. Mission System
Every situation maps to a specific mission name displayed prominently.

```
Pet Food Refill  →  Pet Care Refill
Movie Night      →  Entertainment Essentials
Guest Arrival    →  Guest Welcome
Study Session    →  Exam Preparation
Power Cut        →  Emergency Lighting
```

Generic labels like "Zero-Decision Shopping" are never used.

---

### 12. Missing Essentials Engine
After cart generation, complementary items are suggested based on situation.

| Situation | Suggested Essentials |
|-----------|---------------------|
| Pet Food Refill | Dog Treats, Dental Chews |
| Movie Night | Popcorn Tub, Disposable Cups |
| Guest Arrival | Tissues Box, Soap Bar |
| Baby Care | ORS Sachets, Wet Wipes |
| Study Session | Highlighter Set, Sticky Notes |

Items are **optional** and never auto-added.

---

### 13. Checkout & Delivery Flow
Delivery tracking is shown **only after** the user clicks Order Now.

```
Select Pack or Custom Cart
       ↓
Review Order Summary (total, delivery fee, items, pack)
       ↓
Click "Order Now"
       ↓
Order Confirmed (Order ID, Mission, Pack Tier, Items, Total, ETA)
       ↓
Delivery Timeline (demo simulation):
  0–20s  →  Packing
  20–40s →  Out For Delivery
  40–60s →  Delivered
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js 22, Express |
| AI Engine | Amazon Bedrock (Claude 3 Sonnet) with local fallback |
| State | React useState + useEffect (event-driven reactive) |
| Deployment | Docker, Docker Compose |

---

## Project Structure

```
intent-to-cart-ai/
├── backend/
│   └── src/
│       ├── data/
│       │   ├── productCatalog.js          # 80+ products across all categories
│       │   ├── zeroDecisionPacks.js       # 13 scenarios × 3 tiers (Budget/Standard/Premium)
│       │   └── optimizationMockData.js    # Mock inventory & delivery profiles
│       ├── routes/
│       │   ├── intent.js                  # POST /api/intent/analyze (main pipeline)
│       │   ├── cart.js                    # Cart CRUD + checkout
│       │   ├── products.js                # Product catalog API
│       │   ├── optimization.js            # Standalone optimization endpoint
│       │   └── zeroDecision.js            # Standalone pack generation endpoint
│       ├── services/
│       │   ├── classificationService.js   # Subject + Situation detection engine
│       │   ├── bedrockService.js          # Amazon Bedrock + local fallback
│       │   ├── cartService.js             # Product matching + cart totals
│       │   ├── optimizationService.js     # Dynamic cart optimization
│       │   ├── zeroDecisionService.js     # Pack generation engine
│       │   ├── scoringService.js          # Score calculation utilities
│       │   └── validationService.js       # Category validation + missing essentials
│       └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ResultsPage.jsx            # Single results page (all sections visible)
│       │   ├── SituationPacks.jsx         # Budget / Standard / Premium pack selector
│       │   ├── CartSummary.jsx            # Order summary + checkout button
│       │   ├── OrderConfirmation.jsx      # Post-order confirmation
│       │   ├── DeliveryProgress.jsx       # Delivery timeline (post-checkout only)
│       │   ├── LoadingSequence.jsx        # 6-step AI processing animation
│       │   ├── ExamplePrompts.jsx         # Quick chips + example queries
│       │   ├── ScoreBreakdownTooltip.jsx  # Hover score breakdown
│       │   ├── CartHealthBadge.jsx        # Single health status badge
│       │   ├── MissingEssentials.jsx      # Optional add-on suggestions
│       │   ├── IntentInput.jsx            # Natural language input
│       │   └── Header.jsx                 # App header
│       ├── utils/
│       │   ├── api.js                     # Backend API calls
│       │   └── cartReactive.js            # Reactive score + health recalculation
│       └── App.jsx                        # Main app orchestrator
│
├── docs/
│   └── zero-decision-engine.md
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Quick Start

```bash
# Clone and setup
git clone https://github.com/Rakshit-Singh2004/intent-to-cart-ai
cd intent-to-cart-ai

# Run Backend (Terminal 1)
cd backend
npm install
npm run dev
# Runs on http://localhost:3001

# Run Frontend (Terminal 2)
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## Docker Deployment

```bash
docker-compose up --build
# App available at http://localhost:3001
```

---

## AWS Bedrock Setup (Optional)

The app runs fully with its local fallback engine. AWS credentials unlock Claude 3 Sonnet for richer AI reasoning.

Create `backend/.env` from `backend/.env.example`:

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

Without credentials, the fallback engine handles all 13 supported situations with accurate, category-correct recommendations.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/intent/analyze` | Full pipeline: classify → AI → match → optimize → packs |
| POST | `/api/intent/refine` | Re-analyze with additional context |
| POST | `/api/cart/create` | Create cart with mission metadata |
| POST | `/api/cart/:id/checkout` | Place order, returns order ID + ETA |
| GET | `/api/products` | List products (supports `?category=` and `?search=`) |
| GET | `/api/products/categories` | List all categories |
| POST | `/api/optimization/cart` | Standalone cart optimization |
| POST | `/api/zero-decision/generate` | Standalone pack generation |
| GET | `/api/health` | Service health check |

### POST `/api/intent/analyze` — Request

```json
{
  "input": "Ran out of dog food"
}
```

### POST `/api/intent/analyze` — Response

```json
{
  "success": true,
  "data": {
    "intent": {
      "type": "Pet Care",
      "urgency": "High",
      "subject": "Pet",
      "situation": "Pet Food Refill"
    },
    "subjectDetection": {
      "subject": "Pet",
      "petType": "Dog",
      "category": "Pet Supplies",
      "situation": "Pet Food Refill",
      "missionName": "Pet Care Refill",
      "allowedCategories": ["Pet Care"],
      "confidence": 85
    },
    "reasoning": "Detected that the dog's food supply is depleted...",
    "cart": {
      "name": "Dog Care Refill Kit",
      "estimatedNeedTime": "Within 30 mins",
      "products": [ ... ]
    },
    "optimization": {
      "optimization_score": 92,
      "cart_health": "Good",
      "score_breakdown": { ... }
    },
    "zeroDecision": {
      "scenario": { "missionName": "Pet Care Refill" },
      "packs": [
        { "tier": "Budget", "totals": { "total": 427 }, ... },
        { "tier": "Standard", "totals": { "total": 557 }, "recommended": true, ... },
        { "tier": "Premium", "totals": { "total": 816 }, ... }
      ]
    },
    "missingEssentials": [
      { "name": "Dog Treats", "reason": "Complement food refills with rewarding treats.", "price": 129 }
    ]
  }
}
```

---

## V3 vs Previous Version

| Area | Before (V1/V2) | After (V3) |
|------|---------------|------------|
| "Ran out of dog food" subject | Self / Hungry | Pet (Dog) |
| Default situation | General | Always specific (13 situations) |
| Continue buttons | 4 manual steps | 0 — fully automatic |
| Pack pricing | Premium could < Standard | Budget < Standard < Premium enforced |
| Optimization score | Partially hardcoded | 100% dynamic from cart state |
| Product validation | No category check | Strict allowed-category filter |
| Cart edits | No downstream updates | Reactive — all metrics recalculate |
| Delivery tracking | Shown before checkout | Only shown after Order Now |
| Recommended pack | Random / first | Weighted score formula |
| Missing essentials | Static list | Situation-aware, with prices |
| Mission names | "Zero-Decision Shopping" | Specific per situation |
| Replace product | Not available | Same-category replacements only |
| Why this item? | Not available | Per-product reasoning |

---

*"From intent to doorstep in under a minute."*
