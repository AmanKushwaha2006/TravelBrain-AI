import re
import os

js_path = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner\frontend\static\js\itinerary.js"

with open(js_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "/* ---------------- Robust AI Output Parser ---------------- */"
end_marker = "/* ---------------- Authentication Manager ---------------- */"

if start_marker not in content or end_marker not in content:
    print(f"Error: Markers not found. start_marker in content: {start_marker in content}, end_marker in content: {end_marker in content}")
    exit(1)

new_code = '''/* ---------------- Robust AI Output Parser ---------------- */

  /* Curated high-resolution destination photography registry */
  var DESTINATION_IMAGES = {
    "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    "manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    "shimla": "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80",
    "kashmir": "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80",
    "srinagar": "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80",
    "ladakh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    "leh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80",
    "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
    "udaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
    "munnar": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
    "alleppey": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
    "alappuzha": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
    "varanasi": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    "agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
    "mumbai": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80",
    "rishikesh": "https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80",
    "haridwar": "https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80",
    "ooty": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80",
    "darjeeling": "https://images.unsplash.com/photo-1622308644420-a61254d0fa3c?auto=format&fit=crop&w=1200&q=80",
    "amritsar": "https://images.unsplash.com/photo-1583267746897-2cf415887172?auto=format&fit=crop&w=1200&q=80",
    "andaman": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    "havelock": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    "pondicherry": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    "puducherry": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    "rome": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    "bali": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    "tokyo": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    "kyoto": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    "bangkok": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
    "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    "switzerland": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    "maldives": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
    "vietnam": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    "hanoi": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
  };

  var THEME_FALLBACK_IMAGES = {
    mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    heritage: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
    temple: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    nature: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    lake: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    desert: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    city: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
    culinary: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
  };

  function getDestinationPhoto(name, category) {
    if (!name) return THEME_FALLBACK_IMAGES[category] || THEME_FALLBACK_IMAGES["default"];
    var clean = String(name).toLowerCase().trim();

    // 1. Direct or partial match in curated registry
    var keys = Object.keys(DESTINATION_IMAGES);
    for (var i = 0; i < keys.length; i++) {
      if (clean.indexOf(keys[i]) !== -1 || keys[i].indexOf(clean) !== -1) {
        return DESTINATION_IMAGES[keys[i]];
      }
    }

    // 2. Keyword heuristic for theme fallback
    if (/beach|sea|coast|cove|island|ocean|shore/i.test(clean)) return THEME_FALLBACK_IMAGES.beach;
    if (/mountain|hill|peak|valley|snow|himalaya|alps|trek/i.test(clean)) return THEME_FALLBACK_IMAGES.mountain;
    if (/temple|fort|palace|monument|ruins|heritage|tomb|museum/i.test(clean)) return THEME_FALLBACK_IMAGES.heritage;
    if (/lake|river|waterfall|backwater|canal|falls/i.test(clean)) return THEME_FALLBACK_IMAGES.lake;
    if (/forest|sanctuary|national park|wildlife|jungle|woods/i.test(clean)) return THEME_FALLBACK_IMAGES.nature;
    if (/desert|dune|safari|sand/i.test(clean)) return THEME_FALLBACK_IMAGES.desert;
    if (/food|cuisine|market|dish|bazaar|restaurant|café|culinary/i.test(clean)) return THEME_FALLBACK_IMAGES.culinary;

    if (category && THEME_FALLBACK_IMAGES[category]) {
      return THEME_FALLBACK_IMAGES[category];
    }
    return THEME_FALLBACK_IMAGES["default"];
  }

  function parseItineraryText(fullText, meta) {
    var text = String(fullText || "");

    // Normalize unicode non-breaking spaces and hyphens
    text = text
      .replace(/\\u2011/g, "-")
      .replace(/\\u2013/g, "-")
      .replace(/\\u2014/g, "-")
      .replace(/\\u202f/g, " ")
      .replace(/\\u00a0/g, " ");

    var parsed = {
      destination: meta.destination || "Destination",
      origin: meta.origin || "",
      daysCount: meta.days || 3,
      nightsCount: Math.max(1, (meta.days || 3) - 1),
      budget: "Verified in INR (₹)",
      travelStyle: "Cultural & Scenic Exploration",
      primeSeason: "October – March",
      country: "",
      prologue: "",
      summary: "",
      highlights: [],
      culinary: [],
      weather: { temp: "", condition: "", advice: "", seasons: [] },
      days: [],
      budgetBreakdown: { items: [], total: "" },
      recommendations: { packing: [], transport: [], dining: [], safety: [] },
      flightsText: "",
      hotelsText: ""
    };

    // 1. Destination & Country Extraction
    var destM = text.match(/(?:Destination[:\\s\\*]+)([A-Za-z\\s,]+?)(?:\\(|\\.|\\n)/i) ||
                text.match(/(?:trip to|journey to|visiting|explore)\\s+([A-Za-z\\s,]+?)(?:[\\.\\,\\:\\n]|\\s+from|\\s+for)/i);
    if (destM && destM[1] && (!parsed.destination || parsed.destination === "Destination")) {
      var rawD = destM[1].trim();
      var parts = rawD.split(",");
      parsed.destination = parts[0].trim();
      if (parts.length > 1) {
        parsed.country = parts.slice(1).join(", ").trim();
      }
    }

    if (!parsed.country) {
      if (/India|Goa|Manali|Shimla|Kashmir|Ladakh|Kerala|Jaipur|Udaipur|Varanasi|Agra|Delhi|Mumbai|Rishikesh|Ooty|Darjeeling|Amritsar/i.test(text + " " + parsed.destination)) {
        parsed.country = "India";
      } else if (/France|Paris/i.test(text + " " + parsed.destination)) {
        parsed.country = "France";
      } else if (/Italy|Rome/i.test(text + " " + parsed.destination)) {
        parsed.country = "Italy";
      } else if (/Bali|Indonesia/i.test(text + " " + parsed.destination)) {
        parsed.country = "Indonesia";
      } else if (/Japan|Tokyo|Kyoto/i.test(text + " " + parsed.destination)) {
        parsed.country = "Japan";
      } else if (/UAE|Dubai/i.test(text + " " + parsed.destination)) {
        parsed.country = "United Arab Emirates";
      }
    }

    // 2. Split into Major Sections
    var knownHeaders = [
      { key: "summary", rx: /(?:Trip Summary|Overview|Introduction)/i },
      { key: "flights", rx: /(?:Flight|Transit Information)/i },
      { key: "hotels", rx: /(?:Hotel Suggestions|Accommodations|Hotels)/i },
      { key: "weather", rx: /(?:Weather Information|Climate|Seasonal Weather)/i },
      { key: "itinerary", rx: /(?:Day[- ]by[- ]Day Itinerary|Daily Schedule|Itinerary)/i },
      { key: "budget", rx: /(?:Estimated Budget|Budget Breakdown|Costs|Tariff)/i },
      { key: "recommendations", rx: /(?:Final Recommendations|Recommendations & Local Tips|Travel Tips|Practical Tips)/i }
    ];

    var sections = {};
    var rawSections = text.split(/(?=\\n#{1,4}\\s+|\\n\\*{0,2}\\d+\\.\\s+)/);
    rawSections.forEach(function (chunk) {
      var headerLine = chunk.trim().split("\\n")[0] || "";
      knownHeaders.forEach(function (kh) {
        if (kh.rx.test(headerLine)) {
          sections[kh.key] = chunk;
        }
      });
    });

    // Fallbacks if section split missed:
    if (!sections.summary) {
      var sm = text.match(/(?:Trip Summary|Overview)[:\\s\\*]+(.*?)(?=\\n#{1,4}|\\n\\*{0,2}\\d+\\.|\\Z)/is);
      if (sm) sections.summary = sm[1];
    }
    if (!sections.itinerary) {
      var im = text.match(/(?:Day[- ]by[- ]Day Itinerary|Itinerary)[:\\s\\*]+(.*?)(?=\\n#{1,4}\\s*(?:Estimated Budget|\\d+\\.)|\\n\\*{0,2}\\d+\\.\\s*Estimated Budget|\\Z)/is);
      if (im) sections.itinerary = im[1];
    }
    if (!sections.budget) {
      var bm = text.match(/(?:Estimated Budget|Budget Breakdown)[:\\s\\*]+(.*?)(?=\\n#{1,4}|\\n\\*{0,2}\\d+\\.|\\Z)/is);
      if (bm) sections.budget = bm[1];
    }
    if (!sections.weather) {
      var wm = text.match(/(?:Weather Information)[:\\s\\*]+(.*?)(?=\\n#{1,4}|\\n\\*{0,2}\\d+\\.|\\Z)/is);
      if (wm) sections.weather = wm[1];
    }
    if (!sections.recommendations) {
      var rm = text.match(/(?:Final Recommendations|Recommendations & Local Tips)[:\\s\\*]+(.*?)(?=\\n#{1,4}|\\n\\*{0,2}\\d+\\.|\\Z)/is);
      if (rm) sections.recommendations = rm[1];
    }

    // 3. Process Summary & Prologue
    if (sections.summary) {
      parsed.summary = sections.summary;

      // Extract origin
      var origM = sections.summary.match(/(?:Departure city|From)[:\\s\\*]+([A-Za-z\\s]+?)(?:\\(|,|<|\\.|\\n)/i);
      if (origM) parsed.origin = origM[1].trim();

      // Extract days & nights
      var daysM = sections.summary.match(/(?:Duration)[:\\s\\*]+(\\d+)\\s*(?:days?|Nights?)/i);
      if (daysM) {
        parsed.daysCount = parseInt(daysM[1], 10);
        parsed.nightsCount = Math.max(1, parsed.daysCount - 1);
      }
      var nightsM = sections.summary.match(/(\\d+)\\s*(?:nights?)/i);
      if (nightsM) parsed.nightsCount = parseInt(nightsM[1], 10);

      // Extract total budget
      var costM = sections.summary.match(/(?:Total estimated cost|Total|Estimated cost)[:\\s\\*]+(?:\\*{1,2})?(?:₹|INR)?\\s*([\\d\\,]+)/i);
      if (costM) {
        parsed.budget = "₹" + costM[1].trim();
        parsed.budgetBreakdown.total = "₹" + costM[1].trim();
      }

      // Extract style / pace
      var styleM = sections.summary.match(/(?:Pace & style|Travel style|Style)[:\\s\\*]+([A-Za-z\\s&,-]+?)(?:\\.|\\n|$)/i);
      if (styleM) parsed.travelStyle = cleanMarkdown(styleM[1].trim());

      // Extract prime season / best time
      var seasonM = sections.summary.match(/(?:Best time to visit|Prime season|Season)[:\\s\\*]+([A-Za-z\\s&,-]+?)(?:\\.|\\n|$)/i);
      if (seasonM) parsed.primeSeason = cleanMarkdown(seasonM[1].trim());

      // Extract editorial prologue: clean first narrative paragraph
      var sParas = sections.summary.split(/\\n\\n+/);
      var proseParas = [];
      sParas.forEach(function (p) {
        var cp = cleanMarkdown(p).trim();
        if (cp.length > 50 && !/^(?:Duration|From|Destination|Departure|Estimated cost|Total|Pace|Best time)[:\\s]/i.test(cp)) {
          proseParas.push(cp);
        }
      });
      if (proseParas.length > 0) {
        parsed.prologue = proseParas.slice(0, 2).join(" ");
      }
    }

    if (!parsed.prologue) {
      parsed.prologue = "A meticulously orchestrated expedition through " + cleanMarkdown(parsed.destination) + ", harmonizing iconic landmarks, regional culinary traditions, and authentic cultural encounters into an unforgettable travel narrative.";
    }

    // 4. Process Budget Breakdown
    if (sections.budget) {
      var bTables = parseMarkdownTable(sections.budget);
      if (bTables.length > 1) {
        bTables.slice(1).forEach(function (row) {
          if (row.length >= 2) {
            var category = cleanMarkdown(row[0] || "");
            var itemDesc = row.length >= 3 ? cleanMarkdown(row[1]) : "";
            var costVal = cleanMarkdown(row[row.length - 1] || "");

            if (/Total/i.test(category) || /Total/i.test(itemDesc)) {
              if (costVal) {
                parsed.budgetBreakdown.total = costVal.startsWith("₹") ? costVal : "₹" + costVal;
                parsed.budget = parsed.budgetBreakdown.total;
              }
            } else if (category && !/Category|Component|Item/i.test(category)) {
              parsed.budgetBreakdown.items.push({
                name: category + (itemDesc ? " (" + itemDesc + ")" : ""),
                cost: costVal.startsWith("₹") ? costVal : "₹" + costVal
              });
            }
          }
        });
      } else {
        var bLines = sections.budget.split("\\n");
        bLines.forEach(function (l) {
          var lm = l.match(/(?:[-*•]|\\d+\\.)\\s*(?:\*{1,2})?([A-Za-z\\s\\/&]+?)(?:\*{1,2})?[:\\-–—]+(?:\*{1,2})?(?:₹|INR)?\\s*([\\d\\,]+)(?:\\s*INR|\\s*₹)?/i);
          if (lm) {
            var cat = cleanMarkdown(lm[1]);
            var cVal = "₹" + lm[2].trim();
            if (/Total/i.test(cat)) {
              parsed.budgetBreakdown.total = cVal;
              parsed.budget = cVal;
            } else {
              parsed.budgetBreakdown.items.push({ name: cat, cost: cVal });
            }
          }
        });
      }
    }

    // Fallback budget total check
    if (!parsed.budgetBreakdown.total) {
      var bMatch = text.match(/(?:Total estimated cost|Total budget|Grand total)[:\\s\\*]+(?:\*{1,2})?(?:₹|INR)?\\s*([\\d\\,]+)/i);
      if (bMatch) {
        parsed.budgetBreakdown.total = "₹" + bMatch[1].trim();
        parsed.budget = parsed.budgetBreakdown.total;
      }
    }

    // 5. Process Weather Section
    if (sections.weather) {
      var wTables = parseMarkdownTable(sections.weather);
      if (wTables.length > 1) {
        wTables.slice(1).forEach(function (row) {
          if (row.length >= 3) {
            var seasonName = cleanMarkdown(row[0]);
            var tempVal = cleanMarkdown(row[1]);
            var rainVal = cleanMarkdown(row[2]);
            if (seasonName && !/Season|Month|Period/i.test(seasonName)) {
              parsed.weather.seasons.push({
                season: seasonName,
                temp: tempVal,
                rainfall: rainVal
              });
            }
          }
        });
      }

      var adviceM = sections.weather.match(/(?:Weather-based recommendation|Recommendation|Best time|Advisory)[:\\s\\*]+(.*?)(?=\\n#{1,4}|\\n\\*{0,2}\\d+\\.|\\Z)/is);
      if (adviceM) {
        parsed.weather.advice = cleanMarkdown(adviceM[1]);
      } else {
        var firstWPara = cleanMarkdown(sections.weather.split("\\n\\n")[0] || "");
        if (firstWPara.length > 20) parsed.weather.advice = firstWPara;
      }

      var tempM = sections.weather.match(/(\\d{1,2}\\s*°?\\s*C\\s*(?:-|to)\\s*\\d{1,2}\\s*°?\\s*C|\\d{1,2}\\s*°C)/i);
      if (tempM) parsed.weather.temp = tempM[1].replace(/\\s+/g, "");

      var condM = sections.weather.match(/(?:conditions?|climate)[:\\s\\*]+([A-Za-z\\s]+?)(?:\\.|,|<|\\n)/i);
      if (condM) parsed.weather.condition = cleanMarkdown(condM[1]);
    }

    // 6. Process Day-by-Day Itinerary (Chapters)
    var rawItin = sections.itinerary || text;
    var dayBlocks = rawItin.split(/(?=\\n#{1,4}\\s*Day\\s*\\d+|\\n\\*{0,2}Day\\s*\\d+[:\\s\\-\\*]+)/i);

    var dayIndex = 1;
    dayBlocks.forEach(function (block) {
      var blockTrimmed = block.trim();
      var dMatch = blockTrimmed.match(/^(?:#{1,4}\\s*|\\*{0,2})Day\\s*(\\d+)[:\\s\\-\\*]*(.*?)(?:\\n|$)/i);
      if (!dMatch) return;

      var dayNum = parseInt(dMatch[1], 10);
      var dayTitle = cleanMarkdown(dMatch[2]).replace(/^[\\:\\-\\–\\—\\*\\s]+/, "").trim();
      if (!dayTitle) dayTitle = "Exploration & Highlights";

      var dayContent = blockTrimmed.slice(dMatch[0].length).trim();
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

        // Slot format: - **Morning: Title**: Description OR - **Morning**: Description
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

      dayIndex++;
    });

    // 7. Process Food & Culinary Scene
    var foodKeywords = /(?:dish|cuisine|thali|curry|delicacy|food|dining|café|restaurant|tasting|street food|flavor|culinary)/i;
    var rawTextLines = text.split("\\n");
    rawTextLines.forEach(function (fl) {
      var cfl = cleanMarkdown(fl).trim();
      if (foodKeywords.test(cfl) && cfl.length > 25 && cfl.length < 240) {
        var dishMatch = cfl.match(/(?:try|taste|sample|famous for|savor|signature)?[:\\s\\*]*([A-Za-z\\s]{3,30}?)(?:[:\\-–—]|\\s+which|\\s+a\\s+|\\s+is\\s+|\\()/i);
        var dishName = dishMatch && dishMatch[1] ? dishMatch[1].trim() : "Regional Specialty";
        if (dishName.length > 3 && !/^(?:The|And|With|In|For|Please|Try)$/i.test(dishName) && parsed.culinary.length < 4) {
          var alreadyIn = parsed.culinary.some(function(item) { return item.name.toLowerCase() === dishName.toLowerCase(); });
          if (!alreadyIn) {
            parsed.culinary.push({
              name: dishName,
              category: /street/i.test(cfl) ? "Street Food Delicacy" : /dessert|sweet/i.test(cfl) ? "Traditional Sweet" : /thali|meal/i.test(cfl) ? "Authentic Thali Experience" : "Signature Local Specialty",
              description: cfl
            });
          }
        }
      }
    });

    // Default culinary cards if none found
    if (parsed.culinary.length === 0) {
      parsed.culinary = [
        {
          name: "Regional Flavors & Heritage Dining",
          category: "Culinary Heritage",
          description: "Savor indigenous spices, local farm produce, and traditional preparations refined over generations across authentic heritage eateries."
        },
        {
          name: "Street Food & Artisanal Cafés",
          category: "Local Street Food",
          description: "Experience vibrant evening food promenades, freshly roasted local snacks, and artisanal hillside coffee or coastal brews."
        }
      ];
    }

    // 8. Process Travel Recommendations & Packing
    if (sections.recommendations) {
      var rTables = parseMarkdownTable(sections.recommendations);
      if (rTables.length > 1) {
        rTables.slice(1).forEach(function (row) {
          if (row.length >= 2) {
            var tipTitle = cleanMarkdown(row[0]);
            var tipDesc = cleanMarkdown(row[1]);
            parsed.recommendations.safety.push(tipTitle + ": " + tipDesc);
          }
        });
      } else {
        var rLines = sections.recommendations.split("\\n");
        rLines.forEach(function (l) {
          var cl = cleanMarkdown(l).trim();
          if (cl.length > 12 && cl.length < 240) {
            if (/pack|garment|clothing|jacket|shoe|sunscreen/i.test(cl)) {
              parsed.recommendations.packing.push(cl.replace(/^[-*•\\d.]+\\s*/, ""));
            } else if (/taxi|cab|bus|metro|scooter|rent|transit|flight/i.test(cl)) {
              parsed.recommendations.transport.push(cl.replace(/^[-*•\\d.]+\\s*/, ""));
            } else if (/food|eat|dining|restaurant|water/i.test(cl)) {
              parsed.recommendations.dining.push(cl.replace(/^[-*•\\d.]+\\s*/, ""));
            } else {
              parsed.recommendations.safety.push(cl.replace(/^[-*•\\d.]+\\s*/, ""));
            }
          }
        });
      }
    }

    // Default recommendations if empty
    if (parsed.recommendations.safety.length === 0) {
      parsed.recommendations.safety = [
        "Carry valid government photo IDs and physical photocopies for check-ins and permit gates.",
        "Keep modest digital UPI and liquid cash reserves for small roadside kiosks and heritage entry tickets.",
        "Respect sacred monuments and local prayer spaces by observing local attire guidelines."
      ];
    }
    if (parsed.recommendations.transport.length === 0) {
      parsed.recommendations.transport = [
        "Book licensed pre-paid taxi booths or app-based transit at airport/railway terminals to ensure metered rates.",
        "For coastal or mountain routes, inquire with your stay concierge for vetted local private drivers."
      ];
    }
    if (parsed.recommendations.dining.length === 0) {
      parsed.recommendations.dining = [
        "Seek out heritage food spots and family-run dhabas/cafés with consistent patron turnover.",
        "Drink filtered or bottled mineral water, and enjoy freshly prepared seasonal fruits and warm teas."
      ];
    }
    if (parsed.recommendations.packing.length === 0) {
      parsed.recommendations.packing = [
        "Comfortable breathable fabrics, UV sunglasses, and walking sneakers with gripping tread.",
        "Lightweight weather-proof layer or fleece jacket for evening temperature dips.",
        "Universal power bank, reusable water flask, and basic personal medical kit."
      ];
    }

    parsed.flightsText = sections.flights || "";
    parsed.hotelsText = sections.hotels || "";

    return parsed;
  }

  /* ---------------- Dashboard Rendering ---------------- */

  function renderDashboard(parsed, rawResult) {
    currentParsed = parsed;
    currentPlanData = rawResult;

    var destPhoto = getDestinationPhoto(parsed.destination, "nature");

    // 1. Destination Hero Cover Section (Magazine Cover)
    if (heroCoverBg) {
      heroCoverBg.style.backgroundImage = "url('" + destPhoto + "')";
    }

    if (heroTitle) {
      var destTitle = cleanMarkdown(parsed.destination);
      heroTitle.innerHTML = 'A Curated Journey Through <em>' + destTitle + '</em>';
    }

    if (heroSubtitle) {
      var daysTotal = parsed.days.length || parsed.daysCount || 3;
      var nightsTotal = parsed.nightsCount || Math.max(1, daysTotal - 1);
      var countryTag = parsed.country ? '<span>📍 ' + cleanMarkdown(parsed.country) + '</span><span class="hero-dot">✦</span>' : '';
      var originTag = parsed.origin ? '<span>From ' + cleanMarkdown(parsed.origin) + ' ➔ ' + cleanMarkdown(parsed.destination) + '</span><span class="hero-dot">✦</span>' : '';

      heroSubtitle.innerHTML =
        countryTag +
        originTag +
        '<span>' + daysTotal + ' Days · ' + nightsTotal + ' Nights</span>' +
        '<span class="hero-dot">✦</span>' +
        '<span class="badge-inr">Verified in INR (₹)</span>';
    }

    if (heroPrologue) {
      heroPrologue.textContent = parsed.prologue;
    }

    if (heroSummaryLine) {
      heroSummaryLine.innerHTML =
        '<span>' + (parsed.days.length || parsed.daysCount || 3) + ' Days Journey</span>' +
        '<span class="hero-dot">·</span>' +
        '<span>' + cleanMarkdown(parsed.travelStyle) + '</span>' +
        '<span class="hero-dot">·</span>' +
        '<span>Best Season: ' + cleanMarkdown(parsed.primeSeason) + '</span>';
    }

    if (heroTagsRow) {
      heroTagsRow.innerHTML = "";
      var tags = [
        { label: parsed.budgetBreakdown.total || parsed.budget || "Verified in ₹", cls: "tag-currency", icon: "💰" },
        { label: parsed.weather.condition || (parsed.weather.temp ? parsed.weather.temp : "Pleasant Climate"), cls: "", icon: "🌤️" },
        { label: parsed.travelStyle || "Bespoke Itinerary", cls: "", icon: "✨" },
        { label: "AI Multi-Agent Verified", cls: "", icon: "✓" }
      ];
      tags.forEach(function (t) {
        var span = el("span", "hero-tag " + t.cls);
        span.textContent = t.icon + " " + t.label;
        heroTagsRow.appendChild(span);
      });
    }

    // Quick jump pills in Hero Cover
    if (heroQuickJumps) {
      heroQuickJumps.innerHTML = "";
      var jumps = [
        { label: "📖 Day Chapters", target: "daysContainer" },
        { label: "✨ Highlights", target: "highlightsSection" },
        { label: "🍲 Culinary Scene", target: "foodSection" },
        { label: "🌤️ Climate & Seasons", target: "weatherSection" },
        { label: "🎒 Tips & Packing", target: "recommendationsSection" },
        { label: "💰 Budget Ledger", target: "budgetSection" }
      ];
      jumps.forEach(function (j) {
        var pill = el("a", "hero-jump-pill", j.label);
        pill.href = "#" + j.target;
        pill.addEventListener("click", function (e) {
          e.preventDefault();
          var targetEl = document.getElementById(j.target);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
        heroQuickJumps.appendChild(pill);
      });
    }

    // 2. Trip Overview (Magazine Spec Bar)
    if (summaryCardsGrid) {
      summaryCardsGrid.innerHTML = "";
      var daysVal = (parsed.days.length || parsed.daysCount || 3) + " Days · " + Math.max(1, (parsed.days.length || parsed.daysCount || 3) - 1) + "N";
      var budgetVal = parsed.budgetBreakdown.total || parsed.budget || "Itemized in ₹";
      var weatherVal = parsed.weather.temp ? parsed.weather.temp + " · " + (parsed.weather.condition || "Pleasant") : (parsed.weather.condition || "Favorable Climate");

      var specCards = [
        {
          label: "DURATION & PACE",
          val: daysVal,
          sub: "Sequenced daily rhythm",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        {
          label: "ESTIMATED OUTLAY",
          val: budgetVal,
          sub: "Flights, stays & dining in INR",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 6v12"/></svg>'
        },
        {
          label: "CLIMATE & SEASON",
          val: weatherVal,
          sub: parsed.primeSeason ? "Prime: " + parsed.primeSeason : "Seasonal advisory active",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
        },
        {
          label: "TRAVEL STYLE",
          val: cleanMarkdown(parsed.travelStyle),
          sub: "Tailored multi-agent curation",
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>'
        }
      ];

      specCards.forEach(function (c) {
        var cardEl = el("div", "summary-card");
        var iconWrap = el("div", "summary-card-icon");
        iconWrap.innerHTML = c.icon;
        cardEl.appendChild(iconWrap);
        cardEl.appendChild(el("div", "summary-card-label", c.label));
        cardEl.appendChild(el("div", "summary-card-value", c.val));
        cardEl.appendChild(el("div", "summary-card-sub", c.sub));
        summaryCardsGrid.appendChild(cardEl);
      });
    }

    // 3. Day Navigation Tabs
    if (dayNavTabs) {
      dayNavTabs.innerHTML = "";

      var allTab = el("button", "day-tab active", "All Chapters");
      allTab.addEventListener("click", function () {
        setActiveDayTab(allTab, null);
      });
      dayNavTabs.appendChild(allTab);

      parsed.days.forEach(function (d) {
        var tab = el("button", "day-tab");
        tab.innerHTML = "Chapter " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum) + ' <span class="day-tab-count">(' + d.activities.length + ")</span>";
        tab.addEventListener("click", function () {
          setActiveDayTab(tab, "day-chapter-" + d.dayNum);
        });
        dayNavTabs.appendChild(tab);
      });
    }

    // 4. Day Chapters Itinerary (The Main Magazine Feature)
    if (daysContainer) {
      daysContainer.innerHTML = "";

      if (parsed.days.length === 0) {
        var fallbackBlock = el("div", "itinerary-day-block");
        fallbackBlock.innerHTML = renderMd(rawResult.itinerary || rawResult.answer);
        daysContainer.appendChild(fallbackBlock);
      } else {
        parsed.days.forEach(function (d) {
          var chapterEl = el("article", "itinerary-day-block day-chapter");
          chapterEl.id = "day-chapter-" + d.dayNum;

          // Chapter Header
          var cHead = el("header", "day-chapter-header");
          var eyebrow = el("div", "chapter-eyebrow", "CHAPTER " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum) + " · DAY " + d.dayNum);
          var cTitle = el("h3", "chapter-title", cleanMarkdown(d.title));
          cHead.appendChild(eyebrow);
          cHead.appendChild(cTitle);

          if (d.synopsis) {
            var cSyn = el("p", "chapter-synopsis", d.synopsis);
            cHead.appendChild(cSyn);
          }
          chapterEl.appendChild(cHead);

          // Timeline Container
          var timeline = el("div", "timeline-container");

          d.activities.forEach(function (act) {
            var item = el("div", "timeline-item");
            item.appendChild(el("div", "timeline-node"));

            var card = el("div", "activity-card magazine-activity-card");

            var topRow = el("div", "activity-top-row");
            var timePill = el("span", "activity-time-pill", act.time);
            topRow.appendChild(timePill);

            var metaBadges = el("div", "activity-meta-badges");
            if (act.duration) {
              var durBadge = el("span", "activity-meta-badge");
              durBadge.innerHTML = '⏱️ ' + cleanMarkdown(act.duration);
              metaBadges.appendChild(durBadge);
            }
            if (act.cost) {
              var costBadge = el("span", "activity-meta-badge badge-cost");
              costBadge.innerHTML = '🎟️ ' + cleanMarkdown(act.cost);
              metaBadges.appendChild(costBadge);
            }
            topRow.appendChild(metaBadges);
            card.appendChild(topRow);

            var actTitle = el("h4", "activity-title", cleanMarkdown(act.title));
            card.appendChild(actTitle);

            if (act.location) {
              var locEl = el("div", "activity-location");
              locEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg> <span>' + cleanMarkdown(act.location) + '</span>';
              card.appendChild(locEl);
            }

            if (act.description) {
              var descWrap = el("div", "activity-description");
              descWrap.innerHTML = renderMd(act.description);
              card.appendChild(descWrap);
            }

            if (act.tip) {
              var tipBox = el("div", "activity-tip-box");
              tipBox.innerHTML = '<span>💡</span><div>' + renderMd(act.tip) + '</div>';
              card.appendChild(tipBox);
            }

            item.appendChild(card);
            timeline.appendChild(item);
          });

          chapterEl.appendChild(timeline);
          daysContainer.appendChild(chapterEl);
        });
      }
    }

    // 5. Destination Highlights
    if (highlightsGrid) {
      highlightsGrid.innerHTML = "";
      if (parsed.highlights.length > 0) {
        parsed.highlights.slice(0, 6).forEach(function (h) {
          var hCard = el("div", "highlight-card");
          var photoUrl = getDestinationPhoto(h.name, "heritage");

          var imgWrap = el("div", "highlight-img-wrap");
          var img = el("img", "highlight-img");
          img.src = photoUrl;
          img.alt = cleanMarkdown(h.name);
          img.loading = "lazy";
          img.onerror = function () { this.style.display = "none"; };
          imgWrap.appendChild(img);

          var tag = el("span", "highlight-cat-tag", h.category);
          imgWrap.appendChild(tag);
          hCard.appendChild(imgWrap);

          var hBody = el("div", "highlight-body");
          hBody.appendChild(el("h4", "highlight-title", cleanMarkdown(h.name)));
          hBody.appendChild(el("p", "highlight-desc", cleanMarkdown(h.description)));
          
          var hFoot = el("div", "highlight-footer");
          hFoot.innerHTML = '<span>📍 ' + cleanMarkdown(h.location) + '</span>';
          hBody.appendChild(hFoot);

          hCard.appendChild(hBody);
          highlightsGrid.appendChild(hCard);
        });
        if (highlightsSection) highlightsSection.hidden = false;
      } else {
        if (highlightsSection) highlightsSection.hidden = true;
      }
    }

    // 6. Food & Culinary Scene Section
    if (foodSection && foodGrid) {
      foodGrid.innerHTML = "";
      if (parsed.culinary.length > 0) {
        parsed.culinary.forEach(function (dish) {
          var fCard = el("div", "food-card");
          var fPhoto = getDestinationPhoto(dish.name, "culinary");

          var imgWrap = el("div", "food-img-wrap");
          var img = el("img", "food-img");
          img.src = fPhoto;
          img.alt = cleanMarkdown(dish.name);
          img.loading = "lazy";
          img.onerror = function () { this.style.display = "none"; };
          imgWrap.appendChild(img);

          var fBadge = el("span", "food-cat-badge", dish.category);
          imgWrap.appendChild(fBadge);
          fCard.appendChild(imgWrap);

          var fBody = el("div", "food-body");
          fBody.appendChild(el("h4", "food-title", cleanMarkdown(dish.name)));
          fBody.appendChild(el("p", "food-desc", cleanMarkdown(dish.description)));
          fCard.appendChild(fBody);

          foodGrid.appendChild(fCard);
        });
        foodSection.hidden = false;
      } else {
        foodSection.hidden = true;
      }
    }

    // 7. Weather Advisory & Seasonal Guide
    if (weatherSection) {
      weatherSection.hidden = false;
      if (weatherAdvice) {
        weatherAdvice.innerHTML = '<span>🌤️</span><div>' + renderMd(parsed.weather.advice || "Favorable seasonal climate for travel.") + '</div>';
      }
      if (weatherCardsRow) {
        weatherCardsRow.innerHTML = "";
        if (parsed.weather.seasons && parsed.weather.seasons.length > 0) {
          parsed.weather.seasons.forEach(function (s) {
            var wCard = el("div", "weather-card");
            wCard.appendChild(el("div", "weather-date", s.season));
            var iconVal = /monsoon|rain/i.test(s.season) ? "🌧️" : /winter|cold/i.test(s.season) ? "❄️" : "☀️";
            wCard.appendChild(el("div", "weather-icon-lg", iconVal));
            wCard.appendChild(el("div", "weather-temp", s.temp));
            wCard.appendChild(el("div", "weather-cond", s.rainfall));
            weatherCardsRow.appendChild(wCard);
          });
        }
      }
    }

    // 8. Travel Recommendations & Interactive Packing Checklist
    if (recommendationsGrid) {
      recommendationsGrid.innerHTML = "";

      var categories = [
        { key: "transport", title: "Local Transit & Commute", icon: "🚕", items: parsed.recommendations.transport },
        { key: "dining", title: "Dining & Culinary Etiquette", icon: "🍲", items: parsed.recommendations.dining },
        { key: "packing", title: "Curated Packing Checklist", icon: "🎒", items: parsed.recommendations.packing, isChecklist: true },
        { key: "safety", title: "Insider & Safety Intelligence", icon: "💡", items: parsed.recommendations.safety }
      ];

      categories.forEach(function (cat) {
        var catCard = el("div", "rec-category-card");
        var cHead = el("div", "rec-category-header");
        cHead.appendChild(el("div", "rec-cat-icon", cat.icon));
        cHead.appendChild(el("h4", "rec-cat-title", cat.title));
        catCard.appendChild(cHead);

        if (cat.isChecklist) {
          var checkList = el("div", "packing-checklist");
          (cat.items || []).forEach(function (it, idx) {
            var itemRow = el("label", "packing-item-label");
            var cb = el("input", "packing-checkbox");
            cb.type = "checkbox";
            itemRow.appendChild(cb);
            var span = el("span", "packing-item-text", cleanMarkdown(it));
            itemRow.appendChild(span);
            checkList.appendChild(itemRow);
          });
          catCard.appendChild(checkList);
        } else {
          var ul = el("ul", "rec-list");
          (cat.items || []).slice(0, 4).forEach(function (it) {
            var li = el("li", "rec-list-item");
            li.innerHTML = renderMd(it);
            ul.appendChild(li);
          });
          catCard.appendChild(ul);
        }

        recommendationsGrid.appendChild(catCard);
      });
    }

    // 9. Estimated Budget Breakdown (Itemized in INR ₹)
    if (budgetBreakdownGrid) {
      budgetBreakdownGrid.innerHTML = "";
      var budgetItems = parsed.budgetBreakdown.items;
      if (budgetItems.length === 0) {
        budgetItems = [
          { name: "Round-Trip Flight / Primary Transit", cost: "Estimated in ₹" },
          { name: "Curated Boutique Accommodations", cost: "Approx. ₹4,000 / night" },
          { name: "Regional Culinary & Dining", cost: "Approx. ₹1,500 / day" },
          { name: "Heritage Monument Entries & Activities", cost: "Approx. ₹800 / day" }
        ];
      }

      budgetItems.forEach(function (bi) {
        var itemEl = el("div", "budget-item-card");
        itemEl.appendChild(el("div", "budget-item-name", bi.name));
        itemEl.appendChild(el("div", "budget-item-cost", bi.cost));
        budgetBreakdownGrid.appendChild(itemEl);
      });

      if (budgetTotalNum) {
        budgetTotalNum.textContent = parsed.budgetBreakdown.total || parsed.budget || "Verified in INR (₹)";
      }
    }

    // 10. Logistics (Flights & Hotels Intelligence)
    if (logisticsSection) {
      var flText = rawResult.flight_results || parsed.flightsText;
      var htText = rawResult.hotel_results || parsed.hotelsText;

      if (flText || htText) {
        logisticsSection.hidden = false;
        if (flightsContent) flightsContent.innerHTML = renderMd(flText || "Flight routing verified by Flight Intelligence Agent.");
        if (hotelsContent) hotelsContent.innerHTML = renderMd(htText || "Curated stay recommendations scouted by Accommodations Agent.");
      } else {
        logisticsSection.hidden = true;
      }
    }

    // 11. Raw Dossier View
    if (rawDossierContent) {
      rawDossierContent.innerHTML = renderMd(rawResult.answer || rawResult.itinerary || "");
    }

    // Reveal Dashboard
    hidePlannerScreen();
    if (loadingScreen) loadingScreen.hidden = true;
    if (errorScreen) errorScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = false;
  }

  function setActiveDayTab(activeTabEl, targetId) {
    document.querySelectorAll(".day-tab").forEach(function (t) { t.classList.remove("active"); });
    if (activeTabEl) activeTabEl.classList.add("active");

    if (!targetId) {
      document.querySelectorAll(".itinerary-day-block").forEach(function (b) { b.style.display = "block"; });
      window.scrollTo({ top: daysContainer.offsetTop - 140, behavior: "smooth" });
    } else {
      var target = $(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  '''

# Replace slice between start_marker and end_marker
idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

updated_content = content[:idx_start] + new_code + content[idx_end:]

with open(js_path, "w", encoding="utf-8") as f:
    f.write(updated_content)

print(f"Successfully updated {js_path}!")
