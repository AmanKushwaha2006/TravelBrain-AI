# Graph Report - TravelBrain-Multi-Agent-AI-Travel-Planner  (2026-10-30)

## Corpus Check
- 40 files · ~19,889 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 6, .example 1, .css 1)

## Summary
- 331 nodes · 771 edges · 15 communities (11 shown, 4 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0d59370`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.py
- critic_agent.py
- session.py
- local.py
- app.js
- cache.py
- settings.py
- README.md
- render
- vercel.json
- build-frontend.sh
- travelbrain-multi-agent-ai-travel-planner
- clean_json_output
- render

## God Nodes (most connected - your core abstractions)
1. `TravelState` - 18 edges
2. `get_llm()` - 17 edges
3. `extract_destination()` - 16 edges
4. `run_async()` - 15 edges
5. `bump_llm_calls()` - 15 edges
6. `write_config()` - 13 edges
7. `require()` - 13 edges
8. `run_critic_evaluation()` - 12 edges
9. `build_graph()` - 12 edges
10. `load_tools()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `write_config()` --calls--> `check_database_url()`  [EXTRACTED]
  app.py → src/api/validation.py
- `write_config()` --calls--> `check_groq_api_key()`  [EXTRACTED]
  app.py → src/api/validation.py
- `travel_planner()` --uses--> `MissingCredentialsError`  [INFERRED]
  app.py → src/config/session.py
- `travel_planner()` --calls--> `run_travel_agent()`  [EXTRACTED]
  app.py → src/graph/runner.py
- `evaluate_plan()` --calls--> `run_critic_evaluation()`  [EXTRACTED]
  app.py → src/agents/critic_agent.py

## Import Cycles
- None detected.

## Communities (15 total, 4 thin omitted)

### Community 0 - "app.py"
Cohesion: 0.07
Nodes (26): ConfigRequest, evaluate_plan(), EvaluateRequest, favicon(), health_check(), home(), home_head(), read_config() (+18 more)

### Community 1 - "critic_agent.py"
Cohesion: 0.10
Nodes (17): critic_agent(), run_critic_evaluation(), extract_destination(), final_agent(), flight_agent(), hotel_agent(), __getattr__(), itinerary_agent() (+9 more)

### Community 2 - "session.py"
Cohesion: 0.09
Nodes (12): get_checkpointer(), get_connection(), get_pool(), get_session_checkpointer(), _build_llm(), require(), resolve_database_url(), resolve_groq_api_key() (+4 more)

### Community 3 - "local.py"
Cohesion: 0.10
Nodes (15): async_cached(), _child_env(), get_client(), load_tools(), require_tools(), check_servers(), get_all_tools(), _aviation_call() (+7 more)

### Community 4 - "app.js"
Cohesion: 0.22
Nodes (24): applyConfig(), closeSettings(), el(), icon(), isReady(), markUnreachable(), mdBlock(), openSettings() (+16 more)

### Community 5 - "cache.py"
Cohesion: 0.10
Nodes (14): decorator(), wrapper(), build_key(), cached(), decorator(), wrapper(), clear(), drop_client() (+6 more)

### Community 6 - "settings.py"
Cohesion: 0.14
Nodes (7): check_database_url(), check_groq_api_key(), get_database_url(), get_groq_api_key(), normalize_database_url(), get_current_weather(), get_forecast()

### Community 7 - "README.md"
Cohesion: 0.11
Nodes (18): 🧐 About <a name = "about"></a>, 🎉 Acknowledgements <a name = "acknowledgement"></a>, 👤 Author <a name = "authors"></a>, 🤝 Contributing <a name = "contributing"></a>, Getting set up, 🏁 Getting Started <a name = "getting_started"></a>, Installing, Making your changes (+10 more)

### Community 8 - "render"
Cohesion: 0.47
Nodes (7): escapeHtml(), formatRun(), inline(), parseList(), render(), flushPara(), splitRow()

### Community 9 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, outputDirectory, rewrites, $schema

### Community 13 - "clean_json_output"
Cohesion: 0.22
Nodes (5): clean_json_output(), _compute_grade(), _compute_verdict(), _dynamic_fallback_evaluation(), _sanitize_json_text()

## Knowledge Gaps
- **1 isolated node(s):** `travelbrain-multi-agent-ai-travel-planner`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 139 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_critic_evaluation()` connect `critic_agent.py` to `app.py`, `clean_json_output`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `TravelState` (e.g. with `critic_agent()` and `final_agent()`) actually correct?**
  _`TravelState` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `travelbrain-multi-agent-ai-travel-planner` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06610259122157588 - nodes in this community are weakly interconnected._
- **Why does `async_cached()` connect `local.py` to `critic_agent.py`, `session.py`, `cache.py`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Should `critic_agent.py` be split into smaller, more focused modules?**
  _Cohesion score 0.10206240084611316 - nodes in this community are weakly interconnected._
- **Why does `get_llm()` connect `critic_agent.py` to `session.py`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._