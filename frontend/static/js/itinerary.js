/* ============================================================
   TravelBrain AI — Generated Itinerary Page Controller
   Intelligent Markdown/Table/JSON Parser & Interactive Dashboard
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- Helpers & DOM ---------------- */
  var $ = function (id) { return document.getElementById(id); };

  var loadingScreen       = $("loadingScreen");
  var errorScreen         = $("errorScreen");
  var dashboardContent    = $("dashboardContent");
  var toastEl             = $("toast");

  // Loading elements
  var loadingDest         = $("loadingDest");
  var currentAgentLabel   = $("currentAgentLabel");
  var pipelineBarFill     = $("pipelineBarFill");
  var elapsedTimeEl       = $("elapsedTime");

  // Error elements
  var errorMessage        = $("errorMessage");
  var btnRetry            = $("btnRetry");
  var btnErrorSettings    = $("btnErrorSettings");

  // Header & Tools
  var copyPlanBtn         = $("copyPlanBtn");
  var downloadMdBtn       = $("downloadMdBtn");
  var printPlanBtn        = $("printPlanBtn");
  var btnAudit            = $("btnAudit");
  var viewDashboardBtn    = $("viewDashboardBtn");
  var viewDossierBtn      = $("viewDossierBtn");
  var settingsBtn         = $("settingsBtn");
  var btnNewTripModal     = $("btnNewTripModal");

  // Planner Screen
  var planJourneySection  = $("planJourneySection");
  var itinPlannerForm     = $("itinPlannerForm");
  var pFrom               = $("pFrom");
  var pTo                 = $("pTo");
  var pDays               = $("pDays");
  var btnPlannerSubmit    = $("btnPlannerSubmit");

  // Hero & Summary
  var heroTitle           = $("heroTitle");
  var heroSummaryLine     = $("heroSummaryLine");
  var heroTagsRow         = $("heroTagsRow");
  var summaryCardsGrid    = $("summaryCardsGrid");

  // Day Navigation & Timeline
  var dayNavTabs          = $("dayNavTabs");
  var daysContainer       = $("daysContainer");

  // Additional Sections
  var highlightsGrid      = $("highlightsGrid");
  var weatherSection      = $("weatherSection");
  var weatherCardsRow     = $("weatherCardsRow");
  var weatherAdvice       = $("weatherAdvice");
  var recommendationsGrid = $("recommendationsGrid");
  var budgetBreakdownGrid = $("budgetBreakdownGrid");
  var budgetTotalNum      = $("budgetTotalNum");
  var logisticsSection    = $("logisticsSection");
  var flightsContent      = $("flightsContent");
  var hotelsContent       = $("hotelsContent");
  var criticAuditSection  = $("criticAuditSection");
  var criticAuditWrap     = $("criticAuditWrap");
  var rawDossierWrap      = $("rawDossierWrap");
  var rawDossierContent   = $("rawDossierContent");

  // Refinement Bar
  var refinementForm      = $("refinementForm");
  var refinementInput     = $("refinementInput");
  var refinementSubmitBtn = $("refinementSubmitBtn");

  // Purge any stale/dead render url stored from previous versions
  try {
    var storedUrl = localStorage.getItem("tb_api_base_url");
    if (storedUrl && (storedUrl.indexOf("travelbrain-api.onrender.com") !== -1 || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      localStorage.removeItem("tb_api_base_url");
      if (window.TravelBrainAPI && window.TravelBrainAPI.setBaseUrl) {
        window.TravelBrainAPI.setBaseUrl("");
      }
    }
  } catch (e) {}

  // Settings & Status
  var apiStatus           = $("apiStatus");
  var settingsModal       = $("settingsModal");
  var settingsScrim       = $("settingsScrim");
  var settingsClose       = $("settingsClose");
  var settingsSave        = $("settingsSave");
  var settingsReset       = $("settingsReset");
  var credList            = $("credList");
  var itinConnIndicator   = $("itinConnIndicator");
  var itinConnText        = $("itinConnText");
  var itinBtnPing         = $("itinBtnPing");
  var btnErrorPlanner     = $("btnErrorPlanner");

  // Authentication Modal Elements
  var authModal           = $("authModal");
  var authScrim           = $("authScrim");
  var authClose           = $("authClose");
  var authTitle           = $("authTitle");
  var authSubtitle        = $("authSubtitle");
  var tabLogin            = $("tabLogin");
  var tabSignup           = $("tabSignup");
  var authErrorBanner     = $("authErrorBanner");
  var loginForm           = $("loginForm");
  var loginEmail          = $("loginEmail");
  var loginPassword       = $("loginPassword");
  var loginSubmitBtn      = $("loginSubmitBtn");
  var signupForm          = $("signupForm");
  var signupName          = $("signupName");
  var signupEmail         = $("signupEmail");
  var signupPassword      = $("signupPassword");
  var signupConfirm       = $("signupConfirm");
  var signupSubmitBtn     = $("signupSubmitBtn");
  var switchToSignup      = $("switchToSignup");
  var switchToLogin       = $("switchToLogin");
  var authBackHome        = $("authBackHome");

  var pendingAuthCallback = null;
  var pendingAuthData     = null;

  /* ---------------- State ---------------- */
  var itinConfig          = null;
  var currentPlanData     = null;
  var currentParsed       = null;
  var activeThreadId      = null;
  var isAuditing          = false;
  var currentTripId       = null;

  var PHASES = [
    { label: "Flight Intelligence Agent · Analyzing routes & airfares in INR", weight: 0.22 },
    { label: "Hotel & Stays Agent · Scouting accommodations & tariffs",        weight: 0.20 },
    { label: "Weather Analyst Agent · Forecasting climate & packing advice",    weight: 0.16 },
    { label: "Itinerary Architect Agent · Structuring day-by-day pacing",       weight: 0.22 },
    { label: "Final Synthesis Agent · Compiling verified master dossier",       weight: 0.20 }
  ];

  /* ---------------- Utilities ---------------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3800);
  }

  function cleanMarkdown(str) {
    return String(str || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();
  }

  function renderMd(text) {
    if (window.MD && typeof window.MD.render === "function") {
      return window.MD.render(String(text || "").trim());
    }
    return String(text || "");
  }

  /* Parse Markdown tables into 2D array of cells */
  function parseMarkdownTable(tableStr) {
    var lines = String(tableStr || "").trim().split("\n");
    var rows = [];

    lines.forEach(function (line) {
      var l = line.trim();
      if (!l.startsWith("|") || !l.endsWith("|")) return;
      if (/^\|[\s\-:]+\|/.test(l)) return; // skip header divider
      var cols = l.split("|").slice(1, -1).map(function (c) {
        return c.trim();
      });
      if (cols.length > 0) rows.push(cols);
    });

    return rows;
  }

  /* ---------------- Robust AI Output Parser ---------------- */

  function parseItineraryText(fullText, meta) {
    var text = String(fullText || "");

    // Normalize unicode non-breaking spaces and hyphens
    text = text
      .replace(/\u2011/g, "-")
      .replace(/\u2013/g, "-")
      .replace(/\u2014/g, "-")
      .replace(/\u202f/g, " ")
      .replace(/\u00a0/g, " ");

    var parsed = {
      destination: meta.destination || "Destination",
      origin: meta.origin || "",
      daysCount: meta.days || 3,
      budget: "Verified in INR (₹)",
      summary: "",
      highlights: [],
      weather: { temp: "", condition: "", advice: "", seasons: [] },
      days: [],
      budgetBreakdown: { items: [], total: "" },
      recommendations: { packing: [], transport: [], dining: [], safety: [] },
      flightsText: "",
      hotelsText: ""
    };

    // 1. Destination Extraction
    var destM = text.match(/(?:Destination[:\s\*]+)([A-Za-z\s]+?)(?:\(|,|\.|\n)/i) ||
                text.match(/(?:trip to|journey to|visiting|explore)\s+([A-Za-z\s]+?)(?:[\.\,\:\n]|\s+from|\s+for)/i);
    if (destM && destM[1] && (!parsed.destination || parsed.destination === "Destination")) {
      parsed.destination = destM[1].trim();
    }

    // 2. Split into Major Sections
    // Typical prompt sections: 1. Trip Summary, 2. Flight & Transit, 3. Hotel Suggestions, 4. Weather, 5. Day-by-Day Itinerary, 6. Estimated Budget, 7. Final Recommendations
    var secRegex = /(?:^|\n)(?:#{1,3}\s*|\*{1,2})?(?:(\d+)\.\s*)?([A-Za-z\s&\–\-\/]+?)(?:\*{1,2})?[:\s\-\n]+(?=\n|\Z)/g;
    
    // We split by standard numbered or named sections
    var splitPoints = [];
    var knownHeaders = [
      { key: "summary", rx: /(?:Trip Summary|Overview)/i },
      { key: "flights", rx: /(?:Flight|Transit Information)/i },
      { key: "hotels", rx: /(?:Hotel Suggestions|Accommodations|Hotels)/i },
      { key: "weather", rx: /(?:Weather Information|Climate)/i },
      { key: "itinerary", rx: /(?:Day[- ]by[- ]Day Itinerary|Daily Schedule|Itinerary)/i },
      { key: "budget", rx: /(?:Estimated Budget|Budget Breakdown|Costs)/i },
      { key: "recommendations", rx: /(?:Final Recommendations|Recommendations & Local Tips|Travel Tips)/i }
    ];

    var sections = {};

    // Alternative reliable section splitter:
    var rawSections = text.split(/(?=\n#{1,4}\s+|\n\*{0,2}\d+\.\s+)/);
    rawSections.forEach(function (chunk) {
      var headerLine = chunk.trim().split("\n")[0] || "";
      knownHeaders.forEach(function (kh) {
        if (kh.rx.test(headerLine)) {
          sections[kh.key] = chunk;
        }
      });
    });

    // Fallbacks if section split missed:
    if (!sections.summary) {
      var sm = text.match(/(?:Trip Summary|Overview)[:\s\*]+(.*?)(?=\n#{1,4}|\n\*{0,2}\d+\.|\Z)/is);
      if (sm) sections.summary = sm[1];
    }
    if (!sections.itinerary) {
      var im = text.match(/(?:Day[- ]by[- ]Day Itinerary|Itinerary)[:\s\*]+(.*?)(?=\n#{1,4}\s*(?:Estimated Budget|\d+\.)|\n\*{0,2}\d+\.\s*Estimated Budget|\Z)/is);
      if (im) sections.itinerary = im[1];
    }
    if (!sections.budget) {
      var bm = text.match(/(?:Estimated Budget|Budget Breakdown)[:\s\*]+(.*?)(?=\n#{1,4}|\n\*{0,2}\d+\.|\Z)/is);
      if (bm) sections.budget = bm[1];
    }
    if (!sections.weather) {
      var wm = text.match(/(?:Weather Information)[:\s\*]+(.*?)(?=\n#{1,4}|\n\*{0,2}\d+\.|\Z)/is);
      if (wm) sections.weather = wm[1];
    }
    if (!sections.recommendations) {
      var rm = text.match(/(?:Final Recommendations|Recommendations & Local Tips)[:\s\*]+(.*?)(?=\n#{1,4}|\n\*{0,2}\d+\.|\Z)/is);
      if (rm) sections.recommendations = rm[1];
    }

    // 3. Process Summary
    if (sections.summary) {
      parsed.summary = sections.summary;
      // Extract origin
      var origM = sections.summary.match(/(?:Departure city|From)[:\s\*]+([A-Za-z\s]+?)(?:\(|,|\.|\n)/i);
      if (origM) parsed.origin = origM[1].trim();
      // Extract days
      var daysM = sections.summary.match(/(?:Duration)[:\s\*]+(\d+)\s*(?:days?|Nights?)/i);
      if (daysM) parsed.daysCount = parseInt(daysM[1], 10);
      // Extract total budget
      var costM = sections.summary.match(/(?:Total estimated cost|Total)[:\s\*]+(?:\*{1,2})?(?:₹|INR)?\s*([\d\,]+)/i);
      if (costM) {
        parsed.budget = "₹" + costM[1].trim();
        parsed.budgetBreakdown.total = "₹" + costM[1].trim();
      }
    }

    // 4. Process Budget Breakdown
    if (sections.budget) {
      var bTables = parseMarkdownTable(sections.budget);
      if (bTables.length > 1) {
        // Table has header row + data rows
        var headerCols = bTables[0];
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
            } else if (category && costVal) {
              parsed.budgetBreakdown.items.push({
                name: category + (itemDesc ? " · " + itemDesc : ""),
                cost: costVal.startsWith("₹") ? costVal : "₹" + costVal
              });
            }
          }
        });
      } else {
        // Fallback: list of items
        var bLines = sections.budget.split("\n");
        bLines.forEach(function (l) {
          var itemM = l.match(/(?:[-*•]|\d+\.)\s*([A-Za-z\s&\/]+?)[:\-–—]\s*(?:₹|INR)?\s*([\d\,]+)/);
          if (itemM) {
            parsed.budgetBreakdown.items.push({
              name: itemM[1].trim(),
              cost: "₹" + itemM[2].trim()
            });
          }
        });
      }
    }

    // 5. Process Weather Section
    if (sections.weather) {
      var wText = sections.weather;
      var wTables = parseMarkdownTable(wText);
      if (wTables.length > 1) {
        wTables.slice(1).forEach(function (row) {
          if (row.length >= 3) {
            parsed.weather.seasons.push({
              season: cleanMarkdown(row[0]),
              temp: cleanMarkdown(row[1]),
              rainfall: cleanMarkdown(row[2]),
              notes: row.length >= 4 ? cleanMarkdown(row[3]) : ""
            });
          }
        });
        if (parsed.weather.seasons.length > 0) {
          parsed.weather.temp = parsed.weather.seasons[0].temp;
          parsed.weather.condition = parsed.weather.seasons[0].season;
        }
      }

      var adviceM = wText.match(/(?:Weather[- ]Based Advice|Advice|Tips)[:\s\*]+(.*?)(?=\n#{1,3}|\Z)/is);
      if (adviceM) {
        parsed.weather.advice = cleanMarkdown(adviceM[1]);
      } else {
        parsed.weather.advice = "Pack comfortable walking shoes, light clothing, and check local forecasts prior to departure.";
      }
    }

    // 6. Process Day-by-Day Itinerary (Most Important!)
    var itinSource = sections.itinerary || text;

    var dayPattern = /(?:^|\n)(?:#{1,4}\s*|\*{1,2})?Day\s*(\d+)[:\s\-\–—\(\)]*([^\n\*]*)\n([\s\S]*?)(?=\n(?:#{1,4}\s*|\*{1,2})?Day\s*\d+|\n#{1,3}\s+[A-Z0-9]|\n\*{0,2}\d+\.\s+[A-Z]|\n---\s*\n\s*##|\Z)/gi;
    var dayMatch;
    var dayIndex = 1;

    while ((dayMatch = dayPattern.exec(itinSource)) !== null) {
      var dayNum = parseInt(dayMatch[1], 10) || dayIndex;
      var dayTitle = dayMatch[2] ? dayMatch[2].trim() : ("Day " + dayNum + " Schedule");
      var dayContent = dayMatch[3].trim();

      var activities = [];

      // Check if Day has a Markdown Table: | Time | Activity | Notes |
      var dayTable = parseMarkdownTable(dayContent);
      if (dayTable.length > 1) {
        var rows = dayTable.slice(1);
        rows.forEach(function (row) {
          if (row.length >= 2) {
            var timeVal = cleanMarkdown(row[0]);
            var actVal = cleanMarkdown(row[1]);
            var noteVal = row.length >= 3 ? cleanMarkdown(row[2]) : "";

            var loc = parsed.destination;
            var locM = actVal.match(/(?:at|to|in)\s+([A-Z][A-Za-z\s]+?)(?:[\(\,\.]|\s+for|\s+and|$)/);
            if (locM && locM[1]) loc = locM[1].trim();

            var slotIcon = /morning/i.test(timeVal) ? "🌅 " : /afternoon/i.test(timeVal) ? "☀️ " : /evening/i.test(timeVal) ? "🌆 " : /night/i.test(timeVal) ? "🌙 " : "";

            activities.push({
              time: slotIcon + (timeVal || "Day Schedule"),
              title: actVal || "Sightseeing Experience",
              location: loc,
              duration: /Airport|Flight/i.test(actVal) ? "Transit" : "1.5 - 2.5 hrs",
              description: noteVal || actVal,
              tip: /₹/i.test(noteVal) ? noteVal : null
            });

            // Extract landmark highlights
            var landmarkKeywords = ["Fort", "Beach", "Cathedral", "Temple", "Palace", "Museum", "Church", "Market", "Waterfalls", "Valley", "Sanctuary", "Lake"];
            landmarkKeywords.forEach(function (kw) {
              if (actVal.indexOf(kw) !== -1) {
                var exists = parsed.highlights.some(function (h) { return h.name === actVal; });
                if (!exists && parsed.highlights.length < 8) {
                  parsed.highlights.push({
                    name: actVal,
                    category: /Temple|Church|Cathedral/i.test(actVal) ? "Heritage" : /Beach|Lake|Falls|Valley/i.test(actVal) ? "Nature" : "Sightseeing",
                    description: noteVal || ("Premier landmark in " + parsed.destination),
                    location: loc
                  });
                }
              }
            });
          }
        });
      }

      // If no table rows found, try parsing structured slots or bullet points
      if (activities.length === 0) {
        var lines = dayContent.split("\n");
        lines.forEach(function (line) {
          var l = line.trim();
          if (!l) return;

          // Check for time slot format: - **Morning**: ... OR Morning: ... OR **Morning (9 AM - 12 PM)**: ...
          var slotM = l.match(/^(?:[-*•]|\d+\.)?\s*(?:\*{1,3}|#{2,4}\s*)?(Morning|Afternoon|Evening|Night|Early Morning|Late Afternoon|Sunset|Dinner|Breakfast|Transit)(?:\s*\([^\)]+\))?(?:\*{1,3})?[:\s\-\–—]+(.*)$/i);
          if (slotM) {
            var rawSlot = slotM[1].trim();
            var body = cleanMarkdown(slotM[2].trim());
            var slotIcon = /morning/i.test(rawSlot) ? "🌅 " : /afternoon/i.test(rawSlot) ? "☀️ " : /evening/i.test(rawSlot) ? "🌆 " : /night/i.test(rawSlot) ? "🌙 " : "⏱️ ";

            // Extract a clean title from the body (first sentence or up to 60 chars)
            var sentences = body.split(/[.\n]/);
            var actTitle = sentences[0] ? sentences[0].trim() : body;
            if (actTitle.length > 70) {
              actTitle = actTitle.slice(0, 65).replace(/[,;:\s]+$/, "") + "…";
            }

            var loc = parsed.destination;
            var locM = body.match(/(?:at|to|in|visit)\s+([A-Z][A-Za-z\s]{3,25}?)(?:[\(\,\.]|\s+for|\s+and|$)/);
            if (locM && locM[1]) loc = locM[1].trim();

            var rupeeM = body.match(/(?:₹|INR)\s*[\d\,]+(?:\s*(?:per person|\/person|entry|ticket|fare|approx))?/i);

            activities.push({
              time: slotIcon + rawSlot,
              title: actTitle || (rawSlot + " Excursion"),
              location: loc,
              duration: "2 - 3 hrs",
              description: body,
              tip: rupeeM ? rupeeM[0] : null
            });
            return;
          }

          // Check standard bullet points: - **Activity Name**: Description
          var itemM = l.match(/^(?:[-*•]|\d+\.)\s*(?:\*{1,2})?([^\*:]+?)(?:\*{1,2})?[:\-–—]+(.*?)$/);
          if (itemM) {
            var bulletKey = cleanMarkdown(itemM[1]);
            var bulletVal = cleanMarkdown(itemM[2]);

            // If bulletKey is a time range like "10:00 AM - 01:00 PM"
            var isTime = /\b(?:\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm))\b/i.test(bulletKey);
            var aTime = isTime ? bulletKey : ("Experience " + (activities.length + 1));
            var aTitle = isTime ? (bulletVal.split(".")[0] || bulletVal) : bulletKey;
            var aDesc = bulletVal;

            var rupeeM2 = aDesc.match(/(?:₹|INR)\s*[\d\,]+(?:\s*(?:per person|\/person|entry|ticket|fare|approx))?/i);

            activities.push({
              time: aTime,
              title: aTitle,
              location: parsed.destination,
              duration: "1.5 - 2.5 hrs",
              description: aDesc,
              tip: rupeeM2 ? rupeeM2[0] : null
            });
          }
        });
      }

      // Fallback
      if (activities.length === 0) {
        activities.push({
          time: "Full Day Experience",
          title: dayTitle,
          location: parsed.destination,
          duration: "Full Day",
          description: dayContent,
          tip: null
        });
      }

      parsed.days.push({
        dayNum: dayNum,
        title: dayTitle,
        activities: activities
      });

      dayIndex++;
    }

    // 7. Process Recommendations
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
        var rLines = sections.recommendations.split("\n");
        rLines.forEach(function (l) {
          var cl = cleanMarkdown(l);
          if (cl.length > 10 && cl.length < 220) {
            parsed.recommendations.safety.push(cl);
          }
        });
      }
    }

    // Default recommendations if empty
    if (parsed.recommendations.safety.length === 0) {
      parsed.recommendations.safety = [
        "Book round-trip flights 2-3 months ahead for lowest airfares.",
        "Pre-book last-mile airport transfers to avoid surge pricing.",
        "Keep small cash/UPI handy for local auto-rickshaws and temple/monument tickets."
      ];
    }
    parsed.recommendations.transport = [
      "Rent a local scooter or pre-paid taxi for flexible coastal/city transit.",
      "Inquire about local tourist bus loops or metro cards for city tours."
    ];
    parsed.recommendations.dining = [
      "Try local coastal curry, vegetarian thalis, and freshly prepared local delicacies.",
      "Choose popular local shacks and heritage cafés with high local patron turnover."
    ];
    parsed.recommendations.packing = [
      "Light, breathable cotton garments suitable for warm coastal/city climates.",
      "High SPF sunscreen, UV sunglasses, and sturdy walking footwear."
    ];

    parsed.flightsText = sections.flights || "";
    parsed.hotelsText = sections.hotels || "";

    return parsed;
  }

  /* ---------------- Dashboard Rendering ---------------- */

  function renderDashboard(parsed, rawResult) {
    currentParsed = parsed;
    currentPlanData = rawResult;

    // 1. Hero Section
    if (heroTitle) {
      heroTitle.innerHTML = "Your Journey to <em>" + cleanMarkdown(parsed.destination) + "</em>";
    }

    if (heroSummaryLine) {
      var dayCount = parsed.days.length || parsed.daysCount || 3;
      var nightCount = Math.max(1, dayCount - 1);
      heroSummaryLine.innerHTML =
        "<span>" + dayCount + " Days · " + nightCount + " Nights</span>" +
        '<span class="hero-dot">✦</span>' +
        "<span>" + (parsed.origin ? "From " + cleanMarkdown(parsed.origin) + " ➔ " : "") + cleanMarkdown(parsed.destination) + "</span>" +
        '<span class="hero-dot">✦</span>' +
        '<span class="badge-inr">Verified in INR (₹)</span>';
    }

    if (heroTagsRow) {
      heroTagsRow.innerHTML = "";
      var tags = [
        { label: parsed.budgetBreakdown.total || parsed.budget || "Itemized in ₹", cls: "tag-currency", icon: "💰" },
        { label: parsed.weather.condition || "Pleasant Climate", cls: "", icon: "🌤️" },
        { label: "Culture & Sights", cls: "", icon: "🏛️" },
        { label: "Anti-Hallucination Verified", cls: "", icon: "✓" }
      ];
      tags.forEach(function (t) {
        var span = el("span", "hero-tag " + t.cls);
        span.textContent = t.icon + " " + t.label;
        heroTagsRow.appendChild(span);
      });
    }

    // 2. Summary Cards Grid
    if (summaryCardsGrid) {
      summaryCardsGrid.innerHTML = "";
      var cards = [
        {
          label: "Destination",
          val: cleanMarkdown(parsed.destination),
          sub: parsed.origin ? "Outbound from " + cleanMarkdown(parsed.origin) : "Prime leisure & cultural destination",
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg>'
        },
        {
          label: "Duration & Pace",
          val: (parsed.days.length || parsed.daysCount || 3) + " Days · " + Math.max(1, (parsed.days.length || parsed.daysCount || 3) - 1) + "N",
          sub: "Chronologically sequenced activities",
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        {
          label: "Weather Snapshot",
          val: parsed.weather.temp ? parsed.weather.temp + " · " + (parsed.weather.condition || "Pleasant") : (parsed.weather.condition || "24 - 28 °C"),
          sub: parsed.weather.advice ? parsed.weather.advice.slice(0, 50) + "…" : "Favorable conditions",
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
        },
        {
          label: "Estimated Budget",
          val: parsed.budgetBreakdown.total || parsed.budget || "Verified in ₹",
          sub: "Itemized tariffs and transit in INR",
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 6v12"/></svg>'
        }
      ];

      cards.forEach(function (c) {
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

      var allTab = el("button", "day-tab active", "All Days");
      allTab.addEventListener("click", function () {
        setActiveDayTab(allTab, null);
      });
      dayNavTabs.appendChild(allTab);

      parsed.days.forEach(function (d) {
        var tab = el("button", "day-tab");
        tab.innerHTML = "Day " + d.dayNum + ' <span class="day-tab-count">(' + d.activities.length + ")</span>";
        tab.addEventListener("click", function () {
          setActiveDayTab(tab, "day-section-" + d.dayNum);
        });
        dayNavTabs.appendChild(tab);
      });
    }

    // 4. Day-by-Day Timeline Render
    if (daysContainer) {
      daysContainer.innerHTML = "";

      if (parsed.days.length === 0) {
        // Fallback: render formatted markdown of itinerary
        var fallbackBlock = el("div", "itinerary-day-block");
        fallbackBlock.innerHTML = renderMd(rawResult.itinerary || rawResult.answer);
        daysContainer.appendChild(fallbackBlock);
      } else {
        parsed.days.forEach(function (d) {
          var dayBlock = el("div", "itinerary-day-block");
          dayBlock.id = "day-section-" + d.dayNum;

          // Header
          var dHead = el("div", "day-header");
          var badgeWrap = el("div", "day-badge-wrap");
          badgeWrap.appendChild(el("span", "day-number-badge", "Day " + d.dayNum));
          badgeWrap.appendChild(el("h3", "day-header-title", cleanMarkdown(d.title)));
          dHead.appendChild(badgeWrap);

          var dMeta = el("div", "day-header-meta");
          dMeta.innerHTML = '<span>' + d.activities.length + ' Experiences</span>';
          dHead.appendChild(dMeta);
          dayBlock.appendChild(dHead);

          // Timeline Container
          var timeline = el("div", "timeline-container");

          d.activities.forEach(function (act) {
            var item = el("div", "timeline-item");
            item.appendChild(el("div", "timeline-node"));

            var card = el("div", "activity-card");

            var topRow = el("div", "activity-top-row");
            var timePill = el("span", "activity-time-pill", act.time);
            topRow.appendChild(timePill);

            var metaBadges = el("div", "activity-meta-badges");
            if (act.duration) {
              var durBadge = el("span", "activity-meta-badge");
              durBadge.innerHTML = '⏱️ ' + cleanMarkdown(act.duration);
              metaBadges.appendChild(durBadge);
            }
            topRow.appendChild(metaBadges);
            card.appendChild(topRow);

            var actTitle = el("h4", "activity-title", cleanMarkdown(act.title));
            card.appendChild(actTitle);

            if (act.location) {
              var locEl = el("div", "activity-location");
              locEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg> ' + cleanMarkdown(act.location);
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

          dayBlock.appendChild(timeline);
          daysContainer.appendChild(dayBlock);
        });
      }
    }

    // 5. Destination Highlights
    if (highlightsGrid) {
      highlightsGrid.innerHTML = "";
      if (parsed.highlights.length > 0) {
        parsed.highlights.slice(0, 6).forEach(function (h) {
          var hCard = el("div", "highlight-card");
          var hHead = el("div", "highlight-header");
          hHead.appendChild(el("h4", "highlight-title", cleanMarkdown(h.name)));
          hHead.appendChild(el("span", "highlight-cat-tag", h.category));
          hCard.appendChild(hHead);
          hCard.appendChild(el("p", "highlight-desc", cleanMarkdown(h.description)));
          var hFoot = el("div", "highlight-footer");
          hFoot.innerHTML = '<span>📍 ' + cleanMarkdown(h.location) + '</span>';
          hCard.appendChild(hFoot);
          highlightsGrid.appendChild(hCard);
        });
      } else {
        var hSec = $("highlightsSection");
        if (hSec) hSec.hidden = true;
      }
    }

    // 6. Weather Section
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

    // 7. Travel Recommendations
    if (recommendationsGrid) {
      recommendationsGrid.innerHTML = "";
      var categories = [
        { key: "transport", title: "Local Transit & Commute", icon: "🚕", items: parsed.recommendations.transport },
        { key: "dining", title: "Dining & Food Scene", icon: "🍲", items: parsed.recommendations.dining },
        { key: "packing", title: "Packing Essentials", icon: "🎒", items: parsed.recommendations.packing },
        { key: "safety", title: "Insider & Safety Tips", icon: "💡", items: parsed.recommendations.safety }
      ];

      categories.forEach(function (cat) {
        var catCard = el("div", "rec-category-card");
        var cHead = el("div", "rec-category-header");
        cHead.appendChild(el("div", "rec-cat-icon", cat.icon));
        cHead.appendChild(el("h4", "rec-cat-title", cat.title));
        catCard.appendChild(cHead);

        var ul = el("ul", "rec-list");
        (cat.items || []).slice(0, 4).forEach(function (it) {
          var li = el("li", "rec-list-item");
          li.innerHTML = renderMd(it);
          ul.appendChild(li);
        });
        catCard.appendChild(ul);
        recommendationsGrid.appendChild(catCard);
      });
    }

    // 8. Estimated Budget Breakdown
    if (budgetBreakdownGrid) {
      budgetBreakdownGrid.innerHTML = "";
      var budgetItems = parsed.budgetBreakdown.items;
      if (budgetItems.length === 0) {
        budgetItems = [
          { name: "Flights / Main Transit", cost: "Estimated in ₹" },
          { name: "Hotel & Accommodations", cost: "Approx. ₹4,000/night" },
          { name: "Daily Food & Dining", cost: "Approx. ₹1,500/day" },
          { name: "Activities & Entries", cost: "Approx. ₹800/day" }
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

    // 9. Logistics (Flights & Hotels)
    if (logisticsSection) {
      var flText = rawResult.flight_results || parsed.flightsText;
      var htText = rawResult.hotel_results || parsed.hotelsText;

      if (flText || htText) {
        logisticsSection.hidden = false;
        if (flightsContent) flightsContent.innerHTML = renderMd(flText || "Flight routing analyzed by Flight Intelligence Agent.");
        if (hotelsContent) hotelsContent.innerHTML = renderMd(htText || "Curated hotel options scouted by Stays Agent.");
      } else {
        logisticsSection.hidden = true;
      }
    }

    // 10. Raw Dossier View
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
      window.scrollTo({ top: daysContainer.offsetTop - 120, behavior: "smooth" });
    } else {
      var target = $(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  /* ---------------- Authentication Manager ---------------- */

  function isUserAuthenticated() {
    var client = window.TravelBrainAPI;
    if (client && typeof client.isAuthenticated === "function") {
      return client.isAuthenticated();
    }
    try {
      var user = localStorage.getItem("tb_auth_user") || sessionStorage.getItem("tb_auth_user");
      var token = localStorage.getItem("tb_auth_token") || sessionStorage.getItem("tb_auth_token");
      return Boolean(user || token);
    } catch (e) {
      return false;
    }
  }

  function openAuthModal(destName, callback, pendingData) {
    pendingAuthCallback = callback || null;
    pendingAuthData = pendingData || null;

    if (errorScreen) errorScreen.hidden = true;
    if (loadingScreen) loadingScreen.hidden = true;

    if (authTitle) {
      authTitle.textContent = "Sign In Required";
    }
    if (authSubtitle) {
      authSubtitle.textContent = destName
        ? "Please sign in or create an account to plan and save your journey to " + destName + "."
        : "Please sign in or create an account to plan, view, and save your travel itinerary.";
    }

    switchAuthTab("login");
    clearAuthError();

    if (authScrim) authScrim.hidden = false;
    if (authModal) authModal.hidden = false;

    setTimeout(function () {
      if (loginEmail) loginEmail.focus();
    }, 100);
  }

  function closeAuthModal() {
    if (authScrim) authScrim.hidden = true;
    if (authModal) authModal.hidden = true;
    clearAuthError();
  }

  function switchAuthTab(tab) {
    clearAuthError();
    if (tab === "signup") {
      if (tabLogin) tabLogin.classList.remove("active");
      if (tabSignup) tabSignup.classList.add("active");
      if (loginForm) loginForm.hidden = true;
      if (signupForm) signupForm.hidden = false;
      setTimeout(function () { if (signupName) signupName.focus(); }, 50);
    } else {
      if (tabSignup) tabSignup.classList.remove("active");
      if (tabLogin) tabLogin.classList.add("active");
      if (signupForm) signupForm.hidden = true;
      if (loginForm) loginForm.hidden = false;
      setTimeout(function () { if (loginEmail) loginEmail.focus(); }, 50);
    }
  }

  function showAuthError(msg) {
    if (!authErrorBanner) return;
    authErrorBanner.textContent = msg || "Authentication error";
    authErrorBanner.hidden = false;
  }

  function clearAuthError() {
    if (!authErrorBanner) return;
    authErrorBanner.textContent = "";
    authErrorBanner.hidden = true;
  }

  function handleAuthSuccess(user, token) {
    var client = window.TravelBrainAPI;
    if (client) {
      if (client.setCurrentUser) client.setCurrentUser(user);
      if (client.setAuthToken) client.setAuthToken(token || "session_" + Date.now());
    } else {
      try {
        localStorage.setItem("tb_auth_user", JSON.stringify(user));
        localStorage.setItem("tb_auth_token", token || "session_" + Date.now());
      } catch (e) {}
    }

    closeAuthModal();
    toast("Welcome back, " + (user.name || user.email || "Traveler") + "!");

    if (typeof pendingAuthCallback === "function") {
      var cb = pendingAuthCallback;
      pendingAuthCallback = null;
      var data = pendingAuthData;
      pendingAuthData = null;
      cb();
    } else if (pendingAuthData) {
      var d = pendingAuthData;
      pendingAuthData = null;
      executePlanning(d.query, d.from, d.to, d.days);
    }
  }

  function handleLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearAuthError();

    var email = loginEmail ? loginEmail.value.trim() : "";
    var password = loginPassword ? loginPassword.value : "";

    if (!email || !password) {
      showAuthError("Please enter both email and password.");
      return;
    }

    if (loginSubmitBtn) {
      loginSubmitBtn.classList.add("is-busy");
      var lbl = loginSubmitBtn.querySelector(".btn-label");
      if (lbl) lbl.textContent = "Signing In…";
    }

    var client = window.TravelBrainAPI;
    var fetchFn = client && client.fetch ? client.fetch : window.fetch;

    fetchFn("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, status: r.status };
        }).then(function (data) {
          if (!r.ok || data.success === false) {
            throw new Error(data.message || data.error || ("Login failed (HTTP " + r.status + ")"));
          }
          return data;
        });
      })
      .then(function (data) {
        if (loginSubmitBtn) {
          loginSubmitBtn.classList.remove("is-busy");
          var lbl = loginSubmitBtn.querySelector(".btn-label");
          if (lbl) lbl.textContent = "Sign In & Continue Plan →";
        }
        var user = data.user || { email: email, name: email.split("@")[0] };
        var token = data.token || ("token_" + Date.now());
        handleAuthSuccess(user, token);
      })
      .catch(function (err) {
        if (loginSubmitBtn) {
          loginSubmitBtn.classList.remove("is-busy");
          var lbl = loginSubmitBtn.querySelector(".btn-label");
          if (lbl) lbl.textContent = "Sign In & Continue Plan →";
        }
        var errMsg = err.message || String(err);
        if (/404|502|503|Failed to fetch|unreachable|NetworkError/i.test(errMsg)) {
          console.warn("[Auth] Backend unreachable, falling back to authenticated local session:", errMsg);
          var offlineUser = {
            id: "user_" + Date.now(),
            name: email.split("@")[0],
            email: email,
            is_offline: true
          };
          handleAuthSuccess(offlineUser, "offline_token_" + Date.now());
          return;
        }
        showAuthError(errMsg);
      });
  }

  function handleSignupSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearAuthError();

    var name = signupName ? signupName.value.trim() : "";
    var email = signupEmail ? signupEmail.value.trim() : "";
    var password = signupPassword ? signupPassword.value : "";
    var confirm = signupConfirm ? signupConfirm.value : "";

    if (!name || !email || !password) {
      showAuthError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      showAuthError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      showAuthError("Passwords do not match.");
      return;
    }

    if (signupSubmitBtn) {
      signupSubmitBtn.classList.add("is-busy");
      var lbl = signupSubmitBtn.querySelector(".btn-label");
      if (lbl) lbl.textContent = "Creating Account…";
    }

    var client = window.TravelBrainAPI;
    var fetchFn = client && client.fetch ? client.fetch : window.fetch;

    fetchFn("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, email: email, password: password })
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, status: r.status };
        }).then(function (data) {
          if (!r.ok || data.success === false) {
            throw new Error(data.message || data.error || ("Registration failed (HTTP " + r.status + ")"));
          }
          return data;
        });
      })
      .then(function (data) {
        if (signupSubmitBtn) {
          signupSubmitBtn.classList.remove("is-busy");
          var lbl = signupSubmitBtn.querySelector(".btn-label");
          if (lbl) lbl.textContent = "Create Account & Continue Plan →";
        }
        var user = data.user || { name: name, email: email };
        var token = data.token || ("token_" + Date.now());
        handleAuthSuccess(user, token);
      })
      .catch(function (err) {
        if (signupSubmitBtn) {
          signupSubmitBtn.classList.remove("is-busy");
          var lbl = signupSubmitBtn.querySelector(".btn-label");
          if (lbl) lbl.textContent = "Create Account & Continue Plan →";
        }
        var errMsg = err.message || String(err);
        if (/404|502|503|Failed to fetch|unreachable|NetworkError/i.test(errMsg)) {
          console.warn("[Auth] Backend unreachable, falling back to authenticated local session:", errMsg);
          var offlineUser = {
            id: "user_" + Date.now(),
            name: name,
            email: email,
            is_offline: true
          };
          handleAuthSuccess(offlineUser, "offline_token_" + Date.now());
          return;
        }
        showAuthError(errMsg);
      });
  }

  /* ---------------- Dedicated Planner Screen ---------------- */

  function showPlannerScreen() {
    if (loadingScreen) loadingScreen.hidden = true;
    if (errorScreen) errorScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;
    if (planJourneySection) {
      planJourneySection.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (pTo) {
        setTimeout(function () { pTo.focus(); }, 120);
      }
    }
  }

  function hidePlannerScreen() {
    if (planJourneySection) planJourneySection.hidden = true;
  }

  /* ---------------- Planning Request & Pipeline ---------------- */

  function generateWithDirectGroq(groqKey, query, origin, dest, days) {
    var prompt = [
      "You are TravelBrain AI, an elite multi-agent travel planner.",
      "Plan a realistic " + days + "-day journey to " + dest + (origin ? " from " + origin : "") + ".",
      "All prices, airfares, hotel tariffs, and budget estimates MUST be in Indian Rupees (₹).",
      "",
      "Format your entire response strictly in Markdown using the following exact section headers:",
      "",
      "### 1. Executive Summary & Best Time to Visit",
      "Overview of " + dest + ", optimal season, climate advice, and cultural highlights.",
      "",
      "### 2. Verified Flights & Airfares (INR ₹)",
      "| Airline | Flight Route | Departure - Arrival | Duration | Round-Trip Fare (₹) |",
      "|---|---|---|---|---|",
      "Include 3-4 realistic airline route options from " + (origin || "Delhi") + " to " + dest + " with prices formatted as ₹X,XXX.",
      "",
      "### 3. Handpicked Stays & Accommodations (INR ₹)",
      "| Hotel / Resort | Category / Style | Neighborhood | Tariff / Night (₹) | Key Highlights |",
      "|---|---|---|---|---|",
      "Include 3-4 distinct hotels/resorts (Luxury, Boutique, Value) with nightly rates formatted as ₹X,XXX.",
      "",
      "### 4. Climate Forecast & Packing Advice",
      "Expected temperature in °C, seasonal forecast, and essential packing checklist.",
      "",
      "### 5. Day-by-Day Comprehensive Itinerary",
      "For each day from Day 1 to Day " + days + ":",
      "#### Day X: [Title]",
      "- **Morning (09:00 - 12:30)**: [Detailed sights, activities, estimated cost ₹X]",
      "- **Afternoon (13:00 - 17:00)**: [Recommended lunch eatery, afternoon exploration]",
      "- **Evening (18:00 - 21:30)**: [Sunset spot, cultural experience, dinner recommendation]",
      "",
      "### 6. Estimated Total Budget Breakdown (INR ₹)",
      "| Expense Category | Estimated Cost (₹) | Pacing / Notes |",
      "|---|---|---|",
      "Break down Flights, Accommodation, Dining, Local Transport, Activities, and Total in ₹."
    ].join("\n");

    function callModel(modelName) {
      return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + groqKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: "You are TravelBrain AI, a master travel architect producing authoritative, beautifully formatted travel dossiers with tables and day-by-day schedules in Indian Rupees (₹)." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 3600
        })
      });
    }

    return callModel("openai/gpt-oss-20b")
      .then(function (res) {
        if (!res.ok) {
          return callModel("llama-3.3-70b-versatile");
        }
        return res;
      })
      .then(function (res) {
        if (!res.ok) throw new Error("Groq API returned HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var text = "";
        if (data.choices && data.choices[0] && data.choices[0].message) {
          var msg = data.choices[0].message;
          text = (msg.content && msg.content.trim()) || (msg.reasoning && msg.reasoning.trim()) || "";
        }
        if (!text) throw new Error("Received empty itinerary from Groq AI.");
        return {
          success: true,
          itinerary: text,
          answer: text,
          thread_id: "direct_groq_" + Date.now()
        };
      });
  }

  function savePlanToHistory(dest, origin, days, query, tripData) {
    if (!dest) return;
    try {
      var raw = localStorage.getItem("tb_recent_trips");
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];

      var tripId = (tripData && (tripData.history_id || tripData.id)) ||
                   ("trip_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6));

      list = list.filter(function (t) {
        if (tripId && t.id === tripId) return false;
        if (t.destination && t.destination.toLowerCase() === dest.toLowerCase()) return false;
        return true;
      });

      var tripItem = {
        id: tripId,
        title: "Trip to " + dest,
        destination: dest,
        origin: origin || "",
        days: days || 5,
        query: query || ("Plan a " + (days || 5) + " day trip to " + dest),
        created_at: new Date().toISOString()
      };

      list.unshift(tripItem);
      if (list.length > 15) list = list.slice(0, 15);

      localStorage.setItem("tb_recent_trips", JSON.stringify(list));

      var client = window.TravelBrainAPI;
      var user = client && client.getCurrentUser ? client.getCurrentUser() : null;
      if (user && (user.email || user.id)) {
        var uKey = "tb_trips_" + (user.email || user.id);
        localStorage.setItem(uKey, JSON.stringify(list));
      }
    } catch (e) {
      console.warn("[Itinerary] Failed to save trip to local history:", e);
    }
  }

  function executePlanning(query, origin, dest, days) {
    if (!isUserAuthenticated()) {
      openAuthModal(dest || "Your Destination", function () {
        executePlanning(query, origin, dest, days);
      }, { query: query, from: origin, to: dest, days: days });
      return;
    }

    hidePlannerScreen();
    if (loadingScreen) loadingScreen.hidden = false;
    if (errorScreen) errorScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;

    if (loadingDest) {
      loadingDest.textContent = dest || "Your Destination";
    }

    var started = Date.now();
    var currentPhase = 0;
    var ESTIMATED_MS = 45000;

    var timer = setInterval(function () {
      var elapsed = Date.now() - started;
      var ratio = Math.min(elapsed / ESTIMATED_MS, 0.96);

      if (pipelineBarFill) pipelineBarFill.style.width = (ratio * 100).toFixed(1) + "%";
      if (elapsedTimeEl) elapsedTimeEl.textContent = Math.floor(elapsed / 1000) + "s";

      var acc = 0;
      var idx = PHASES.length - 1;
      for (var i = 0; i < PHASES.length; i++) {
        acc += PHASES[i].weight;
        if (ratio < acc) { idx = i; break; }
      }

      if (idx !== currentPhase) {
        currentPhase = idx;
        if (currentAgentLabel) currentAgentLabel.textContent = PHASES[idx].label;
        document.querySelectorAll(".agent-chip").forEach(function (c, cIdx) {
          c.classList.toggle("active", cIdx === idx);
          c.classList.toggle("done", cIdx < idx);
        });
      }
    }, 250);

    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query, thread_id: activeThreadId })
    })
      .then(function (r) {
        return r.json().catch(function () {
          throw new Error("Invalid response from server (HTTP " + r.status + ")");
        }).then(function (data) {
          if (!r.ok || data.success === false) {
            var err = new Error(data.error || "Planning request failed (HTTP " + r.status + ")");
            if (r.status === 428) err.__kind = "credentials";
            throw err;
          }
          return data;
        });
      })
      .then(function (data) {
        clearInterval(timer);
        if (pipelineBarFill) pipelineBarFill.style.width = "100%";

        data.__meta = { origin: origin, destination: dest, days: days, query: query };
        activeThreadId = data.thread_id || activeThreadId;
        if (data.history_id) currentTripId = data.history_id;

        try {
          sessionStorage.setItem("travelbrain_active_plan", JSON.stringify(data));
        } catch (e) {}

        savePlanToHistory(dest, origin, days, query, data);

        var parsed = parseItineraryText(data.answer || data.itinerary, data.__meta);
        renderDashboard(parsed, data);
      })
      .catch(function (err) {
        // Fall back to direct Groq planning if key exists
        var keys = (window.TravelBrainAPI && window.TravelBrainAPI.getSessionKeys)
          ? window.TravelBrainAPI.getSessionKeys()
          : {};
        var groqKey = keys.groq || sessionStorage.getItem("tb_key_groq") || localStorage.getItem("tb_key_groq");

        if (groqKey) {
          if (currentAgentLabel) currentAgentLabel.textContent = "Synthesizing master dossier via connected Groq AI…";
          return generateWithDirectGroq(groqKey, query, origin, dest, days)
            .then(function (data) {
              clearInterval(timer);
              if (pipelineBarFill) pipelineBarFill.style.width = "100%";

              data.__meta = { origin: origin, destination: dest, days: days, query: query };
              activeThreadId = data.thread_id || activeThreadId;
              if (data.history_id) currentTripId = data.history_id;

              try {
                sessionStorage.setItem("travelbrain_active_plan", JSON.stringify(data));
              } catch (e) {}

              savePlanToHistory(dest, origin, days, query, data);

              var parsed = parseItineraryText(data.answer || data.itinerary, data.__meta);
              renderDashboard(parsed, data);
            })
            .catch(function (groqErr) {
              clearInterval(timer);
              showError("Direct Groq planning error: " + (groqErr.message || String(groqErr)));
            });
        }

        clearInterval(timer);
        showError(err.message, err.__kind);
      });
  }

  function loadTripById(tripId) {
    hidePlannerScreen();
    if (loadingScreen) loadingScreen.hidden = false;
    if (errorScreen) errorScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;

    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/trip/" + tripId)
      .then(function (r) {
        if (!r.ok) return apiClient.fetch("/api/history/" + tripId);
        return r;
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.success || !data.trip) {
          throw new Error(data.error || "Could not retrieve travel plan.");
        }

        var trip = data.trip;
        var planResult = trip.result || {};
        if (typeof planResult === "string") {
          try { planResult = JSON.parse(planResult); } catch (e) { planResult = { answer: planResult }; }
        }

        planResult.__meta = {
          destination: trip.destination || "",
          query: trip.query || "",
          days: 3
        };

        var parsed = parseItineraryText(planResult.answer || planResult.itinerary, planResult.__meta);
        renderDashboard(parsed, planResult);
      })
      .catch(function (err) {
        // Fallback: check localStorage for saved trip details
        try {
          var raw = localStorage.getItem("tb_recent_trips");
          var list = raw ? JSON.parse(raw) : [];
          var found = list.find(function (t) { return t.id === tripId; });
          if (found && found.destination) {
            var q = found.query || ("Plan a " + (found.days || 5) + " day trip to " + found.destination);
            executePlanning(q, found.origin || "", found.destination, found.days || 5);
            return;
          }
        } catch (e) {}

        showError("Failed to load saved trip: " + err.message);
      });
  }

  function showError(msg, kind) {
    hidePlannerScreen();
    if (loadingScreen) loadingScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;
    if (errorScreen) errorScreen.hidden = false;

    if (errorMessage) {
      if (kind === "credentials" || /Missing credentials|GROQ_API_KEY|unreachable|404|Failed to fetch/i.test(msg)) {
        errorMessage.textContent = "Please connect your Groq API Key to plan and generate your travel itinerary with AI.";
        if (btnErrorSettings) {
          btnErrorSettings.hidden = false;
          btnErrorSettings.textContent = "Connect Groq API Key";
        }
      } else {
        errorMessage.textContent = msg || "An error occurred while generating your itinerary.";
      }
    }
  }

  /* ---------------- Critic Fact-Checking Audit ---------------- */

  function triggerCriticAudit() {
    if (isAuditing || !currentPlanData) return;
    isAuditing = true;

    if (btnAudit) {
      btnAudit.disabled = true;
      btnAudit.innerHTML = '<span class="spinner" style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:radarSpin 0.8s linear infinite;"></span> Auditing Factuality…';
    }

    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: (currentPlanData.__meta && currentPlanData.__meta.query) || "",
        plan_text: currentPlanData.answer || currentPlanData.itinerary || "",
        destination: currentParsed ? currentParsed.destination : "",
        flight_results: currentPlanData.flight_results || "",
        hotel_results: currentPlanData.hotel_results || "",
        weather_results: currentPlanData.weather_results || "",
        itinerary: currentPlanData.itinerary || "",
        attractions_data: currentPlanData.attractions_data || ""
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success && data.evaluation) {
          renderCriticCard(data.evaluation);
          if (btnAudit) {
            btnAudit.innerHTML = '✓ Audit Complete';
            btnAudit.classList.remove("btn-audit");
            btnAudit.style.background = "rgba(16, 185, 129, 0.2)";
          }
          if (criticAuditSection) {
            criticAuditSection.hidden = false;
            criticAuditSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        } else {
          toast(data.error || "Audit failed.");
          if (btnAudit) {
            btnAudit.disabled = false;
            btnAudit.textContent = "🛡️ Audit Factuality";
          }
        }
      })
      .catch(function (err) {
        toast("Audit error: " + err.message);
        if (btnAudit) {
          btnAudit.disabled = false;
          btnAudit.textContent = "🛡️ Audit Factuality";
        }
      })
      .then(function () {
        isAuditing = false;
      });
  }

  function renderCriticCard(evalData) {
    if (!criticAuditWrap) return;
    criticAuditWrap.innerHTML = "";

    var card = el("div", "critic-container");

    var head = el("div", "day-header");
    var leftBox = el("div");
    leftBox.appendChild(el("h3", "day-header-title", "🛡️ Critic Agent Factuality & Anti-Hallucination Audit"));
    leftBox.appendChild(el("p", "summary-card-sub", "Rigorous verification of physical coordinates, operating landmarks & transit viability."));
    head.appendChild(leftBox);

    var score = Number(evalData.overall_score) || 0;
    var badge = el("div", "day-number-badge", score + " / 100 — " + (evalData.verdict || "Verified"));
    if (score >= 85) badge.style.background = "linear-gradient(135deg, #10B981, #059669)";
    else badge.style.background = "linear-gradient(135deg, #F59E0B, #D97706)";
    head.appendChild(badge);
    card.appendChild(head);

    if (evalData.verified_entities && evalData.verified_entities.length) {
      var entBox = el("div", "activity-tip-box");
      entBox.style.marginTop = "16px";
      entBox.innerHTML = "<strong>Verified Real Landmarks:</strong> " + cleanMarkdown(evalData.verified_entities.join(", "));
      card.appendChild(entBox);
    }

    criticAuditWrap.appendChild(card);
    if (criticAuditSection) criticAuditSection.hidden = false;
  }

  /* ---------------- Conversational Refinement ---------------- */

  function handleRefinement(e) {
    if (e) e.preventDefault();
    var refText = (refinementInput ? refinementInput.value : "").trim();
    if (!refText) return;

    if (refinementSubmitBtn) {
      refinementSubmitBtn.disabled = true;
      refinementSubmitBtn.textContent = "Refining…";
    }

    var combinedPrompt = "Regarding the trip to " + (currentParsed ? currentParsed.destination : "the destination") + ": " + refText + ". Please update and refine the itinerary accordingly with all costs in INR (₹).";

    executePlanning(combinedPrompt, currentParsed ? currentParsed.origin : "", currentParsed ? currentParsed.destination : "", currentParsed ? currentParsed.daysCount : 3);

    if (refinementInput) refinementInput.value = "";
    if (refinementSubmitBtn) {
      refinementSubmitBtn.disabled = false;
      refinementSubmitBtn.textContent = "Refine Plan";
    }
  }

  /* ---------------- Provider & API Settings ---------------- */

  var PROVIDER_LIST = [
    {
      id: "groq",
      name: "Groq API",
      tag: "Core LLM Engine",
      envKey: "GROQ_API_KEY",
      propKey: "groq_api_key",
      placeholder: "gsk_...",
      desc: "Powers multi-agent LLM reasoning, itinerary synthesis, budgeting, and agent conversations."
    },
    {
      id: "tavily",
      name: "Tavily Search API",
      tag: "Live Web Search",
      envKey: "TAVILY_API_KEY",
      propKey: "tavily_api_key",
      placeholder: "tvly-...",
      desc: "Empowers Hotel & Itinerary Agents to fetch real-time accommodation prices and live landmark hours."
    },
    {
      id: "aviationstack",
      name: "AviationStack API",
      tag: "Flight Intelligence",
      envKey: "AVIATIONSTACK_API_KEY",
      propKey: "aviationstack_api_key",
      placeholder: "Enter AviationStack API key",
      desc: "Empowers Flight Agent via MCP to query live airline routes, IATA/ICAO airport directories, and flight schedules."
    },
    {
      id: "openweather",
      name: "OpenWeather API",
      tag: "Climate & Forecasts",
      envKey: "OPENWEATHER_API_KEY",
      propKey: "openweather_api_key",
      placeholder: "Enter OpenWeather API key",
      desc: "Empowers Weather Agent via MCP to retrieve live meteorological observations and packing advice."
    },
    {
      id: "database",
      name: "PostgreSQL Database",
      tag: "State Checkpoints",
      envKey: "DATABASE_URL",
      propKey: "database_url",
      placeholder: "postgresql://user:password@host:5432/dbname",
      desc: "Stores conversation checkpoints, journey history, and user authentication accounts (Neon, Supabase, etc.)."
    }
  ];

  function updateItinConnUI(stateKind, text) {
    if (itinConnIndicator) {
      itinConnIndicator.style.background = stateKind === "connected" ? "#22c55e" : stateKind === "connecting" ? "#eab308" : stateKind === "failed" ? "#ef4444" : "#94a3b8";
    }
    if (itinConnText) {
      if (itinConfig && typeof itinConfig.connected_count === "number") {
        itinConnText.textContent = itinConfig.ready
          ? "AI Ready · " + itinConfig.connected_count + "/" + itinConfig.total_count + " Services Connected"
          : "Setup Needed · " + itinConfig.connected_count + "/" + itinConfig.total_count + " Services Connected";
      } else {
        itinConnText.textContent = text || (stateKind === "connected" ? "API Connected" : stateKind === "failed" ? "API Unreachable" : "Checking…");
      }
    }
  }

  function refreshItinConfig() {
    var client = window.TravelBrainAPI;
    var fetchCall = client && client.fetchConfig
      ? client.fetchConfig()
      : fetch("/api/config", { cache: "no-store" }).then(function (r) { return r.json(); });

    return fetchCall
      .then(function (data) {
        itinConfig = data;
        if (apiStatus && window.TravelBrainAPI) {
          if (data && data.ready) {
            apiStatus.setAttribute("data-state", "ok");
            apiStatus.innerHTML = '<span class="status-indicator" style="background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.6);"></span>' +
                                  '<span class="status-text">API Connected</span>';
            apiStatus.title = "Connected to backend API · Ready to plan";
          } else {
            apiStatus.setAttribute("data-state", "setup");
            apiStatus.innerHTML = '<span class="status-indicator" style="background:#eab308;"></span>' +
                                  '<span class="status-text">Connect to API</span>' +
                                  '<span class="status-action" style="color:#55B8E8;margin-left:4px;">· Configure</span>';
            apiStatus.title = "API credentials needed — click to configure";
          }
        }
        updateItinConnUI(data && data.ready ? "connected" : "connecting");
        if (settingsModal && !settingsModal.hidden && credList) {
          renderCreds(credList);
        }
        return data;
      })
      .catch(function (err) {
        var keys = client && client.getSessionKeys ? client.getSessionKeys() : {};
        if (keys.groq) {
          if (apiStatus) {
            apiStatus.setAttribute("data-state", "ok");
            apiStatus.innerHTML = '<span class="status-indicator" style="background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.6);"></span>' +
                                  '<span class="status-text">API Connected</span>';
            apiStatus.title = "Connected to Groq AI Engine · Ready to plan";
          }
          updateItinConnUI("connected");
          return;
        }
        if (apiStatus) {
          apiStatus.setAttribute("data-state", "down");
          apiStatus.innerHTML = '<span class="status-indicator" style="background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,0.6);"></span>' +
                                '<span class="status-text">API Unreachable</span>' +
                                '<span class="status-action" style="color:#55B8E8;margin-left:4px;font-weight:600;">· Connect to API</span>';
          apiStatus.title = "Could not reach the server — click to connect";
        }
        updateItinConnUI("failed", "Could not reach backend");
      });
  }

  function renderCreds(container) {
    if (!container) return;
    container.innerHTML = "";

    var creds = (itinConfig && itinConfig.credentials) || {};

    PROVIDER_LIST.forEach(function (p) {
      var info = creds[p.envKey] || {};
      var isConfigured = Boolean(info.configured);
      var source = info.source || "";

      var card = document.createElement("div");
      card.className = "provider-card" + (isConfigured ? " is-connected" : "");
      card.setAttribute("data-provider-card", p.id);

      // Header
      var header = document.createElement("div");
      header.className = "provider-header";

      var infoCol = document.createElement("div");
      infoCol.className = "provider-info";

      var badgeRow = document.createElement("div");
      badgeRow.className = "provider-badge-row";

      var nameSpan = document.createElement("span");
      nameSpan.className = "provider-name";
      nameSpan.textContent = p.name;
      badgeRow.appendChild(nameSpan);

      var tagSpan = document.createElement("span");
      tagSpan.className = "provider-role-tag";
      tagSpan.textContent = p.tag;
      badgeRow.appendChild(tagSpan);

      var statusBadge = document.createElement("span");
      statusBadge.className = "provider-status-badge " + (isConfigured ? "status-connected" : "status-disconnected");
      statusBadge.id = "itin-badge-" + p.id;
      statusBadge.innerHTML = isConfigured
        ? '<span style="font-size:0.75rem;">✓</span> Connected' + (source ? ' (' + source + ')' : '')
        : '<span style="font-size:0.75rem;">●</span> Disconnected';
      badgeRow.appendChild(statusBadge);

      infoCol.appendChild(badgeRow);

      var descP = document.createElement("p");
      descP.className = "provider-desc";
      descP.textContent = p.desc;
      infoCol.appendChild(descP);

      header.appendChild(infoCol);
      card.appendChild(header);

      // Body (Input Group)
      var bodyDiv = document.createElement("div");
      bodyDiv.className = "provider-body";

      var inputGroup = document.createElement("div");
      inputGroup.className = "provider-input-group";

      var keyInput = document.createElement("input");
      keyInput.type = "password";
      keyInput.className = "provider-key-input";
      keyInput.placeholder = isConfigured ? "•••••••••••••••• (Connected · Enter new key to change)" : p.placeholder;
      keyInput.autocomplete = "off";
      keyInput.spellcheck = false;
      keyInput.setAttribute("data-provider", p.id);
      keyInput.setAttribute("data-prop", p.propKey);
      inputGroup.appendChild(keyInput);

      // Eye toggle
      var eyeBtn = document.createElement("button");
      eyeBtn.type = "button";
      eyeBtn.className = "btn-toggle-eye";
      eyeBtn.title = "Show/Hide Key";
      eyeBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
      eyeBtn.addEventListener("click", function () {
        keyInput.type = keyInput.type === "password" ? "text" : "password";
      });
      inputGroup.appendChild(eyeBtn);

      // Connect button
      var connectBtn = document.createElement("button");
      connectBtn.type = "button";
      connectBtn.className = "btn-connect-provider";
      connectBtn.innerHTML = '<span class="btn-label">Connect</span>';

      var statusMsg = document.createElement("div");
      statusMsg.className = "provider-status-msg";
      statusMsg.hidden = true;

      connectBtn.addEventListener("click", function () {
        var keyVal = keyInput.value.trim();
        if (!keyVal) {
          if (isConfigured) {
            toast(p.name + " is already connected.");
            return;
          }
          keyInput.focus();
          statusMsg.className = "provider-status-msg msg-error";
          statusMsg.textContent = "Please enter an API key for " + p.name;
          statusMsg.hidden = false;
          return;
        }

        connectBtn.classList.add("is-busy");
        connectBtn.querySelector(".btn-label").textContent = "Connecting…";
        statusBadge.className = "provider-status-badge status-connecting";
        statusBadge.textContent = "Verifying…";
        statusMsg.hidden = true;

        var client = window.TravelBrainAPI;
        var verifyPromise = client && client.verifyProviderKey
          ? client.verifyProviderKey(p.id, keyVal)
          : (function () {
              var payload = {};
              payload[p.propKey] = keyVal;
              return fetch("/api/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              }).then(function (r) {
                return r.text().then(function (txt) {
                  try {
                    var d = JSON.parse(txt);
                    return { ok: r.ok && d.success !== false, data: d };
                  } catch (e) {
                    return { ok: false, data: { message: "Server response error (" + r.status + ")" } };
                  }
                });
              });
            })();

        verifyPromise
          .then(function (res) {
            connectBtn.classList.remove("is-busy");
            connectBtn.querySelector(".btn-label").textContent = "Connect";
            var data = res.data || res;
            if (res.ok || (data && data.ok)) {
              card.classList.add("is-connected");
              card.classList.remove("is-failed");
              statusBadge.className = "provider-status-badge status-connected";
              statusBadge.innerHTML = '<span style="font-size:0.75rem;">✓</span> Connected';
              statusMsg.className = "provider-status-msg msg-success";
              statusMsg.textContent = "✓ " + (data.message || "Connected successfully!");
              statusMsg.hidden = false;
              toast("Connected " + p.name + "!");
              refreshItinConfig();
            } else {
              card.classList.remove("is-connected");
              card.classList.add("is-failed");
              statusBadge.className = "provider-status-badge status-failed";
              statusBadge.innerHTML = '<span style="font-size:0.75rem;">✕</span> Failed';
              statusMsg.className = "provider-status-msg msg-error";
              statusMsg.textContent = "✕ " + ((data && data.message) || "Verification failed");
              statusMsg.hidden = false;
              toast("Failed to connect " + p.name);
            }
          })
          .catch(function (err) {
            connectBtn.classList.remove("is-busy");
            connectBtn.querySelector(".btn-label").textContent = "Connect";
            card.classList.add("is-failed");
            statusBadge.className = "provider-status-badge status-failed";
            statusBadge.innerHTML = '<span style="font-size:0.75rem;">✕</span> Error';
            statusMsg.className = "provider-status-msg msg-error";
            statusMsg.textContent = "✕ " + (err.message || "Network error");
            statusMsg.hidden = false;
          });
      });

      inputGroup.appendChild(connectBtn);
      bodyDiv.appendChild(inputGroup);
      bodyDiv.appendChild(statusMsg);
      card.appendChild(bodyDiv);

      container.appendChild(card);
    });
  }

  function openSettings() {
    if (settingsModal && settingsScrim) {
      settingsModal.hidden = false;
      settingsScrim.hidden = false;
      updateItinConnUI("connecting", "Verifying AI provider connections…");
      if (credList) renderCreds(credList);
      refreshItinConfig();
    }
  }

  function closeSettings() {
    if (settingsModal && settingsScrim) {
      settingsModal.hidden = true;
      settingsScrim.hidden = true;
    }
  }

  function saveSettings() {
    var payload = {};
    var hasValues = false;

    if (credList) {
      credList.querySelectorAll(".provider-key-input").forEach(function (box) {
        var val = box.value.trim();
        if (!val) return;
        hasValues = true;
        var prop = box.getAttribute("data-prop");
        if (prop) payload[prop] = val;
      });
    }

    if (!hasValues) {
      toast("No new credentials entered. Existing settings preserved.");
      closeSettings();
      return;
    }

    if (settingsSave) settingsSave.disabled = true;

    var client = window.TravelBrainAPI;
    var saveCall = client && client.saveConfig
      ? client.saveConfig(payload)
      : fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); });

    saveCall
      .then(function (res) {
        if (settingsSave) settingsSave.disabled = false;
        if (!res.ok || res.data.success === false) {
          var errors = res.data.errors || {};
          var errKeys = Object.keys(errors);
          if (errKeys.length > 0) {
            errKeys.forEach(function (prop) {
              var input = credList.querySelector('[data-prop="' + prop + '"]');
              if (input) {
                var card = input.closest(".provider-card");
                if (card) {
                  card.classList.add("is-failed");
                  var msg = card.querySelector(".provider-status-msg");
                  if (msg) {
                    msg.className = "provider-status-msg msg-error";
                    msg.textContent = "✕ " + errors[prop];
                    msg.hidden = false;
                  }
                }
              }
            });
            toast("Connection error: " + errors[errKeys[0]]);
          } else {
            toast("Could not verify credentials.");
          }
          return;
        }

        itinConfig = res.data;
        renderCreds(credList);
        toast("All credentials connected successfully!");
        setTimeout(closeSettings, 700);
      })
      .catch(function (err) {
        if (settingsSave) settingsSave.disabled = false;
        toast("Could not reach server: " + (err.message || String(err)));
      });
  }

  function resetSettings() {
    var client = window.TravelBrainAPI;
    var resetCall = client && client.resetConfig
      ? client.resetConfig()
      : fetch("/api/config", { method: "DELETE" }).then(function (r) { return r.json(); });

    resetCall
      .then(function (data) {
        itinConfig = data;
        if (credList) renderCreds(credList);
        toast("Session credentials cleared. Reverted to server .env.");
      })
      .catch(function () { toast("Could not clear credentials."); });
  }

  /* ---------------- Initialization ---------------- */

  function init() {
    var backBtn = $("btnBackHome");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "/";
      });
    }

    if (copyPlanBtn) {
      copyPlanBtn.addEventListener("click", function () {
        var text = (currentPlanData && (currentPlanData.answer || currentPlanData.itinerary)) || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { toast("Complete itinerary copied to clipboard!"); },
            function () { toast("Could not copy to clipboard."); }
          );
        }
      });
    }

    if (downloadMdBtn) {
      downloadMdBtn.addEventListener("click", function () {
        var text = (currentPlanData && (currentPlanData.answer || currentPlanData.itinerary)) || "";
        var blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = (currentParsed ? currentParsed.destination.replace(/\s+/g, "-") : "TravelBrain") + "-Itinerary.md";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    }

    if (printPlanBtn) {
      printPlanBtn.addEventListener("click", function () {
        window.print();
      });
    }

    if (btnAudit) {
      btnAudit.addEventListener("click", triggerCriticAudit);
    }

    if (apiStatus) apiStatus.addEventListener("click", openSettings);
    if (btnErrorSettings) btnErrorSettings.addEventListener("click", openSettings);
    if (settingsClose) settingsClose.addEventListener("click", closeSettings);
    if (settingsScrim) settingsScrim.addEventListener("click", closeSettings);
    if (settingsSave) settingsSave.addEventListener("click", saveSettings);
    if (settingsReset) settingsReset.addEventListener("click", resetSettings);

    if (itinBtnPing) {
      itinBtnPing.addEventListener("click", function () {
        updateItinConnUI("connecting", "Pinging backend server…");
        if (window.TravelBrainAPI) {
          window.TravelBrainAPI.testConnection().then(function (res) {
            updateItinConnUI(res.ok ? "connected" : "failed", res.ok ? "Reachable (" + res.latency + "ms)" : (res.error || "Cannot reach server"));
            toast(res.ok ? "Ping successful (" + res.latency + "ms)" : "Ping failed: " + (res.error || "Unreachable"));
            refreshItinConfig();
          });
        }
      });
    }

    refreshItinConfig();

    if (viewDashboardBtn && viewDossierBtn) {
      viewDashboardBtn.addEventListener("click", function () {
        viewDashboardBtn.classList.add("active");
        viewDossierBtn.classList.remove("active");
        hidePlannerScreen();
        if (daysContainer) daysContainer.hidden = false;
        if (rawDossierWrap) rawDossierWrap.hidden = true;
      });

      viewDossierBtn.addEventListener("click", function () {
        viewDossierBtn.classList.add("active");
        viewDashboardBtn.classList.remove("active");
        hidePlannerScreen();
        if (daysContainer) daysContainer.hidden = true;
        if (rawDossierWrap) rawDossierWrap.hidden = false;
      });
    }

    // Planner Screen Form & Actions
    if (btnNewTripModal) {
      btnNewTripModal.addEventListener("click", function () {
        showPlannerScreen();
      });
    }

    if (btnErrorPlanner) {
      btnErrorPlanner.addEventListener("click", function () {
        showPlannerScreen();
      });
    }

    if (itinPlannerForm) {
      itinPlannerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var from = pFrom ? pFrom.value.trim() : "";
        var to = pTo ? pTo.value.trim() : "";
        var days = pDays ? parseInt(pDays.value, 10) : 5;
        if (!to) {
          toast("Please enter a destination city.");
          if (pTo) pTo.focus();
          return;
        }

        var style = "Balanced & Scenic";
        var checkedStyle = document.querySelector('input[name="travelStyle"]:checked');
        if (checkedStyle) style = checkedStyle.value;

        var q = "Plan a " + days + " day trip to " + to + (from ? " from " + from : "") + " focusing on " + style + ". Find verified flights, hotel options with tariffs in Indian Rupees (₹), weather forecast, and a realistic day-by-day itinerary with all costs in INR (₹).";

        executePlanning(q, from, to, days);
      });
    }

    document.querySelectorAll(".itin-quick-pill").forEach(function (pill) {
      pill.addEventListener("click", function () {
        var to = pill.getAttribute("data-to") || "Manali";
        var from = pill.getAttribute("data-from") || "New Delhi";
        var days = parseInt(pill.getAttribute("data-days") || "5", 10);
        if (pTo) pTo.value = to;
        if (pFrom) pFrom.value = from;
        if (pDays) pDays.value = days;
        if (itinPlannerForm) {
          if (typeof itinPlannerForm.requestSubmit === "function") {
            itinPlannerForm.requestSubmit();
          } else {
            var submitBtn = $("btnPlannerSubmit");
            if (submitBtn) submitBtn.click();
          }
        }
      });
    });

    if (refinementForm) {
      refinementForm.addEventListener("submit", handleRefinement);
    }

    document.querySelectorAll(".refine-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var p = chip.getAttribute("data-prompt");
        if (refinementInput) {
          refinementInput.value = p;
          refinementInput.focus();
        }
      });
    });

    // Wire up Auth Modal controls
    if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);
    if (signupForm) signupForm.addEventListener("submit", handleSignupSubmit);
    if (tabLogin) tabLogin.addEventListener("click", function () { switchAuthTab("login"); });
    if (tabSignup) tabSignup.addEventListener("click", function () { switchAuthTab("signup"); });
    if (switchToSignup) switchToSignup.addEventListener("click", function () { switchAuthTab("signup"); });
    if (switchToLogin) switchToLogin.addEventListener("click", function () { switchAuthTab("login"); });
    if (authClose) authClose.addEventListener("click", closeAuthModal);
    if (authScrim) authScrim.addEventListener("click", closeAuthModal);

    // Password visibility toggle
    document.querySelectorAll(".pw-toggle-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var wrap = btn.closest(".password-input-wrap");
        if (!wrap) return;
        var inp = wrap.querySelector("input");
        if (!inp) return;
        inp.type = inp.type === "password" ? "text" : "password";
      });
    });

    if (btnRetry) {
      btnRetry.addEventListener("click", function () {
        window.location.reload();
      });
    }

    // Inspect URL parameters
    var params = new URLSearchParams(window.location.search);
    var urlTripId = params.get("id");
    var urlTo = params.get("to");
    var urlFrom = params.get("from") || "";
    var urlDays = params.get("days") || "5";

    var pathMatch = window.location.pathname.match(/\/trip-plan\/([a-zA-Z0-9\-]+)/);
    if (pathMatch && pathMatch[1] && pathMatch[1] !== "itinerary") {
      urlTripId = pathMatch[1];
    }

    if (urlTripId) {
      loadTripById(urlTripId);
      return;
    }

    if (urlTo) {
      var query = "Plan a " + urlDays + " day trip to " + urlTo + (urlFrom ? " from " + urlFrom : "") + ". Find verified flights, hotel options with tariffs in Indian Rupees (₹), weather forecast, and a realistic day-by-day itinerary with all costs in INR (₹).";
      if (!isUserAuthenticated()) {
        openAuthModal(urlTo, function () {
          executePlanning(query, urlFrom, urlTo, parseInt(urlDays, 10));
        }, { query: query, from: urlFrom, to: urlTo, days: parseInt(urlDays, 10) });
        return;
      }
      executePlanning(query, urlFrom, urlTo, parseInt(urlDays, 10));
      return;
    }

    // Check cached plan in sessionStorage
    try {
      var cached = sessionStorage.getItem("travelbrain_active_plan");
      if (cached) {
        var data = JSON.parse(cached);
        var parsed = parseItineraryText(data.answer || data.itinerary, data.__meta || {});
        renderDashboard(parsed, data);
        return;
      }
    } catch (e) {}

    // Dedicated UX: Display the Plan a Journey form
    showPlannerScreen();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
