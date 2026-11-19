/* ============================================================
   TravelBrain AI — Frontend Application Controller
   Connects:
     - 3D Aviation Engine (Three.js + GSAP)
     - 3-Field Main Travel Search (Source, Destination, Days)
     - Multi-Agent Orchestration API: POST /api/travel
     - Critic Fact-Checking Audit:     POST /api/evaluate
     - Session Credential Store:       GET/POST/DELETE /api/config
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- DOM Elements ---------------- */

  var $ = function (id) { return document.getElementById(id); };

  var hero              = $("hero");
  var planningSection   = $("planningSection");
  var messages          = $("messages");
  var input             = $("input");
  var composer          = $("composer");
  var sendBtn           = $("sendBtn");
  var toastEl           = $("toast");

  var fFrom             = $("fFrom");
  var fTo               = $("fTo");
  var fDays             = $("fDays");
  var btnPlanJourney    = $("btnPlanJourney");
  var collapsePlanBtn   = $("collapsePlanBtn");

  var statusBtn         = $("apiStatus");
  var statusText        = statusBtn ? statusBtn.querySelector(".status-text") : null;

  var setupGate         = $("setupGate");
  var gateCreds         = $("gateCreds");
  var gateSub           = $("gateSub");
  var gateSave          = $("gateSave");

  var settingsModal     = $("settingsModal");
  var settingsScrim     = $("settingsScrim");
  var credList          = $("credList");
  var settingsSave      = $("settingsSave");
  var settingsReset     = $("settingsReset");
  var settingsClose     = $("settingsClose");
  var settingsBtn       = $("settingsBtn");

  var themeToggle       = $("themeToggle");
  var newTripBtn        = $("newTripBtn");
  var mobileToggle      = $("mobileToggle");
  var mobileDrawer      = $("mobileDrawer");

  /* --- Auth & Sidebar Elements --- */
  var sidebarToggle     = $("sidebarToggle");
  var chatSidebar       = $("chatSidebar");
  var sidebarCloseBtn   = $("sidebarCloseBtn");
  var sidebarBackdrop   = $("sidebarBackdrop");
  var sidebarNewTripBtn = $("sidebarNewTripBtn");
  var historyList       = $("historyList");
  var historyCount      = $("historyCount");
  var historyEmpty      = $("historyEmpty");
  var sidebarUserAvatar = $("sidebarUserAvatar");
  var sidebarUserName   = $("sidebarUserName");
  var sidebarUserEmail  = $("sidebarUserEmail");
  var sidebarAuthActionBtn = $("sidebarAuthActionBtn");
  var navAuthBtn        = $("navAuthBtn");
  var navAuthText       = $("navAuthText");
  var mAuth             = $("mAuth");

  var authModal         = $("authModal");
  var authScrim         = $("authScrim");
  var authClose         = $("authClose");
  var tabLogin          = $("tabLogin");
  var tabSignup         = $("tabSignup");
  var authErrorBanner   = $("authErrorBanner");
  var loginForm         = $("loginForm");
  var loginEmail        = $("loginEmail");
  var loginPassword     = $("loginPassword");
  var loginSubmitBtn    = $("loginSubmitBtn");
  var signupForm        = $("signupForm");
  var signupName        = $("signupName");
  var signupEmail       = $("signupEmail");
  var signupPassword    = $("signupPassword");
  var signupConfirm     = $("signupConfirm");
  var signupSubmitBtn   = $("signupSubmitBtn");
  var switchToSignup    = $("switchToSignup");
  var switchToLogin     = $("switchToLogin");

  /* ---------------- State ---------------- */

  var THEME_KEY = "travelbrain.theme";
  var threadId = null;   // Active LangGraph session thread
  var busy = false;
  var config = null;     // Last /api/config payload
  var savingConfig = false;

  var currentUser = null; // { id, name, email }
  var historyItems = [];  // Array of latest 10 trips
  var activeTripId = null;

  var PHASES = [
    { label: "Flight Intelligence Agent · Analyzing routes & airfares in INR", weight: 0.22 },
    { label: "Hotel & Stays Agent · Scouting accommodations & tariffs",        weight: 0.20 },
    { label: "Weather Analyst Agent · Forecasting climate & packing advice",    weight: 0.16 },
    { label: "Itinerary Architect Agent · Structuring day-by-day pacing",       weight: 0.22 },
    { label: "Final Synthesis Agent · Compiling verified master dossier",       weight: 0.20 }
  ];

  var ESTIMATED_MS = 55000;

  /* ---------------- Utilities ---------------- */

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function icon(paths, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    if (cls) svg.setAttribute("class", cls);
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", paths);
    svg.appendChild(p);
    return svg;
  }

  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.hidden = true; }, 250);
    }, 3000);
  }

  function toText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);

    if (Array.isArray(value)) {
      return value.map(toText).filter(Boolean).join("\n\n");
    }

    if (typeof value === "object") {
      if (typeof value.text === "string") return value.text;
      if (typeof value.content === "string") return value.content;
      if (Array.isArray(value.content)) return toText(value.content);

      try {
        return "```json\n" + JSON.stringify(value, null, 2) + "\n```";
      } catch (e) {
        return String(value);
      }
    }

    return String(value);
  }

  /* ---------------- Theme Management ---------------- */

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var activeTheme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", activeTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------------- API Credentials & Config ---------------- */

  function isReady() {
    return !!(config && config.ready);
  }

  function updateEmptyState() {
    var hasMessages = messages && messages.children.length > 0;
    var ready = isReady();

    if (setupGate) setupGate.hidden = ready || hasMessages;
    if (planningSection) planningSection.hidden = !hasMessages;

    if (input) input.disabled = !ready || busy;
    if (sendBtn) sendBtn.disabled = !ready || busy;
  }

  var btnTestApiConn        = $("btnTestApiConn");
  var settingsConnIndicator = $("settingsConnIndicator");
  var settingsConnState     = $("settingsConnState");
  var settingsConnDetail    = $("settingsConnDetail");
  var authNoticeBanner      = $("authNoticeBanner");
  var pendingPlan           = null;

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

  function updateConnectionUI(stateKind, detailText) {
    if (settingsConnIndicator) {
      if (stateKind === "connected") {
        settingsConnIndicator.style.background = "#22c55e";
        settingsConnIndicator.style.boxShadow = "0 0 10px rgba(34,197,94,0.5)";
      } else if (stateKind === "connecting") {
        settingsConnIndicator.style.background = "#eab308";
        settingsConnIndicator.style.boxShadow = "none";
      } else if (stateKind === "failed") {
        settingsConnIndicator.style.background = "#ef4444";
        settingsConnIndicator.style.boxShadow = "0 0 10px rgba(239,68,68,0.5)";
      } else {
        settingsConnIndicator.style.background = "#94a3b8";
        settingsConnIndicator.style.boxShadow = "none";
      }
    }
    if (settingsConnState) {
      if (config && typeof config.connected_count === "number") {
        settingsConnState.textContent = config.ready
          ? "AI Agents Ready · " + config.connected_count + "/" + config.total_count + " Services Connected"
          : "Configuration Required · " + config.connected_count + "/" + config.total_count + " Services Connected";
      } else {
        settingsConnState.textContent = stateKind === "connected" ? "Connected"
                                     : stateKind === "connecting" ? "Connecting…"
                                     : stateKind === "failed" ? "API Unreachable"
                                     : "Disconnected";
      }
    }
    if (settingsConnDetail && detailText) {
      settingsConnDetail.textContent = detailText;
    }
  }

  function applyConfig(data) {
    config = data;
    var missing = (data && data.missing) || [];

    if (statusBtn) {
      if (data && data.ready) {
        statusBtn.setAttribute("data-state", "ok");
        statusBtn.innerHTML = '<span class="status-indicator" style="background:#22c55e;box-shadow:0 0 8px rgba(34,197,94,0.6);"></span>' +
                              '<span class="status-text">API Connected</span>';
        statusBtn.title = "Connected to backend API · Ready to plan";
      } else {
        statusBtn.setAttribute("data-state", "setup");
        statusBtn.innerHTML = '<span class="status-indicator" style="background:#eab308;"></span>' +
                              '<span class="status-text">Connect to API</span>' +
                              '<span class="status-action" style="color:#55B8E8;margin-left:4px;">· Configure</span>';
        statusBtn.title = "API keys needed — click to configure";

        if (gateSub && data.credentials) {
          var labels = missing.map(function (name) {
            return (data.credentials[name] && data.credentials[name].label) || name;
          });
          gateSub.textContent = labels.length
            ? "The server has no " + labels.join(" and ") + " configured. Add below to begin planning."
            : "The server has no API keys configured. Connect your credentials to start planning.";
        }
        if (gateCreds) renderCreds(gateCreds);
      }
    }

    var connectedCount = (data && data.connected_count) || 0;
    var totalCount = (data && data.total_count) || 5;
    updateConnectionUI(data && data.ready ? "connected" : "connecting", connectedCount + " of " + totalCount + " AI services configured.");

    if (settingsModal && !settingsModal.hidden && credList) {
      renderCreds(credList);
    }

    updateEmptyState();
  }

  function markUnreachable(err) {
    config = null;
    if (statusBtn) {
      statusBtn.setAttribute("data-state", "down");
      statusBtn.innerHTML = '<span class="status-indicator" style="background:#ef4444;box-shadow:0 0 8px rgba(239,68,68,0.6);"></span>' +
                            '<span class="status-text">API Unreachable</span>' +
                            '<span class="status-action" style="color:#55B8E8;margin-left:4px;font-weight:600;">· Connect to API</span>';
      statusBtn.title = "Could not reach the server — click to connect";
    }
    updateConnectionUI("failed", err && err.message ? err.message : "Could not reach server. Verify backend is running.");
    updateEmptyState();
  }

  function refreshConfig() {
    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    return apiClient.fetch("/api/config", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)); })
      .then(applyConfig)
      .catch(markUnreachable);
  }

  function renderCreds(container) {
    if (!container) return;
    container.innerHTML = "";

    var creds = (config && config.credentials) || {};

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
      statusBadge.id = "badge-" + p.id;
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
          : fetch("/api/config/verify-key", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ provider: p.id, key: keyVal })
            }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok && d.ok, data: d }; }); });

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
              refreshConfig();
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
    if (!settingsModal || !settingsScrim) return;
    settingsModal.hidden = false;
    settingsScrim.hidden = false;

    updateConnectionUI("connecting", "Verifying AI provider connections…");
    if (credList) renderCreds(credList);
    refreshConfig();
    var first = credList ? credList.querySelector(".provider-key-input") : null;
    if (first) first.focus();
  }

  function closeSettings() {
    if (!settingsModal || !settingsScrim) return;
    settingsModal.hidden = true;
    settingsScrim.hidden = true;
  }

  function setSavingConfig(state, button) {
    savingConfig = state;
    if (settingsSave) settingsSave.disabled = state;
    if (gateSave) gateSave.disabled = state;
    if (button) button.classList.toggle("is-busy", state);
  }

  function saveCredentials(container, button) {
    if (savingConfig) return;

    var payload = {};
    var hasValues = false;

    container.querySelectorAll(".provider-key-input").forEach(function (box) {
      var val = box.value.trim();
      if (!val) return;
      hasValues = true;
      var prop = box.getAttribute("data-prop");
      if (prop) payload[prop] = val;
    });

    if (!hasValues) {
      toast("No new credentials entered. Existing settings preserved.");
      closeSettings();
      return;
    }

    setSavingConfig(true, button);

    var apiClient = window.TravelBrainAPI;
    var saveCall = apiClient && apiClient.saveConfig
      ? apiClient.saveConfig(payload)
      : fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); });

    saveCall
      .then(function (res) {
        if (!res.ok || res.data.success === false) {
          var errors = res.data.errors || {};
          var errKeys = Object.keys(errors);
          if (errKeys.length > 0) {
            errKeys.forEach(function (prop) {
              var input = container.querySelector('[data-prop="' + prop + '"]');
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

        applyConfig(res.data);
        renderCreds(container);
        toast("All credentials connected successfully!");
        setTimeout(closeSettings, 700);
      })
      .catch(function (err) {
        toast("Could not reach server: " + (err.message || String(err)));
      })
      .then(function () {
        setSavingConfig(false, button);
      });
  }

  function resetSettings() {
    if (savingConfig) return;
    setSavingConfig(true, settingsSave);

    var apiClient = window.TravelBrainAPI;
    var resetCall = apiClient && apiClient.resetConfig
      ? apiClient.resetConfig()
      : fetch("/api/config", { method: "DELETE" }).then(function (r) { return r.json(); });

    resetCall
      .then(function (data) {
        applyConfig(data);
        if (credList) renderCreds(credList);
        toast("Session credentials cleared. Reverted to server .env.");
      })
      .catch(function () { toast("Could not clear credentials."); })
      .then(function () { setSavingConfig(false, settingsSave); });
  }

  if (btnTestApiConn) {
    btnTestApiConn.addEventListener("click", function () {
      updateConnectionUI("connecting", "Pinging backend server…");
      if (window.TravelBrainAPI) {
        window.TravelBrainAPI.testConnection().then(function (res) {
          if (res.ok) {
            updateConnectionUI("connected", "Reachable! Latency: " + res.latency + "ms");
            toast("Connection test successful (" + res.latency + "ms)");
            refreshConfig();
          } else {
            updateConnectionUI("failed", res.error || "Connection test failed");
            toast("Connection failed: " + (res.error || "Cannot reach server"));
          }
        });
      }
    });
  }

  if (statusBtn) statusBtn.addEventListener("click", openSettings);
  if (settingsClose) settingsClose.addEventListener("click", closeSettings);
  if (settingsScrim) settingsScrim.addEventListener("click", closeSettings);
  if (settingsSave) settingsSave.addEventListener("click", function () { saveCredentials(credList, settingsSave); });
  if (gateSave) gateSave.addEventListener("click", function () { saveCredentials(gateCreds, gateSave); });
  if (settingsReset) settingsReset.addEventListener("click", resetSettings);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && settingsModal && !settingsModal.hidden) closeSettings();
  });

  /* ---------------- Auth & Sidebar Controllers ---------------- */

  function toggleSidebar(state) {
    var isOpen = typeof state === "boolean" ? state : !document.body.classList.contains("sidebar-open");
    document.body.classList.toggle("sidebar-open", isOpen);
    if (chatSidebar) {
      if (isOpen) {
        chatSidebar.style.visibility = "visible";
        chatSidebar.style.pointerEvents = "auto";
        chatSidebar.style.transform = "translateX(0)";
      } else {
        chatSidebar.style.pointerEvents = "none";
        chatSidebar.style.transform = "translateX(-100%)";
        setTimeout(function () {
          if (!document.body.classList.contains("sidebar-open")) {
            chatSidebar.style.visibility = "hidden";
          }
        }, 300);
      }
    }
    if (sidebarBackdrop) sidebarBackdrop.hidden = !isOpen;
  }

  function openAuthModal(tab) {
    if (!authModal || !authScrim) return;
    authModal.hidden = false;
    authScrim.hidden = false;
    clearAuthError();
    switchAuthTab(tab || "login");
    var firstInput = (tab === "signup" ? signupName : loginEmail);
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  }

  function closeAuthModal() {
    if (!authModal || !authScrim) return;
    authModal.hidden = true;
    authScrim.hidden = true;
    clearAuthError();
    if (authNoticeBanner) {
      authNoticeBanner.innerHTML = "";
      authNoticeBanner.hidden = true;
    }
  }

  function resumePendingPlanIfAny() {
    var pending = pendingPlan;
    if (!pending) {
      try {
        var saved = sessionStorage.getItem("tb_pending_plan");
        if (saved) pending = JSON.parse(saved);
      } catch (e) {}
    }

    if (pending && pending.to) {
      sessionStorage.removeItem("tb_pending_plan");
      pendingPlan = null;
      toast("Welcome, " + (currentUser.name || "Traveler") + "! Starting your journey plan…");
      setTimeout(function () {
        var targetUrl = "/trip-plan?to=" + encodeURIComponent(pending.to) +
          (pending.from ? "&from=" + encodeURIComponent(pending.from) : "") +
          "&days=" + encodeURIComponent(pending.days || 5);
        window.location.href = targetUrl;
      }, 500);
      return true;
    }
    return false;
  }

  function switchAuthTab(tab) {
    clearAuthError();
    if (tab === "signup") {
      if (tabLogin) tabLogin.classList.remove("active");
      if (tabSignup) tabSignup.classList.add("active");
      if (loginForm) loginForm.hidden = true;
      if (signupForm) signupForm.hidden = false;
    } else {
      if (tabSignup) tabSignup.classList.remove("active");
      if (tabLogin) tabLogin.classList.add("active");
      if (signupForm) signupForm.hidden = true;
      if (loginForm) loginForm.hidden = false;
    }
  }

  function showAuthError(msg) {
    if (!authErrorBanner) return;
    authErrorBanner.textContent = msg;
    authErrorBanner.hidden = false;
  }

  function clearAuthError() {
    if (!authErrorBanner) return;
    authErrorBanner.textContent = "";
    authErrorBanner.hidden = true;
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return "";
    var date = new Date(dateStr);
    var now = new Date();
    var diffMs = now - date;
    var diffSec = Math.floor(diffMs / 1000);
    var diffMin = Math.floor(diffSec / 60);
    var diffHrs = Math.floor(diffMin / 60);
    var diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return diffMin + "m ago";
    if (diffHrs < 24) return diffHrs + "h ago";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return diffDays + "d ago";

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function updateAuthUI() {
    if (currentUser) {
      var initial = (currentUser.name || "U").trim().charAt(0).toUpperCase();
      if (sidebarUserAvatar) sidebarUserAvatar.textContent = initial;
      if (sidebarUserName) sidebarUserName.textContent = currentUser.name;
      if (sidebarUserEmail) sidebarUserEmail.textContent = currentUser.email;

      if (sidebarAuthActionBtn) {
        sidebarAuthActionBtn.title = "Log Out (" + currentUser.name + ")";
        sidebarAuthActionBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>';
      }

      if (navAuthBtn) {
        navAuthBtn.classList.add("is-logged-in");
        navAuthBtn.title = "Logged in as " + currentUser.name + " — click to log out";
      }
      if (navAuthText) {
        var firstName = currentUser.name.split(" ")[0];
        navAuthText.textContent = firstName;
      }
      if (mAuth) {
        mAuth.textContent = "Log Out (" + currentUser.name.split(" ")[0] + ")";
      }
    } else {
      if (sidebarUserAvatar) sidebarUserAvatar.textContent = "G";
      if (sidebarUserName) sidebarUserName.textContent = "Guest Traveler";
      if (sidebarUserEmail) sidebarUserEmail.textContent = "Sign in to sync history";

      if (sidebarAuthActionBtn) {
        sidebarAuthActionBtn.title = "Sign In";
        sidebarAuthActionBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>';
      }

      if (navAuthBtn) {
        navAuthBtn.classList.remove("is-logged-in");
        navAuthBtn.title = "Sign In or Register";
      }
      if (navAuthText) {
        navAuthText.textContent = "Sign In";
      }
      if (mAuth) {
        mAuth.textContent = "Sign In / Register";
      }
    }
  }

  function checkAuth() {
    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    return apiClient.fetch("/api/auth/me")
      .then(function (r) {
        return r.ok ? r.json() : { authenticated: false };
      })
      .then(function (data) {
        if (data.authenticated && data.user) {
          currentUser = data.user;
          if (window.TravelBrainAPI) window.TravelBrainAPI.setCurrentUser(currentUser);
          updateAuthUI();
          loadHistory();
        } else {
          currentUser = null;
          if (window.TravelBrainAPI) window.TravelBrainAPI.setCurrentUser(null);
          updateAuthUI();
          renderHistory();
        }
      })
      .catch(function () {
        currentUser = null;
        if (window.TravelBrainAPI) window.TravelBrainAPI.setCurrentUser(null);
        updateAuthUI();
        renderHistory();
      });
  }

  function handleLogin(e) {
    if (e) e.preventDefault();
    clearAuthError();

    var email = (loginEmail ? loginEmail.value : "").trim();
    var password = (loginPassword ? loginPassword.value : "");

    if (!email || !password) {
      showAuthError("Please fill in both email and password.");
      return;
    }

    if (loginSubmitBtn) {
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.classList.add("is-busy");
    }

    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    })
      .then(function (r) {
        return r.json().then(function (data) { return { ok: r.ok, data: data }; });
      })
      .then(function (res) {
        if (!res.ok || res.data.success === false) {
          showAuthError(res.data.error || "Invalid email or password.");
          return;
        }

        currentUser = res.data.user;
        if (res.data.token && window.TravelBrainAPI) {
          window.TravelBrainAPI.setAuthToken(res.data.token);
        }
        if (window.TravelBrainAPI) window.TravelBrainAPI.setCurrentUser(currentUser);

        updateAuthUI();
        closeAuthModal();
        if (loginForm) loginForm.reset();

        var resumed = resumePendingPlanIfAny();
        if (!resumed) {
          toast("Welcome back, " + (currentUser.name || "traveler") + "!");
          loadHistory();
        }
      })
      .catch(function (err) {
        showAuthError("Connection error: " + err.message);
      })
      .then(function () {
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.classList.remove("is-busy");
        }
      });
  }

  function handleSignup(e) {
    if (e) e.preventDefault();
    clearAuthError();

    var name = (signupName ? signupName.value : "").trim();
    var email = (signupEmail ? signupEmail.value : "").trim();
    var password = (signupPassword ? signupPassword.value : "");
    var confirm = (signupConfirm ? signupConfirm.value : "");

    if (!name || !email || !password || !confirm) {
      showAuthError("Please complete all fields.");
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
      signupSubmitBtn.disabled = true;
      signupSubmitBtn.classList.add("is-busy");
    }

    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        confirm_password: confirm
      })
    })
      .then(function (r) {
        return r.json().then(function (data) { return { ok: r.ok, data: data }; });
      })
      .then(function (res) {
        if (!res.ok || res.data.success === false) {
          if (res.data.errors) {
            var firstKey = Object.keys(res.data.errors)[0];
            showAuthError(res.data.errors[firstKey]);
          } else {
            showAuthError(res.data.error || "Registration failed.");
          }
          return;
        }

        currentUser = res.data.user;
        if (res.data.token && window.TravelBrainAPI) {
          window.TravelBrainAPI.setAuthToken(res.data.token);
        }
        if (window.TravelBrainAPI) window.TravelBrainAPI.setCurrentUser(currentUser);

        updateAuthUI();
        closeAuthModal();
        if (signupForm) signupForm.reset();

        var resumed = resumePendingPlanIfAny();
        if (!resumed) {
          toast("Account created! Welcome, " + (currentUser.name || "") + "!");
          loadHistory();
        }
      })
      .catch(function (err) {
        showAuthError("Connection error: " + err.message);
      })
      .then(function () {
        if (signupSubmitBtn) {
          signupSubmitBtn.disabled = false;
          signupSubmitBtn.classList.remove("is-busy");
        }
      });
  }

  function handleLogout() {
    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/auth/logout", { method: "POST" })
      .then(function () {
        currentUser = null;
        if (window.TravelBrainAPI) window.TravelBrainAPI.clearAuth();
        activeTripId = null;
        historyItems = [];
        updateAuthUI();
        renderHistory();
        toast("Logged out successfully.");
      })
      .catch(function () {
        currentUser = null;
        if (window.TravelBrainAPI) window.TravelBrainAPI.clearAuth();
        updateAuthUI();
        renderHistory();
      });
  }

  /* ---------------- Travel History Controllers ---------------- */

  function loadHistory() {
    if (!currentUser) {
      historyItems = [];
      renderHistory();
      return;
    }

    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/history")
      .then(function (r) {
        return r.ok ? r.json() : { success: false, trips: [] };
      })
      .then(function (data) {
        if (data.success && Array.isArray(data.trips)) {
          historyItems = data.trips;
        } else {
          historyItems = [];
        }
        renderHistory();
      })
      .catch(function () {
        historyItems = [];
        renderHistory();
      });
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";

    if (historyCount) {
      historyCount.textContent = historyItems.length + " / 10";
    }

    // Guest state
    if (!currentUser) {
      var guestBox = el("div", "history-empty");
      guestBox.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><p>Sign in to save trips</p><small>Your generated itineraries will be saved automatically.</small>';
      var signBtn = el("button", "btn btn-soft btn-sm", "Sign In / Register");
      signBtn.style.marginTop = "14px";
      signBtn.addEventListener("click", function () { openAuthModal("login"); });
      guestBox.appendChild(signBtn);
      historyList.appendChild(guestBox);
      return;
    }

    // Authenticated but empty history
    if (historyItems.length === 0) {
      var emptyBox = el("div", "history-empty");
      emptyBox.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><p>No recent trips yet</p><small>Search a route above to generate and save your plan!</small>';
      historyList.appendChild(emptyBox);
      return;
    }

    // Render list
    historyItems.forEach(function (trip) {
      var item = el("div", "history-item" + (trip.id === activeTripId ? " active" : ""));
      item.setAttribute("data-trip-id", trip.id);

      var tripIcon = el("span", "history-item-icon");
      tripIcon.appendChild(icon("M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"));
      item.appendChild(tripIcon);

      var info = el("div", "history-item-info");
      var title = el("div", "history-item-title", trip.title || "Travel Plan");
      info.appendChild(title);

      var meta = el("div", "history-item-meta");
      if (trip.destination) {
        meta.appendChild(el("span", "history-dest-pill", trip.destination));
        meta.appendChild(el("span", null, "·"));
      }
      meta.appendChild(el("span", null, formatRelativeTime(trip.created_at)));
      info.appendChild(meta);
      item.appendChild(info);

      // Delete Button
      var delBtn = el("button", "history-item-del");
      delBtn.type = "button";
      delBtn.title = "Delete this trip";
      delBtn.appendChild(icon("M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"));
      delBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        deleteTrip(trip.id);
      });
      item.appendChild(delBtn);

      // Click to open saved trip
      item.addEventListener("click", function () {
        openTrip(trip.id);
      });

      historyList.appendChild(item);
    });
  }

  function openTrip(tripId) {
    if (!tripId) return;
    activeTripId = tripId;
    window.location.href = "/trip-plan?id=" + encodeURIComponent(tripId);
  }

  function deleteTrip(tripId) {
    if (!tripId) return;

    var apiClient = window.TravelBrainAPI || { fetch: window.fetch.bind(window) };
    apiClient.fetch("/api/history/" + tripId, { method: "DELETE" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success) {
          historyItems = historyItems.filter(function (t) { return t.id !== tripId; });
          if (activeTripId === tripId) {
            activeTripId = null;
          }
          renderHistory();
          toast("Trip removed from history.");
        } else {
          toast(data.error || "Failed to delete trip.");
        }
      })
      .catch(function () {
        toast("Error deleting trip.");
      });
  }

  /* ---------------- Message & Plan Rendering ---------------- */

  function renderUser(text) {
    var wrap = el("div", "msg msg-user");
    wrap.appendChild(el("div", "bubble-user", text));
    messages.appendChild(wrap);
    if (window.AnimatedContent) window.AnimatedContent(wrap, { distance: 20, duration: 0.45, ease: "power3.out", trigger: "mount" });
    return wrap;
  }

  function mdBlock(source, emptyText) {
    var box = el("div", "md");
    var text = toText(source).trim();

    if (!text) {
      box.appendChild(el("p", null, emptyText || "No data returned for this section."));
      return box;
    }

    if (window.MD && typeof window.MD.render === "function") {
      box.innerHTML = window.MD.render(text);
    } else {
      box.textContent = text;
    }
    return box;
  }

  function renderPipeline() {
    var wrap = el("div", "pipeline-card");

    var head = el("div", "pipeline-header");
    var agentName = el("div", "pipeline-agent-name");
    agentName.appendChild(icon("M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.8.8 0 0 0-.8 1.3L8 11l-2 2-2.2-.5a.6.6 0 0 0-.6 1L5 16l2.5 1.8a.6.6 0 0 0 1-.6L8 15l2-2 3.5 4a.8.8 0 0 0 1.3-.8Z"));
    agentName.appendChild(el("span", null, "Multi-Agent Coordination in Progress…"));
    head.appendChild(agentName);

    var timer = el("span", "pipeline-timer", "0s");
    head.appendChild(timer);
    wrap.appendChild(head);

    var track = el("div", "pipeline-track");
    var fill = el("div", "pipeline-fill");
    track.appendChild(fill);
    wrap.appendChild(track);

    var stageLabel = el("div", "pipeline-stage-label");
    var spinner = el("span", "spinner", "");
    spinner.style.display = "inline-block";
    stageLabel.appendChild(spinner);
    var labelText = el("span", null, PHASES[0].label);
    stageLabel.appendChild(labelText);
    wrap.appendChild(stageLabel);

    messages.appendChild(wrap);
    if (window.AnimatedContent) window.AnimatedContent(wrap, { distance: 25, duration: 0.5, ease: "power3.out", trigger: "mount" });

    var started = Date.now();
    var currentPhase = 0;

    var interval = setInterval(function () {
      var elapsed = Date.now() - started;
      var ratio = Math.min(elapsed / ESTIMATED_MS, 0.96);

      fill.style.width = (ratio * 100).toFixed(1) + "%";
      timer.textContent = Math.floor(elapsed / 1000) + "s";

      var acc = 0;
      var idx = PHASES.length - 1;
      for (var i = 0; i < PHASES.length; i++) {
        acc += PHASES[i].weight;
        if (ratio < acc) { idx = i; break; }
      }

      if (idx !== currentPhase) {
        currentPhase = idx;
        labelText.textContent = PHASES[idx].label;
      }
    }, 250);

    return {
      node: wrap,
      finish: function () {
        clearInterval(interval);
        fill.style.width = "100%";
      }
    };
  }

  function renderResult(result) {
    var card = el("article", "card");

    // Head
    var head = el("div", "card-head");
    var avatar = el("div", "card-avatar");
    avatar.appendChild(icon("M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.8.8 0 0 0-.8 1.3L8 11l-2 2-2.2-.5a.6.6 0 0 0-.6 1L5 16l2.5 1.8a.6.6 0 0 0 1-.6L8 15l2-2 3.5 4a.8.8 0 0 0 1.3-.8Z"));
    head.appendChild(avatar);

    var titleBox = el("div", "card-title");
    titleBox.appendChild(el("strong", null, "TravelBrain AI Itinerary"));
    titleBox.appendChild(el("small", null, "✓ Verified in Indian Rupees (₹)"));
    head.appendChild(titleBox);

    var tools = el("div", "card-tools");

    // Copy Button
    var copyBtn = el("button", "icon-btn");
    copyBtn.title = "Copy Itinerary to Clipboard";
    copyBtn.appendChild(icon("M8 4h10a2 2 0 0 1 2 2v10M16 8H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"));
    copyBtn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(toText(result.answer)).then(
          function () { toast("Itinerary copied to clipboard!"); },
          function () { toast("Could not copy."); }
        );
      }
    });
    tools.appendChild(copyBtn);

    // Download Markdown Button
    var dlBtn = el("button", "icon-btn");
    dlBtn.title = "Download as Markdown (.md)";
    dlBtn.appendChild(icon("M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"));
    dlBtn.addEventListener("click", function () {
      var blob = new Blob([toText(result.answer)], { type: "text/markdown;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "TravelBrain-Itinerary.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
    tools.appendChild(dlBtn);

    // Print Button
    var printBtn = el("button", "icon-btn");
    printBtn.title = "Print Plan";
    printBtn.appendChild(icon("M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 14h12v7H6z"));
    printBtn.addEventListener("click", function () { window.print(); });
    tools.appendChild(printBtn);

    // Critic Agent Audit CTA
    var auditHolder = el("div", "critic-audit-wrap");
    auditHolder.hidden = true;

    var auditBtn = el("button", "btn btn-soft btn-sm");
    auditBtn.title = "Audit this plan for hallucinations & geographic factuality";
    auditBtn.appendChild(icon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"));
    var auditLabel = el("span", "btn-label", "Audit with Critic");
    auditBtn.appendChild(auditLabel);

    auditBtn.addEventListener("click", function () {
      if (auditBtn.disabled) return;
      auditBtn.disabled = true;
      auditLabel.textContent = "Auditing landmarks…";
      var spin = el("span", "spinner", "");
      spin.style.display = "inline-block";
      auditBtn.appendChild(spin);

      fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: result.__query || "",
          plan_text: result.answer || "",
          destination: "",
          flight_results: result.flight_results || "",
          hotel_results: result.hotel_results || "",
          weather_results: result.weather_results || "",
          itinerary: result.itinerary || "",
          attractions_data: result.attractions_data || ""
        })
      })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (data.success && data.evaluation) {
          auditHolder.hidden = false;
          renderCriticEvaluation(auditHolder, data.evaluation);
          auditBtn.remove();
          auditHolder.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          toast(data.error || "Critic audit failed.");
          auditBtn.disabled = false;
          auditLabel.textContent = "Audit with Critic";
          if (spin.parentNode) spin.remove();
        }
      })
      .catch(function (err) {
        toast("Critic audit error: " + err.message);
        auditBtn.disabled = false;
        auditLabel.textContent = "Audit with Critic";
        if (spin.parentNode) spin.remove();
      });
    });

    tools.appendChild(auditBtn);
    head.appendChild(tools);
    card.appendChild(head);

    // Body
    var body = el("div", "card-body");
    body.appendChild(mdBlock(result.answer, "The agent returned an empty itinerary."));
    card.appendChild(body);
    card.appendChild(auditHolder);

    var wrap = el("div", "msg");
    wrap.appendChild(card);
    messages.appendChild(wrap);
    if (window.AnimatedContent) window.AnimatedContent(wrap, { distance: 35, duration: 0.65, ease: "power3.out", trigger: "mount" });
    return wrap;
  }

  function renderCriticEvaluation(container, data) {
    container.innerHTML = "";
    var auditCard = el("div", "critic-card");

    var head = el("div", "critic-head");
    var titleBox = el("div", "critic-title-box");
    var shieldIco = el("span", "critic-shield-ico");
    shieldIco.appendChild(icon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"));
    titleBox.appendChild(shieldIco);

    var textWrap = el("div");
    textWrap.appendChild(el("strong", "critic-title", "Critic Agent Hallucination & Quality Audit"));
    textWrap.appendChild(el("p", "critic-subtitle", "Rigorous fact-checking of landmarks, physical locations & transit realism"));
    titleBox.appendChild(textWrap);
    head.appendChild(titleBox);

    var score = Number(data.overall_score) || 0;
    var scoreClass = score >= 85 ? "score-high" : score >= 70 ? "score-med" : "score-low";
    var badgeBox = el("div", "critic-score-box " + scoreClass);
    badgeBox.appendChild(el("span", "critic-score-num", score + "/100"));
    badgeBox.appendChild(el("span", "critic-score-verdict", data.verdict || (score >= 85 ? "High Faithfulness" : "Hallucination Risk")));
    head.appendChild(badgeBox);
    auditCard.appendChild(head);

    // Metrics Breakdown
    var breakdown = data.breakdown || {};
    var metricsGrid = el("div", "critic-metrics-grid");

    var metrics = [
      { label: "Entity Factuality", val: breakdown.entity_factuality || 0, max: 40 },
      { label: "Geographic Coherence", val: breakdown.geographic_coherence || 0, max: 30 },
      { label: "Transit Realism", val: breakdown.transit_realism || 0, max: 20 },
      { label: "Pacing & Practicality", val: breakdown.pacing_practicality || 0, max: 10 }
    ];

    metrics.forEach(function (m) {
      var item = el("div", "critic-metric-item");
      var topRow = el("div", "metric-top");
      topRow.appendChild(el("span", "metric-label", m.label));
      topRow.appendChild(el("span", "metric-val", m.val + " / " + m.max));
      item.appendChild(topRow);

      var track = el("div", "metric-bar-track");
      var fill = el("div", "metric-bar-fill");
      var pct = Math.min(100, Math.max(0, (m.val / m.max) * 100));
      fill.style.width = pct + "%";
      track.appendChild(fill);
      item.appendChild(track);

      metricsGrid.appendChild(item);
    });
    auditCard.appendChild(metricsGrid);

    // Verified Highlights
    if (data.verified_entities && data.verified_entities.length) {
      var verBox = el("div", "audit-detail-box");
      verBox.appendChild(el("strong", null, "Verified Physical Landmarks:"));
      var p = el("p", "verified-text", data.verified_entities.join(", "));
      verBox.appendChild(p);
      auditCard.appendChild(verBox);
    }

    container.appendChild(auditCard);
  }

  function renderError(message, kind) {
    var card = el("article", "card");
    var head = el("div", "card-head");
    var avatar = el("div", "card-avatar");
    avatar.appendChild(icon("M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"));
    head.appendChild(avatar);

    var titleBox = el("div", "card-title");
    titleBox.appendChild(el("strong", null, "Agent Planning Stopped"));
    titleBox.appendChild(el("small", null, kind === "setup" ? "Credentials Required" : "Error"));
    head.appendChild(titleBox);
    card.appendChild(head);

    var body = el("div", "card-body");
    body.appendChild(el("p", null, message));
    card.appendChild(body);

    var wrap = el("div", "msg");
    wrap.appendChild(card);
    messages.appendChild(wrap);
  }

  /* ---------------- Travel Planning Request ---------------- */

  function setBusy(state) {
    busy = state;
    if (sendBtn) sendBtn.classList.toggle("is-busy", state);
    if (btnPlanJourney) btnPlanJourney.classList.toggle("is-busy", state);
    updateEmptyState();
  }

  function send(text) {
    if (busy) return;

    var message = String(text == null ? (input ? input.value : "") : text).trim();
    if (!message) return;

    if (!isReady()) {
      toast("No live API credentials configured. Add your API keys first.");
      openSettings();
      return;
    }

    if (input) {
      input.value = "";
      input.style.height = "auto";
    }

    setBusy(true);

    if (planningSection) planningSection.hidden = false;
    document.body.classList.add("planning-active");
    renderUser(message);
    var pipeline = renderPipeline();

    // Scroll smoothly to planning deck
    planningSection.scrollIntoView({ behavior: "smooth", block: "start" });

    fetch("/api/travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message, thread_id: threadId })
    })
      .then(function (r) {
        return r.json().catch(function () {
          throw new Error("Server returned a non-JSON response (HTTP " + r.status + ")");
        }).then(function (data) {
          if (!r.ok || data.success === false) {
            var err = new Error(data.error || "Request failed with HTTP " + r.status);
            if (r.status === 428) err.__kind = "setup";
            throw err;
          }
          return data;
        });
      })
      .then(function (data) {
        pipeline.finish();
        if (pipeline.node.parentNode) pipeline.node.remove();

        data.__query = message;
        threadId = data.thread_id || threadId;
        if (data.history_id) {
          activeTripId = data.history_id;
        }

        try {
          renderResult(data);
        } catch (e) {
          console.error("renderResult failed", e);
          renderError(e.message || String(e), "render");
        }

        // Refresh recent travel history in sidebar
        if (currentUser) {
          loadHistory();
        }

        planningSection.scrollIntoView({ behavior: "smooth", block: "end" });
      })
      .catch(function (err) {
        pipeline.finish();
        if (pipeline.node.parentNode) pipeline.node.remove();
        renderError(err.message || String(err), err.__kind || "server");
        refreshConfig();
      })
      .then(function () {
        setBusy(false);
        if (input) input.focus();
      });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ---------------- Main 3-Field Search Execution ---------------- */

  function planJourney() {
    var from = fFrom ? fFrom.value.trim() : "";
    var to = fTo ? fTo.value.trim() : "";
    var days = fDays ? fDays.value.trim() : "";

    if (!to) {
      toast("Please enter a destination city (e.g. Manali, Goa, Paris).");
      if (fTo) fTo.focus();
      return;
    }

    // Default days if missing
    var parsedDays = parseInt(days, 10);
    if (!parsedDays || isNaN(parsedDays)) {
      parsedDays = 5;
    }

    // Navigate directly to dedicated itinerary route
    var targetUrl = "/trip-plan?to=" + encodeURIComponent(to) +
                    (from ? "&from=" + encodeURIComponent(from) : "") +
                    "&days=" + encodeURIComponent(parsedDays);
    window.location.href = targetUrl;
  }

  if (btnPlanJourney) {
    btnPlanJourney.addEventListener("click", planJourney);
  }

  // Allow pressing Enter in search inputs
  [fFrom, fTo, fDays].forEach(function (inp) {
    if (inp) {
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          planJourney();
        }
      });
    }
  });

  // Quick route discovery pills
  document.querySelectorAll(".quick-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      var pFrom = pill.getAttribute("data-from") || "Delhi";
      var pTo   = pill.getAttribute("data-to") || "Goa";
      var pDays = pill.getAttribute("data-days") || "5";

      if (fFrom) fFrom.value = pFrom;
      if (fTo) fTo.value = pTo;
      if (fDays) fDays.value = pDays;

      planJourney();
    });
  });

  // Destination cards
  document.querySelectorAll(".destination-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var dFrom = card.getAttribute("data-from") || "Delhi";
      var dTo   = card.getAttribute("data-to") || "";
      var dDays = card.getAttribute("data-days") || "5";

      if (fFrom) fFrom.value = dFrom;
      if (fTo) fTo.value = dTo;
      if (fDays) fDays.value = dDays;

      planJourney();
    });
  });

  // Reset / New Trip function
  function startNewTrip() {
    if (busy) { toast("Please wait for the active plan to finish."); return; }
    threadId = null;
    activeTripId = null;
    document.querySelectorAll(".history-item").forEach(function (n) { n.classList.remove("active"); });
    if (messages) messages.innerHTML = "";
    if (planningSection) planningSection.hidden = true;
    document.body.classList.remove("planning-active");
    if (hero) hero.scrollIntoView({ behavior: "smooth" });
    if (fTo) fTo.focus();
    if (window.innerWidth < 992) toggleSidebar(false);
  }

  if (newTripBtn) {
    newTripBtn.addEventListener("click", startNewTrip);
  }
  if (sidebarNewTripBtn) {
    sidebarNewTripBtn.addEventListener("click", startNewTrip);
  }

  // Sidebar Toggle Listeners
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () { toggleSidebar(); });
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", function () { toggleSidebar(false); });
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", function () { toggleSidebar(false); });
  }

  // Auth Button Listeners
  if (navAuthBtn) {
    navAuthBtn.addEventListener("click", function () {
      if (currentUser) {
        // Toggle sidebar or prompt logout
        toggleSidebar(true);
      } else {
        openAuthModal("login");
      }
    });
  }
  if (mAuth) {
    mAuth.addEventListener("click", function () {
      if (mobileDrawer) mobileDrawer.hidden = true;
      if (currentUser) {
        handleLogout();
      } else {
        openAuthModal("login");
      }
    });
  }
  if (sidebarAuthActionBtn) {
    sidebarAuthActionBtn.addEventListener("click", function () {
      if (currentUser) {
        handleLogout();
      } else {
        openAuthModal("login");
      }
    });
  }

  // Auth Modal Controls
  if (authClose) authClose.addEventListener("click", closeAuthModal);
  if (authScrim) authScrim.addEventListener("click", closeAuthModal);
  if (tabLogin) tabLogin.addEventListener("click", function () { switchAuthTab("login"); });
  if (tabSignup) tabSignup.addEventListener("click", function () { switchAuthTab("signup"); });
  if (switchToSignup) switchToSignup.addEventListener("click", function () { switchAuthTab("signup"); });
  if (switchToLogin) switchToLogin.addEventListener("click", function () { switchAuthTab("login"); });

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signupForm) signupForm.addEventListener("submit", handleSignup);

  // Password Visibility Toggle Buttons
  document.querySelectorAll(".pw-toggle-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var wrap = btn.closest(".password-input-wrap");
      if (!wrap) return;
      var pwInput = wrap.querySelector("input");
      if (pwInput) {
        pwInput.type = pwInput.type === "password" ? "text" : "password";
      }
    });
  });

  // Global ESC key listener for modals
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (authModal && !authModal.hidden) closeAuthModal();
      if (document.body.classList.contains("sidebar-open")) toggleSidebar(false);
    }
  });

  // Collapse / Back to Search Button
  if (collapsePlanBtn) {
    collapsePlanBtn.addEventListener("click", function () {
      document.body.classList.remove("planning-active");
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Quick refinement chips in planning section
  document.querySelectorAll(".qr-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var prompt = chip.getAttribute("data-prompt") || chip.textContent.trim();
      if (input) {
        input.value = prompt;
        input.focus();
      }
    });
  });

  // Composer textarea autosize & submit
  if (input) {
    input.addEventListener("input", function () {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 180) + "px";
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }

  if (composer) {
    composer.addEventListener("submit", function (e) {
      e.preventDefault();
      send();
    });
  }

  // Mobile drawer toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", function () {
      mobileDrawer.hidden = !mobileDrawer.hidden;
    });

    document.querySelectorAll(".m-link").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileDrawer.hidden = true;
      });
    });
  }

  // Navigation Links
  var navNewTrip = $("navNewTrip");
  var navSettings = $("navSettings");
  var mNewTrip = $("mNewTrip");
  var mSettings = $("mSettings");
  var finalCta = $("finalCta");

  if (finalCta) {
    finalCta.addEventListener("click", function (e) {
      e.preventDefault();
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
      if (fTo) {
        setTimeout(function () { fTo.focus(); }, 300);
      }
    });
  }

  if (navNewTrip) {
    navNewTrip.addEventListener("click", function () {
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
      if (fTo) fTo.focus();
    });
  }
  if (mNewTrip) {
    mNewTrip.addEventListener("click", function () {
      if (mobileDrawer) mobileDrawer.hidden = true;
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
      if (fTo) fTo.focus();
    });
  }
  if (navSettings) {
    navSettings.addEventListener("click", openSettings);
  }
  if (mSettings) {
    mSettings.addEventListener("click", function () {
      if (mobileDrawer) mobileDrawer.hidden = true;
      openSettings();
    });
  }

  // Close mobile drawer on any link click
  var mLinks = document.querySelectorAll(".mobile-drawer .m-link");
  mLinks.forEach(function (mlink) {
    mlink.addEventListener("click", function () {
      if (mobileDrawer) mobileDrawer.hidden = true;
    });
  });

  
  /* ---------------- Initialization ---------------- */

  
  initTheme();
  updateEmptyState();
  checkAuth();

  // Initialize 3D Aviation Engine
  if (window.Aviation3D) {
    window.Aviation3D.init("heroCanvasContainer");
  }

  refreshConfig();
  setInterval(refreshConfig, 60000);

  // Handle direct navigation to /how-it-works or /features
  var path = window.location.pathname;
  if (path === "/how-it-works") {
    setTimeout(function () {
      var el = $("how-it-works");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 350);
  } else if (path === "/features") {
    setTimeout(function () {
      var el = $("features");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 350);
  }

})();
