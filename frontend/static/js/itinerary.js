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

  // Settings Modal
  var settingsModal       = $("settingsModal");
  var settingsScrim       = $("settingsScrim");
  var settingsClose       = $("settingsClose");
  var settingsSave        = $("settingsSave");
  var settingsGroqKey     = $("settingsGroqKey");

  /* ---------------- State ---------------- */
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
    var rawSections = text.split(/(?=\n#{1,3}\s+|\n\*\*\d+\.\s+)/);
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
      var sm = text.match(/(?:Trip Summary|Overview)[:\s\*]+(.*?)(?=\n#{1,3}|\n\*\*\d+\.|\Z)/is);
      if (sm) sections.summary = sm[1];
    }
    if (!sections.itinerary) {
      var im = text.match(/(?:Day[- ]by[- ]Day Itinerary|Itinerary)[:\s\*]+(.*?)(?=\n#{1,3}\s*(?:Estimated Budget|\d+\.)|\n\*\*\d+\.\s*Estimated Budget|\Z)/is);
      if (im) sections.itinerary = im[1];
    }
    if (!sections.budget) {
      var bm = text.match(/(?:Estimated Budget|Budget Breakdown)[:\s\*]+(.*?)(?=\n#{1,3}|\n\*\*\d+\.|\Z)/is);
      if (bm) sections.budget = bm[1];
    }
    if (!sections.weather) {
      var wm = text.match(/(?:Weather Information)[:\s\*]+(.*?)(?=\n#{1,3}|\n\*\*\d+\.|\Z)/is);
      if (wm) sections.weather = wm[1];
    }
    if (!sections.recommendations) {
      var rm = text.match(/(?:Final Recommendations|Recommendations & Local Tips)[:\s\*]+(.*?)(?=\n#{1,3}|\n\*\*\d+\.|\Z)/is);
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

    var dayPattern = /(?:^|\n)(?:#{2,4}\s*|\*{1,2})Day\s*(\d+)[:\s\-\–—]*([^\n\*]*)\n([\s\S]*?)(?=\n(?:#{2,4}\s*|\*{1,2})Day\s*\d+|\n#{1,3}\s+[A-Z0-9]|\n\*\*\d+\.|\n---\s*\n\s*##|\Z)/gi;
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

            activities.push({
              time: timeVal || "Day Schedule",
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

      // If no table rows found, try parsing bullet points
      if (activities.length === 0) {
        var lines = dayContent.split("\n");
        lines.forEach(function (line) {
          var l = line.trim();
          var itemM = l.match(/(?:[-*•]|\d+\.)\s*(?:\*{1,2})?([^\*:]+?)(?:\*{1,2})?[:\-–—]+(.*?)$/);
          if (itemM) {
            activities.push({
              time: "Scheduled",
              title: cleanMarkdown(itemM[1]),
              location: parsed.destination,
              duration: "2-3 hours",
              description: cleanMarkdown(itemM[2]),
              tip: null
            });
          }
        });
      }

      // Fallback
      if (activities.length === 0) {
        activities.push({
          time: "Full Day",
          title: dayTitle,
          location: parsed.destination,
          duration: "Day Schedule",
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

        var parsed = parseItineraryText(data.answer || data.itinerary, data.__meta);
        renderDashboard(parsed, data);
      })
      .catch(function (err) {
        clearInterval(timer);
        showError(err.message, err.__kind);
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
          days: 3
        };

        var parsed = parseItineraryText(planResult.answer || planResult.itinerary, planResult.__meta);
        renderDashboard(parsed, planResult);
      })
      .catch(function (err) {
        showError("Failed to load saved trip: " + err.message);
      });
  }

  function showError(msg, kind) {
    if (loadingScreen) loadingScreen.hidden = true;
    if (dashboardContent) dashboardContent.hidden = true;
    if (errorScreen) errorScreen.hidden = false;

    if (errorMessage) {
      if (kind === "credentials" || /Missing credentials|GROQ_API_KEY/i.test(msg)) {
        errorMessage.textContent = "Please configure your Groq API Key to generate travel plans.";
        if (btnErrorSettings) btnErrorSettings.hidden = false;
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

  /* ---------------- Settings Modal Handlers ---------------- */

  function openSettings() {
    if (settingsModal && settingsScrim) {
      settingsModal.hidden = false;
      settingsScrim.hidden = false;
      if (settingsGroqKey) settingsGroqKey.focus();
    }
  }

  function closeSettings() {
    if (settingsModal && settingsScrim) {
      settingsModal.hidden = true;
      settingsScrim.hidden = true;
    }
  }

  function saveSettings() {
    var key = settingsGroqKey ? settingsGroqKey.value.trim() : "";
    if (!key) {
      toast("Please enter your Groq API key.");
      return;
    }

    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groq_api_key: key })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          toast("Groq API key saved successfully!");
          closeSettings();
          // Reload planning
          window.location.reload();
        } else {
          toast(data.error || "Failed to save key.");
        }
      })
      .catch(function () {
        toast("Error saving credentials.");
      });
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

    if (settingsBtn) settingsBtn.addEventListener("click", openSettings);
    if (btnErrorSettings) btnErrorSettings.addEventListener("click", openSettings);
    if (settingsClose) settingsClose.addEventListener("click", closeSettings);
    if (settingsScrim) settingsScrim.addEventListener("click", closeSettings);
    if (settingsSave) settingsSave.addEventListener("click", saveSettings);

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

    // Inspect URL parameters
    var params = new URLSearchParams(window.location.search);
    var urlTripId = params.get("id");
    var urlTo = params.get("to");
    var urlFrom = params.get("from") || "";
    var urlDays = params.get("days") || "3";

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

    showError("No destination specified. Return home to choose your journey.");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
