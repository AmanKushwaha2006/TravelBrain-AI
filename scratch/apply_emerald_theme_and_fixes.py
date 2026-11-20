# -*- coding: utf-8 -*-
"""
1. Fix Day parsing and section splitting in frontend/static/js/itinerary.js
2. Fix grid layout (auto-fit instead of auto-fill) and fallback card width
3. Transform color theme from blue to luxury Emerald Jade (#10B981) & Champagne Gold (#D4AF37) in:
   - frontend/static/css/itinerary.css
   - frontend/templates/itinerary.html
4. Sync all changes to dist/
"""
import os
import re
import shutil

BASE_DIR = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner"

# ==============================================================================
# 1. UPDATE frontend/static/js/itinerary.js
# ==============================================================================
js_path = os.path.join(BASE_DIR, "frontend", "static", "js", "itinerary.js")
with open(js_path, "r", encoding="utf-8") as f:
    js_text = f.read()

# Update knownHeaders
old_headers = """    var knownHeaders = [
      { key: "summary", rx: /(?:Trip Summary|Overview|Introduction)/i },
      { key: "flights", rx: /(?:Flight|Transit Information)/i },
      { key: "hotels", rx: /(?:Hotel Suggestions|Accommodations|Hotels)/i },
      { key: "weather", rx: /(?:Weather Information|Climate|Seasonal Weather)/i },
      { key: "itinerary", rx: /(?:Day[- ]by[- ]Day Itinerary|Daily Schedule|Itinerary)/i },
      { key: "budget", rx: /(?:Estimated Budget|Budget Breakdown|Costs|Tariff)/i },
      { key: "recommendations", rx: /(?:Final Recommendations|Recommendations & Local Tips|Travel Tips|Practical Tips)/i }
    ];"""

new_headers = """    var knownHeaders = [
      { key: "summary", rx: /(?:Trip Summary|Overview|Introduction|Executive Summary|Destination Overview|Summary)/i },
      { key: "flights", rx: /(?:Flight|Transit|Airfare|Logistics|Aviation)/i },
      { key: "hotels", rx: /(?:Hotel|Stay|Accommodations|Lodging|Resort)/i },
      { key: "weather", rx: /(?:Weather|Climate|Season|Meteorology)/i },
      { key: "itinerary", rx: /(?:Day[- ]by[- ]Day|Daily Schedule|Itinerary|Travel Plan|Tour Plan|Sightseeing Plan)/i },
      { key: "budget", rx: /(?:Estimated Budget|Budget Breakdown|Costs|Tariff|Financial Estimates|Expenses)/i },
      { key: "recommendations", rx: /(?:Final Recommendations|Recommendations|Local Tips|Travel Tips|Practical Tips|Actionable Advice)/i }
    ];"""

if old_headers in js_text:
    js_text = js_text.replace(old_headers, new_headers)
    print("Updated knownHeaders in itinerary.js")
else:
    print("WARNING: Could not find old_headers in itinerary.js")

# Now update the Day-by-Day processing in parseDossier
old_day_proc = """    // 6. Process Day-by-Day Itinerary (Chapters)
    var rawItin = sections.itinerary || text;
    var dayBlocks = rawItin.split(/(?=\n#{1,4}\s*Day\s*\d+|\n\*{0,2}Day\s*\d+[:\s\-\*]+)/i);

    var dayIndex = 1;
    dayBlocks.forEach(function (block) {
      var blockTrimmed = block.trim();
      var dMatch = blockTrimmed.match(/^(?:#{1,4}\s*|\*{0,2})Day\s*(\d+)[:\s\-\*]*(.*?)(?:\n|$)/i);
      if (!dMatch) return;

      var dayNum = parseInt(dMatch[1], 10);
      var dayTitle = cleanMarkdown(dMatch[2]).replace(/^[\:\-\–\—\*\s]+/, "").trim();
      if (!dayTitle) dayTitle = "Exploration & Highlights";

      var dayContent = blockTrimmed.slice(dMatch[0].length).trim();
      var activities = [];
      var daySynopsis = "";

      // Extract synopsis if day starts with a brief description or quote
      var firstPara = dayContent.split(/\n\n+/)[0] || "";
      if (firstPara.length > 25 && !/^(?:Morning|Afternoon|Evening|Night|[-*•]|\d+\.)/i.test(firstPara.trim())) {
        daySynopsis = cleanMarkdown(firstPara);
      }

      var lines = dayContent.split("\\n");
      lines.forEach(function (l) {
        var line = l.trim();
        if (!line) return;

        // Slot format: - **Morning: Title**: Description OR - **Morning**: Description
        var slotM = line.match(/^(?:[-*•]|\d+\.)?\s*(?:\*{1,2})?(Morning|Afternoon|Evening|Night|Sunset|Dawn|Midday)(?:[:\s\-\*]+([^\*:]+?))?(?:\*{1,2})?[:\-–—]+(.*?)$/i);
        if (slotM) {
          var timePhase = slotM[1].trim();
          var subTitle = slotM[2] ? cleanMarkdown(slotM[2].trim()) : "";
          var body = cleanMarkdown(slotM[3].trim());

          var icon = /morning/i.test(timePhase) ? "🌅 Morning" :
                     /afternoon/i.test(timePhase) ? "☀️ Afternoon" :
                     /evening|sunset/i.test(timePhase) ? "🌆 Sunset & Evening" :
                     /night/i.test(timePhase) ? "🌙 Night" : (timePhase + " Phase");

          var sentences = body.split(/[.\\n]/);
          var actTitle = subTitle || (sentences[0] ? sentences[0].trim() : (timePhase + " Experience"));
          if (actTitle.length > 70) {
            actTitle = actTitle.slice(0, 65).replace(/[,;:\s]+$/, "") + "…";
          }

          var loc = parsed.destination;
          var locM = body.match(/(?:at|to|in|visit|explore)\s+([A-Z][A-Za-z0-9\s]{3,28}?)(?:[\(\.\,\<]|\s+for|\s+and|$)/);
          if (locM && locM[1]) loc = locM[1].trim();

          var rupeeM = body.match(/(?:₹|INR)\s*[\d\,]+(?:\s*(?:per person|\/person|entry|ticket|fare|approx|meal))?/i);
          var durationM = body.match(/(\d+(?:\.\d+)?(?:\s*(?:-|to)\s*\d+)?\s*(?:hours?|hrs?|mins?))/i);

          // Add to curated highlights if notable landmark
          if (loc && loc !== parsed.destination && parsed.highlights.length < 8) {
            var exists = parsed.highlights.some(function(h) { return h.name.toLowerCase() === loc.toLowerCase(); });
            if (!exists) {
              parsed.highlights.push({
                name: loc,
                category: /temple|church|monastery/i.test(loc) ? "Sacred Heritage" : /beach|coast/i.test(loc) ? "Coastal Wonder" : /fort|palace/i.test(loc) ? "Historic Monument" : "Scenic Landmark",
                description: body.slice(0, 140) + "…",
                location: parsed.destination
              });
            }
          }

          activities.push({
            time: icon,
            title: actTitle,
            location: loc,
            duration: durationM ? durationM[1] : "2 - 3 hrs",
            cost: rupeeM ? rupeeM[0] : null,
            description: body,
            tip: rupeeM ? "Estimated Outlay: " + rupeeM[0] : null
          });
          return;
        }

        // Standard bullet point: - **Activity Name**: Description
        var itemM = line.match(/^(?:[-*•]|\d+\.)\s*(?:\*{1,2})?([^\*:]+?)(?:\*{1,2})?[:\-–—]+(.*?)$/);
        if (itemM) {
          var bKey = cleanMarkdown(itemM[1]);
          var bVal = cleanMarkdown(itemM[2]);

          var isTime = /\\b(?:\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm))\\b/i.test(bKey);
          var aTime = isTime ? bKey : ("Experience " + (activities.length + 1));
          var aTitle = isTime ? (bVal.split(".")[0] || bVal) : bKey;
          var aDesc = bVal;

          var rupeeM2 = aDesc.match(/(?:₹|INR)\s*[\d\,]+(?:\s*(?:per person|\/person|entry|ticket|fare|approx|meal))?/i);
          var durM2 = aDesc.match(/(\d+(?:\.\d+)?(?:\s*(?:-|to)\s*\d+)?\s*(?:hours?|hrs?|mins?))/i);

          activities.push({
            time: aTime,
            title: aTitle,
            location: parsed.destination,
            duration: durM2 ? durM2[1] : "1.5 - 2.5 hrs",
            cost: rupeeM2 ? rupeeM2[0] : null,
            description: aDesc,
            tip: rupeeM2 ? "Estimated Outlay: " + rupeeM2[0] : null
          });
        }
      });

      if (activities.length === 0) {
        activities.push({
          time: "Full Day Experience",
          title: dayTitle,
          location: parsed.destination,
          duration: "Full Day",
          cost: null,
          description: dayContent || "Immersive curated day exploring local landmarks and scenic trails.",
          tip: null
        });
      }

      if (!daySynopsis) {
        daySynopsis = "Chapter " + (dayNum < 10 ? "0" + dayNum : dayNum) + " unfolds with " + dayTitle.toLowerCase() + ", balancing active exploration and moments of serene contemplation.";
      }

      parsed.days.push({
        dayNum: dayNum,
        title: dayTitle,
        synopsis: daySynopsis,
        activities: activities
      });

      dayIndex++;
    });"""

new_day_proc = """    // 6. Process Day-by-Day Itinerary (Chapters) - Robust Index-Based Extraction
    var dayRegex = /(?:^|\\n)\\s*(?:[-*•]|\\d+\\.)?\\s*(?:#{1,4}\\s*)?(?:\\*{1,2})?Day\\s*0?(\\d+)(?:[:\\s\\-\\*–—\\(\\)]|\\b)(.*?)(?:\\n|$)/gi;
    var dayMatches = [];
    var dm;
    var searchSource = (sections.itinerary && sections.itinerary.length > 50) ? sections.itinerary : text;

    while ((dm = dayRegex.exec(searchSource)) !== null) {
      dayMatches.push({
        dayNum: parseInt(dm[1], 10),
        rawTitle: (dm[2] || "").trim(),
        index: dm.index
      });
    }

    // Fallback: If sections.itinerary gave 0 matches, search full text
    if (dayMatches.length === 0 && searchSource !== text) {
      dayRegex.lastIndex = 0;
      while ((dm = dayRegex.exec(text)) !== null) {
        dayMatches.push({
          dayNum: parseInt(dm[1], 10),
          rawTitle: (dm[2] || "").trim(),
          index: dm.index
        });
      }
      searchSource = text;
    }

    if (dayMatches.length > 0) {
      for (var dIdx = 0; dIdx < dayMatches.length; dIdx++) {
        var curMatch = dayMatches[dIdx];
        var startPos = curMatch.index;
        var endPos = (dIdx + 1 < dayMatches.length) ? dayMatches[dIdx + 1].index : searchSource.length;
        var dayBlock = searchSource.slice(startPos, endPos).trim();

        // If last day block bleeds into a subsequent section, truncate it
        if (dIdx === dayMatches.length - 1) {
          var nextSecMatch = dayBlock.match(/\\n\\s*(?:#{1,4}\\s+|\\d+\\.\\s+)(?:Estimated Budget|Budget|Final Recommendations|Recommendations|Local Tips|Travel Tips|Practical Tips|Weather)/i);
          if (nextSecMatch) {
            dayBlock = dayBlock.slice(0, nextSecMatch.index).trim();
          }
        }

        var dayNum = curMatch.dayNum || (dIdx + 1);
        var dayTitle = cleanMarkdown(curMatch.rawTitle)
          .replace(/^[\\:\\-\\–\\—\\*\\s\\(\\)]+/, "")
          .replace(/[\\:\\-\\–\\—\\*\\s\\(\\)]+$/, "")
          .trim();
        if (!dayTitle || dayTitle.length < 2) {
          dayTitle = "Exploration & Highlights";
        }

        var firstNewline = dayBlock.indexOf("\\n");
        var dayContent = (firstNewline !== -1) ? dayBlock.slice(firstNewline).trim() : dayBlock;

        var activities = [];
        var daySynopsis = "";

        // Extract synopsis if day starts with a brief description or quote
        var firstPara = dayContent.split(/\\n\\n+/)[0] || "";
        if (firstPara.length > 25 && !/^(?:Morning|Afternoon|Evening|Night|[-*•]|\\d+\\.)/i.test(firstPara.trim())) {
          daySynopsis = cleanMarkdown(firstPara);
        }

        var lines = dayContent.split("\\n");
        lines.forEach(function (l) {
          var line = l.trim();
          if (!line) return;

          // Slot format: - **Morning: Title**: Description OR - **Morning**: Description OR Morning: Description
          var slotM = line.match(/^(?:[-*•]|\\d+\\.)?\\s*(?:\\*{1,2})?(Morning|Afternoon|Evening|Night|Sunset|Dawn|Midday)(?:[:\\s\\-\\*]+([^\\*:]+?))?(?:\\*{1,2})?[:\\-–—]+(.*?)$/i);
          if (slotM) {
            var timePhase = slotM[1].trim();
            var subTitle = slotM[2] ? cleanMarkdown(slotM[2].trim()) : "";
            var body = cleanMarkdown(slotM[3].trim());

            var icon = /morning/i.test(timePhase) ? "🌅 Morning" :
                       /afternoon/i.test(timePhase) ? "☀️ Afternoon" :
                       /evening|sunset/i.test(timePhase) ? "🌆 Sunset & Evening" :
                       /night/i.test(timePhase) ? "🌙 Night" : (timePhase + " Phase");

            var sentences = body.split(/[.\\n]/);
            var actTitle = subTitle || (sentences[0] ? sentences[0].trim() : (timePhase + " Experience"));
            if (actTitle.length > 70) {
              actTitle = actTitle.slice(0, 65).replace(/[,;:\\s]+$/, "") + "…";
            }

            var loc = parsed.destination;
            var locM = body.match(/(?:at|to|in|visit|explore)\\s+([A-Z][A-Za-z0-9\\s]{3,28}?)(?:[\\(\\.\\,\\<]|\\s+for|\\s+and|$)/);
            if (locM && locM[1]) loc = locM[1].trim();

            var rupeeM = body.match(/(?:₹|INR)\\s*[\\d\\,]+(?:\\s*(?:per person|\\/person|entry|ticket|fare|approx|meal))?/i);
            var durationM = body.match(/(\\d+(?:\\.\\d+)?(?:\\s*(?:-|to)\\s*\\d+)?\\s*(?:hours?|hrs?|mins?))/i);

            // Add to curated highlights if notable landmark
            if (loc && loc !== parsed.destination && parsed.highlights.length < 8) {
              var exists = parsed.highlights.some(function(h) { return h.name.toLowerCase() === loc.toLowerCase(); });
              if (!exists) {
                parsed.highlights.push({
                  name: loc,
                  category: /temple|church|monastery/i.test(loc) ? "Sacred Heritage" : /beach|coast/i.test(loc) ? "Coastal Wonder" : /fort|palace/i.test(loc) ? "Historic Monument" : "Scenic Landmark",
                  description: body.slice(0, 140) + "…",
                  location: parsed.destination
                });
              }
            }

            activities.push({
              time: icon,
              title: actTitle,
              location: loc,
              duration: durationM ? durationM[1] : "2 - 3 hrs",
              cost: rupeeM ? rupeeM[0] : null,
              description: body,
              tip: rupeeM ? "Estimated Outlay: " + rupeeM[0] : null
            });
            return;
          }

          // Standard bullet point: - **Activity Name**: Description
          var itemM = line.match(/^(?:[-*•]|\\d+\\.)\\s*(?:\\*{1,2})?([^\\*:]+?)(?:\\*{1,2})?[:\\-–—]+(.*?)$/);
          if (itemM) {
            var bKey = cleanMarkdown(itemM[1]);
            var bVal = cleanMarkdown(itemM[2]);

            var isTime = /\\b(?:\\d{1,2}:\\d{2}|\\d{1,2}\\s*(?:am|pm))\\b/i.test(bKey);
            var aTime = isTime ? bKey : ("Experience " + (activities.length + 1));
            var aTitle = isTime ? (bVal.split(".")[0] || bVal) : bKey;
            var aDesc = bVal;

            var rupeeM2 = aDesc.match(/(?:₹|INR)\\s*[\\d\\,]+(?:\\s*(?:per person|\\/person|entry|ticket|fare|approx|meal))?/i);
            var durM2 = aDesc.match(/(\\d+(?:\\.\\d+)?(?:\\s*(?:-|to)\\s*\\d+)?\\s*(?:hours?|hrs?|mins?))/i);

            activities.push({
              time: aTime,
              title: aTitle,
              location: parsed.destination,
              duration: durM2 ? durM2[1] : "1.5 - 2.5 hrs",
              cost: rupeeM2 ? rupeeM2[0] : null,
              description: aDesc,
              tip: rupeeM2 ? "Estimated Outlay: " + rupeeM2[0] : null
            });
          }
        });

        if (activities.length === 0) {
          activities.push({
            time: "Full Day Experience",
            title: dayTitle,
            location: parsed.destination,
            duration: "Full Day",
            cost: null,
            description: dayContent || "Immersive curated day exploring local landmarks and scenic trails.",
            tip: null
          });
        }

        if (!daySynopsis) {
          daySynopsis = "Chapter " + (dayNum < 10 ? "0" + dayNum : dayNum) + " unfolds with " + dayTitle.toLowerCase() + ", balancing active exploration and moments of serene contemplation.";
        }

        parsed.days.push({
          dayNum: dayNum,
          title: dayTitle,
          synopsis: daySynopsis,
          activities: activities
        });
      }
    }

    // Safety synthesis: If still 0 days, synthesize requested days from paragraphs so cards are NEVER empty
    if (parsed.days.length === 0) {
      var targetDaysCount = parsed.daysCount || 3;
      var rawParas = (sections.itinerary || text).split(/\\n\\n+/).filter(function(p) {
        var cp = cleanMarkdown(p).trim();
        return cp.length > 40 && !/^(?:Flight|Hotel|Budget|Total|Airline|Table|Category)/i.test(cp);
      });
      for (var fi = 1; fi <= targetDaysCount; fi++) {
        var pContent = rawParas[fi - 1] || ("Curated exploration of key sights, scenic vistas, and culinary delights in " + cleanMarkdown(parsed.destination) + ".");
        parsed.days.push({
          dayNum: fi,
          title: "Chapter " + (fi < 10 ? "0" + fi : fi) + " Highlights",
          synopsis: cleanMarkdown(pContent).slice(0, 160) + "…",
          activities: [
            {
              time: "Full Day Journey",
              title: "Discover " + cleanMarkdown(parsed.destination),
              location: parsed.destination,
              duration: "Full Day",
              cost: null,
              description: cleanMarkdown(pContent),
              tip: null
            }
          ]
        });
      }
    }"""

if old_day_proc in js_text:
    js_text = js_text.replace(old_day_proc, new_day_proc)
    print("Updated Day-by-Day processor in itinerary.js")
else:
    print("WARNING: Could not find old_day_proc in itinerary.js")

# Replace any blue color references in JS (e.g. svg icons)
js_text = js_text.replace("#55B8E8", "#10B981")
js_text = js_text.replace("rgba(85, 184, 232,", "rgba(16, 185, 129,")

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_text)
print("Saved updated itinerary.js")

# Copy JS to dist
dist_js = os.path.join(BASE_DIR, "dist", "static", "js", "itinerary.js")
shutil.copy(js_path, dist_js)
print("Copied to dist/static/js/itinerary.js")
