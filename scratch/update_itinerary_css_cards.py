# -*- coding: utf-8 -*-
"""
Update frontend/static/css/itinerary.css with Journey Route Graph & Day Cards Grid styles.
"""
import os
import shutil

BASE_DIR = r"c:\Users\Lenovo\Desktop\TravelBrain-Multi-Agent-AI-Travel-Planner"
css_path = os.path.join(BASE_DIR, "frontend", "static", "css", "itinerary.css")

with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

target_str = """.section-title {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}"""

replacement_str = """.section-title {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* ==================== JOURNEY FLOW GRAPH & LEGEND ==================== */

.itinerary-graph-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-dim);
}

.legend-dot.active {
  background: var(--gold-primary);
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.8);
}

.legend-line {
  width: 22px;
  height: 2px;
  background: linear-gradient(90deg, var(--gold-primary), var(--blue-sky));
  border-radius: 2px;
}

.legend-badge {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid var(--border-gold);
  color: var(--gold-light);
}

.journey-graph-card {
  background: rgba(8, 16, 28, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(85, 184, 232, 0.2);
  border-radius: var(--radius-xl);
  padding: 22px 24px;
  margin-bottom: 32px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
  position: relative;
  overflow: hidden;
}

.journey-graph-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--gold-primary) 30%, var(--blue-sky) 70%, transparent 100%);
  opacity: 0.85;
}

.journey-graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-wrap: wrap;
  gap: 12px;
}

.journey-graph-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.journey-graph-tag {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--gold-primary);
  background: rgba(212, 175, 55, 0.12);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(212, 175, 55, 0.25);
}

.journey-graph-count {
  font-size: 0.88rem;
  font-weight: 600;
  color: #FFFFFF;
}

.journey-graph-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-graph-view {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-graph-view:hover,
.btn-graph-view.active {
  background: rgba(212, 175, 55, 0.18);
  border-color: var(--gold-primary);
  color: var(--gold-light);
}

.journey-flow-track-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 10px 4px 16px;
}

.journey-flow-track-wrap::-webkit-scrollbar {
  height: 6px;
}

.journey-flow-track-wrap::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-full);
}

.journey-flow-track-wrap::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.35);
  border-radius: var(--radius-full);
}

.journey-flow-track-wrap::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.65);
}

.journey-flow-track {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: max-content;
  gap: 0;
  padding: 4px 6px;
}

.journey-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 140px;
  max-width: 190px;
  user-select: none;
}

.journey-node:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateY(-3px);
}

.journey-node.active {
  background: rgba(212, 175, 55, 0.12);
  border-color: var(--gold-primary);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
  transform: translateY(-2px);
}

.journey-node-dot-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.journey-node-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(212, 175, 55, 0.4);
  transition: all 0.25s ease;
}

.journey-node:hover .journey-node-ring {
  border-color: var(--gold-primary);
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
}

.journey-node.active .journey-node-ring {
  border-color: var(--gold-primary);
  box-shadow: 0 0 18px rgba(212, 175, 55, 0.8);
}

.journey-node-core {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #0A1424;
  transition: all 0.25s ease;
}

.journey-node.active .journey-node-core {
  background: linear-gradient(135deg, var(--gold-primary), #B8860B);
}

.journey-node-num {
  position: relative;
  z-index: 2;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--gold-light);
  transition: color 0.2s ease;
}

.journey-node.active .journey-node-num {
  color: #050B14;
  font-weight: 900;
}

.journey-node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.journey-node-day {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--gold-primary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.journey-node-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.3;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.journey-node.active .journey-node-title {
  color: var(--gold-light);
}

.journey-node-meta {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.journey-track-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 60px;
  flex-shrink: 0;
  margin-top: -38px;
}

.journey-segment-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.4), rgba(85, 184, 232, 0.6), rgba(212, 175, 55, 0.4));
  border-radius: 2px;
}

.journey-segment-icon {
  position: absolute;
  font-size: 0.72rem;
  color: var(--blue-sky);
  animation: flightPulse 2.5s ease-in-out infinite;
}

@keyframes flightPulse {
  0%, 100% {
    transform: translateX(-4px);
    opacity: 0.6;
  }
  50% {
    transform: translateX(4px);
    opacity: 1;
    filter: drop-shadow(0 0 6px rgba(85, 184, 232, 0.8));
  }
}

/* ==================== DAY CARDS GRID (CARDS-WISE DISPLAY) ==================== */

.day-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 26px;
  align-items: stretch;
  margin-bottom: 40px;
}

.itinerary-day-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 26px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-subtle);
}

.itinerary-day-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--gold-primary) 0%, var(--blue-sky) 50%, var(--gold-primary) 100%);
  opacity: 0.75;
}

.itinerary-day-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  background: var(--bg-card-hover);
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.1);
}

.itinerary-day-card.card-pulse-active {
  border-color: var(--gold-primary) !important;
  box-shadow: 0 0 28px rgba(212, 175, 55, 0.6), inset 0 0 12px rgba(212, 175, 55, 0.15) !important;
  transform: scale(1.015);
}

.day-card-anchor {
  position: absolute;
  top: -120px;
  left: 0;
  height: 1px;
  width: 1px;
  pointer-events: none;
}

.day-card-header {
  margin-bottom: 18px;
}

.day-card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.day-card-badge-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.day-card-number {
  background: linear-gradient(135deg, var(--gold-primary), #B8860B);
  color: #050B14;
  font-family: var(--font-mono);
  font-weight: 800;
  font-size: 0.82rem;
  padding: 5px 13px;
  border-radius: var(--radius-full);
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.day-card-step-tag {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-weight: 500;
}

.day-card-count-badge {
  font-size: 0.74rem;
  color: var(--blue-sky);
  background: rgba(85, 184, 232, 0.12);
  border: 1px solid rgba(85, 184, 232, 0.25);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.day-card-title {
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.25;
  margin-bottom: 10px;
}

.day-card-synopsis {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.55;
  margin-bottom: 14px;
}

.day-mini-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.28);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.day-flow-step {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--text-dim);
  opacity: 0.6;
}

.day-flow-step.active {
  color: var(--gold-light);
  opacity: 1;
  font-weight: 600;
}

.day-flow-arrow {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.25);
}

.day-card-activities {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.day-activity-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  transition: all 0.2s ease;
}

.day-activity-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(212, 175, 55, 0.25);
}

.day-activity-slot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.day-activity-title {
  font-family: var(--font-display);
  font-size: 0.96rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 6px;
  line-height: 1.35;
}

.day-activity-location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: var(--blue-sky);
  margin-bottom: 8px;
}

.day-activity-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.day-activity-desc p {
  margin-bottom: 4px;
}

.day-activity-desc p:last-child {
  margin-bottom: 0;
}

.day-activity-tip {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 10px;
  background: rgba(212, 175, 55, 0.08);
  border-left: 2px solid var(--gold-primary);
  border-radius: 4px;
  font-size: 0.76rem;
  color: #F3E5AB;
}

.day-card-footer {
  border-top: 1px solid var(--border-subtle);
  padding-top: 14px;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 10px;
}

.day-card-foot-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.foot-sep {
  opacity: 0.4;
}

.day-cost-pill {
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--gold-light);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
}

.day-status-pill {
  color: var(--blue-sky);
  font-size: 0.75rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .day-cards-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .itinerary-day-card {
    padding: 20px;
  }
  .journey-node {
    min-width: 120px;
    padding: 8px 10px;
  }
  .journey-track-segment {
    width: 40px;
  }
}"""

if target_str in css_content:
    css_content = css_content.replace(target_str, replacement_str)
    with open(css_path, "w", encoding="utf-8") as f:
        f.write(css_content)
    print("Updated frontend/static/css/itinerary.css successfully.")
else:
    print("Target string not found in itinerary.css.")

# Copy to dist
dist_css = os.path.join(BASE_DIR, "dist", "static", "css", "itinerary.css")
shutil.copy(css_path, dist_css)
print("Copied to dist/static/css/itinerary.css.")
