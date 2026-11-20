# -*- coding: utf-8 -*-
"""
Update frontend/static/js/itinerary.js with Journey Flow Graph & Day Cards Grid.
"""
import os
import shutil

BASE_DIR = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner"
js_path = os.path.join(BASE_DIR, "frontend", "static", "js", "itinerary.js")

with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# 1. Update element declarations
old_vars = """  // Day Navigation & Timeline
  var dayNavTabs          = $("dayNavTabs");
  var daysContainer       = $("daysContainer");"""

new_vars = """  // Day Navigation & Timeline & Journey Flow Graph
  var dayNavTabs          = $("dayNavTabs");
  var daysContainer       = $("daysContainer");
  var itinerarySection    = $("itinerarySection");
  var journeyGraphCard    = $("journeyGraphCard");
  var journeyGraphCount   = $("journeyGraphCount");
  var journeyFlowTrack    = $("journeyFlowTrack");
  var btnViewAllDays      = $("btnViewAllDays");"""

if old_vars in js_content:
    js_content = js_content.replace(old_vars, new_vars)
    print("Replaced element declarations.")
else:
    print("Could not find old_vars in js_content.")

# 2. Update heroQuickJumps label
old_jump = '{ label: "📖 Day Chapters", target: "daysContainer" },'
new_jump = '{ label: "📖 Journey Flow & Cards", target: "journeyGraphCard" },'
if old_jump in js_content:
    js_content = js_content.replace(old_jump, new_jump)
    print("Replaced heroQuickJumps entry.")
else:
    print("Could not find old_jump in js_content.")

# 3. Replace steps 3 and 4 in renderDashboard
old_render_part = """    // 3. Day Navigation Tabs
    if (dayNavTabs) {
      dayNavTabs.innerHTML = "";

      var allTab = el("button", "day-tab active", "All Chapters");
      allTab.addEventListener("click", function () {
        setActiveDayTab(allTab, null);
      });
      dayNavTabs.appendChild(allTab);

      parsed.days.forEach(function (d) {
        var tab = el("button", "day-tab");
        tab.innerHTML = "Chapter " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum) + ' <span class="day-tab-count">(' + d.activities.length + ")</span>";
        tab.addEventListener("click", function () {
          setActiveDayTab(tab, "day-chapter-" + d.dayNum);
        });
        dayNavTabs.appendChild(tab);
      });
    }

    // 4. Day Chapters Itinerary (The Main Magazine Feature)
    if (daysContainer) {
      daysContainer.innerHTML = "";

      if (parsed.days.length === 0) {
        var fallbackBlock = el("div", "itinerary-day-block");
        fallbackBlock.innerHTML = renderMd(rawResult.itinerary || rawResult.answer);
        daysContainer.appendChild(fallbackBlock);
      } else {
        parsed.days.forEach(function (d) {
          var chapterEl = el("article", "itinerary-day-block day-chapter");
          chapterEl.id = "day-chapter-" + d.dayNum;

          // Chapter Header
          var cHead = el("header", "day-chapter-header");
          var eyebrow = el("div", "chapter-eyebrow", "CHAPTER " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum) + " · DAY " + d.dayNum);
          var cTitle = el("h3", "chapter-title", cleanMarkdown(d.title));
          cHead.appendChild(eyebrow);
          cHead.appendChild(cTitle);

          if (d.synopsis) {
            var cSyn = el("p", "chapter-synopsis", d.synopsis);
            cHead.appendChild(cSyn);
          }
          chapterEl.appendChild(cHead);

          // Timeline Container
          var timeline = el("div", "timeline-container");

          d.activities.forEach(function (act) {
            var item = el("div", "timeline-item");
            item.appendChild(el("div", "timeline-node"));

            var card = el("div", "activity-card magazine-activity-card");

            var topRow = el("div", "activity-top-row");
            var timePill = el("span", "activity-time-pill", act.time);
            topRow.appendChild(timePill);

            var metaBadges = el("div", "activity-meta-badges");
            if (act.duration) {
              var durBadge = el("span", "activity-meta-badge");
              durBadge.innerHTML = '⏱️ ' + cleanMarkdown(act.duration);
              metaBadges.appendChild(durBadge);
            }
            if (act.cost) {
              var costBadge = el("span", "activity-meta-badge badge-cost");
              costBadge.innerHTML = '🎟️ ' + cleanMarkdown(act.cost);
              metaBadges.appendChild(costBadge);
            }
            topRow.appendChild(metaBadges);
            card.appendChild(topRow);

            var actTitle = el("h4", "activity-title", cleanMarkdown(act.title));
            card.appendChild(actTitle);

            if (act.location) {
              var locEl = el("div", "activity-location");
              locEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg> <span>' + cleanMarkdown(act.location) + '</span>';
              card.appendChild(locEl);
            }

            if (act.description) {
              var descWrap = el("div", "activity-description");
              descWrap.innerHTML = renderMd(act.description);
              card.appendChild(descWrap);
            }

            if (act.tip) {
              var tipBox = el("div", "activity-tip-box");
              tipBox.innerHTML = '<span>💡</span><div>' + renderMd(act.tip) + '</div>';
              card.appendChild(tipBox);
            }

            item.appendChild(card);
            timeline.appendChild(item);
          });

          chapterEl.appendChild(timeline);
          daysContainer.appendChild(chapterEl);
        });
      }
    }"""

new_render_part = """    // 3. Day Navigation Tabs
    if (dayNavTabs) {
      dayNavTabs.innerHTML = "";

      var totalDaysCount = parsed.days.length || parsed.daysCount || 3;
      var allTab = el("button", "day-tab active", "All Days (" + totalDaysCount + " Cards)");
      allTab.addEventListener("click", function () {
        setActiveDayTab(allTab, null);
      });
      dayNavTabs.appendChild(allTab);

      parsed.days.forEach(function (d) {
        var tab = el("button", "day-tab");
        tab.innerHTML = "Day " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum) + ' <span class="day-tab-count">(' + d.activities.length + ")</span>";
        tab.addEventListener("click", function () {
          setActiveDayTab(tab, "day-card-" + d.dayNum);
        });
        dayNavTabs.appendChild(tab);
      });
    }

    // 3.5 Populate Journey Flow Graph (Visual Timeline Track)
    if (journeyFlowTrack) {
      journeyFlowTrack.innerHTML = "";
      if (journeyGraphCount) {
        var totalDays = parsed.days.length || parsed.daysCount || 3;
        journeyGraphCount.textContent = totalDays + " Days Flow · " + Math.max(1, totalDays - 1) + " Nights Verified Route";
      }

      parsed.days.forEach(function (d, idx) {
        var nodeEl = el("div", "journey-node");
        nodeEl.id = "journey-node-" + d.dayNum;
        nodeEl.setAttribute("role", "button");
        nodeEl.setAttribute("tabindex", "0");
        nodeEl.setAttribute("title", "Jump to Day " + d.dayNum + ": " + cleanMarkdown(d.title));

        var dotWrap = el("div", "journey-node-dot-wrap");
        var ring = el("div", "journey-node-ring");
        var core = el("div", "journey-node-core");
        var num = el("span", "journey-node-num", (d.dayNum < 10 ? "0" + d.dayNum : "" + d.dayNum));
        dotWrap.appendChild(ring);
        dotWrap.appendChild(core);
        dotWrap.appendChild(num);
        nodeEl.appendChild(dotWrap);

        var content = el("div", "journey-node-content");
        var dayTag = el("div", "journey-node-day", "DAY " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum));
        var title = el("div", "journey-node-title", cleanMarkdown(d.title));
        var meta = el("div", "journey-node-meta", d.activities.length + " spots · ~" + Math.max(4, d.activities.length * 2) + "h");
        content.appendChild(dayTag);
        content.appendChild(title);
        content.appendChild(meta);
        nodeEl.appendChild(content);

        nodeEl.addEventListener("click", function () {
          focusDayCard(d.dayNum);
        });

        journeyFlowTrack.appendChild(nodeEl);

        // Connector segment if not last day
        if (idx < parsed.days.length - 1) {
          var segment = el("div", "journey-track-segment");
          var segLine = el("div", "journey-segment-line");
          var segIcon = el("div", "journey-segment-icon", "✈");
          segment.appendChild(segLine);
          segment.appendChild(segIcon);
          journeyFlowTrack.appendChild(segment);
        }
      });
    }

    if (btnViewAllDays) {
      btnViewAllDays.addEventListener("click", function () {
        setActiveDayTab(null, null);
      });
    }

    // 4. Day Cards Grid (Cards-wise display, exactly as many cards as days)
    if (daysContainer) {
      daysContainer.innerHTML = "";
      daysContainer.className = "day-cards-grid";

      if (parsed.days.length === 0) {
        var fallbackBlock = el("div", "itinerary-day-card fallback-card");
        fallbackBlock.innerHTML = renderMd(rawResult.itinerary || rawResult.answer);
        daysContainer.appendChild(fallbackBlock);
      } else {
        parsed.days.forEach(function (d, dIdx) {
          var cardEl = el("article", "itinerary-day-card day-chapter");
          cardEl.id = "day-card-" + d.dayNum;
          cardEl.setAttribute("data-day-num", d.dayNum);

          // Anchor for backward compatibility
          var anchor = el("div", "day-card-anchor");
          anchor.id = "day-chapter-" + d.dayNum;
          cardEl.appendChild(anchor);

          // Card Header
          var cHead = el("header", "day-card-header");
          
          var topBadgeRow = el("div", "day-card-top-row");
          var badgeWrap = el("div", "day-card-badge-wrap");
          var numBadge = el("span", "day-card-number", "DAY " + (d.dayNum < 10 ? "0" + d.dayNum : d.dayNum));
          var stepTag = el("span", "day-card-step-tag", "Milestone " + (dIdx + 1) + " of " + parsed.days.length);
          badgeWrap.appendChild(numBadge);
          badgeWrap.appendChild(stepTag);
          topBadgeRow.appendChild(badgeWrap);

          var actCountBadge = el("span", "day-card-count-badge", "✦ " + d.activities.length + " Experiences");
          topBadgeRow.appendChild(actCountBadge);
          cHead.appendChild(topBadgeRow);

          var cTitle = el("h3", "day-card-title", cleanMarkdown(d.title));
          cHead.appendChild(cTitle);

          if (d.synopsis) {
            var cSyn = el("p", "day-card-synopsis", d.synopsis);
            cHead.appendChild(cSyn);
          }

          // Mini Flow Progression Inside Card (Morning -> Afternoon -> Evening -> Night)
          var miniFlow = el("div", "day-mini-flow");
          var phases = [
            { label: "Morning", icon: "🌅" },
            { label: "Afternoon", icon: "☀️" },
            { label: "Evening", icon: "🌆" },
            { label: "Night", icon: "🌙" }
          ];
          phases.forEach(function (phase, pIdx) {
            var phaseDot = el("span", "day-flow-step");
            var hasAct = d.activities.some(function (act) {
              return act.time && act.time.toLowerCase().indexOf(phase.label.toLowerCase()) !== -1;
            });
            if (hasAct) phaseDot.classList.add("active");
            phaseDot.innerHTML = '<span class="flow-step-icon">' + phase.icon + '</span> <span class="flow-step-label">' + phase.label + '</span>';
            miniFlow.appendChild(phaseDot);
            if (pIdx < phases.length - 1) {
              var flowArrow = el("span", "day-flow-arrow", "›");
              miniFlow.appendChild(flowArrow);
            }
          });
          cHead.appendChild(miniFlow);

          cardEl.appendChild(cHead);

          // Activities Stack inside Card
          var actContainer = el("div", "day-card-activities");

          // Calculate day total cost if available
          var dayCostTotal = 0;
          var hasCost = false;

          d.activities.forEach(function (act) {
            var item = el("div", "day-activity-item");

            var slotHead = el("div", "day-activity-slot-head");
            var timePill = el("span", "activity-time-pill", act.time);
            slotHead.appendChild(timePill);

            var metaBadges = el("div", "activity-meta-badges");
            if (act.duration) {
              var durBadge = el("span", "activity-meta-badge");
              durBadge.innerHTML = '⏱️ ' + cleanMarkdown(act.duration);
              metaBadges.appendChild(durBadge);
            }
            if (act.cost) {
              var costBadge = el("span", "activity-meta-badge badge-cost");
              costBadge.innerHTML = '🎟️ ' + cleanMarkdown(act.cost);
              metaBadges.appendChild(costBadge);

              var numCostMatch = act.cost.match(/[\d\,]+/);
              if (numCostMatch) {
                var cNum = parseInt(numCostMatch[0].replace(/,/g, ""), 10);
                if (!isNaN(cNum)) {
                  dayCostTotal += cNum;
                  hasCost = true;
                }
              }
            }
            slotHead.appendChild(metaBadges);
            item.appendChild(slotHead);

            var actTitle = el("h4", "day-activity-title", cleanMarkdown(act.title));
            item.appendChild(actTitle);

            if (act.location) {
              var locEl = el("div", "day-activity-location");
              locEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"/></svg> <span>' + cleanMarkdown(act.location) + '</span>';
              item.appendChild(locEl);
            }

            if (act.description) {
              var descWrap = el("div", "day-activity-desc");
              descWrap.innerHTML = renderMd(act.description);
              item.appendChild(descWrap);
            }

            if (act.tip) {
              var tipBox = el("div", "day-activity-tip");
              tipBox.innerHTML = '<span>💡</span><div>' + renderMd(act.tip) + '</div>';
              item.appendChild(tipBox);
            }

            actContainer.appendChild(item);
          });

          cardEl.appendChild(actContainer);

          // Card Footer
          var cFoot = el("footer", "day-card-footer");
          var footLeft = el("div", "day-card-foot-left");
          footLeft.innerHTML = '<span>📍 ' + d.activities.length + ' Curated Spots</span> <span class="foot-sep">·</span> <span>⏱️ Full Day Pace</span>';
          cFoot.appendChild(footLeft);

          var footRight = el("div", "day-card-foot-right");
          if (hasCost && dayCostTotal > 0) {
            footRight.innerHTML = '<span class="day-cost-pill">💰 Day Outlay: <strong>₹' + dayCostTotal.toLocaleString("en-IN") + '</strong></span>';
          } else {
            footRight.innerHTML = '<span class="day-status-pill">✦ Milestone Active</span>';
          }
          cFoot.appendChild(footRight);

          cardEl.appendChild(cFoot);
          daysContainer.appendChild(cardEl);
        });
      }
    }"""

if old_render_part in js_content:
    js_content = js_content.replace(old_render_part, new_render_part)
    print("Replaced renderDashboard steps 3 and 4.")
else:
    print("Could not find old_render_part in js_content.")

# 4. Replace setActiveDayTab and add focusDayCard
old_tab_fn = """  function setActiveDayTab(activeTabEl, targetId) {
    document.querySelectorAll(".day-tab").forEach(function (t) { t.classList.remove("active"); });
    if (activeTabEl) activeTabEl.classList.add("active");

    if (!targetId) {
      document.querySelectorAll(".itinerary-day-block").forEach(function (b) { b.style.display = "block"; });
      window.scrollTo({ top: daysContainer.offsetTop - 140, behavior: "smooth" });
    } else {
      var target = $(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }"""

new_tab_fn = """  function focusDayCard(dayNum) {
    document.querySelectorAll(".journey-node").forEach(function (n) {
      n.classList.remove("active");
    });
    var targetNode = $("journey-node-" + dayNum);
    if (targetNode) targetNode.classList.add("active");

    var numStr = dayNum < 10 ? "0" + dayNum : "" + dayNum;
    document.querySelectorAll(".day-tab").forEach(function (t) {
      t.classList.remove("active");
      var text = t.textContent || "";
      if (text.indexOf("Day " + numStr) !== -1 || text.indexOf("Chapter " + numStr) !== -1 || text.indexOf(" " + numStr) !== -1) {
        t.classList.add("active");
      }
    });

    document.querySelectorAll(".itinerary-day-card, .itinerary-day-block").forEach(function (c) {
      c.style.display = "";
      c.classList.remove("card-pulse-active");
    });

    var card = $("day-card-" + dayNum) || $("day-chapter-" + dayNum);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("card-pulse-active");
      setTimeout(function () {
        card.classList.remove("card-pulse-active");
      }, 2500);
    }
  }

  function setActiveDayTab(activeTabEl, targetId) {
    document.querySelectorAll(".day-tab").forEach(function (t) { t.classList.remove("active"); });
    if (activeTabEl) activeTabEl.classList.add("active");

    if (!targetId) {
      document.querySelectorAll(".itinerary-day-card, .itinerary-day-block").forEach(function (b) {
        b.style.display = "";
        b.classList.remove("card-pulse-active");
      });
      document.querySelectorAll(".journey-node").forEach(function (n) {
        n.classList.remove("active");
      });
      var itinTarget = $("journeyGraphCard") || $("itinerarySection") || daysContainer;
      if (itinTarget) {
        window.scrollTo({ top: itinTarget.offsetTop - 120, behavior: "smooth" });
      }
    } else {
      var dMatch = targetId.match(/\d+/);
      if (dMatch) {
        focusDayCard(parseInt(dMatch[0], 10));
      } else {
        var target = $(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }"""

if old_tab_fn in js_content:
    js_content = js_content.replace(old_tab_fn, new_tab_fn)
    print("Replaced setActiveDayTab and added focusDayCard.")
else:
    print("Could not find old_tab_fn in js_content.")

# 5. Update viewDashboard and viewDossier toggle to handle journeyGraphCard
old_view_toggle = """        if (daysContainer) daysContainer.hidden = false;
        if (rawDossierWrap) rawDossierWrap.hidden = true;
      });

      viewDossierBtn.addEventListener("click", function () {
        viewDossierBtn.classList.add("active");
        viewDashboardBtn.classList.remove("active");
        hidePlannerScreen();
        if (daysContainer) daysContainer.hidden = true;
        if (rawDossierWrap) rawDossierWrap.hidden = false;"""

new_view_toggle = """        if (daysContainer) daysContainer.hidden = false;
        if (journeyGraphCard) journeyGraphCard.hidden = false;
        if (rawDossierWrap) rawDossierWrap.hidden = true;
      });

      viewDossierBtn.addEventListener("click", function () {
        viewDossierBtn.classList.add("active");
        viewDashboardBtn.classList.remove("active");
        hidePlannerScreen();
        if (daysContainer) daysContainer.hidden = true;
        if (journeyGraphCard) journeyGraphCard.hidden = true;
        if (rawDossierWrap) rawDossierWrap.hidden = false;"""

if old_view_toggle in js_content:
    js_content = js_content.replace(old_view_toggle, new_view_toggle)
    print("Replaced view toggle logic.")
else:
    print("Could not find old_view_toggle in js_content.")

with open(js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print("Saved frontend/static/js/itinerary.js.")

# Copy to dist
dist_js = os.path.join(BASE_DIR, "dist", "static", "js", "itinerary.js")
shutil.copy(js_path, dist_js)
print("Copied to dist/static/js/itinerary.js.")
