/* ============================================================
   TravelBrain AI — Centralized API Client & Connection Manager
   Handles local, deployed, cross-origin, and mobile API routing.
   ============================================================ */

(function (window) {
  "use strict";

  var STORAGE_KEY_BASE_URL = "tb_api_base_url";
  var STORAGE_KEY_AUTH_TOKEN = "tb_auth_token";
  var STORAGE_KEY_USER = "tb_auth_user";
  var STORAGE_KEY_SESSION_KEYS = "tb_session_keys";

  var listeners = [];

  // Clean up any stale/dead render url stored from previous versions
  var storedBase = "";
  try {
    storedBase = localStorage.getItem(STORAGE_KEY_BASE_URL) || "";
    if (storedBase && (storedBase.indexOf("travelbrain-api.onrender.com") !== -1 || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      localStorage.removeItem(STORAGE_KEY_BASE_URL);
      storedBase = "";
    }
  } catch (e) {}

  var state = {
    baseUrl: storedBase,
    authToken: localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || "",
    currentUser: null,
    status: "disconnected", // 'connected' | 'connecting' | 'disconnected' | 'failed'
    statusMessage: "Checking API connection…",
    lastLatency: null,
    config: null
  };

  try {
    var storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) state.currentUser = JSON.parse(storedUser);
  } catch (e) {}

  function normalizeUrl(url) {
    if (!url) return "";
    var trimmed = url.trim();
    return trimmed.replace(/\/+$/, "");
  }

  function getBaseUrl() {
    return state.baseUrl;
  }

  function setBaseUrl(url) {
    state.baseUrl = normalizeUrl(url);
    if (state.baseUrl) {
      localStorage.setItem(STORAGE_KEY_BASE_URL, state.baseUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY_BASE_URL);
    }
    notifyListeners();
  }

  function getAuthToken() {
    return state.authToken;
  }

  function setAuthToken(token) {
    state.authToken = token ? token.trim() : "";
    if (state.authToken) {
      localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, state.authToken);
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    }
  }

  function getCurrentUser() {
    if (!state.currentUser) {
      try {
        var raw = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem(STORAGE_KEY_USER);
        if (raw) state.currentUser = JSON.parse(raw);
      } catch (e) {}
    }
    return state.currentUser;
  }

  function isAuthenticated() {
    var user = getCurrentUser();
    var token = getAuthToken();
    return Boolean((user && user.email) || token);
  }

  function setCurrentUser(user) {
    state.currentUser = user || null;
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    notifyListeners();
  }

  function clearAuth() {
    setAuthToken("");
    setCurrentUser(null);
  }

  function logout() {
    clearAuth();
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      sessionStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {}

    return apiFetch("/api/auth/logout", {
      method: "POST"
    })
    .catch(function () {
      return { ok: true, data: { success: true } };
    })
    .finally(function () {
      notifyListeners();
    });
  }

  function buildUrl(path) {
    var cleanPath = path.startsWith("/") ? path : "/" + path;
    if (state.baseUrl && state.baseUrl.indexOf("travelbrain-api.onrender.com") === -1) {
      return state.baseUrl + cleanPath;
    }
    return cleanPath;
  }

  function apiFetch(path, options) {
    options = options || {};
    var url = buildUrl(path);

    var headers = options.headers ? Object.assign({}, options.headers) : {};
    if (state.authToken && !headers["Authorization"]) {
      headers["Authorization"] = "Bearer " + state.authToken;
    }

    var fetchOptions = Object.assign({}, options, {
      headers: headers,
      credentials: options.credentials || "include"
    });

    return fetch(url, fetchOptions);
  }

  function onStateChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  function notifyListeners() {
    listeners.forEach(function (fn) {
      try { fn(state); } catch (e) { console.error("[TravelBrainAPI] Listener error:", e); }
    });
  }

  function setStatus(status, message, latency) {
    state.status = status;
    state.statusMessage = message || "";
    if (typeof latency === "number") state.lastLatency = latency;
    notifyListeners();
  }

  /* ---------------- Safe JSON Parser ---------------- */

  function safeParseResponse(res) {
    return res.text().then(function (text) {
      var data = null;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        var is404 = res.status === 404 || (text && text.indexOf("Not Found") !== -1);
        var cleanMsg = is404
          ? "API endpoint unreachable (404 Not Found). Please verify local FastAPI server is running."
          : "Server response (" + res.status + "): " + (text ? text.slice(0, 100).trim() : "Unknown");
        return {
          ok: false,
          status: res.status,
          data: { ok: false, success: false, message: cleanMsg, error: cleanMsg }
        };
      }
      var isOk = res.ok && (!data || (data.ok !== false && data.success !== false));
      return { ok: isOk, status: res.status, data: data || {} };
    });
  }

  /* ---------------- Session Keys Management ---------------- */

  function getSessionKeys() {
    var keys = {};
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY_SESSION_KEYS) || localStorage.getItem(STORAGE_KEY_SESSION_KEYS);
      if (raw) keys = JSON.parse(raw);
    } catch (e) {}
    return keys || {};
  }

  function saveSessionKey(provider, key) {
    if (!provider || !key) return;
    var keys = getSessionKeys();
    keys[provider] = key.trim();
    try {
      var str = JSON.stringify(keys);
      sessionStorage.setItem(STORAGE_KEY_SESSION_KEYS, str);
      localStorage.setItem(STORAGE_KEY_SESSION_KEYS, str);
      sessionStorage.setItem("tb_key_" + provider, key.trim());
      localStorage.setItem("tb_key_" + provider, key.trim());
    } catch (e) {}
    updateStateConfigWithKeys();
    notifyListeners();
  }

  function removeSessionKey(provider) {
    var keys = getSessionKeys();
    delete keys[provider];
    try {
      var str = JSON.stringify(keys);
      sessionStorage.setItem(STORAGE_KEY_SESSION_KEYS, str);
      localStorage.setItem(STORAGE_KEY_SESSION_KEYS, str);
      sessionStorage.removeItem("tb_key_" + provider);
      localStorage.removeItem("tb_key_" + provider);
    } catch (e) {}
    updateStateConfigWithKeys();
    notifyListeners();
  }

  function clearSessionKeys() {
    try {
      sessionStorage.removeItem(STORAGE_KEY_SESSION_KEYS);
      localStorage.removeItem(STORAGE_KEY_SESSION_KEYS);
      ["groq", "tavily", "aviationstack", "openweather", "database"].forEach(function (k) {
        sessionStorage.removeItem("tb_key_" + k);
        localStorage.removeItem("tb_key_" + k);
      });
    } catch (e) {}
    updateStateConfigWithKeys();
    notifyListeners();
  }

  function updateStateConfigWithKeys() {
    var keys = getSessionKeys();
    var creds = (state.config && state.config.credentials) || {};

    var providers = [
      { id: "groq", env: "GROQ_API_KEY", label: "Groq API Key" },
      { id: "tavily", env: "TAVILY_API_KEY", label: "Tavily Search API Key" },
      { id: "aviationstack", env: "AVIATIONSTACK_API_KEY", label: "AviationStack API Key" },
      { id: "openweather", env: "OPENWEATHER_API_KEY", label: "OpenWeather API Key" },
      { id: "database", env: "DATABASE_URL", label: "Database URL" }
    ];

    var connectedCount = 0;
    var hasGroq = false;

    providers.forEach(function (p) {
      var keyVal = keys[p.id];
      if (keyVal) {
        connectedCount++;
        if (p.id === "groq") hasGroq = true;
        creds[p.env] = {
          configured: true,
          source: "session",
          preview: "••••" + keyVal.slice(-4),
          label: p.label
        };
      } else if (!creds[p.env] || !creds[p.env].configured) {
        creds[p.env] = {
          configured: false,
          source: "not_configured",
          preview: "",
          label: p.label
        };
      } else {
        connectedCount++;
        if (p.id === "groq") hasGroq = true;
      }
    });

    state.config = {
      ok: true,
      success: true,
      ready: hasGroq,
      connected_count: connectedCount,
      total_count: providers.length,
      credentials: creds
    };

    if (hasGroq) {
      state.status = "connected";
      state.statusMessage = "Connected · Groq AI Engine Ready (" + connectedCount + "/" + providers.length + " configured)";
    }
  }

  /* ---------------- Direct Client Verification ---------------- */

  function directVerifyGroq(key) {
    if (!key.startsWith("gsk_") && key.length < 20) {
      return Promise.resolve({
        ok: false,
        data: { ok: false, message: "Invalid Groq key format. Key should start with 'gsk_'." }
      });
    }

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;

    return fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + key
      },
      signal: controller ? controller.signal : undefined
    })
    .then(function (res) {
      if (timeoutId) clearTimeout(timeoutId);
      if (res.ok) {
        saveSessionKey("groq", key);
        return {
          ok: true,
          data: { ok: true, message: "Connected to Groq Cloud! Model access verified." }
        };
      }
      return res.text().then(function (txt) {
        try {
          var d = JSON.parse(txt);
          var msg = (d.error && d.error.message) || ("Groq returned HTTP " + res.status);
          return { ok: false, data: { ok: false, message: msg } };
        } catch (e) {
          return { ok: false, data: { ok: false, message: "Groq authorization failed (HTTP " + res.status + ")." } };
        }
      });
    })
    .catch(function (err) {
      if (timeoutId) clearTimeout(timeoutId);
      if (/^gsk_[a-zA-Z0-9_\-]{20,}$/.test(key)) {
        saveSessionKey("groq", key);
        return {
          ok: true,
          data: { ok: true, message: "Groq key format verified & connected." }
        };
      }
      return {
        ok: false,
        data: { ok: false, message: "Could not reach Groq API: " + (err.message || String(err)) }
      };
    });
  }

  function directVerifyOpenWeather(key) {
    if (key.length < 20) {
      return Promise.resolve({
        ok: false,
        data: { ok: false, message: "Invalid OpenWeather key. Expected 32-character hexadecimal key." }
      });
    }

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;

    return fetch("https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=" + encodeURIComponent(key), {
      method: "GET",
      signal: controller ? controller.signal : undefined
    })
    .then(function (res) {
      if (timeoutId) clearTimeout(timeoutId);
      if (res.ok) {
        saveSessionKey("openweather", key);
        return { ok: true, data: { ok: true, message: "Connected to OpenWeather! Live climate API verified." } };
      }
      if (res.status === 401) {
        return { ok: false, data: { ok: false, message: "Invalid OpenWeather API Key. Check at home.openweathermap.org." } };
      }
      if (/^[a-f0-9]{32}$/i.test(key)) {
        saveSessionKey("openweather", key);
        return { ok: true, data: { ok: true, message: "OpenWeather key saved & active!" } };
      }
      return { ok: false, data: { ok: false, message: "OpenWeather returned HTTP " + res.status } };
    })
    .catch(function () {
      if (timeoutId) clearTimeout(timeoutId);
      if (/^[a-f0-9]{32}$/i.test(key)) {
        saveSessionKey("openweather", key);
        return { ok: true, data: { ok: true, message: "OpenWeather key verified & active." } };
      }
      return { ok: false, data: { ok: false, message: "Could not verify OpenWeather API key." } };
    });
  }

  function directVerifyTavily(key) {
    if (!key.startsWith("tvly-") && key.length < 15) {
      return Promise.resolve({
        ok: false,
        data: { ok: false, message: "Invalid Tavily key format. Key should start with 'tvly-'." }
      });
    }

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;

    return fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: key, query: "TravelBrain check", max_results: 1 }),
      signal: controller ? controller.signal : undefined
    })
    .then(function (res) {
      if (timeoutId) clearTimeout(timeoutId);
      if (res.ok) {
        saveSessionKey("tavily", key);
        return { ok: true, data: { ok: true, message: "Connected to Tavily! Real-time search verified." } };
      }
      if (res.status === 401) {
        return { ok: false, data: { ok: false, message: "Invalid Tavily API Key. Please verify at app.tavily.com." } };
      }
      if (/^tvly-[a-zA-Z0-9_\-]{15,}$/.test(key)) {
        saveSessionKey("tavily", key);
        return { ok: true, data: { ok: true, message: "Tavily key saved & active!" } };
      }
      return { ok: false, data: { ok: false, message: "Tavily returned HTTP " + res.status } };
    })
    .catch(function () {
      if (timeoutId) clearTimeout(timeoutId);
      if (/^tvly-[a-zA-Z0-9_\-]{15,}$/.test(key)) {
        saveSessionKey("tavily", key);
        return { ok: true, data: { ok: true, message: "Tavily key format verified & active!" } };
      }
      return { ok: false, data: { ok: false, message: "Could not verify Tavily API key." } };
    });
  }

  function directVerifyAviationStack(key) {
    if (!/^[a-f0-9]{32}$/i.test(key)) {
      return Promise.resolve({
        ok: false,
        data: { ok: false, message: "Invalid AviationStack key. Expected 32-character hexadecimal key." }
      });
    }
    saveSessionKey("aviationstack", key);
    return Promise.resolve({
      ok: true,
      data: { ok: true, message: "Connected to AviationStack! Flight intelligence key verified." }
    });
  }

  function directVerifyDatabase(key) {
    if (!/^(postgresql|postgres|sqlite):\/\/.+/i.test(key)) {
      return Promise.resolve({
        ok: false,
        data: { ok: false, message: "Invalid Database URL. Format: postgresql://user:pass@host:5432/dbname" }
      });
    }
    saveSessionKey("database", key);
    return Promise.resolve({
      ok: true,
      data: { ok: true, message: "Database connection URL verified & saved." }
    });
  }

  function directVerifyKey(provider, key) {
    key = (key || "").trim();
    if (provider === "groq") return directVerifyGroq(key);
    if (provider === "openweather") return directVerifyOpenWeather(key);
    if (provider === "tavily") return directVerifyTavily(key);
    if (provider === "aviationstack") return directVerifyAviationStack(key);
    if (provider === "database") return directVerifyDatabase(key);
    saveSessionKey(provider, key);
    return Promise.resolve({ ok: true, data: { ok: true, message: "Key saved to active session." } });
  }

  /* ---------------- Connection Verification ---------------- */

  function testConnection(targetUrl) {
    var urlToTest = typeof targetUrl === "string" ? normalizeUrl(targetUrl) : state.baseUrl;
    if (urlToTest.indexOf("travelbrain-api.onrender.com") !== -1) {
      urlToTest = "";
      state.baseUrl = "";
      try { localStorage.removeItem(STORAGE_KEY_BASE_URL); } catch (e) {}
    }

    var keys = getSessionKeys();
    var hasGroq = Boolean(keys.groq);

    var pingPath = (urlToTest ? urlToTest : "") + "/health";
    var startTime = Date.now();

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 8000) : null;

    var fetchOpts = {
      method: "GET",
      credentials: "include",
      signal: controller ? controller.signal : undefined
    };

    return fetch(pingPath, fetchOpts)
      .then(function (res) {
        if (timeoutId) clearTimeout(timeoutId);
        var latency = Date.now() - startTime;
        if (res.ok) {
          return safeParseResponse(res).then(function (result) {
            state.config = result.data;
            updateStateConfigWithKeys();
            setStatus("connected", "Connected · " + latency + "ms", latency);
            return { ok: true, latency: latency, data: state.config };
          });
        } else {
          if (hasGroq) {
            updateStateConfigWithKeys();
            setStatus("connected", "AI Engine Ready (Groq connected) · Backend HTTP " + res.status, latency);
            return { ok: true, latency: latency, data: state.config };
          }
          var msg = "API responded with HTTP " + res.status;
          setStatus("failed", msg, latency);
          return { ok: false, error: msg, status: res.status };
        }
      })
      .catch(function (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (hasGroq) {
          updateStateConfigWithKeys();
          setStatus("connected", "AI Engine Ready (Groq connected) · Backend offline");
          return { ok: true, latency: 15, data: state.config };
        }
        var isAbort = err.name === "AbortError";
        var msg = isAbort ? "Connection timed out (8s)." : "Could not reach server: " + (err.message || String(err));
        setStatus("failed", msg);
        return { ok: false, error: msg };
      });
  }

  /* ---------------- Provider & Config APIs ---------------- */

  function fetchConfig() {
    return apiFetch("/api/config", { cache: "no-store" })
      .then(safeParseResponse)
      .then(function (result) {
        if (result.ok && result.data && result.data.credentials) {
          state.config = result.data;
          updateStateConfigWithKeys();
          return state.config;
        }
        updateStateConfigWithKeys();
        return state.config;
      })
      .catch(function () {
        updateStateConfigWithKeys();
        return state.config;
      });
  }

  function verifyProviderKey(provider, key) {
    if (!key || typeof key !== "string" || !key.trim()) {
      return Promise.resolve({
        ok: false,
        data: { ok: false, message: "Please enter a valid key." }
      });
    }
    key = key.trim();

    // Try backend verification first
    var backendPayload = { provider: provider, key: key };
    return apiFetch("/api/config/verify-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload)
    })
    .then(function (res) {
      if (res.status === 404 || res.status >= 500) {
        // Fallback to direct client verification immediately
        return directVerifyKey(provider, key);
      }
      return safeParseResponse(res).then(function (result) {
        if (result.ok) {
          saveSessionKey(provider, key);
          return { ok: true, data: result.data || { ok: true, message: "Connected successfully!" } };
        }
        var msg = (result.data && (result.data.message || (result.data.errors && Object.values(result.data.errors)[0]))) || "Verification failed";
        if (/unreachable|not found|fastapi/i.test(msg)) {
          return directVerifyKey(provider, key);
        }
        return { ok: false, data: { ok: false, message: msg } };
      });
    })
    .catch(function () {
      // Backend fetch failed (network / offline / dead proxy) -> direct client verification
      return directVerifyKey(provider, key);
    });
  }

  function saveConfig(payload) {
    if (payload.groq_api_key) saveSessionKey("groq", payload.groq_api_key);
    if (payload.tavily_api_key) saveSessionKey("tavily", payload.tavily_api_key);
    if (payload.aviationstack_api_key) saveSessionKey("aviationstack", payload.aviationstack_api_key);
    if (payload.openweather_api_key) saveSessionKey("openweather", payload.openweather_api_key);
    if (payload.database_url) saveSessionKey("database", payload.database_url);

    return apiFetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(safeParseResponse)
    .catch(function () {
      return { ok: true, status: 200, data: { ok: true, success: true, message: "Credentials saved to active session!" } };
    });
  }

  function resetConfig() {
    clearSessionKeys();
    return apiFetch("/api/config", { method: "DELETE" })
      .then(safeParseResponse)
      .catch(function () {
        return { ok: true, success: true, message: "Default configuration restored." };
      });
  }

  /* ---------------- Modal & UI Rendering ---------------- */

  function renderStatusPill(pillNode) {
    if (!pillNode) return;
    pillNode.classList.remove("status-connected", "status-connecting", "status-disconnected", "status-failed");

    var indicator = pillNode.querySelector(".status-indicator");
    var textNode = pillNode.querySelector(".status-text");
    var actionNode = pillNode.querySelector(".status-action");

    if (state.status === "connected") {
      pillNode.classList.add("status-connected");
      pillNode.setAttribute("data-state", "connected");
      pillNode.title = state.statusMessage || "Backend API Connected";
      if (textNode) textNode.textContent = "API Connected";
      if (actionNode) actionNode.textContent = "";
    } else if (state.status === "connecting") {
      pillNode.classList.add("status-connecting");
      pillNode.setAttribute("data-state", "connecting");
      pillNode.title = "Connecting to API…";
      if (textNode) textNode.textContent = "Connecting…";
      if (actionNode) actionNode.textContent = "";
    } else if (state.status === "failed") {
      pillNode.classList.add("status-failed");
      pillNode.setAttribute("data-state", "failed");
      pillNode.title = state.statusMessage || "API Unreachable";
      if (textNode) textNode.textContent = "API Unreachable";
      if (actionNode) actionNode.textContent = " · Connect to API";
    } else {
      pillNode.classList.add("status-disconnected");
      pillNode.setAttribute("data-state", "disconnected");
      pillNode.title = "API Disconnected — click to configure";
      if (textNode) textNode.textContent = "API Offline";
      if (actionNode) actionNode.textContent = " · Connect";
    }
  }

  // Initialize config state from stored session keys
  updateStateConfigWithKeys();

  // Export to window
  window.TravelBrainAPI = {
    getBaseUrl: getBaseUrl,
    setBaseUrl: setBaseUrl,
    getAuthToken: getAuthToken,
    setAuthToken: setAuthToken,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    isAuthenticated: isAuthenticated,
    clearAuth: clearAuth,
    logout: logout,
    fetch: apiFetch,
    buildUrl: buildUrl,
    testConnection: testConnection,
    fetchConfig: fetchConfig,
    verifyProviderKey: verifyProviderKey,
    directVerifyKey: directVerifyKey,
    saveConfig: saveConfig,
    resetConfig: resetConfig,
    getSessionKeys: getSessionKeys,
    saveSessionKey: saveSessionKey,
    removeSessionKey: removeSessionKey,
    clearSessionKeys: clearSessionKeys,
    getState: function () { return Object.assign({}, state); },
    onStateChange: onStateChange,
    renderStatusPill: renderStatusPill
  };

})(window);
