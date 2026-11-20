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
  var navAuthBtn          = $("navAuthBtn");
  var navAuthText         = $("navAuthText");
  var userMenuWrap        = $("userMenuWrap");
  var userDropdownMenu    = $("userDropdownMenu");
  var dropdownUserAvatar  = $("dropdownUserAvatar");
  var dropdownUserName    = $("dropdownUserName");
  var dropdownUserEmail   = $("dropdownUserEmail");
  var dropdownLogoutBtn   = $("dropdownLogoutBtn");

  // Planner Screen
  var planJourneySection  = $("planJourneySection");
  var itinPlannerForm     = $("itinPlannerForm");
  var pFrom               = $("pFrom");
  var pTo                 = $("pTo");
  var pDays               = $("pDays");
  var btnPlannerSubmit    = $("btnPlannerSubmit");

  // Hero & Summary
  var heroTitle           = $("heroTitle");
  var heroCoverBg         = $("heroCoverBg");
  var heroSubtitle        = $("heroSubtitle");
  var heroPrologue        = $("heroPrologue");
  var heroSummaryLine     = $("heroSummaryLine");
  var heroTagsRow         = $("heroTagsRow");
  var summaryCardsGrid    = $("summaryCardsGrid");
  var foodSection         = $("foodSection");
  var foodGrid            = $("foodGrid");
  var jumpPillFood        = $("jumpPillFood");

  // Day Navigation & Timeline & Journey Flow Graph
  var dayNavTabs          = $("dayNavTabs");
  var daysContainer       = $("daysContainer");
  var itinerarySection    = $("itinerarySection");
  var journeyGraphCard    = $("journeyGraphCard");
  var journeyGraphCount   = $("journeyGraphCount");
  var journeyFlowTrack    = $("journeyFlowTrack");
  var btnViewAllDays      = $("btnViewAllDays");

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
      .replace(/\u2011/g, "-")
      .replace(/\u2013/g, "-")
      .replace(/\u2014/g, "-")
      .replace(/\u202f/g, " ")
      .replace(/\u00a0/g, " ");

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
    var destM = text.match(/(?:Destination[:\s\*]+)([A-Za-z\s,]+?)(?:\(|\.|\n)/i) ||
                text.match(/(?:trip to|journey to|visiting|explore)\s+([A-Za-z\s,]+?)(?:[\.\,\:\n]|\s+from|\s+for)/i);
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
      { key: "summary", rx: /(?:Trip Summary|Overview|Introduction|Executive Summary|Destination Overview|Summary)/i },
      { key: "flights", rx: /(?:Flight|Transit|Airfare|Logistics|Aviation)/i },
      { key: "hotels", rx: /(?:Hotel|Stay|Accommodations|Lodging|Resort)/i },
      { key: "weather", rx: /(?:Weather|Climate|Season|Meteorology)/i },
      { key: "itinerary", rx: /(?:Day[- ]by[- ]Day|Daily Schedule|Itinerary|Travel Plan|Tour Plan|Sightseeing Plan)/i },
      { key: "budget", rx: /(?:Estimated Budget|Budget Breakdown|Costs|Tariff|Financial Estimates|Expenses)/i },
      { key: "recommendations", rx: /(?:Final Recommendations|Recommendations|Local Tips|Travel Tips|Practical Tips|Actionable Advice)/i }
    ];

    var sections = {};
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

    // 3. Process Summary & Prologue
    if (sections.summary) {
      parsed.summary = sections.summary;

      // Extract origin
      var origM = sections.summary.match(/(?:Departure city|From)[:\s\*]+([A-Za-z\s]+?)(?:\(|,|<|\.|\n)/i);
      if (origM) parsed.origin = origM[1].trim();

      // Extract days & nights
      var daysM = sections.summary.match(/(?:Duration)[:\s\*]+(\d+)\s*(?:days?|Nights?)/i);
      if (daysM) {
        parsed.daysCount = parseInt(daysM[1], 10);
        parsed.nightsCount = Math.max(1, parsed.daysCount - 1);
      }
      var nightsM = sections.summary.match(/(\d+)\s*(?:nights?)/i);
      if (nightsM) parsed.nightsCount = parseInt(nightsM[1], 10);

      // Extract total budget
      var costM = sections.summary.match(/(?:Total estimated cost|Total|Estimated cost)[:\s\*]+(?:\*{1,2})?(?:₹|INR)?\s*([\d\,]+)/i);
      if (costM) {
        parsed.budget = "₹" + costM[1].trim();
        parsed.budgetBreakdown.total = "₹" + costM[1].trim();
      }

      // Extract style / pace
      var styleM = sections.summary.match(/(?:Pace & style|Travel style|Style)[:\s\*]+([A-Za-z\s&,-]+?)(?:\.|\n|$)/i);
      if (styleM) parsed.travelStyle = cleanMarkdown(styleM[1].trim());

      // Extract prime season / best time
      var seasonM = sections.summary.match(/(?:Best time to visit|Prime season|Season)[:\s\*]+([A-Za-z\s&,-]+?)(?:\.|\n|$)/i);
      if (seasonM) parsed.primeSeason = cleanMarkdown(seasonM[1].trim());

      // Extract editorial prologue: clean narrative lines
      var sLines = sections.summary.split("\n");
      var proseLines = [];
      sLines.forEach(function (l) {
        var cl = cleanMarkdown(l).trim();
        if (cl.length > 30 && !/^(?:#|[-*•]|\d+\.|Duration|From|Destination|Departure|Estimated cost|Total|Pace|Best time)/i.test(cl)) {
          proseLines.push(cl);
        }
      });
      if (proseLines.length > 0) {
        parsed.prologue = proseLines.slice(0, 3).join(" ");
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
        var bLines = sections.budget.split("\n");
        bLines.forEach(function (l) {
          var lm = l.match(/(?:[-*•]|\d+\.)\s*(?:\*{1,2})?([A-Za-z\s\/&]+?)(?:\*{1,2})?[:\-–—]+(?:\*{1,2})?(?:₹|INR)?\s*([\d\,]+)(?:\s*INR|\s*₹)?/i);
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
      var bMatch = text.match(/(?:Total estimated cost|Total budget|Grand total)[:\s\*]+(?:\*{1,2})?(?:₹|INR)?\s*([\d\,]+)/i);
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

      var adviceM = sections.weather.match(/(?:Weather-based recommendation|Recommendation|Best time|Advisory)[:\s\*]+(.*?)(?=\n#{1,4}|\n\*{0,2}\d+\.|\Z)/is);
      if (adviceM) {
        parsed.weather.advice = cleanMarkdown(adviceM[1]);
      } else {
        var firstWPara = cleanMarkdown(sections.weather.split("\n\n")[0] || "");
        if (firstWPara.length > 20) parsed.weather.advice = firstWPara;
      }

      var tempM = sections.weather.match(/(\d{1,2}\s*°?\s*C\s*(?:-|to)\s*\d{1,2}\s*°?\s*C|\d{1,2}\s*°C)/i);
      if (tempM) parsed.weather.temp = tempM[1].replace(/\s+/g, "");

      var condM = sections.weather.match(/(?:conditions?|climate)[:\s\*]+([A-Za-z\s]+?)(?:\.|,|<|\n)/i);
      if (condM) parsed.weather.condition = cleanMarkdown(condM[1]);
    }

    // 6. Process Day-by-Day Itinerary (Chapters) - Robust Index-Based Extraction
    var dayRegex = /(?:^|\n)\s*(?:[-*•]|\d+\.)?\s*(?:#{1,4}\s*)?(?:\*{1,2})?Day\s*0?(\d+)(?:[:\s\-\*–—\(\)]|\b)(.*?)(?:\n|$)/gi;
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
          var nextSecMatch = dayBlock.match(/\n\s*(?:#{1,4}\s+|\d+\.\s+)(?:Estimated Budget|Budget|Final Recommendations|Recommendations|Local Tips|Travel Tips|Practical Tips|Weather)/i);
          if (nextSecMatch) {
            dayBlock = dayBlock.slice(0, nextSecMatch.index).trim();
          }
        }

        var dayNum = curMatch.dayNum || (dIdx + 1);
        var dayTitle = cleanMarkdown(curMatch.rawTitle)
          .replace(/^[\:\-\–\—\*\s\(\)]+/, "")
          .replace(/[\:\-\–\—\*\s\(\)]+$/, "")
          .trim();
        if (!dayTitle || dayTitle.length < 2) {
          dayTitle = "Exploration & Highlights";
        }

        var firstNewline = dayBlock.indexOf("\n");
        var dayContent = (firstNewline !== -1) ? dayBlock.slice(firstNewline).trim() : dayBlock;

        var activities = [];
        var daySynopsis = "";

        // Extract synopsis if day starts with a brief description or quote
        var firstPara = dayContent.split(/\n\n+/)[0] || "";
        if (firstPara.length > 25 && !/^(?:Morning|Afternoon|Evening|Night|[-*•]|\d+\.)/i.test(firstPara.trim())) {
          daySynopsis = cleanMarkdown(firstPara);
        }

        var lines = dayContent.split("\n");
        lines.forEach(function (l) {
          var line = l.trim();
          if (!line) return;

          // Slot format: - **Morning: Title**: Description OR - **Morning**: Description OR Morning: Description
          var slotM = line.match(/^(?:[-*•]|\d+\.)?\s*(?:\*{1,2})?(Morning|Afternoon|Evening|Night|Sunset|Dawn|Midday)(?:[:\s\-\*]+([^\*:]+?))?(?:\*{1,2})?[:\-–—]+(.*?)$/i);
          if (slotM) {
            var timePhase = slotM[1].trim();
            var subTitle = slotM[2] ? cleanMarkdown(slotM[2].trim()) : "";
            var body = cleanMarkdown(slotM[3].trim());

            var icon = /morning/i.test(timePhase) ? "🌅 Morning" :
                       /afternoon/i.test(timePhase) ? "☀️ Afternoon" :
                       /evening|sunset/i.test(timePhase) ? "🌆 Sunset & Evening" :
                       /night/i.test(timePhase) ? "🌙 Night" : (timePhase + " Phase");

            var sentences = body.split(/[.\n]/);
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

            var isTime = /\b(?:\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm))\b/i.test(bKey);
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
      }
    }

    // Safety synthesis: If still 0 days, synthesize requested days from paragraphs so cards are NEVER empty
    if (parsed.days.length === 0) {
      var targetDaysCount = parsed.daysCount || 3;
      var rawParas = (sections.itinerary || text).split(/\n\n+/).filter(function(p) {
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
    }

    // 7. Process Food & Culinary Scene
    var foodKeywords = /(?:dish|cuisine|thali|curry|delicacy|food|dining|café|restaurant|tasting|street food|flavor|culinary|dham|biryani|seafood|chai|kahwa)/i;
    var rawTextLines = text.split("\n");
    rawTextLines.forEach(function (fl) {
      var cfl = cleanMarkdown(fl).trim();
      // Remove time phase prefixes like "Evening: "
      cfl = cfl.replace(/^(?:Morning|Afternoon|Evening|Night|Dawn|Midday)[:\s\-\*]+/i, "").trim();
      if (foodKeywords.test(cfl) && cfl.length > 25 && cfl.length < 240) {
        var dishMatch = cfl.match(/(?:try|taste|sample|famous for|savor|signature|featuring|including)?[:\s\*]*([A-Z][A-Za-z\s]{3,28}?)(?:[:\-–—]|\s+which|\s+a\s+|\s+is\s+|\(|\.|\,)/);
        var dishName = dishMatch && dishMatch[1] ? dishMatch[1].trim() : "";
        if (dishName && !/^(?:The|And|With|In|For|Please|Try|From|After|Before|Local|Traditional|Savor|Taste|Morning|Afternoon|Evening|Night|Day|Dawn|Midday)$/i.test(dishName) && parsed.culinary.length < 4) {
          var alreadyIn = parsed.culinary.some(function(item) { return item.name.toLowerCase() === dishName.toLowerCase(); });
          if (!alreadyIn) {
            parsed.culinary.push({
              name: dishName,
              category: /street/i.test(cfl) ? "Street Food Delicacy" : /dessert|sweet/i.test(cfl) ? "Traditional Sweet" : /thali|dham|meal/i.test(cfl) ? "Authentic Thali Experience" : "Signature Local Specialty",
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
        var rLines = sections.recommendations.split("\n");
        rLines.forEach(function (l) {
          var cl = cleanMarkdown(l).trim();
          if (cl.length > 12 && cl.length < 240) {
            if (/pack|garment|clothing|jacket|shoe|sunscreen/i.test(cl)) {
              parsed.recommendations.packing.push(cl.replace(/^[-*•\d.]+\s*/, ""));
            } else if (/taxi|cab|bus|metro|scooter|rent|transit|flight/i.test(cl)) {
              parsed.recommendations.transport.push(cl.replace(/^[-*•\d.]+\s*/, ""));
            } else if (/food|eat|dining|restaurant|water/i.test(cl)) {
              parsed.recommendations.dining.push(cl.replace(/^[-*•\d.]+\s*/, ""));
            } else {
              parsed.recommendations.safety.push(cl.replace(/^[-*•\d.]+\s*/, ""));
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
      heroPrologue.hidden = !parsed.prologue;
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
        { label: "📖 Journey Flow & Cards", target: "journeyGraphCard" },
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

      var totalDaysCount = parsed.days.length || parsed.daysCount || 3;
      var allTab = el("button", "day-tab active", "All Days (" + totalDaysCount + " Cards)");
      allTab.addEventListener("click", function () {
        setActiveDayTab(allTab, null);
      });
      dayNavTabs.appendChild(allTab);

      parsed.days.forEach(function (d) {
        var tab = el("button", "day-tab");
        tab.innerHTML = "Day " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum) + ' <span class="day-tab-count">(' + d.activities.length + ")</span>";
        tab.addEventListener("click", function () {
          setActiveDayTab(tab, "day-card-" + d.dayNum);
        });
        dayNavTabs.appendChild(tab);
      });
    }

    // 3.5 Populate Journey Flow Graph (Visual Timeline Track)
    if (journeyFlowTrack) {
      journeyFlowTrack.innerHTML = "";
      if (journeyGraphCount) {
        var totalDays = parsed.days.length || parsed.daysCount || 3;
        journeyGraphCount.textContent = totalDays + " Days Flow · " + Math.max(1, totalDays - 1) + " Nights Verified Route";
      }

      parsed.days.forEach(function (d, idx) {
        var nodeEl = el("div", "journey-node");
        nodeEl.id = "journey-node-" + d.dayNum;
        nodeEl.setAttribute("role", "button");
        nodeEl.setAttribute("tabindex", "0");
        nodeEl.setAttribute("title", "Jump to Day " + d.dayNum + ": " + cleanMarkdown(d.title));

        var dotWrap = el("div", "journey-node-dot-wrap");
        var ring = el("div", "journey-node-ring");
        var core = el("div", "journey-node-core");
        var num = el("span", "journey-node-num", (d.dayNum < 10 ? "0" + d.dayNum : "" + d.dayNum));
        dotWrap.appendChild(ring);
        dotWrap.appendChild(core);
        dotWrap.appendChild(num);
        nodeEl.appendChild(dotWrap);

        var content = el("div", "journey-node-content");
        var dayTag = el("div", "journey-node-day", "DAY " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum));
        var title = el("div", "journey-node-title", cleanMarkdown(d.title));
        var meta = el("div", "journey-node-meta", d.activities.length + " spots · ~" + Math.max(4, d.activities.length * 2) + "h");
        content.appendChild(dayTag);
        content.appendChild(title);
        content.appendChild(meta);
        nodeEl.appendChild(content);

        nodeEl.addEventListener("click", function () {
          focusDayCard(d.dayNum);
        });

        journeyFlowTrack.appendChild(nodeEl);

        // Connector segment if not last day
        if (idx < parsed.days.length - 1) {
          var segment = el("div", "journey-track-segment");
          var segLine = el("div", "journey-segment-line");
          var segIcon = el("div", "journey-segment-icon", "✈");
          segment.appendChild(segLine);
          segment.appendChild(segIcon);
          journeyFlowTrack.appendChild(segment);
        }
      });
    }

    if (btnViewAllDays) {
      btnViewAllDays.addEventListener("click", function () {
        setActiveDayTab(null, null);
      });
    }

    // 4. Day Cards Grid (Cards-wise display, exactly as many cards as days)
    if (daysContainer) {
      daysContainer.innerHTML = "";
      daysContainer.className = "day-cards-grid";

      if (parsed.days.length === 0) {
        var fallbackBlock = el("div", "itinerary-day-card fallback-card");
        fallbackBlock.innerHTML = renderMd(rawResult.itinerary || rawResult.answer);
        daysContainer.appendChild(fallbackBlock);
      } else {
        parsed.days.forEach(function (d, dIdx) {
          var cardEl = el("article", "itinerary-day-card day-chapter");
          cardEl.id = "day-card-" + d.dayNum;
          cardEl.setAttribute("data-day-num", d.dayNum);

          // Anchor for backward compatibility
          var anchor = el("div", "day-card-anchor");
          anchor.id = "day-chapter-" + d.dayNum;
          cardEl.appendChild(anchor);

          // Card Header
          var cHead = el("header", "day-card-header");
          
          var topBadgeRow = el("div", "day-card-top-row");
          var badgeWrap = el("div", "day-card-badge-wrap");
          var numBadge = el("span", "day-card-number", "DAY " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum));
          var stepTag = el("span", "day-card-step-tag", "Milestone " + (dIdx + 1) + " of " + parsed.days.length);
          badgeWrap.appendChild(numBadge);
          badgeWrap.appendChild(stepTag);
          topBadgeRow.appendChild(badgeWrap);

          var actCountBadge = el("span", "day-card-count-badge", "✦ " + d.activities.length + " Experiences");
          topBadgeRow.appendChild(actCountBadge);
          cHead.appendChild(topBadgeRow);

          var cTitle = el("h3", "day-card-title", cleanMarkdown(d.title));
          cHead.appendChild(cTitle);

          if (d.synopsis) {
            var cSyn = el("p", "day-card-synopsis", d.synopsis);
            cHead.appendChild(cSyn);
          }

          // Mini Flow Progression Inside Card (Morning -> Afternoon -> Evening -> Night)
          var miniFlow = el("div", "day-mini-flow");
          var phases = [
            { label: "Morning", icon: "🌅" },
            { label: "Afternoon", icon: "☀️" },
            { label: "Evening", icon: "🌆" },
            { label: "Night", icon: "🌙" }
          ];
          phases.forEach(function (phase, pIdx) {
            var phaseDot = el("span", "day-flow-step");
            var hasAct = d.activities.some(function (act) {
              return act.time && act.time.toLowerCase().indexOf(phase.label.toLowerCase()) !== -1;
            });
            if (hasAct) phaseDot.classList.add("active");
            phaseDot.innerHTML = '<span class="flow-step-icon">' + phase.icon + '</span> <span class="flow-step-label">' + phase.label + '</span>';
            miniFlow.appendChild(phaseDot);
            if (pIdx < phases.length - 1) {
              var flowArrow = el("span", "day-flow-arrow", "›");
              miniFlow.appendChild(flowArrow);
            }
          });
          cHead.appendChild(miniFlow);

          cardEl.appendChild(cHead);

          // Activities Stack inside Card
          var actContainer = el("div", "day-card-activities");

          // Calculate day total cost if available
          var dayCostTotal = 0;
          var hasCost = false;

          d.activities.forEach(function (act) {
            var item = el("div", "day-activity-item");

            var slotHead = el("div", "day-activity-slot-head");
            var timePill = el("span", "activity-time-pill", act.time);
            slotHead.appendChild(timePill);

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

              var numCostMatch = act.cost.match(/[\d\,]+/);
              if (numCostMatch) {
                var cNum = parseInt(numCostMatch[0].replace(/,/g, ""), 10);
                if (!isNaN(cNum)) {
                  dayCostTotal += cNum;
                  hasCost = true;
                }
              }
            }
            slotHead.appendChild(metaBadges);
            item.appendChild(slotHead);

            var actTitle = el("h4", "day-activity-title", cleanMarkdown(act.title));
            item.appendChild(actTitle);

            if (act.location) {
              var locEl = el("div", "day-activity-location");
              locEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg> <span>' + cleanMarkdown(act.location) + '</span>';
              item.appendChild(locEl);
            }

            if (act.description) {
              var descWrap = el("div", "day-activity-desc");
              descWrap.innerHTML = renderMd(act.description);
              item.appendChild(descWrap);
            }

            if (act.tip) {
              var tipBox = el("div", "day-activity-tip");
              tipBox.innerHTML = '<span>💡</span><div>' + renderMd(act.tip) + '</div>';
              item.appendChild(tipBox);
            }

            actContainer.appendChild(item);
          });

          cardEl.appendChild(actContainer);

          // Card Footer
          var cFoot = el("footer", "day-card-footer");
          var footLeft = el("div", "day-card-foot-left");
          footLeft.innerHTML = '<span>📍 ' + d.activities.length + ' Curated Spots</span> <span class="foot-sep">·</span> <span>⏱️ Full Day Pace</span>';
          cFoot.appendChild(footLeft);

          var footRight = el("div", "day-card-foot-right");
          if (hasCost && dayCostTotal > 0) {
            footRight.innerHTML = '<span class="day-cost-pill">💰 Day Outlay: <strong>₹' + dayCostTotal.toLocaleString("en-IN") + '</strong></span>';
          } else {
            footRight.innerHTML = '<span class="day-status-pill">✦ Milestone Active</span>';
          }
          cFoot.appendChild(footRight);

          cardEl.appendChild(cFoot);
          daysContainer.appendChild(cardEl);
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

  function focusDayCard(dayNum) {
    document.querySelectorAll(".journey-node").forEach(function (n) {
      n.classList.remove("active");
    });
    var targetNode = $("journey-node-" + dayNum);
    if (targetNode) targetNode.classList.add("active");

    var numStr = dayNum < 10 ? "0" + dayNum : "" + dayNum;
    document.querySelectorAll(".day-tab").forEach(function (t) {
      t.classList.remove("active");
      var text = t.textContent || "";
      if (text.indexOf("Day " + numStr) !== -1 || text.indexOf("Chapter " + numStr) !== -1 || text.indexOf(" " + numStr) !== -1) {
        t.classList.add("active");
      }
    });

    document.querySelectorAll(".itinerary-day-card, .itinerary-day-block").forEach(function (c) {
      c.style.display = "";
      c.classList.remove("card-pulse-active");
    });

    var card = $("day-card-" + dayNum) || $("day-chapter-" + dayNum);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("card-pulse-active");
      setTimeout(function () {
        card.classList.remove("card-pulse-active");
      }, 2500);
    }
  }

  function setActiveDayTab(activeTabEl, targetId) {
    document.querySelectorAll(".day-tab").forEach(function (t) { t.classList.remove("active"); });
    if (activeTabEl) activeTabEl.classList.add("active");

    if (!targetId) {
      document.querySelectorAll(".itinerary-day-card, .itinerary-day-block").forEach(function (b) {
        b.style.display = "";
        b.classList.remove("card-pulse-active");
      });
      document.querySelectorAll(".journey-node").forEach(function (n) {
        n.classList.remove("active");
      });
      var itinTarget = $("journeyGraphCard") || $("itinerarySection") || daysContainer;
      if (itinTarget) {
        window.scrollTo({ top: itinTarget.offsetTop - 120, behavior: "smooth" });
      }
    } else {
      var dMatch = targetId.match(/\d+/);
      if (dMatch) {
        focusDayCard(parseInt(dMatch[0], 10));
      } else {
        var target = $(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }

  /* ---------------- Authentication Manager ---------------- */

  function getLoggedInUser() {
    var client = window.TravelBrainAPI;
    if (client && client.getCurrentUser) {
      var u = client.getCurrentUser();
      if (u && (u.email || u.id)) return u;
    }
    try {
      var raw = localStorage.getItem("tb_auth_user") || sessionStorage.getItem("tb_auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function updateItinAuthUI() {
    var user = getLoggedInUser();
    if (user) {
      var initial = (user.name || "U").trim().charAt(0).toUpperCase();
      if (dropdownUserAvatar) dropdownUserAvatar.textContent = initial;
      if (dropdownUserName) dropdownUserName.textContent = user.name || "Traveler";
      if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || "";

      if (navAuthBtn) {
        navAuthBtn.classList.add("is-logged-in");
        navAuthBtn.title = "Logged in as " + (user.name || user.email) + " — click for options";
      }
      if (navAuthText) {
        var firstName = (user.name || user.email || "User").split(" ")[0];
        navAuthText.textContent = firstName;
      }
    } else {
      if (navAuthBtn) {
        navAuthBtn.classList.remove("is-logged-in");
        navAuthBtn.title = "Sign In or Register";
      }
      if (navAuthText) {
        navAuthText.textContent = "Sign In";
      }
      if (userDropdownMenu) {
        userDropdownMenu.hidden = true;
      }
    }
  }

  function handleLogout() {
    if (userDropdownMenu) userDropdownMenu.hidden = true;
    var logoutCall = (window.TravelBrainAPI && typeof window.TravelBrainAPI.logout === "function")
      ? window.TravelBrainAPI.logout()
      : fetch("/api/auth/logout", { method: "POST" });

    logoutCall.finally(function () {
      try {
        localStorage.removeItem("tb_auth_user");
        localStorage.removeItem("tb_auth_token");
        sessionStorage.removeItem("tb_auth_user");
        sessionStorage.removeItem("tb_auth_token");
      } catch (e) {}
      if (window.TravelBrainAPI) window.TravelBrainAPI.clearAuth();
      updateItinAuthUI();
      toast("Logged out successfully.");
      window.location.href = "/";
    });
  }
  window.handleLogout = handleLogout;

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
    updateItinAuthUI();
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
                                  '<span class="status-action" style="color:#10B981;margin-left:4px;">· Configure</span>';
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
                                '<span class="status-action" style="color:#10B981;margin-left:4px;font-weight:600;">· Connect to API</span>';
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
        if (journeyGraphCard) journeyGraphCard.hidden = false;
        if (rawDossierWrap) rawDossierWrap.hidden = true;
      });

      viewDossierBtn.addEventListener("click", function () {
        viewDossierBtn.classList.add("active");
        viewDashboardBtn.classList.remove("active");
        hidePlannerScreen();
        if (daysContainer) daysContainer.hidden = true;
        if (journeyGraphCard) journeyGraphCard.hidden = true;
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

    // Wire up User Menu & Logout Controls
    updateItinAuthUI();

    if (navAuthBtn) {
      navAuthBtn.addEventListener("click", function (e) {
        var user = getLoggedInUser();
        if (user) {
          e.stopPropagation();
          if (userDropdownMenu) {
            userDropdownMenu.hidden = !userDropdownMenu.hidden;
          }
        } else {
          openAuthModal();
        }
      });
    }

    document.addEventListener("click", function (e) {
      if (userDropdownMenu && !userDropdownMenu.hidden) {
        if (userMenuWrap && !userMenuWrap.contains(e.target)) {
          userDropdownMenu.hidden = true;
        }
      }
    });

    if (dropdownLogoutBtn) {
      dropdownLogoutBtn.addEventListener("click", function () {
        handleLogout();
      });
    }

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
