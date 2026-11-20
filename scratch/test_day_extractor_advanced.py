import re

def clean_markdown(text):
    text = re.sub(r'[*_#`~]', '', text)
    return text.strip()

def extract_days_from_text(text, dest_name="Tamil Nadu"):
    day_regex = re.compile(r'(?:^|\n)\s*(?:[-*•]|\d+\.)?\s*(?:#{1,4}\s*)?(?:\*{1,2})?Day\s*0?(\d+)(?:[:\s\-\*–—\(\)]|\b)(.*?)(?:\n|$)', re.IGNORECASE)
    
    matches = []
    for m in day_regex.finditer(text):
        matches.append({
            'day_num': int(m.group(1)),
            'raw_title': m.group(2).strip(),
            'start': m.start()
        })
        
    if not matches:
        return []
        
    days = []
    for i, m in enumerate(matches):
        start_idx = m['start']
        end_idx = matches[i + 1]['start'] if i + 1 < len(matches) else len(text)
        block = text[start_idx:end_idx].strip()
        
        if i == len(matches) - 1:
            next_sec = re.search(r'\n\s*(?:#{1,4}\s+|\d+\.\s+)(?:Estimated Budget|Budget|Final Recommendations|Recommendations|Local Tips)', block, re.IGNORECASE)
            if next_sec:
                block = block[:next_sec.start()].strip()
                
        day_num = m['day_num']
        day_title = clean_markdown(m['raw_title']).strip(' *:-–—()#')
        if not day_title:
            day_title = "Exploration & Sightseeing"
            
        days.append({
            'dayNum': day_num,
            'title': day_title,
            'block_len': len(block),
            'first_line': block.split('\n')[0]
        })
        
    return days

# Test with 3 messy formats
test_1 = """
1. Executive Summary
Tamil Nadu is great.

4. Day-by-Day Itinerary

* **Day 1: Arrival in Chennai & Historic Temples**
- Morning: Kapaleeshwarar Temple
- Afternoon: Marina Beach
- Evening: Street food tour

* **Day 2: Coastal Mahabalipuram**
- Morning: Shore Temple
- Afternoon: Pancha Rathas
- Evening: Seafood dinner

* **Day 3: Kanchipuram Silk & Sacred Shrines**
- Morning: Kailasanathar Temple
- Afternoon: Silk weaving workshops
- Evening: Return to Chennai

5. Estimated Budget
Total: ₹35,000
"""

test_2 = """
### Day 1 - Arrival & Check-in
Morning: Land at airport.
Afternoon: Relax.

### Day 2 - Cultural Safari
Morning: Temple visit.
"""

test_3 = """
- Day 01: Welcome to Tamil Nadu
Morning: Transfer to hotel.

- Day 02: Temple Trail
Morning: Heritage walk.
"""

for idx, t in enumerate([test_1, test_2, test_3]):
    res = extract_days_from_text(t)
    print(f"Test {idx+1} extracted {len(res)} days:")
    for d in res:
        print(f"  Day {d['dayNum']}: '{d['title']}' (Length: {d['block_len']})")
