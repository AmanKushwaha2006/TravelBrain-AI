# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-11-19)

## Corpus Check
- 49 files · ~77,252 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 219 file(s) not represented in the graph (top: (none) 183, .old 18, .db 3)

## Summary
- 609 nodes · 1465 edges · 36 communities (27 shown, 9 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5dd776f2`
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
- use_credentials
- app.py
- animated-content.js
- sessions.py
- history.py
- api-client.js
- Request
- settings.py
- itinerary.js
- _read
- remote.py
- add_no_cache_for_dev
- get_client

## God Nodes (most connected - your core abstractions)
1. `GLTFParser` - 31 edges
2. `init()` - 23 edges
3. `TravelState` - 18 edges
4. `verify_single_key()` - 17 edges
5. `get_llm()` - 17 edges
6. `write_config()` - 16 edges
7. `executePlanning()` - 16 edges
8. `extract_destination()` - 16 edges
9. `_get_auth_pool()` - 15 edges
10. `require()` - 15 edges

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

## Communities (36 total, 9 thin omitted)

### Community 0 - "session.py"
Cohesion: 0.10
Nodes (10): get_connection(), get_session_checkpointer(), get_credentials(), MissingCredentialsError, require(), resolve_aviationstack_api_key(), resolve_database_url(), resolve_groq_api_key() (+2 more)

### Community 1 - "critic_agent.py"
Cohesion: 0.07
Nodes (28): clean_json_output(), _compute_grade(), _compute_verdict(), critic_agent(), _dynamic_fallback_evaluation(), run_critic_evaluation(), _sanitize_json_text(), extract_destination() (+20 more)

### Community 2 - "verify_single_key"
Cohesion: 0.21
Nodes (11): _set_session_cookie(), verify_single_key(), write_config(), new_session_id(), check_aviationstack_api_key(), check_database_url(), check_groq_api_key(), check_openweather_api_key() (+3 more)

### Community 3 - "local.py"
Cohesion: 0.16
Nodes (10): load_tools(), check_servers(), get_all_tools(), _aviation_call(), _aviation_call_cached(), aviation_mcp_call(), forecast_mcp_search(), _get_aviation_tools() (+2 more)

### Community 4 - "app.js"
Cohesion: 0.12
Nodes (47): applyConfig(), checkAuth(), clearAuthError(), closeAuthModal(), closeSettings(), deleteTrip(), el(), formatRelativeTime() (+39 more)

### Community 5 - "cache.py"
Cohesion: 0.16
Nodes (6): cached(), clear(), get_client(), reset_client(), _safe_url(), status()

### Community 6 - "auth.py"
Cohesion: 0.10
Nodes (10): authenticate_user(), create_session(), create_user(), delete_session(), get_session_user(), hash_password(), _hash_token(), verify_password() (+2 more)

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

### Community 22 - "use_credentials"
Cohesion: 0.19
Nodes (8): evaluate_plan(), EvaluateRequest, health_check(), read_config(), reset_config(), _session_id(), clear_credentials(), use_credentials()

### Community 23 - "app.py"
Cohesion: 0.09
Nodes (10): ConfigRequest, home_head(), lifespan(), LoginRequest, SignupRequest, TravelRequest, VerifyKeyRequest, get_pool() (+2 more)

### Community 25 - "sessions.py"
Cohesion: 0.30
Nodes (6): active_session_count(), get_credentials_for(), _merge(), _prune(), store_credentials(), Credentials

### Community 26 - "history.py"
Cohesion: 0.20
Nodes (4): delete_trip(), get_trip(), get_user_history(), save_trip()

### Community 27 - "api-client.js"
Cohesion: 0.15
Nodes (29): apiFetch(), buildUrl(), clearAuth(), clearSessionKeys(), directVerifyAviationStack(), directVerifyDatabase(), directVerifyGroq(), directVerifyKey() (+21 more)

### Community 28 - "Request"
Cohesion: 0.14
Nodes (19): auth_me(), _clear_auth_cookie(), create_history(), _extract_destination(), _extract_title(), favicon(), _get_auth_pool(), _get_current_user() (+11 more)

### Community 29 - "settings.py"
Cohesion: 0.18
Nodes (3): get_database_url(), get_groq_api_key(), _child_env()

### Community 31 - "itinerary.js"
Cohesion: 0.16
Nodes (36): cleanMarkdown(), clearAuthError(), closeAuthModal(), closeSettings(), el(), executePlanning(), generateWithDirectGroq(), handleAuthSuccess() (+28 more)

### Community 32 - "_read"
Cohesion: 0.22
Nodes (8): decorator(), wrapper(), build_key(), decorator(), wrapper(), drop_client(), _read(), _write()

### Community 33 - "remote.py"
Cohesion: 0.27
Nodes (4): async_cached(), require_tools(), _get_search_tool(), tavily_mcp_search()

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 194 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `remote.py`, `use_credentials`, `app.py`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `init()` (e.g. with `itinerary.js` and `closeAuthModal()`) actually correct?**
  _`init()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `session.py` be split into smaller, more focused modules?**
  _Cohesion score 0.1010752688172043 - nodes in this community are weakly interconnected._
- **Why does `GLTFParser` connect `GLTFParser` to `GLTFLoader.js`, `.loadTextureImage`, `.assignTexture`, `.getDependency`, `GLTFMaterialsPbrSpecularGlossinessExtension`, `.parse`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06993828974434323 - nodes in this community are weakly interconnected._