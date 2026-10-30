# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-10-30)

## Corpus Check
- 41 files · ~55,808 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .glb 2, .example 1)

## Summary
- 439 nodes · 991 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0d59370`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.py
- critic_agent.py
- checkpointer.py
- local.py
- app.js
- cache.py
- settings.py
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

## God Nodes (most connected - your core abstractions)
1. `GLTFParser` - 31 edges
2. `TravelState` - 18 edges
3. `get_llm()` - 17 edges
4. `extract_destination()` - 16 edges
5. `run_async()` - 15 edges
6. `bump_llm_calls()` - 15 edges
7. `write_config()` - 13 edges
8. `require()` - 13 edges
9. `run_critic_evaluation()` - 12 edges
10. `build_graph()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `write_config()` --calls--> `check_database_url()`  [EXTRACTED]
  app.py → src/api/validation.py
- `travel_planner()` --uses--> `MissingCredentialsError`  [INFERRED]
  app.py → src/config/session.py
- `travel_planner()` --calls--> `run_travel_agent()`  [EXTRACTED]
  app.py → src/graph/runner.py
- `evaluate_plan()` --calls--> `run_critic_evaluation()`  [EXTRACTED]
  app.py → src/agents/critic_agent.py
- `evaluate_plan()` --uses--> `MissingCredentialsError`  [INFERRED]
  app.py → src/config/session.py

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "app.py"
Cohesion: 0.06
Nodes (28): ConfigRequest, evaluate_plan(), EvaluateRequest, favicon(), health_check(), home(), home_head(), read_config() (+20 more)

### Community 1 - "critic_agent.py"
Cohesion: 0.07
Nodes (25): clean_json_output(), _compute_grade(), _compute_verdict(), critic_agent(), _dynamic_fallback_evaluation(), run_critic_evaluation(), _sanitize_json_text(), extract_destination() (+17 more)

### Community 2 - "checkpointer.py"
Cohesion: 0.12
Nodes (11): get_checkpointer(), get_connection(), get_pool(), get_session_checkpointer(), require(), resolve_database_url(), _compiled_graph(), get_travel_graph() (+3 more)

### Community 3 - "local.py"
Cohesion: 0.13
Nodes (12): async_cached(), get_client(), load_tools(), check_servers(), get_all_tools(), _aviation_call(), _aviation_call_cached(), aviation_mcp_call() (+4 more)

### Community 4 - "app.js"
Cohesion: 0.22
Nodes (24): applyConfig(), closeSettings(), el(), icon(), isReady(), markUnreachable(), mdBlock(), openSettings() (+16 more)

### Community 5 - "cache.py"
Cohesion: 0.11
Nodes (13): decorator(), wrapper(), build_key(), decorator(), wrapper(), clear(), drop_client(), get_client() (+5 more)

### Community 6 - "settings.py"
Cohesion: 0.11
Nodes (7): check_database_url(), get_database_url(), get_groq_api_key(), normalize_database_url(), _child_env(), get_current_weather(), get_forecast()

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

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 165 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GLTFParser` connect `GLTFParser` to `GLTFLoader.js`, `.loadTextureImage`, `.assignTexture`, `.getDependency`, `GLTFMaterialsPbrSpecularGlossinessExtension`, `.parse`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06010230179028133 - nodes in this community are weakly interconnected._
- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `app.py`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06817513958272113 - nodes in this community are weakly interconnected._
- **Why does `async_cached()` connect `local.py` to `critic_agent.py`, `checkpointer.py`, `cache.py`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._