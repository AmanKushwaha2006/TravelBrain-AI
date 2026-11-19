/* ============================================================
   TravelBrain AI — Centralized API Client & Connection Manager
   Handles local, deployed, cross-origin, and mobile API routing.
   ============================================================ */

(function (window) {
  "use strict";

  var STORAGE_KEY_BASE_URL = "tb_api_base_url";
  var STORAGE_KEY_AUTH_TOKEN = "tb_auth_token";
  var STORAGE_KEY_USER = "tb_auth_user";

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
    return state.currentUser;
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

  /* ---------------- Connection Verification ---------------- */

  function testConnection(targetUrl) {
    var urlToTest = typeof targetUrl === "string" ? normalizeUrl(targetUrl) : state.baseUrl;
    if (urlToTest.indexOf("travelbrain-api.onrender.com") !== -1) {
      urlToTest = "";
      state.baseUrl = "";
      try { localStorage.removeItem(STORAGE_KEY_BASE_URL); } catch (e) {}
    }

    setStatus("connecting", "Connecting to " + (urlToTest || "current host") + "…");

    var pingPath = (urlToTest ? urlToTest : "") + "/health";
    var startTime = Date.now();

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 35000) : null;

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
            setStatus("connected", "Connected · " + latency + "ms", latency);
            return { ok: true, latency: latency, data: result.data };
          });
        } else {
          var msg = "API responded with HTTP " + res.status;
          setStatus("failed", msg, latency);
          return { ok: false, error: msg, status: res.status };
        }
      })
      .catch(function (err) {
        if (timeoutId) clearTimeout(timeoutId);
        var isAbort = err.name === "AbortError";
        var msg = isAbort ? "Connection timed out (35s). Server might be waking up from sleep." : "Could not reach server: " + (err.message || String(err));
        setStatus("failed", msg);
        return { ok: false, error: msg };
      });
  }

  /* ---------------- Provider & Config APIs ---------------- */

  function fetchConfig() {
    return apiFetch("/api/config", { cache: "no-store" })
      .then(safeParseResponse)
      .then(function (result) {
        if (!result.ok) throw new Error((result.data && result.data.message) || ("HTTP " + result.status));
        return result.data;
      });
  }

  function verifyProviderKey(provider, key) {
    var payload = {};
    if (provider === "groq") payload.groq_api_key = key;
    else if (provider === "tavily") payload.tavily_api_key = key;
    else if (provider === "aviationstack") payload.aviationstack_api_key = key;
    else if (provider === "openweather") payload.openweather_api_key = key;
    else if (provider === "database") payload.database_url = key;
    else payload[provider] = key;

    // Send verification request to /api/config/verify-key, fallback to /api/config
    return apiFetch("/api/config/verify-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: provider, key: key })
    }).then(function (res) {
      if (res.status === 404) {
        // Fallback to /api/config
        return apiFetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      return res;
    }).then(safeParseResponse).then(function (result) {
      if (!result.ok) {
        var errDetail = (result.data && (result.data.message || (result.data.errors && (result.data.errors[payload[provider]] || Object.values(result.data.errors)[0])))) || "Verification failed";
        return { ok: false, data: { ok: false, message: errDetail } };
      }
      return { ok: true, data: result.data };
    }).catch(function (err) {
      return { ok: false, data: { ok: false, message: err.message || "Network error" } };
    });
  }

  function saveConfig(payload) {
    return apiFetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(safeParseResponse);
  }

  function resetConfig() {
    return apiFetch("/api/config", { method: "DELETE" })
      .then(safeParseResponse)
      .then(function (result) {
        return result.data;
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
      pillNode.title = "Backend API Connected (" + (state.lastLatency ? state.lastLatency + "ms" : "Active") + ")";
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

  // Export to window
  window.TravelBrainAPI = {
    getBaseUrl: getBaseUrl,
    setBaseUrl: setBaseUrl,
    getAuthToken: getAuthToken,
    setAuthToken: setAuthToken,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    clearAuth: clearAuth,
    fetch: apiFetch,
    buildUrl: buildUrl,
    testConnection: testConnection,
    fetchConfig: fetchConfig,
    verifyProviderKey: verifyProviderKey,
    saveConfig: saveConfig,
    resetConfig: resetConfig,
    getState: function () { return Object.assign({}, state); },
    onStateChange: onStateChange,
    renderStatusPill: renderStatusPill
  };

})(window);
