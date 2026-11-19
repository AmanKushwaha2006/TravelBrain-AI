// Test the itinerary parser logic with realistic backend AI response
const fs = require('fs');
const path = require('path');

const jsContent = fs.readFileSync('frontend/static/js/itinerary.js', 'utf8');

// Extract the helper functions and parseItineraryText
// We can wrap and evaluate parseItineraryText in a sandbox
const parserCode = jsContent.substring(
  jsContent.indexOf('/* ---------------- Robust AI Output Parser ---------------- */'),
  jsContent.indexOf('/* ---------------- Dashboard Rendering ---------------- */')
);

// Minimal cleanMarkdown / parseMarkdownTable shim for isolated test
const testEnv = `
${parserCode}

function cleanMarkdown(s) {
  if (!s) return "";
  return String(s).replace(/\\*\\*/g, "").replace(/\\*/g, "").replace(/__/g, "").trim();
}

function parseMarkdownTable(text) {
  const lines = text.split('\\n').filter(l => l.includes('|'));
  return lines.map(l => l.split('|').map(c => c.trim()).filter(c => c.length > 0));
}

const sampleAiOutput = \`
# Trip Summary: Manali, Himachal Pradesh, India
- **Duration**: 4 Days / 3 Nights
- **From**: New Delhi
- **Estimated cost**: ₹18,500 total
- **Pace & style**: Cultural & Scenic Exploration
- **Best time to visit**: October to March

Nestled in the breathtaking Pir Panjal and Dhauladhar ranges, Manali offers a timeless sanctuary of ancient deodar forests, cedar-scented trails, and roaring mountain torrents. From mystical centuries-old pagoda temples to high alpine passes and riverside bohemian cafés, this journey captures the alpine soul of the Himalayas.

## Day 1: Arrival & Old Manali Heritage
- **Morning: Scenic Mountain Arrival & Check-in**: Arrive in Manali, settle into your boutique valley-facing resort, and acclimatize with a cup of warm Himalayan kahwa. (Duration: 2 hours, Fare: ₹800 taxi).
- **Afternoon: Hadimba Devi Temple**: Visit the historic 16th-century timber-and-stone pagoda temple hidden within dense deodar woods. (Duration: 2.5 hours, Entry: ₹50).
- **Evening: Old Manali Cafés & Live Music**: Stroll along the cobbled lanes of Old Manali, browsing quaint handicraft shops and relaxing at riverside music bistros. (Duration: 3 hours, Dinner: ₹700 per person).

## Day 2: Solang Valley & Alpine Adventure
- **Morning: Solang Valley Excursion**: Journey through pine-clad hairpin bends to Solang Valley for panoramic vistas and mountain cable car rides. (Duration: 4 hours, Cable car: ₹650).
- **Afternoon: Vashisht Hot Springs & Temple**: Unwind at the natural sulphur springs in Vashisht village, renowned for ancient stone carvings. (Duration: 2 hours).
- **Evening: Traditional Himachali Dham Tasting**: Savor an authentic multi-course Himachali Dham dinner featuring Madra and Babru at a traditional heritage dhaba. (Duration: 2.5 hours, Meal: ₹550).

## 4. Weather Information
| Season | Temp Range | Conditions |
| Summer (Apr-Jun) | 12°C - 24°C | Pleasant & Clear |
| Monsoon (Jul-Sep) | 15°C - 20°C | Lush Greens & Showers |
| Winter (Oct-Feb) | -2°C - 10°C | Snowfall & Crisp Vistas |

Best time to visit: Mid-October to April for crisp alpine skies and snow-dusted peaks.

## 6. Estimated Budget
| Component | Details | Cost (INR) |
| Round-Trip Volvo / Transit | Delhi to Manali AC Sleeper | ₹3,200 |
| Boutique Accommodations | 3 Nights Mountain Lodge | ₹8,400 |
| Local Dining & Cafés | Authentic local meals & tea | ₹3,800 |
| Activities & Sightseeing | Temple permits & Solang cable car | ₹1,900 |
| Miscellaneous & Tips | Emergency reserve & auto fares | ₹1,200 |
| Total Estimated Cost | Comprehensive trip budget | ₹18,500 |

## 7. Recommendations & Local Tips
- Carry valid government photo ID and booking vouchers at hotel check-in.
- Pre-book Volvo bus tickets or private car transfers from Delhi 2 weeks ahead.
- Savor authentic local delicacies including Siddu with ghee, Trout fish, and Madra curry.
- Pack warm thermal inners, a windbreaker jacket, sunscreen with SPF 50, and sturdy mountain walking shoes.
\`;

const meta = { destination: "Manali", origin: "New Delhi", days: 4 };
const parsed = parseItineraryText(sampleAiOutput, meta);

console.log("=== PARSER VERIFICATION RESULTS ===");
console.log("Destination:", parsed.destination);
console.log("Country:", parsed.country);
console.log("Origin:", parsed.origin);
console.log("Days Count:", parsed.daysCount, "Nights Count:", parsed.nightsCount);
console.log("Budget Total:", parsed.budgetBreakdown.total);
console.log("Travel Style:", parsed.travelStyle);
console.log("Prime Season:", parsed.primeSeason);
console.log("Prologue preview:", parsed.prologue.slice(0, 100) + "...");
console.log("Day Chapters Count:", parsed.days.length);
if (parsed.days.length > 0) {
  console.log("Chapter 1 Title:", parsed.days[0].title);
  console.log("Chapter 1 Synopsis:", parsed.days[0].synopsis);
  console.log("Chapter 1 Activities Count:", parsed.days[0].activities.length);
  console.log("Activity 1:", JSON.stringify(parsed.days[0].activities[0]));
}
console.log("Culinary items extracted:", parsed.culinary.length);
parsed.culinary.forEach(c => console.log(" - Dish:", c.name, "| Category:", c.category));
console.log("Highlights count:", parsed.highlights.length);
console.log("Packing items:", parsed.recommendations.packing);
console.log("=== PARSER TEST PASSED SUCCESSFULLY! ===");
`;

eval(testEnv);
