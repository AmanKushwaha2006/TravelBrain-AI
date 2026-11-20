# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-11-20)

## Corpus Check
- 57 files · ~89,076 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 219 file(s) not represented in the graph (top: (none) 183, .old 18, .db 3)

## Summary
- 634 nodes · 1501 edges · 34 communities (25 shown, 9 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `42461654`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- session.py
- critic_agent.py
- verify_single_key
- settings.py
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
- sessions.py
- app.py
- test_parser.js
- use_credentials
- history.py
- api-client.js
- Request
- itinerary.js
- home_head

## God Nodes (most connected - your core abstractions)
1. `GLTFParser` - 31 edges
2. `init()` - 25 edges
3. `TravelState` - 18 edges
4. `verify_single_key()` - 17 edges
5. `get_llm()` - 17 edges
6. `write_config()` - 16 edges
7. `extract_destination()` - 16 edges
8. `_get_auth_pool()` - 15 edges
9. `executePlanning()` - 15 edges
10. `run_async()` - 15 edges

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

## Communities (34 total, 9 thin omitted)

### Community 0 - "session.py"
Cohesion: 0.11
Nodes (10): get_connection(), get_session_checkpointer(), get_credentials(), MissingCredentialsError, require(), resolve_aviationstack_api_key(), resolve_database_url(), resolve_groq_api_key() (+2 more)

### Community 1 - "critic_agent.py"
Cohesion: 0.06
Nodes (30): clean_json_output(), _compute_grade(), _compute_verdict(), critic_agent(), _dynamic_fallback_evaluation(), run_critic_evaluation(), _sanitize_json_text(), extract_destination() (+22 more)

### Community 2 - "verify_single_key"
Cohesion: 0.18
Nodes (11): _set_session_cookie(), verify_single_key(), write_config(), new_session_id(), check_aviationstack_api_key(), check_database_url(), check_groq_api_key(), check_openweather_api_key() (+3 more)

### Community 3 - "settings.py"
Cohesion: 0.08
Nodes (18): async_cached(), get_database_url(), get_groq_api_key(), normalize_database_url(), _child_env(), get_client(), load_tools(), require_tools() (+10 more)

### Community 4 - "app.js"
Cohesion: 0.12
Nodes (47): applyConfig(), checkAuth(), clearAuthError(), closeAuthModal(), closeSettings(), deleteTrip(), el(), formatRelativeTime() (+39 more)

### Community 5 - "cache.py"
Cohesion: 0.12
Nodes (13): decorator(), wrapper(), build_key(), decorator(), wrapper(), clear(), drop_client(), get_client() (+5 more)

### Community 6 - "auth.py"
Cohesion: 0.13
Nodes (9): signup(), authenticate_user(), create_session(), create_user(), delete_session(), get_session_user(), hash_password(), _hash_token() (+1 more)

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

### Community 22 - "sessions.py"
Cohesion: 0.30
Nodes (6): active_session_count(), get_credentials_for(), _merge(), _prune(), store_credentials(), Credentials

### Community 23 - "app.py"
Cohesion: 0.08
Nodes (16): add_no_cache_for_dev(), _clear_auth_cookie(), ConfigRequest, evaluate_plan(), EvaluateRequest, favicon(), lifespan(), login() (+8 more)

### Community 24 - "test_parser.js"
Cohesion: 0.20
Nodes (7): fs, jsContent, parserCode, path, cleanMarkdown(), extractPrologue(), fs

### Community 25 - "use_credentials"
Cohesion: 0.22
Nodes (5): health_check(), reset_config(), clear_credentials(), credential_status(), use_credentials()

### Community 26 - "history.py"
Cohesion: 0.20
Nodes (4): delete_trip(), get_trip(), get_user_history(), save_trip()

### Community 27 - "api-client.js"
Cohesion: 0.15
Nodes (30): apiFetch(), buildUrl(), clearAuth(), clearSessionKeys(), directVerifyAviationStack(), directVerifyDatabase(), directVerifyGroq(), directVerifyKey() (+22 more)

### Community 28 - "Request"
Cohesion: 0.16
Nodes (16): auth_me(), create_history(), _extract_destination(), _extract_title(), _get_auth_pool(), _get_current_user(), home(), itinerary_view() (+8 more)

### Community 31 - "itinerary.js"
Cohesion: 0.14
Nodes (40): cleanMarkdown(), clearAuthError(), closeAuthModal(), closeSettings(), el(), executePlanning(), focusDayCard(), generateWithDirectGroq() (+32 more)

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 206 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `app.py`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `init()` (e.g. with `itinerary.js` and `closeAuthModal()`) actually correct?**
  _`init()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `session.py` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Why does `GLTFParser` connect `GLTFParser` to `GLTFLoader.js`, `.loadTextureImage`, `.assignTexture`, `.getDependency`, `GLTFMaterialsPbrSpecularGlossinessExtension`, `.parse`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.059574468085106386 - nodes in this community are weakly interconnected._