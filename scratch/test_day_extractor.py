import re

full_text = """
1. Executive Summary & Best Time to Visit
Tamil Nadu, the southern jewel of India...

2. Flight Logistics
Air India ...

3. Handpicked Stays & Accommodations (INR ₹)
The Leela Palace ...

4. Day-by-Day Itinerary

Day 1: Arrival in Chennai & Heritage Temples
- Morning: Arrive at Chennai International Airport and check into hotel.
- Afternoon: Visit the historic Kapaleeshwarar Temple in Mylapore.
- Evening: Stroll along the famous Marina Beach and savor hot sundal.

Day 2: Coastal Mahabalipuram Exploration
- Morning: Drive scenic East Coast Road (ECR) to Mahabalipuram.
- Afternoon: Marvel at the UNESCO Shore Temple and Pancha Rathas.
- Evening: Relax at a coastal café overlooking the Bay of Bengal.

Day 3: Sacred Temples of Kanchipuram
- Morning: Travel to Kanchipuram, the City of Thousand Temples.
- Afternoon: Visit Kailasanathar and Ekambareswarar temples.
- Evening: Visit authentic silk weaver workshops.

Day 4: Thanjavur & The Great Living Chola Temples
- Morning: Proceed to Thanjavur.
- Afternoon: Stand in awe before Brihadisvara Temple (Big Temple).
- Evening: Discover Thanjavur art and bronze doll craftsmanship.

Day 5: Madurai Meenakshi & Cultural Departure
- Morning: Arrive in Madurai, explore the ancient temple corridors.
- Afternoon: Visit Thirumalai Nayakkar Mahal.
- Evening: Experience the sacred evening temple procession and depart.

5. Estimated Budget (Itemized & Total in INR ₹)
Total: ₹45,000
"""

day_pattern = re.compile(r'(?:^|\n)\s*(?:[-*•]|\d+\.)?\s*(?:#{1,4}\s*)?(?:\*{1,2})?Day\s*0?(\d+)(?:[:\s\-\*–—\(\)]|\b)(.*?)(?:\n|$)', re.IGNORECASE)

matches = list(day_pattern.finditer(full_text))
print(f"Total day matches found: {len(matches)}")

days = []
for idx, m in enumerate(matches):
    start = m.start()
    end = matches[idx + 1].start() if idx + 1 < len(matches) else len(full_text)
    block = full_text[start:end].strip()
    day_num = int(m.group(1))
    title = m.group(2).strip(' *:-–—()#')
    print(f"Day {day_num}: Title='{title}', Block length={len(block)}")
    days.append({'dayNum': day_num, 'title': title, 'content': block})

print(f"Successfully extracted {len(days)} days!")
