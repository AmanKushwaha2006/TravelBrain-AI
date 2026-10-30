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

  /* ---------------- State ---------------- */

  var THEME_KEY = "travelbrain.theme";
  var threadId = null;   // Active LangGraph session thread
  var busy = false;
  var config = null;     // Last /api/config payload
  var savingConfig = false;

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

  function applyConfig(data) {
    config = data;
    var missing = (data && data.missing) || [];

    if (statusBtn && statusText) {
      if (data && data.ready) {
        statusBtn.setAttribute("data-state", "ok");
        statusText.textContent = "API connected";
        statusBtn.title = "All credentials verified — click to edit";
      } else {
        statusBtn.setAttribute("data-state", "setup");
        statusText.textContent = "No Live API";
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

    if (settingsModal && !settingsModal.hidden && credList) {
      renderCreds(credList);
    }

    updateEmptyState();
  }

  function markUnreachable() {
    config = null;
    if (statusBtn && statusText) {
      statusBtn.setAttribute("data-state", "down");
      statusText.textContent = "API unreachable";
      statusBtn.title = "Could not reach the server";
    }
    updateEmptyState();
  }

  function refreshConfig() {
    return fetch("/api/config", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)); })
      .then(applyConfig)
      .catch(markUnreachable);
  }

  function renderCreds(container) {
    container.innerHTML = "";

    if (!config || !config.credentials) {
      container.appendChild(el("p", "cred-hint", "Loading configuration…"));
      return;
    }

    Object.keys(config.credentials).forEach(function (name) {
      var info = config.credentials[name];
      var row = el("div", "cred");

      var head = el("div", "cred-head");
      head.appendChild(el("label", "cred-label", info.label));

      var badgeText = info.source === "env" ? "Server .env"
                    : info.source === "session" ? "Session Key"
                    : "Missing";
      head.appendChild(el("span", "badge badge-" + (info.source || "missing"), badgeText));
      row.appendChild(head);

      row.appendChild(el("p", "cred-hint", info.hint));

      var field = el("div", "cred-field");
      var box = el("input", "cred-input");
      box.type = "password";
      box.placeholder = info.configured ? "•••••••• (leave blank to keep)" : info.placeholder;
      box.autocomplete = "off";
      box.spellcheck = false;
      box.setAttribute("data-cred", name);
      field.appendChild(box);

      var reveal = el("button", "icon-btn");
      reveal.type = "button";
      reveal.title = "Show / hide password";
      reveal.appendChild(icon("M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"));
      reveal.addEventListener("click", function () {
        box.type = box.type === "password" ? "text" : "password";
      });
      field.appendChild(reveal);
      row.appendChild(field);

      var err = el("p", "cred-error");
      err.setAttribute("data-error-for", name);
      err.hidden = true;
      row.appendChild(err);

      container.appendChild(row);
    });
  }

  var FIELD_MAP = {
    GROQ_API_KEY: "groq_api_key",
    DATABASE_URL: "database_url"
  };

  function openSettings() {
    if (!settingsModal || !settingsScrim) return;
    settingsModal.hidden = false;
    settingsScrim.hidden = false;
    if (credList) renderCreds(credList);
    refreshConfig();
    var first = credList ? credList.querySelector(".cred-input") : null;
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

    container.querySelectorAll(".cred-input").forEach(function (box) {
      var val = box.value.trim();
      if (!val) return;
      hasValues = true;
      var prop = FIELD_MAP[box.getAttribute("data-cred")];
      if (prop) payload[prop] = val;
    });

    container.querySelectorAll(".cred-error").forEach(function (n) { n.hidden = true; });

    if (!hasValues) {
      toast("Please enter an API key first.");
      var emptyBox = container.querySelector(".cred-input");
      if (emptyBox) emptyBox.focus();
      return;
    }

    setSavingConfig(true, button);

    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().then(function (data) { return { ok: r.ok, data: data }; });
      })
      .then(function (res) {
        if (!res.ok || res.data.success === false) {
          var errors = res.data.errors || {};
          Object.keys(errors).forEach(function (f) {
            var node = container.querySelector('[data-error-for="' + f.toUpperCase() + '"]');
            if (node) {
              node.textContent = errors[f];
              node.hidden = false;
            }
          });
          toast("Check highlighted configuration error.");
          return;
        }

        applyConfig(res.data);
        closeSettings();
        toast(res.data.ready ? "Credentials connected successfully!" : "Saved — one credential still missing.");
      })
      .catch(function () {
        toast("Could not connect to server.");
      })
      .then(function () {
        setSavingConfig(false, button);
      });
  }

  function resetSettings() {
    if (savingConfig) return;
    setSavingConfig(true, settingsSave);

    fetch("/api/config", { method: "DELETE" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        applyConfig(data);
        if (credList) renderCreds(credList);
        toast("Session credentials cleared. Reverted to .env.");
      })
      .catch(function () { toast("Could not clear credentials."); })
      .then(function () { setSavingConfig(false, settingsSave); });
  }

  if (settingsBtn) settingsBtn.addEventListener("click", openSettings);
  if (statusBtn) statusBtn.addEventListener("click", openSettings);
  if (settingsClose) settingsClose.addEventListener("click", closeSettings);
  if (settingsScrim) settingsScrim.addEventListener("click", closeSettings);
  if (settingsSave) settingsSave.addEventListener("click", function () { saveCredentials(credList, settingsSave); });
  if (gateSave) gateSave.addEventListener("click", function () { saveCredentials(gateCreds, gateSave); });
  if (settingsReset) settingsReset.addEventListener("click", resetSettings);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && settingsModal && !settingsModal.hidden) closeSettings();
  });

  /* ---------------- Message & Plan Rendering ---------------- */

  function renderUser(text) {
    var wrap = el("div", "msg msg-user");
    wrap.appendChild(el("div", "bubble-user", text));
    messages.appendChild(wrap);
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

        try {
          renderResult(data);
        } catch (e) {
          console.error("renderResult failed", e);
          renderError(e.message || String(e), "render");
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

    var queryParts = ["Plan a " + parsedDays + " day trip to " + to];
    if (from) {
      queryParts.push("from " + from);
    }
    queryParts.push(". Find verified flights, hotel options with tariffs in Indian Rupees (₹), the weather forecast, and a realistic day-by-day itinerary with all costs in INR (₹).");

    var finalPrompt = queryParts.join(" ");
    send(finalPrompt);
  }

  if (btnPlanJourney) {
    btnPlanJourney.addEventListener("click", planJourney);
  }

  // Quick route discovery pills
  document.querySelectorAll(".quick-pill").forEach(function (pill) {
    pill.addEventListener("click", function () {
      var pFrom = pill.getAttribute("data-from") || "Delhi";
      var pTo   = pill.getAttribute("data-to") || "Goa";
      var pDays = pill.getAttribute("data-days") || "5";

      if (fFrom) fFrom.value = pFrom;
      if (fTo) fTo.value = pTo;
      if (fDays) fDays.value = pDays + " Days";

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
      if (fDays) fDays.value = dDays + " Days";

      planJourney();
    });
  });

  // Reset Trip
  if (newTripBtn) {
    newTripBtn.addEventListener("click", function () {
      if (busy) { toast("Please wait for the active plan to finish."); return; }
      threadId = null;
      if (messages) messages.innerHTML = "";
      if (planningSection) planningSection.hidden = true;
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
      if (fTo) fTo.focus();
    });
  }

  // Collapse / Back to Search Button
  if (collapsePlanBtn) {
    collapsePlanBtn.addEventListener("click", function () {
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

  /* ---------------- Initialization ---------------- */

  initTheme();
  updateEmptyState();

  // Initialize 3D Aviation Engine
  if (window.Aviation3D) {
    window.Aviation3D.init("heroCanvasContainer");
  }

  refreshConfig();
  setInterval(refreshConfig, 60000);

})();
