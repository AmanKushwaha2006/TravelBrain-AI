# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-11-19)

## Corpus Check
- 49 files · ~72,516 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 219 file(s) not represented in the graph (top: (none) 183, .old 18, .db 3)

## Summary
- 580 nodes · 1362 edges · 33 communities (24 shown, 9 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d67a1176`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.py
- critic_agent.py
- verify_single_key
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
- login
- app.py
- animated-content.js
- sessions.py
- history.py
- api-client.js
- Request
- weather_server.py
- itinerary.js
- home_head

## God Nodes (most connected - your core abstractions)
1. `GLTFParser` - 31 edges
2. `TravelState` - 18 edges
3. `verify_single_key()` - 17 edges
4. `init()` - 17 edges
5. `get_llm()` - 17 edges
6. `write_config()` - 16 edges
7. `extract_destination()` - 16 edges
8. `require()` - 15 edges
9. `run_async()` - 15 edges
10. `bump_llm_calls()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `travel_planner()` --uses--> `MissingCredentialsError`  [INFERRED]
  app.py → src/config/session.py
- `evaluate_plan()` --uses--> `MissingCredentialsError`  [INFERRED]
  app.py → src/config/session.py
- `_get_auth_pool()` --calls--> `get_pool()`  [EXTRACTED]
  app.py → src/clients/checkpointer.py
- `_get_auth_pool()` --calls--> `normalize_database_url()`  [EXTRACTED]
  app.py → src/config/settings.py
- `_get_current_user()` --calls--> `get_session_user()`  [EXTRACTED]
  app.py → src/db/auth.py

## Import Cycles
- None detected.

## Communities (33 total, 9 thin omitted)

### Community 0 - "session.py"
Cohesion: 0.07
Nodes (15): cached(), get_connection(), get_session_checkpointer(), Credentials, get_credentials(), MissingCredentialsError, require(), resolve_aviationstack_api_key() (+7 more)

### Community 1 - "critic_agent.py"
Cohesion: 0.07
Nodes (29): clean_json_output(), _compute_grade(), _compute_verdict(), critic_agent(), _dynamic_fallback_evaluation(), run_critic_evaluation(), _sanitize_json_text(), extract_destination() (+21 more)

### Community 2 - "verify_single_key"
Cohesion: 0.24
Nodes (9): _set_session_cookie(), verify_single_key(), write_config(), check_aviationstack_api_key(), check_database_url(), check_groq_api_key(), check_openweather_api_key(), check_tavily_api_key() (+1 more)

### Community 3 - "local.py"
Cohesion: 0.10
Nodes (15): async_cached(), _child_env(), get_client(), load_tools(), require_tools(), check_servers(), get_all_tools(), _aviation_call() (+7 more)

### Community 4 - "app.js"
Cohesion: 0.12
Nodes (43): applyConfig(), checkAuth(), clearAuthError(), closeAuthModal(), closeSettings(), deleteTrip(), el(), formatRelativeTime() (+35 more)

### Community 5 - "cache.py"
Cohesion: 0.12
Nodes (13): decorator(), wrapper(), build_key(), decorator(), wrapper(), clear(), drop_client(), get_client() (+5 more)

### Community 6 - "auth.py"
Cohesion: 0.14
Nodes (8): authenticate_user(), create_session(), create_user(), delete_session(), get_session_user(), hash_password(), _hash_token(), verify_password()

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

### Community 22 - "login"
Cohesion: 0.15
Nodes (11): _clear_auth_cookie(), ConfigRequest, EvaluateRequest, login(), LoginRequest, logout(), _set_auth_cookie(), signup() (+3 more)

### Community 23 - "app.py"
Cohesion: 0.09
Nodes (7): add_no_cache_for_dev(), _extract_destination(), _extract_title(), lifespan(), get_pool(), cleanup_expired_sessions(), init_auth_tables()

### Community 25 - "sessions.py"
Cohesion: 0.25
Nodes (7): active_session_count(), clear_credentials(), get_credentials_for(), _merge(), new_session_id(), _prune(), store_credentials()

### Community 26 - "history.py"
Cohesion: 0.20
Nodes (4): delete_trip(), get_trip(), get_user_history(), save_trip()

### Community 27 - "api-client.js"
Cohesion: 0.18
Nodes (15): apiFetch(), buildUrl(), clearAuth(), fetchConfig(), normalizeUrl(), notifyListeners(), resetConfig(), safeParseResponse() (+7 more)

### Community 28 - "Request"
Cohesion: 0.15
Nodes (17): auth_me(), evaluate_plan(), favicon(), _get_auth_pool(), _get_current_user(), health_check(), home(), itinerary_view() (+9 more)

### Community 31 - "itinerary.js"
Cohesion: 0.23
Nodes (25): cleanMarkdown(), closeSettings(), el(), executePlanning(), handleRefinement(), hidePlannerScreen(), init(), resumePlanning() (+17 more)

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 195 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `Request`, `app.py`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `session.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Why does `GLTFParser` connect `GLTFParser` to `GLTFLoader.js`, `.loadTextureImage`, `.assignTexture`, `.getDependency`, `GLTFMaterialsPbrSpecularGlossinessExtension`, `.parse`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `init()` (e.g. with `itinerary.js` and `closeSettings()`) actually correct?**
  _`init()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._