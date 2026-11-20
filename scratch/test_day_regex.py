import re

cases = [
    'Day 1: Arrival in Chennai',
    'Day 01: Arrival in Chennai',
    '**Day 1: Arrival in Chennai**',
    '**Day 1** - Arrival in Chennai',
    '**Day 1**: Arrival in Chennai',
    '### Day 1: Arrival in Chennai',
    '#### Day 1 - Arrival in Chennai',
    '### Day 1 (Chennai): Arrival & Temples',
    '- **Day 1: Arrival in Chennai**',
    '* **Day 1: Arrival in Chennai**',
    '1. **Day 1: Arrival in Chennai**',
    '* Day 1: Arrival in Chennai',
    '- Day 1 - Arrival in Chennai',
    'Day 1 - Chennai Exploration',
    '**Day 1 (20 Nov)**: Arrival in Chennai'
]

pattern = re.compile(r'(?:^|\n)\s*(?:[-*•]|\d+\.)?\s*(?:#{1,4}\s*)?(?:\*{1,2})?Day\s*0?(\d+)(?:[:\s\-\*–—\(\)]|\b)(.*?)(?:\n|$)', re.IGNORECASE)

all_ok = True
for c in cases:
    m = pattern.search(c)
    if m:
        num = m.group(1)
        raw_title = m.group(2).strip(' *:-–—()#')
        print(f'SUCCESS: Day {num} -> "{raw_title}" from: "{c}"')
    else:
        print(f'FAIL: "{c}"')
        all_ok = False

print('All passed:', all_ok)
