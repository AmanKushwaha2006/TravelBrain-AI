# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-11-19)

## Corpus Check
- 49 files · ~69,416 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 219 file(s) not represented in the graph (top: (none) 183, .old 18, .db 3)

## Summary
- 562 nodes · 1290 edges · 38 communities (28 shown, 10 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4bb4bdf9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BaseModel
- critic_agent.py
- checkpointer.py
- local.py
- app.js
- cache.py
- auth.py
- README.md
- render
- vercel.json
- build-frontend.sh
- travelbrain-multi-agent-ai-travel-planner
- GLTFParser
- GLTFLoader.js
- GLTFLoader
- .loadTextureImage
- .assignTexture
- .getDependency
- GLTFMaterialsPbrSpecularGlossinessExtension
- .parse
- Request
- app.py
- animated-content.js
- sessions.py
- history.py
- api-client.js
- session.py
- add_no_cache_for_dev
- itinerary.js
- home_head
- settings.py
- mcp_servers/__init__.py
- _read
- write_config
- remote.py

## God Nodes (most connected - your core abstractions)
1. `GLTFParser` - 31 edges
2. `TravelState` - 18 edges
3. `init()` - 17 edges
4. `get_llm()` - 17 edges
5. `extract_destination()` - 16 edges
6. `run_async()` - 15 edges
7. `bump_llm_calls()` - 15 edges
8. `_get_auth_pool()` - 14 edges
9. `travel_planner()` - 14 edges
10. `write_config()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `travel_planner()` --uses--> `MissingCredentialsError`  [INFERRED]
  app.py → src/config/session.py
- `_get_auth_pool()` --calls--> `get_pool()`  [EXTRACTED]
  app.py → src/clients/checkpointer.py
- `_get_auth_pool()` --calls--> `normalize_database_url()`  [EXTRACTED]
  app.py → src/config/settings.py
- `_get_current_user()` --calls--> `get_session_user()`  [EXTRACTED]
  app.py → src/db/auth.py
- `read_config()` --calls--> `get_credentials_for()`  [EXTRACTED]
  app.py → src/api/sessions.py

## Import Cycles
- None detected.

## Communities (38 total, 10 thin omitted)

### Community 0 - "BaseModel"
Cohesion: 0.33
Nodes (4): ConfigRequest, LoginRequest, SignupRequest, TravelRequest

### Community 1 - "critic_agent.py"
Cohesion: 0.06
Nodes (31): clean_json_output(), _compute_grade(), _compute_verdict(), critic_agent(), _dynamic_fallback_evaluation(), run_critic_evaluation(), _sanitize_json_text(), extract_destination() (+23 more)

### Community 2 - "checkpointer.py"
Cohesion: 0.16
Nodes (4): get_checkpointer(), get_connection(), get_pool(), get_session_checkpointer()

### Community 3 - "local.py"
Cohesion: 0.24
Nodes (8): async_cached(), _aviation_call(), _aviation_call_cached(), aviation_mcp_call(), forecast_mcp_search(), _get_aviation_tools(), _get_weather_tools(), weather_mcp_search()

### Community 4 - "app.js"
Cohesion: 0.13
Nodes (44): applyConfig(), checkAuth(), clearAuthError(), closeAuthModal(), closeSettings(), deleteTrip(), el(), escapeHtml() (+36 more)

### Community 5 - "cache.py"
Cohesion: 0.16
Nodes (6): cached(), clear(), get_client(), reset_client(), _safe_url(), status()

### Community 6 - "auth.py"
Cohesion: 0.11
Nodes (9): create_session(), create_user(), delete_session(), get_session_user(), hash_password(), _hash_token(), verify_password(), get_current_weather() (+1 more)

### Community 7 - "README.md"
Cohesion: 0.11
Nodes (18): 🧐 About <a name = "about"></a>, 🎉 Acknowledgements <a name = "acknowledgement"></a>, 👤 Author <a name = "authors"></a>, 🤝 Contributing <a name = "contributing"></a>, Getting set up, 🏁 Getting Started <a name = "getting_started"></a>, Installing, Making your changes (+10 more)

### Community 8 - "render"
Cohesion: 0.47
Nodes (7): escapeHtml(), formatRun(), inline(), parseList(), render(), flushPara(), splitRow()

### Community 9 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 13 - "GLTFParser"
Cohesion: 0.20
Nodes (4): addUnknownExtensionsToUserData(), assignExtrasToUserData(), GLTFLightsExtension, GLTFParser

### Community 15 - "GLTFLoader.js"
Cohesion: 0.16
Nodes (9): computeBounds(), createAttributesKey(), createDefaultMaterial(), createPrimitiveKey(), getNormalizedComponentScale(), GLTFCubicSplineInterpolant, GLTFRegistry(), toTrianglesDrawMode() (+1 more)

### Community 16 - "GLTFLoader"
Cohesion: 0.14
Nodes (3): GLTFLoader, GLTFMaterialsTransmissionExtension, GLTFMeshoptCompression

### Community 17 - ".loadTextureImage"
Cohesion: 0.21
Nodes (3): GLTFTextureBasisUExtension, GLTFTextureWebPExtension, resolveURL()

### Community 18 - ".assignTexture"
Cohesion: 0.17
Nodes (3): GLTFMaterialsClearcoatExtension, GLTFMaterialsUnlitExtension, GLTFTextureTransformExtension

### Community 19 - ".getDependency"
Cohesion: 0.27
Nodes (5): addMorphTargets(), addPrimitiveAttributes(), assignAttributeAccessor(), buildNodeHierachy(), createDracoPrimitive()

### Community 21 - ".parse"
Cohesion: 0.22
Nodes (3): GLTFBinaryExtension, GLTFDracoMeshCompressionExtension, GLTFMeshQuantizationExtension

### Community 22 - "Request"
Cohesion: 0.20
Nodes (15): auth_me(), favicon(), _get_auth_pool(), _get_current_user(), home(), itinerary_view(), list_history(), login() (+7 more)

### Community 23 - "app.py"
Cohesion: 0.09
Nodes (8): _clear_auth_cookie(), _extract_destination(), _extract_title(), lifespan(), _set_session_cookie(), authenticate_user(), cleanup_expired_sessions(), init_auth_tables()

### Community 25 - "sessions.py"
Cohesion: 0.30
Nodes (6): active_session_count(), get_credentials_for(), _merge(), _prune(), store_credentials(), Credentials

### Community 26 - "history.py"
Cohesion: 0.20
Nodes (4): delete_trip(), get_trip(), get_user_history(), save_trip()

### Community 27 - "api-client.js"
Cohesion: 0.20
Nodes (10): apiFetch(), buildUrl(), clearAuth(), normalizeUrl(), notifyListeners(), setAuthToken(), setBaseUrl(), setCurrentUser() (+2 more)

### Community 28 - "session.py"
Cohesion: 0.11
Nodes (11): evaluate_plan(), EvaluateRequest, health_check(), read_config(), reset_config(), _session_id(), clear_credentials(), credential_status() (+3 more)

### Community 31 - "itinerary.js"
Cohesion: 0.24
Nodes (21): cleanMarkdown(), closeSettings(), el(), executePlanning(), handleRefinement(), hideAuthGate(), init(), loadTripById() (+13 more)

### Community 33 - "settings.py"
Cohesion: 0.18
Nodes (3): get_database_url(), get_groq_api_key(), _child_env()

### Community 34 - "mcp_servers/__init__.py"
Cohesion: 0.23
Nodes (4): get_client(), load_tools(), check_servers(), get_all_tools()

### Community 35 - "_read"
Cohesion: 0.22
Nodes (8): decorator(), wrapper(), build_key(), decorator(), wrapper(), drop_client(), _read(), _write()

### Community 36 - "write_config"
Cohesion: 0.29
Nodes (5): write_config(), new_session_id(), check_database_url(), check_groq_api_key(), normalize_database_url()

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 193 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `session.py`, `app.py`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06495726495726496 - nodes in this community are weakly interconnected._
- **Why does `GLTFParser` connect `GLTFParser` to `GLTFLoader.js`, `.loadTextureImage`, `.assignTexture`, `.getDependency`, `GLTFMaterialsPbrSpecularGlossinessExtension`, `.parse`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `init()` (e.g. with `itinerary.js` and `closeSettings()`) actually correct?**
  _`init()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12657004830917876 - nodes in this community are weakly interconnected._