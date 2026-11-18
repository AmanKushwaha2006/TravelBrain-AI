/* ============================================================
   TravelBrain AI — Generated Itinerary Page Controller
   Intelligent Markdown/JSON Transformer & Interactive Dashboard
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- Helpers & DOM ---------------- */
  var $ = function (id) { return document.getElementById(id); };

  var loadingScreen      = $("loadingScreen");
  var errorScreen        = $("errorScreen");
  var dashboardContent   = $("dashboardContent");
  var toastEl            = $("toast");

  // Loading elements
  var loadingDest        = $("loadingDest");
  var currentAgentLabel  = $("currentAgentLabel");
  var pipelineBarFill    = $("pipelineBarFill");
  var elapsedTimeEl      = $("elapsedTime");

  // Error elements
  var errorMessage       = $("errorMessage");
  var btnRetry           = $("btnRetry");

  // Header & Tools
  var copyPlanBtn        = $("copyPlanBtn");
  var downloadMdBtn      = $("downloadMdBtn");
  var printPlanBtn       = $("printPlanBtn");
  var btnAudit           = $("btnAudit");
  var viewDashboardBtn   = $("viewDashboardBtn");
  var viewDossierBtn     = $("viewDossierBtn");

  // Hero & Summary
  var heroTitle          = $("heroTitle");
  var heroSummaryLine    = $("heroSummaryLine");
  var heroTagsRow        = $("heroTagsRow");
  var summaryCardsGrid   = $("summaryCardsGrid");

  // Day Navigation & Timeline
  var dayNavTabs         = $("dayNavTabs");
  var daysContainer      = $("daysContainer");

  // Additional Sections
  var highlightsGrid     = $("highlightsGrid");
  var weatherSection     = $("weatherSection");
  var weatherCardsRow    = $("weatherCardsRow");
  var weatherAdvice      = $("weatherAdvice");
  var recommendationsGrid= $("recommendationsGrid");
  var budgetBreakdownGrid= $("budgetBreakdownGrid");
  var budgetTotalNum     = $("budgetTotalNum");
  var logisticsSection   = $("logisticsSection");
  var flightsContent     = $("flightsContent");
  var hotelsContent      = $("hotelsContent");
  var criticAuditSection = $("criticAuditSection");
  var criticAuditWrap    = $("criticAuditWrap");
  var rawDossierWrap     = $("rawDossierWrap");
  var rawDossierContent  = $("rawDossierContent");

  // Refinement Bar
  var refinementForm     = $("refinementForm");
  var refinementInput    = $("refinementInput");
  var refinementSubmitBtn= $("refinementSubmitBtn");

  /* ---------------- State ---------------- */
  var currentPlanData    = null;
  var currentParsed      = null;
  var activeThreadId     = null;
  var isAuditing         = false;
  var currentTripId      = null;

  var PHASES = [
    { label: "Flight Intelligence Agent · Analyzing routes & airfares in INR", weight: 0.22 },
    { label: "Hotel & Stays Agent · Scouting accommodations & tariffs",        weight: 0.20 },
    { label: "Weather Analyst Agent · Forecasting climate & packing advice",    weight: 0.16 },
    { label: "Itinerary Architect Agent · Structuring day-by-day pacing",       weight: 0.22 },
    { label: "Final Synthesis Agent · Compiling verified master dossier",       weight: 0.20 }
  ];

  /* ---------------- Utility Functions ---------------- */

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
    }, 3600);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMd(text) {
    if (window.MD && typeof window.MD.render === "function") {
      return window.MD.render(text || "");
    }
    return escapeHtml(text || "");
  }

  /* ---------------- Intelligent Itinerary Text Parser ---------------- */

  function parseItineraryText(fullText, meta) {
    var text = String(fullText || "");
    var parsed = {
      destination: meta.destination || "Destination",
      origin: meta.origin || "",
      daysCount: meta.days || 5,
      budget: "Estimated in INR (₹)",
      summary: "",
      highlights: [],
      weather: { temp: "", condition: "", advice: "", forecast: [] },
      days: [],
      budgetBreakdown: { items: [], total: "" },
      recommendations: { packing: [], transport: [], dining: [], safety: [] },
      flightsText: "",
      hotelsText: ""
    };

    // 1. Try to extract destination from query or text
    var destMatch = text.match(/(?:trip to|journey to|visiting|explore|itinerary for)\s+([A-Za-z\s]+?)(?:[\.\,\:\n]|\s+from|\s+for|\s+in)/i);
    if (destMatch && destMatch[1] && parsed.destination === "Destination") {
      parsed.destination = destMatch[1].trim();
    }

    // 2. Extract Sections by common headers
    var sectionPatterns = [
      { key: "summary", regex: /(?:^|\n)(?:#{1,3}\s*|\*{1,2})(?:1\.?\s*)?(?:Trip Summary|Overview|Introduction)[:\s\*]*(.*?)(?=\n(?:#{1,3}\s*|\*{1,2})(?:[2-9]\.?\s*)?[A-Z]|\Z)/is },
      { key: "flights", regex: /(?:^|\n)(?:#{1,3}\s*|\*{1,2})(?:2\.?\s*)?(?:Flight|Transit|Flights & Transit Information)[:\s\*]*(.*?)(?=\n(?:#{1,3}\s*|\*{1,2})(?:[3-9]\.?\s*)?[A-Z]|\Z)/is },
      { key: "hotels", regex: /(?:^|\n)(?:#{1,3}\s*|\*{1,2})(?:3\.?\s*)?(?:Hotel|Accommodation|Hotel Suggestions)[:\s\*]*(.*?)(?=\n(?:#{1,3}\s*|\*{1,2})(?:[4-9]\.?\s*)?[A-Z]|\Z)/is },
      { key: "weather", regex: /(?:^|\n)(?:#{1,3}\s*|\*{1,2})(?:4\.?\s*)?(?:Weather|Climate|Weather Information)[:\s\*]*(.*?)(?=\n(?:#{1,3}\s*|\*{1,2})(?:[5-9]\.?\s*)?[A-Z]|\Z)/is },
      { key: "itinerary", regex: /(?:^|\n)(?:#{1,3}\s*|\*{1,2})(?:5\.?\s*)?(?:Day-by-Day Itinerary|Itinerary|Daily Schedule)[:\s\*]*(.*?)(?=\n(?:#{1,3}\s*|\*{1,2})(?:[6-9]\.?\s*)?[A-Z]|\Z)/is },
      { key: "budget", regex: /(?:^|\n)(?:#{1,3}\s*|\*{1,2})(?:6\.?\s*)?(?:Estimated Budget|Budget Breakdown|Costs)[:\s\*]*(.*?)(?=\n(?:#{1,3}\s*|\*{1,2})(?:[7-9]\.?\s*)?[A-Z]|\Z)/is },
      { key: "recommendations", regex: /(?:^|\n)(?:#{1,3}\s*|\*{1,2})(?:7\.?\s*)?(?:Final Recommendations|Recommendations & Local Tips|Travel Tips)[:\s\*]*(.*?)(?=\n(?:#{1,3}\s*|\*{1,2})[A-Z]|\Z)/is }
    ];

    var sections = {};
    sectionPatterns.forEach(function (sec) {
      var m = text.match(sec.regex);
      if (m && m[1]) {
        sections[sec.key] = m[1].trim();
      }
    });

    // Summary
    parsed.summary = sections.summary || (text.slice(0, 320) + "…");
    parsed.flightsText = sections.flights || "";
    parsed.hotelsText = sections.hotels || "";

    // Weather extraction
    if (sections.weather) {
      var wText = sections.weather;
      var tempM = wText.match(/(\d{1,2}(?:\.\d+)?\s*°\s*C|\d{1,2}(?:\.\d+)?\s*°\s*F)/i);
      if (tempM) parsed.weather.temp = tempM[1];

      if (/sunny|clear/i.test(wText)) parsed.weather.condition = "☀️ Sunny & Clear";
      else if (/rain|shower/i.test(wText)) parsed.weather.condition = "🌧️ Seasonal Rain";
      else if (/snow|freez/i.test(wText)) parsed.weather.condition = "❄️ Snowy & Cold";
      else if (/cloud/i.test(wText)) parsed.weather.condition = "⛅ Partly Cloudy";
      else parsed.weather.condition = "🌤️ Pleasant Climate";

      parsed.weather.advice = wText.replace(/^[\*\#\-\s]+/gm, " ").trim().slice(0, 240);
    }

    // Budget extraction
    if (sections.budget) {
      var bText = sections.budget;
      var totalM = bText.match(/(?:Total(?: Estimated)?(?: Trip)? Cost|Grand Total)[:\s\*]*(?:₹|INR)?\s*([\d\,]+)/i);
      if (totalM) {
        parsed.budgetBreakdown.total = "₹" + totalM[1];
        parsed.budget = "₹" + totalM[1];
      } else {
        var firstInr = bText.match(/(?:₹|INR)\s*([\d\,]+)/);
        if (firstInr) {
          parsed.budget = "₹" + firstInr[1];
          parsed.budgetBreakdown.total = "₹" + firstInr[1];
        }
      }

      // Line items
      var lines = bText.split("\n");
      lines.forEach(function (l) {
        var itemM = l.match(/(?:[-*•]|\d+\.)\s*([A-Za-z\s&\/]+?)[:\-–—]\s*(?:₹|INR)?\s*([\d\,]+)/);
        if (itemM) {
          parsed.budgetBreakdown.items.push({
            name: itemM[1].trim(),
            cost: "₹" + itemM[2].trim()
          });
        }
      });
    }

    // Parse Day-by-Day Itinerary
    var itinText = sections.itinerary || text;
    var dayRegex = /(?:^|\n)(?:#{1,4}\s*|\*{1,2})Day\s*(\d+)[:\s\-\–—]*(.*?)(?=\n(?:#{1,4}\s*|\*{1,2})Day\s*\d+|\n#{1,3}\s+[A-Z]|\Z)/gis;
    var match;
    var dayMatches = [];

    while ((match = dayRegex.exec(itinText)) !== null) {
      dayMatches.push({
        num: parseInt(match[1], 10),
        raw: match[2].trim()
      });
    }

    if (dayMatches.length > 0) {
      parsed.days = dayMatches.map(function (dm) {
        var rawLines = dm.raw.split("\n");
        var dayTitle = "Exploration & Activities";

        // First non-empty line can be day title
        if (rawLines.length && rawLines[0].length < 80) {
          dayTitle = rawLines[0].replace(/^[\#\*\-\s]+/, "").trim();
        }

        var activities = [];
        // Split by activity headers or bold time markers
        var actRegex = /(?:^|\n)(?:(?:#{3,4}\s*|\*{1,2})?(?:Morning|Afternoon|Evening|Night|\d{1,2}:\d{2}\s*(?:AM|PM)?)[:\s\-\–—]*|[-*•]\s*\*{1,2})([^\n\*]+?)(?:\*{1,2})?[:\s\-\–—]+(.*?)(?=\n(?:(?:#{3,4}\s*|\*{1,2})?(?:Morning|Afternoon|Evening|Night|\d{1,2}:\d{2}\s*(?:AM|PM)?)|\s*[-*•]\s*\*{1,2}[A-Z]|\Z))/gis;
        var actM;

        while ((actM = actRegex.exec(dm.raw)) !== null) {
          var actTitle = actM[1].replace(/^[#\*\s]+/, "").trim();
          var actBody = actM[2].trim();

          var timeMatch = actTitle.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?|Morning|Afternoon|Evening|Night)/i);
          var timeStr = timeMatch ? timeMatch[1] : "Daytime";

          var locMatch = actBody.match(/(?:Location|Venue)[:\s\*]*([^\n,\.]+)/i);
          var durMatch = actBody.match(/(?:Duration|Time required)[:\s\*]*([^\n,\.]+)/i);
          var tipMatch = actBody.match(/(?:Tip|Note|Pro-Tip|Recommendation)[:\s\*]*([^\n]+)/i);

          activities.push({
            time: timeStr,
            title: actTitle.replace(/^(?:Morning|Afternoon|Evening|Night|\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[:\-–—]?\s*/i, "").trim() || actTitle,
            location: locMatch ? locMatch[1].trim() : parsed.destination,
            duration: durMatch ? durMatch[1].trim() : "2-3 hours",
            description: actBody.replace(/(?:Location|Duration|Tip|Note|Pro-Tip)[:\s\*]*[^\n]+/gi, "").trim(),
            tip: tipMatch ? tipMatch[1].trim() : null
          });
        }

        // Fallback if no sub-activities parsed: create one activity with the day's markdown
        if (activities.length === 0) {
          activities.push({
            time: "Full Day",
            title: dayTitle,
            location: parsed.destination,
            duration: "Day Schedule",
            description: dm.raw,
            tip: null
          });
        }

        return {
          dayNum: dm.num,
          title: dayTitle,
          activities: activities
        };
      });
    }

    // Recommendations extraction
    if (sections.recommendations) {
      var rText = sections.recommendations;
      var rLines = rText.split("\n");
      var curCat = "safety";

      rLines.forEach(function (line) {
        var clean = line.replace(/^[\*\#\-\s•\d\.]+/, "").trim();
        if (!clean) return;

        if (/packing|clothes|wear|carry/i.test(clean)) curCat = "packing";
        else if (/transit|transport|metro|taxi|cab|auto|bus/i.test(clean)) curCat = "transport";
        else if (/food|dining|eat|cuisine|restaurant|veg/i.test(clean)) curCat = "dining";
        else if (/safety|tip|scam|cash|sim|atm/i.test(clean)) curCat = "safety";

        if (clean.length > 8 && clean.length < 220) {
          parsed.recommendations[curCat].push(clean);
        }
      });
    }

    // Highlights extraction: pull famous attractions mentioned in itinerary
    var highlightKeywords = ["Temple", "Fort", "Palace", "Museum", "Beach", "Valley", "Viewpoint", "Pass", "Market", "Tower", "Lake", "Gardens", "Cathedral", "Sanctuary", "Falls", "Bridge"];
    var seenHighlights = {};
    parsed.days.forEach(function (d) {
      d.activities.forEach(function (act) {
        var words = act.title.split(/\s+/);
        highlightKeywords.forEach(function (kw) {
          if (act.title.toLowerCase().indexOf(kw.toLowerCase()) !== -1 && !seenHighlights[act.title]) {
            seenHighlights[act.title] = true;
            parsed.highlights.push({
              name: act.title,
              category: /Temple|Church|Cathedral/i.test(act.title) ? "Heritage" : /Beach|Lake|Falls|Valley/i.test(act.title) ? "Nature" : "Sightseeing",
              description: act.description.slice(0, 140) + "…",
              location: act.location || parsed.destination
            });
          }
        });
      });
    });

    return parsed;
  }

  /* ---------------- UI Rendering ---------------- */

  function renderDashboard(parsed, rawResult) {
    currentParsed = parsed;
    currentPlanData = rawResult;

    // 1. Hero Section
    if (heroTitle) {
      heroTitle.innerHTML = "Your Journey to <em>" + escapeHtml(parsed.destination) + "</em>";
    }

    if (heroSummaryLine) {
      var daysText = (parsed.days.length || parsed.daysCount) + " Days";
      var nightsText = Math.max(1, (parsed.days.length || parsed.daysCount) - 1) + " Nights";
      heroSummaryLine.innerHTML =
        "<span>" + daysText + " · " + nightsText + "</span>" +
        '<span class="hero-dot">✦</span>' +
        "<span>" + (parsed.origin ? "From " + escapeHtml(parsed.origin) + " ➔ " : "") + escapeHtml(parsed.destination) + "</span>" +
        '<span class="hero-dot">✦</span>' +
        "<span>Verified in INR (₹)</span>";
    }

    if (heroTagsRow) {
      heroTagsRow.innerHTML = "";
      var tags = [
        { label: parsed.budget || "Budget in ₹", cls: "tag-currency", icon: "💰" },
        { label: parsed.weather.condition || "Pleasant Climate", cls: "", icon: "🌤️" },
        { label: "Culture & Sights", cls: "", icon: "🏛️" },
        { label: "Multi-Agent Verified", cls: "", icon: "✓" }
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
          val: parsed.destination,
          sub: parsed.origin ? "Outbound from " + parsed.origin : "Premier travel destination",
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg>'
        },
        {
          label: "Duration & Pace",
          val: (parsed.days.length || parsed.daysCount) + " Days · " + Math.max(1, (parsed.days.length || parsed.daysCount) - 1) + "N",
          sub: "Chronologically sequenced pacing",
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        {
          label: "Weather & Climate",
          val: parsed.weather.temp ? parsed.weather.temp + " · " + parsed.weather.condition : (parsed.weather.condition || "Seasonal"),
          sub: parsed.weather.advice ? parsed.weather.advice.slice(0, 50) + "…" : "Favorable conditions",
          icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
        },
        {
          label: "Estimated Budget",
          val: parsed.budgetBreakdown.total || parsed.budget || "Itemized in ₹",
          sub: "All tariffs and fares in Indian Rupees",
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
        // Fallback if no days parsed: render raw answer formatted
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
          badgeWrap.appendChild(el("h3", "day-header-title", d.title));
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
              durBadge.innerHTML = '⏱️ ' + escapeHtml(act.duration);
              metaBadges.appendChild(durBadge);
            }
            topRow.appendChild(metaBadges);
            card.appendChild(topRow);

            var actTitle = el("h4", "activity-title", act.title);
            card.appendChild(actTitle);

            if (act.location) {
              var locEl = el("div", "activity-location");
              locEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg> ' + escapeHtml(act.location);
              card.appendChild(locEl);
            }

            if (act.description) {
              var desc = el("p", "activity-description", act.description);
              card.appendChild(desc);
            }

            if (act.tip) {
              var tipBox = el("div", "activity-tip-box");
              tipBox.innerHTML = '<span>💡</span><span>' + escapeHtml(act.tip) + '</span>';
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
          hHead.appendChild(el("h4", "highlight-title", h.name));
          hHead.appendChild(el("span", "highlight-cat-tag", h.category));
          hCard.appendChild(hHead);
          hCard.appendChild(el("p", "highlight-desc", h.description));
          var hFoot = el("div", "highlight-footer");
          hFoot.innerHTML = '<span>📍 ' + escapeHtml(h.location) + '</span>';
          hCard.appendChild(hFoot);
          highlightsGrid.appendChild(hCard);
        });
      } else {
        var highlightsSec = $("highlightsSection");
        if (highlightsSec) highlightsSec.hidden = true;
      }
    }

    // 6. Weather Section
    if (weatherSection) {
      if (parsed.weather.advice || parsed.weather.temp) {
        weatherSection.hidden = false;
        if (weatherAdvice) {
          weatherAdvice.innerHTML = '<span>🌤️</span><span>' + escapeHtml(parsed.weather.advice || "Ideal travel weather with comfortable temperatures.") + '</span>';
        }
      } else {
        weatherSection.hidden = true;
      }
    }

    // 7. Travel Recommendations
    if (recommendationsGrid) {
      recommendationsGrid.innerHTML = "";
      var categories = [
        { key: "transport", title: "Local Transit & Commute", icon: "🚕", def: ["Use local prepaid taxis or registered app cabs.", "Inquire about daily transit passes for major routes."] },
        { key: "dining", title: "Dining & Food Scene", icon: "🍲", def: ["Savor authentic regional cuisine and thalis.", "Look for reputed restaurants with high local footfall."] },
        { key: "packing", title: "Packing Essentials", icon: "🎒", def: ["Comfortable walking footwear for active sightseeing.", "Layered clothing suitable for day and evening temperature shifts."] },
        { key: "safety", title: "Insider & Safety Tips", icon: "💡", def: ["Keep small currency notes handy for auto-rickshaws and entry fees.", "Book high-demand heritage monuments and safari passes online in advance."] }
      ];

      categories.forEach(function (cat) {
        var items = (parsed.recommendations[cat.key] && parsed.recommendations[cat.key].length)
          ? parsed.recommendations[cat.key]
          : cat.def;

        var catCard = el("div", "rec-category-card");
        var cHead = el("div", "rec-category-header");
        var ico = el("div", "rec-cat-icon", cat.icon);
        cHead.appendChild(ico);
        cHead.appendChild(el("h4", "rec-cat-title", cat.title));
        catCard.appendChild(cHead);

        var ul = el("ul", "rec-list");
        items.slice(0, 4).forEach(function (it) {
          ul.appendChild(el("li", "rec-list-item", it));
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
          { name: "Flights / Transit", cost: "Estimated in ₹" },
          { name: "Hotels & Stays", cost: "Tariff in ₹" },
          { name: "Daily Food & Dining", cost: "Approx. ₹1,200/day" },
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
      var hasFlights = Boolean(rawResult.flight_results || parsed.flightsText);
      var hasHotels = Boolean(rawResult.hotel_results || parsed.hotelsText);

      if (hasFlights || hasHotels) {
        logisticsSection.hidden = false;
        if (flightsContent) flightsContent.innerHTML = renderMd(rawResult.flight_results || parsed.flightsText || "Flights analyzed by Flight Intelligence Agent.");
        if (hotelsContent) hotelsContent.innerHTML = renderMd(rawResult.hotel_results || parsed.hotelsText || "Curated accommodations scouted by Hotel Agent.");
      } else {
        logisticsSection.hidden = true;
      }
    }

    // 10. Raw Dossier View
    if (rawDossierContent) {
      rawDossierContent.innerHTML = renderMd(rawResult.answer || rawResult.itinerary || "");
    }

    // Show dashboard
    if (loadingScreen) loadingScreen.hidden = true;
    if (errorScreen) errorScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = false;
  }

  function setActiveDayTab(activeTabEl, targetId) {
    document.querySelectorAll(".day-tab").forEach(function (t) { t.classList.remove("active"); });
    if (activeTabEl) activeTabEl.classList.add("active");

    if (!targetId) {
      // Show all days
      document.querySelectorAll(".itinerary-day-block").forEach(function (b) { b.style.display = "block"; });
      window.scrollTo({ top: daysContainer.offsetTop - 120, behavior: "smooth" });
    } else {
      var target = $(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  /* ---------------- Planning Request & Pipeline ---------------- */

  function executePlanning(query, origin, dest, days) {
    if (loadingScreen) loadingScreen.hidden = false;
    if (errorScreen) errorScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;

    if (loadingDest) {
      loadingDest.textContent = dest || "Your Destination";
    }

    var started = Date.now();
    var currentPhase = 0;
    var ESTIMATED_MS = 50000;

    var timer = setInterval(function () {
      var elapsed = Date.now() - started;
      var ratio = Math.min(elapsed / ESTIMATED_MS, 0.95);

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

    fetch("/api/travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query, thread_id: activeThreadId })
    })
      .then(function (r) {
        return r.json().catch(function () {
          throw new Error("Invalid response from server (HTTP " + r.status + ")");
        }).then(function (data) {
          if (!r.ok || data.success === false) {
            throw new Error(data.error || "Planning failed with HTTP " + r.status);
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

        // Cache in sessionStorage for fast back/forward navigation
        try {
          sessionStorage.setItem("travelbrain_active_plan", JSON.stringify(data));
        } catch (e) {}

        var parsed = parseItineraryText(data.answer || data.itinerary, data.__meta);
        renderDashboard(parsed, data);
      })
      .catch(function (err) {
        clearInterval(timer);
        showError(err.message);
      });
  }

  function loadTripById(tripId) {
    if (loadingScreen) loadingScreen.hidden = false;
    if (errorScreen) errorScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;

    fetch("/api/trip/" + tripId)
      .then(function (r) {
        if (!r.ok) return fetch("/api/history/" + tripId);
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
          days: 5
        };

        var parsed = parseItineraryText(planResult.answer || planResult.itinerary, planResult.__meta);
        renderDashboard(parsed, planResult);
      })
      .catch(function (err) {
        showError("Failed to load saved trip: " + err.message);
      });
  }

  function showError(msg) {
    if (loadingScreen) loadingScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;
    if (errorScreen) errorScreen.hidden = false;
    if (errorMessage) errorMessage.textContent = msg || "An unexpected error occurred while planning your journey.";
  }

  /* ---------------- Critic Fact-Checking Audit ---------------- */

  function triggerCriticAudit() {
    if (isAuditing || !currentPlanData) return;
    isAuditing = true;

    if (btnAudit) {
      btnAudit.disabled = true;
      btnAudit.innerHTML = '<span class="spinner" style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:radarSpin 0.8s linear infinite;"></span> Auditing Factuality…';
    }

    fetch("/api/evaluate", {
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
            btnAudit.textContent = "🛡️ Audit Plan";
          }
        }
      })
      .catch(function (err) {
        toast("Audit error: " + err.message);
        if (btnAudit) {
          btnAudit.disabled = false;
          btnAudit.textContent = "🛡️ Audit Plan";
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
      entBox.innerHTML = "<strong>Verified Real Landmarks:</strong> " + escapeHtml(evalData.verified_entities.join(", "));
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

    var combinedPrompt = "Regarding the previously planned trip to " + (currentParsed ? currentParsed.destination : "the destination") + ": " + refText + ". Please update and refine the itinerary accordingly with all costs in INR (₹).";

    executePlanning(combinedPrompt, currentParsed ? currentParsed.origin : "", currentParsed ? currentParsed.destination : "", currentParsed ? currentParsed.daysCount : 5);

    if (refinementInput) refinementInput.value = "";
    if (refinementSubmitBtn) {
      refinementSubmitBtn.disabled = false;
      refinementSubmitBtn.textContent = "Refine Plan";
    }
  }

  /* ---------------- Event Listeners & Initialization ---------------- */

  function init() {
    // 1. Back button behavior
    var backBtn = $("btnBackHome");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.location.href = "/";
      });
    }

    // 2. Action buttons
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

    // View toggle: Dashboard vs Dossier
    if (viewDashboardBtn && viewDossierBtn) {
      viewDashboardBtn.addEventListener("click", function () {
        viewDashboardBtn.classList.add("active");
        viewDossierBtn.classList.remove("active");
        if (daysContainer) daysContainer.hidden = false;
        if (rawDossierWrap) rawDossierWrap.hidden = true;
      });

      viewDossierBtn.addEventListener("click", function () {
        viewDossierBtn.classList.add("active");
        viewDashboardBtn.classList.remove("active");
        if (daysContainer) daysContainer.hidden = true;
        if (rawDossierWrap) rawDossierWrap.hidden = false;
      });
    }

    // Refinement Form
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

    if (btnRetry) {
      btnRetry.addEventListener("click", function () {
        window.location.reload();
      });
    }

    // 3. Inspect URL parameters
    var params = new URLSearchParams(window.location.search);
    var urlTripId = params.get("id");
    var urlTo = params.get("to");
    var urlFrom = params.get("from") || "";
    var urlDays = params.get("days") || "5";

    // Dynamic path route check: /trip-plan/<id>
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
      executePlanning(query, urlFrom, urlTo, parseInt(urlDays, 10));
      return;
    }

    // Check sessionStorage fallback
    try {
      var cached = sessionStorage.getItem("travelbrain_active_plan");
      if (cached) {
        var data = JSON.parse(cached);
        var parsed = parseItineraryText(data.answer || data.itinerary, data.__meta || {});
        renderDashboard(parsed, data);
        return;
      }
    } catch (e) {}

    // If nothing provided, prompt user to go home
    showError("No travel plan specified. Please select a destination from the home page.");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
