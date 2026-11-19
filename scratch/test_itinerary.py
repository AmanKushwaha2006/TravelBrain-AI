import html.parser
import re

with open("frontend/templates/itinerary.html", "r", encoding="utf-8") as f:
    html_content = f.read()

elements_to_check = [
    "tripHero", "heroCoverBg", "heroTitle", "heroSubtitle", "heroPrologue",
    "heroSummaryLine", "heroTagsRow", "heroQuickJumps", "summaryCardsGrid",
    "dayNavWrapper", "dayNavTabs", "daysContainer", "highlightsSection",
    "highlightsGrid", "foodSection", "foodGrid", "weatherSection",
    "weatherAdvice", "weatherCardsRow", "recommendationsGrid",
    "budgetBreakdownGrid", "budgetTotalNum", "logisticsSection"
]

all_found = True
for el_id in elements_to_check:
    pattern = rf'id=[\'"]{el_id}[\'"]'
    if re.search(pattern, html_content):
        print(f"✓ Found #{el_id}")
    else:
        print(f"✗ MISSING #{el_id}")
        all_found = False

if all_found:
    print("\nALL CRITICAL DOM HOOKS PRESENT!")
else:
    print("\nSome hooks missing, check output.")
