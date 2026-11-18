# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-11-18)

## Corpus Check
- 47 files · ~60,806 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 218 file(s) not represented in the graph (top: (none) 183, .old 18, .db 3)

## Summary
- 516 nodes · 1190 edges · 29 communities (21 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2827eb29`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- write_config
- critic_agent.py
- evaluate_plan
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
- history.py
- session.py
- add_no_cache_for_dev

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

## Communities (29 total, 8 thin omitted)

### Community 0 - "write_config"
Cohesion: 0.22
Nodes (8): _clear_auth_cookie(), logout(), _set_auth_cookie(), _set_session_cookie(), signup(), SignupRequest, write_config(), check_groq_api_key()

### Community 1 - "critic_agent.py"
Cohesion: 0.07
Nodes (29): clean_json_output(), _compute_grade(), _compute_verdict(), critic_agent(), _dynamic_fallback_evaluation(), run_critic_evaluation(), _sanitize_json_text(), extract_destination() (+21 more)

### Community 2 - "evaluate_plan"
Cohesion: 0.18
Nodes (6): ConfigRequest, evaluate_plan(), EvaluateRequest, LoginRequest, TravelRequest, MissingCredentialsError

### Community 3 - "local.py"
Cohesion: 0.10
Nodes (15): async_cached(), _child_env(), get_client(), load_tools(), require_tools(), check_servers(), get_all_tools(), _aviation_call() (+7 more)

### Community 4 - "app.js"
Cohesion: 0.14
Nodes (41): applyConfig(), checkAuth(), clearAuthError(), closeAuthModal(), closeSettings(), deleteTrip(), el(), formatRelativeTime() (+33 more)

### Community 5 - "cache.py"
Cohesion: 0.07
Nodes (17): decorator(), wrapper(), build_key(), cached(), decorator(), wrapper(), clear(), drop_client() (+9 more)

### Community 6 - "auth.py"
Cohesion: 0.14
Nodes (9): login(), authenticate_user(), create_session(), create_user(), delete_session(), get_session_user(), hash_password(), _hash_token() (+1 more)

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

### Community 23 - "app.py"
Cohesion: 0.09
Nodes (8): _extract_destination(), _extract_title(), favicon(), home_head(), lifespan(), get_pool(), cleanup_expired_sessions(), init_auth_tables()

### Community 26 - "history.py"
Cohesion: 0.20
Nodes (4): delete_trip(), get_trip(), get_user_history(), save_trip()

### Community 27 - "session.py"
Cohesion: 0.08
Nodes (16): active_session_count(), clear_credentials(), get_credentials_for(), _merge(), new_session_id(), _prune(), store_credentials(), check_database_url() (+8 more)

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 185 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `evaluate_plan`, `app.py`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06687565308254964 - nodes in this community are weakly interconnected._
- **Why does `GLTFParser` connect `GLTFParser` to `GLTFLoader.js`, `.loadTextureImage`, `.assignTexture`, `.getDependency`, `GLTFMaterialsPbrSpecularGlossinessExtension`, `.parse`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `local.py` be split into smaller, more focused modules?**
  _Cohesion score 0.09581646423751687 - nodes in this community are weakly interconnected._
- **Why does `async_cached()` connect `local.py` to `critic_agent.py`, `cache.py`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._