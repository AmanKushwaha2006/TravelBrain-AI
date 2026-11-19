const fs = require('fs');

function cleanMarkdown(s) {
  if (!s) return "";
  return String(s).replace(/\*\*/g, "").replace(/\*/g, "").replace(/__/g, "").trim();
}

const summaryText = `
# Trip Summary: Manali, Himachal Pradesh, India
- **Duration**: 4 Days / 3 Nights
- **From**: New Delhi
- **Estimated cost**: ₹18,500 total
- **Pace & style**: Cultural & Scenic Exploration
- **Best time to visit**: October to March

Nestled in the breathtaking Pir Panjal and Dhauladhar ranges, Manali offers a timeless sanctuary of ancient deodar forests, cedar-scented trails, and roaring mountain torrents. From mystical centuries-old pagoda temples to high alpine passes and riverside bohemian cafés, this journey captures the alpine soul of the Himalayas.
`;

function extractPrologue(summaryText, destination) {
  var lines = summaryText.split('\n');
  var narrativeLines = [];
  lines.forEach(function(l) {
    var cl = cleanMarkdown(l).trim();
    if (cl.length > 30 && !/^(?:#|[-*•]|\d+\.|Duration|From|Destination|Departure|Estimated cost|Total|Pace|Best time)/i.test(cl)) {
      narrativeLines.push(cl);
    }
  });

  if (narrativeLines.length > 0) {
    return narrativeLines.slice(0, 3).join(' ');
  }
  return "A meticulously orchestrated expedition through " + destination + ", harmonizing iconic landmarks, regional culinary traditions, and authentic cultural encounters into an unforgettable travel narrative.";
}

console.log("Extracted Prologue:", extractPrologue(summaryText, "Manali"));
