# -*- coding: utf-8 -*-
"""
Script to update Itinerary HTML, JS, and CSS with Journey Flow Graph and Day Cards Grid.
"""
import re
import os
import shutil

BASE_DIR = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner"

# 1. Update frontend/templates/itinerary.html
html_path = os.path.join(BASE_DIR, "frontend", "templates", "itinerary.html")
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

old_html_section = """      <!-- SECTION 6 & 7: DAY-BY-DAY ITINERARY CHAPTERS -->
      <section class="itinerary-section">
        <div class="section-title-wrap">
          <div>
            <div class="section-kicker">Chronological Timeline</div>
            <h2 class="section-title">Day-by-Day Itinerary</h2>
          </div>
        </div>

        <div id="daysContainer">
          <!-- Day blocks and activity timeline injected dynamically -->
        </div>
      </section>"""

new_html_section = """      <!-- SECTION 6 & 7: DAY-BY-DAY ITINERARY CARDS & JOURNEY FLOW GRAPH -->
      <section class="itinerary-section" id="itinerarySection">
        <div class="section-title-wrap">
          <div>
            <div class="section-kicker">Chronological Journey Architecture</div>
            <h2 class="section-title">Day-by-Day Journey Flow</h2>
          </div>
          <div class="itinerary-graph-legend">
            <span class="legend-item"><span class="legend-dot active"></span> Active Milestone</span>
            <span class="legend-item"><span class="legend-line"></span> Route Connection</span>
            <span class="legend-item"><span class="legend-badge">₹ INR</span> Verified Costs</span>
          </div>
        </div>

        <!-- Visual Journey Route Graph (Horizontal Milestone Track) -->
        <div class="journey-graph-card" id="journeyGraphCard">
          <div class="journey-graph-header">
            <div class="journey-graph-meta">
              <span class="journey-graph-tag">✦ ROUTE TIMELINE GRAPH</span>
              <span class="journey-graph-count" id="journeyGraphCount">Day-by-Day Progression</span>
            </div>
            <div class="journey-graph-controls">
              <button type="button" class="btn-graph-view active" id="btnViewAllDays" title="Show all cards">All Day Cards</button>
            </div>
          </div>
          <div class="journey-flow-track-wrap" id="journeyFlowTrackWrap">
            <div class="journey-flow-track" id="journeyFlowTrack">
              <!-- Dynamically populated day nodes with connecting graph lines -->
            </div>
          </div>
        </div>

        <!-- Day Cards Grid (Cards wise show karo, jitne din utne cards) -->
        <div class="day-cards-grid" id="daysContainer">
          <!-- Individual Day Cards injected dynamically -->
        </div>
      </section>"""

if old_html_section in html_content:
    html_content = html_content.replace(old_html_section, new_html_section)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print("Updated frontend/templates/itinerary.html successfully.")
else:
    print("Could not find old_html_section in itinerary.html; checking regex...")
    pattern = r'<section class="itinerary-section">.*?<div id="daysContainer">.*?</div>\s*</section>'
    if re.search(pattern, html_content, re.DOTALL):
        html_content = re.sub(pattern, new_html_section, html_content, count=1, flags=re.DOTALL)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print("Updated frontend/templates/itinerary.html via regex.")
    else:
        print("Regex failed to match itinerary section.")

# Copy to dist
dist_itin = os.path.join(BASE_DIR, "dist", "itinerary.html")
dist_trip = os.path.join(BASE_DIR, "dist", "trip-plan.html")
shutil.copy(html_path, dist_itin)
shutil.copy(html_path, dist_trip)
print("Copied HTML to dist/itinerary.html and dist/trip-plan.html.")
