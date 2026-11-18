# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-11-18)

## Corpus Check
- 129 files · ~74,759 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 220 file(s) not represented in the graph (top: (none) 183, .old 18, .css 3)

## Summary
- 617 nodes · 1279 edges · 73 communities (22 shown, 51 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df22d8f3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.py
- critic_agent.py
- session.py
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
- render
- GLTFLoader.js
- GLTFLoader
- .loadTextureImage
- .assignTexture
- .getDependency
- GLTFMaterialsPbrSpecularGlossinessExtension
- .parse
- Request
- evaluate_plan
- animated-content.js
- os
- history.py
- sessions.py
- re
- add_no_cache_for_dev
- aether_script_0.js
- test_waypoint_math.py
- settings.py

## God Nodes (most connected - your core abstractions)
1. `GLTFParser` - 31 edges
2. `TravelState` - 18 edges
3. `get_llm()` - 17 edges
4. `extract_destination()` - 16 edges
5. `run_async()` - 15 edges
6. `bump_llm_calls()` - 15 edges
7. `travel_planner()` - 14 edges
8. `_get_auth_pool()` - 13 edges
9. `write_config()` - 13 edges
10. `require()` - 13 edges

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

## Communities (73 total, 51 thin omitted)

### Community 0 - "app.py"
Cohesion: 0.09
Nodes (8): _extract_destination(), _extract_title(), favicon(), home_head(), lifespan(), get_pool(), cleanup_expired_sessions(), init_auth_tables()

### Community 1 - "critic_agent.py"
Cohesion: 0.08
Nodes (23): clean_json_output(), _compute_grade(), _compute_verdict(), critic_agent(), _dynamic_fallback_evaluation(), run_critic_evaluation(), _sanitize_json_text(), extract_destination() (+15 more)

### Community 2 - "session.py"
Cohesion: 0.09
Nodes (13): get_checkpointer(), get_connection(), get_session_checkpointer(), Credentials, get_credentials(), MissingCredentialsError, require(), resolve_database_url() (+5 more)

### Community 3 - "local.py"
Cohesion: 0.10
Nodes (15): async_cached(), _child_env(), get_client(), load_tools(), require_tools(), check_servers(), get_all_tools(), _aviation_call() (+7 more)

### Community 4 - "app.js"
Cohesion: 0.12
Nodes (44): applyConfig(), checkAuth(), clearAuthError(), closeAuthModal(), closeSettings(), deleteTrip(), el(), formatRelativeTime() (+36 more)

### Community 5 - "cache.py"
Cohesion: 0.11
Nodes (14): decorator(), wrapper(), build_key(), cached(), decorator(), wrapper(), clear(), drop_client() (+6 more)

### Community 6 - "auth.py"
Cohesion: 0.16
Nodes (7): authenticate_user(), create_user(), delete_session(), get_session_user(), hash_password(), _hash_token(), verify_password()

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
Cohesion: 0.17
Nodes (14): auth_me(), _get_auth_pool(), _get_current_user(), health_check(), home(), list_history(), read_config(), read_history() (+6 more)

### Community 23 - "evaluate_plan"
Cohesion: 0.14
Nodes (13): _clear_auth_cookie(), ConfigRequest, evaluate_plan(), EvaluateRequest, login(), LoginRequest, logout(), _set_auth_cookie() (+5 more)

### Community 26 - "history.py"
Cohesion: 0.17
Nodes (4): delete_trip(), get_trip(), get_user_history(), save_trip()

### Community 27 - "sessions.py"
Cohesion: 0.20
Nodes (9): write_config(), active_session_count(), clear_credentials(), get_credentials_for(), _merge(), new_session_id(), _prune(), store_credentials() (+1 more)

### Community 51 - "settings.py"
Cohesion: 0.16
Nodes (6): check_database_url(), get_database_url(), get_groq_api_key(), normalize_database_url(), get_current_weather(), get_forecast()

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 253 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `app.py`, `evaluate_plan`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.08547008547008547 - nodes in this community are weakly interconnected._
- **Why does `GLTFParser` connect `GLTFParser` to `GLTFLoader.js`, `.loadTextureImage`, `.assignTexture`, `.getDependency`, `GLTFMaterialsPbrSpecularGlossinessExtension`, `.parse`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07747747747747748 - nodes in this community are weakly interconnected._
- **Why does `async_cached()` connect `local.py` to `critic_agent.py`, `session.py`, `cache.py`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._