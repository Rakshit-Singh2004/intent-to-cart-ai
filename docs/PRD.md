# Intent-to-Cart AI — Product Requirements Document (PR-FAQ)

> Written in Amazon's **Working Backwards** style: a mock Press Release, followed
> by an FAQ, then the requirements that make the press release true. Read the
> press release first — if it isn't compelling, the product isn't worth building.

| | |
|---|---|
| **Project** | Intent-to-Cart AI |
| **Tagline** | From "what you need" to "ready to checkout" in one sentence. |
| **Category** | Generative AI · Quick Commerce · Shopping Agents |
| **Built on** | Amazon Bedrock (Anthropic Claude) · Node.js/Express · React/Vite |
| **Status** | Working prototype (hackathon MVP) |
| **Doc owner** | Rakshit Singh |
| **Last updated** | June 2026 |

---

## 1. Press Release

### Intent-to-Cart AI turns a single sentence into a ready-to-checkout cart in seconds

**Shoppers describe a situation in plain language — "my baby has a fever," "house party tonight," "exam tomorrow" — and instantly get a fully optimized, ready-to-buy cart instead of searching, comparing, and second-guessing dozens of products.**

**BENGALURU — June 2026 —** Today we launched **Intent-to-Cart AI**, a generative-AI shopping agent for quick commerce that converts a natural-language *intent* into a complete, optimized cart. Powered by Amazon Bedrock, it understands *who* the shopper is buying for and *what situation* they're in, then assembles ready-made "situation packs" optimized for availability, delivery speed, and budget — eliminating the dozens of micro-decisions that stand between a need and a delivered order.

Quick-commerce promises groceries in 10–30 minutes, but the **decision time still takes longer than the delivery**. A parent whose child spikes a fever at midnight doesn't want to browse a "Health" category and weigh five thermometers — they want the right cart, now. Today shoppers abandon carts, forget essentials (the ORS to go with the paracetamol), and overpay because comparing options under stress is hard.

Intent-to-Cart AI removes that work. The shopper types one sentence. The agent classifies the subject (Baby, Pet, Guest, Self, Family, Child) and the situation (15+ scenarios from *Medicine Run* to *Power Cut*), then generates **three ready-to-buy packs — Budget, Standard, and Premium** — each independently optimized and scored for "cart health." Out-of-stock items are auto-replaced with in-stock equivalents, slow items are swapped for ones that meet the urgency window, and every substitution comes with a plain-English reason. The shopper picks a pack — or the recommended one — and checks out.

"Search-based shopping makes the customer do the agent's job," said the team behind Intent-to-Cart AI. "We worked backwards from a stressed parent at midnight. They shouldn't have to *shop* — they should just say what's happening and trust that the cart is right, complete, and affordable. That's a zero-decision experience."

Using Intent-to-Cart AI is simple. A shopper opens the app and types *"my baby has a fever and I need medicine."* In under two seconds the agent recognizes a **Baby Care emergency**, builds a cart with a thermometer, infant paracetamol, ORS, and fever patches, confirms each item is in stock and deliverable in time, and presents Budget/Standard/Premium options with a transparent score showing why the cart is healthy. If the request mixes domains — *"snacks and headache medicine"* — it builds a single combined cart spanning both.

"I typed one line during a power cut and had candles, a flashlight, and batteries in my cart before I'd have finished typing into a search bar," said an early tester. "It even told me the batteries it picked were the ones that could actually arrive in 20 minutes."

Intent-to-Cart AI is available now as a hackathon prototype. To try it, describe what you need in your own words and let the agent do the shopping.

---

## 2. Customer & Problem (Working Backwards)

**Who is the customer?**
Time-pressed quick-commerce shoppers in India — parents, students, working professionals, and hosts — who know *the situation they're in* but not the exact products that solve it, and who are often shopping under stress or time pressure.

**What is the customer problem or opportunity?**
Quick commerce optimized *delivery* (10–30 min) but not *decision-making*. Customers still:
- Translate a need ("baby has fever") into a search query, then into individual products.
- Compare near-identical SKUs with no clear signal of which fits their urgency/budget.
- Forget complementary essentials (ORS with paracetamol; batteries with a flashlight).
- Hit out-of-stock items mid-cart and start over.
- Abandon carts because the cognitive load exceeds the value of the order.

**What is the most important customer benefit?**
**Zero-decision shopping:** one sentence in, a correct, complete, optimized, ready-to-checkout cart out.

**How do we know what customers need/want?**
Observed quick-commerce behavior (high cart abandonment, repetitive "situation" searches), and the recurring pattern that customers describe *situations*, not *SKUs*.

**What does the customer experience look like?**
Type a sentence → see a recognized situation + 3 scored packs → tap the recommended pack → checkout. No category browsing, no comparison grids, no forgotten essentials.

---

## 3. Product Tenets

1. **The customer states intent; the agent makes decisions.** Never push product-selection work back to the user.
2. **Complete over minimal.** A cart that forgets the ORS is a failed cart, even if every item it *did* add is perfect.
3. **Every decision is explainable.** Each replacement and recommendation carries a human-readable reason.
4. **Optimize for the moment.** Availability and delivery-within-urgency outrank price; price still matters.
5. **Never block on ambiguity unnecessarily.** Ask for clarification only when the request is genuinely vague.
6. **Graceful degradation.** The experience works even when the LLM is unavailable.

---

## 4. Solution Overview

Intent-to-Cart AI is a three-layer agent:

1. **Subject & Situation Detection** — identifies *who* (Baby, Pet, Guest, Child, Family, Self) and *what situation* (15+ scenarios). Supports **multi-intent** ("snacks and medicine") and only asks for clarification when no situation is detectable.
2. **Cart Optimization** — for any candidate cart, validates stock, enforces the urgency delivery window, fits budget, and replaces items that fail — each with a reason. Produces a 0–100 **optimization score** and a **cart-health** label.
3. **Zero-Decision Pack Engine** — turns the detected situation into **three ready-made packs (Budget / Standard / Premium)**, each independently optimized, price-ordered, and one flagged as **Recommended** based on the best balance of cost, completeness, and delivery speed.

**Intelligence layer:** Amazon Bedrock (Anthropic Claude) performs intent understanding and recommendation; a deterministic rule/template engine provides identical-shape output as a **fallback** so the product never hard-fails.

---

## 5. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Accept a free-text shopping intent and return a structured intent (subject, situation, urgency, budget if stated). | P0 |
| FR-2 | Detect subject among Baby, Pet, Child, Family, Guest, Self. | P0 |
| FR-3 | Detect situation among 15+ scenarios (Medicine Run, First Aid, Baby Care, Study Session, House Party, Movie Night, Snack Run, Rainy Day, Power Cut, Gym Recovery, Road Trip, Guest Arrival, Office Essentials, Grocery Refill, Pet Food Refill). | P0 |
| FR-4 | Support multi-intent requests by generating one combined cart spanning all detected domains. | P0 |
| FR-5 | Request clarification **only** when no situation keyword is detected. | P0 |
| FR-6 | Generate exactly three packs (Budget/Standard/Premium) per situation, price-ordered ascending. | P0 |
| FR-7 | Optimize every cart/pack: in-stock validation, delivery within urgency window, budget fit, intent relevance. | P0 |
| FR-8 | Replace failing items with in-stock, in-time, same-category alternatives and attach a plain-English reason. | P0 |
| FR-9 | Compute a 0–100 optimization score (Availability 40 / Delivery 30 / Budget 20 / Intent 10) and a cart-health label. | P0 |
| FR-10 | Flag one Recommended pack with a stated reason. | P1 |
| FR-11 | Let the user switch the active cart to any pack and proceed to checkout. | P1 |
| FR-12 | Render product images that correctly match each product. | P1 |
| FR-13 | Fall back to a deterministic engine (same response shape) when Bedrock is unavailable. | P0 |

---

## 6. Non-Functional Requirements

- **Latency:** Intent → packs in < 2.5 s (warm); fallback path < 500 ms.
- **Availability:** No hard failure if the LLM is down — always return a valid cart.
- **Explainability:** 100% of substitutions and the recommendation carry a reason string.
- **Portability:** Stateless API; deployable on Render (backend) + Vercel (frontend).
- **Cost:** Operate within AWS free/low-tier Bedrock usage for the prototype.
- **Localization:** INR pricing and India quick-commerce delivery norms (10–45 min windows).
- **Security:** No secrets in the client; CORS restricted to configured + `*.vercel.app` origins.

---

## 7. Scoring Model (how "cart health" is computed)

| Dimension | Weight | What it measures |
|-----------|:------:|------------------|
| Availability | 40 | Share of items actually in stock. |
| Delivery | 30 | Share of items deliverable within the urgency window. |
| Budget | 20 | How well the total fits a stated/target budget. |
| Intent match | 10 | How well items match the detected subject/situation. |
| **Total** | **100** | Mapped to **Excellent (95+) / Good (80+) / Fair (60+) / Needs Improvement**. |

---

## 8. Success Metrics

**North-star:** % of sessions that go *one sentence → checkout* with **zero manual product edits**.

| Metric | Target (prototype) |
|--------|--------------------|
| Time from intent to a ready cart | < 3 s |
| Situation classification accuracy (curated test prompts) | ≥ 90% |
| Carts requiring no manual edit before checkout | ≥ 70% |
| Average cart-health score of recommended pack | ≥ 85 / 100 |
| Multi-intent prompts handled in a single combined cart | 100% of detected cases |
| Clarification asked only when truly ambiguous (false-prompt rate) | < 5% |

---

## 9. MVP Scope

**In scope (built):** single-sentence intent input; subject + situation detection with multi-intent; three optimized packs with scoring, cart health, and reasoned substitutions; recommended-pack selection; pack switching; correct product imagery; Bedrock integration with deterministic fallback; deployable backend (Render) + frontend (Vercel).

**Out of scope (post-hackathon):** user accounts & persistence (schemas drafted in `docs/zero-decision-engine.md`); real inventory/delivery integrations; payments; reorder history & personalization; voice input; live A/B testing.

---

## 10. Architecture (prototype)

```
User (browser)
   │  natural-language intent
   ▼
React / Vite frontend  ──VITE_API_URL──►  Express API (Node)
   ▲                                          │
   │  3 scored packs + reasons                ▼
   │                            ┌─────────────────────────────┐
   │                            │ classificationService (V3.1)│  who + what
   │                            │ optimizationService         │  stock/time/budget
   │                            │ zeroDecisionService         │  3-pack generation
   │                            │ scoringService              │  cart health 0–100
   │                            │ bedrockService ──► Amazon Bedrock (Claude)
   │                            │        └─ deterministic fallback
   │                            └─────────────────────────────┘
```

**Key endpoints:** `POST /api/intent/analyze` (intent → cart + optimization + zeroDecision), `POST /api/zero-decision/generate` (situation → packs), `GET /api/health`.

---

## 11. FAQ

### External (customer) FAQ

**Q: What do I have to type?**
Just describe your situation in plain words — "friends coming over tonight," "I cut my finger," "out of dog food." No keywords or product names required.

**Q: What if my request means two things at once?**
If you say "snacks and medicine," the agent builds a single combined cart covering both.

**Q: Why did it swap an item I expected?**
Because the original was out of stock, couldn't arrive in time, or didn't fit your budget. Every swap shows the reason.

**Q: What's the difference between the three packs?**
Budget = essentials at lowest cost; Standard = balanced value; Premium = the complete bundle with extras. One is marked **Recommended**.

**Q: Will it ask me questions?**
Only when your request is genuinely vague (e.g., "I need something"). Clear requests go straight to a cart.

**Q: Is the price in my currency?**
Prices are shown in INR for the India quick-commerce context.

### Internal (stakeholder) FAQ

**Q: Why Amazon Bedrock?**
Managed access to Anthropic Claude for intent understanding without standing up model infra, with IAM-based security and pay-per-use cost that suits a hackathon.

**Q: What happens if Bedrock is unavailable or unconfigured?**
A deterministic classification + template engine returns the **same response shape**, so the UX degrades gracefully and the demo never hard-fails. This is a core tenet, not a fallback afterthought.

**Q: How is the "recommended" pack chosen?**
A weighted blend of optimization score (60%), value (score ÷ price, 30%), and completeness (item count, 10%). Defaults to Standard when scores tie.

**Q: How do you keep three packs meaningfully different?**
Tier-aware product scoring (Budget favors low price, Premium favors completeness) plus explicit **price-ordering enforcement** (Budget < Standard < Premium), boosting a tier with an extra relevant item if needed.

**Q: Why not just rank search results better?**
Ranking still makes the customer choose. Our bet is that for situational, time-pressured needs the winning experience is *no choosing* — a complete, correct cart by default.

**Q: What are the biggest risks?**
1. **Mis-classification** → wrong cart. *Mitigation:* specific-first keyword patterns, confidence + clarification gate, curated test prompts. 2. **Catalog/inventory realism** → prototype uses mock inventory/delivery data. *Mitigation:* clean service boundary so real feeds can replace mocks. 3. **LLM latency/cost.** *Mitigation:* deterministic fast path + caching opportunities.

**Q: What's the path to production?**
Add persistence (session/optimization/pack schemas are drafted), integrate real inventory & delivery ETAs, wire payments, then layer personalization and reorder history.

**Q: How is it deployed?**
Backend on Render (Express, `/api/health` checks), frontend on Vercel (Vite), connected via `VITE_API_URL`; CORS allows the configured frontend plus `*.vercel.app`.

---

## 12. Appendix — Worked Example

**Input:** `"my baby has a fever and needs medicine"`
**Detected:** subject *Baby* → situation *Baby Care* (baby context overrides multi-intent split).
**Generated:** Budget / Standard / Premium packs from Health + Baby Care categories (thermometer, infant paracetamol, ORS, fever patches, wipes…), each stock- and time-validated, scored for cart health, with the best-balanced pack marked **Recommended** — ready to checkout in one tap.
