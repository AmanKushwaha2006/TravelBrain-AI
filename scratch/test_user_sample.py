import re
import json

sample_user_output = """
1. Executive Summary & Best Time to Visit
Tamil Nadu, the southern jewel of India, blends ancient temples, colonial architecture, pristine beaches, and vibrant street-food culture. The state's diverse geography offers a mild winter (November-March) with temperatures ranging from 15°C to 28°C, making it the ideal window for travel. The monsoon season (June-September) brings lush greenery but can dampen outdoor plans, while the hot summer months (April-May) see temperatures soaring above 38°C.
Duration: 5 days
Pace & style: Balanced & Scenic
Total estimated cost: ₹42,500

2. Flight Logistics
Airline | Flight Route | Departure - Arrival | Duration | Round-Trip Fare (₹)
Air India | Lucknow (LKO) -> Chennai (MAA) | 07:30 - 11:00 | 3h30m | ₹12,500
IndiGo | Lucknow (LKO) -> Chennai (MAA) | 09:45 - 13:15 | 3h30m | ₹11,200
SpiceJet | Lucknow (LKO) -> Chennai (MAA) | 15:00 - 18:30 | 3h30m | ₹10,800
Vistara | Lucknow (LKO) -> Chennai (MAA) | 06:00 - 09:30 | 3h30m | ₹13,400
All fares include taxes and fees; prices are approximate and subject to change.

3. Handpicked Stays & Accommodations (INR ₹)
Hotel / Resort | Category / Style | Neighborhood | Tariff / Night (₹)
The Leela Palace Chennai | Luxury Seaside | R.A. Puram | ₹18,000/night
Taj Coromandel | Boutique Heritage | Nungambakkam | ₹14,500/night
Hotel Royal Value | Value Comfort | Mylapore | ₹5,500/night

4. Day-by-Day Itinerary

Day 1: Arrival in Chennai & Heritage Temples
- **Morning**: Land at Chennai International Airport. Transfer to Mylapore and check into your stay.
- **Afternoon**: Marvel at the Dravidian gopuram of the 7th-century Kapaleeshwarar Temple.
- **Evening**: Catch the golden sunset breeze at Marina Beach, sampling freshly roasted groundnuts and sundal.

Day 2: Coastal Mahabalipuram Heritage Trail
- **Morning**: Take a private morning drive along scenic East Coast Road (ECR) to UNESCO World Heritage site Mahabalipuram.
- **Afternoon**: Explore the monolithic Shore Temple, Pancha Rathas, and the gravity-defying Krishna's Butterball.
- **Evening**: Enjoy fresh coastal seafood curry overlooking the Bay of Bengal before returning to Chennai.

Day 3: Sacred Kanchipuram Silk & Ancient Shrines
- **Morning**: Journey to Kanchipuram, celebrated worldwide for handcrafted mulberry silk sarees.
- **Afternoon**: Explore Ekambareswarar Temple and the intricate sandstone carvings of Kailasanathar Temple.
- **Evening**: Visit live artisan handloom weaving cooperative centers.

Day 4: Great Living Chola Temples in Thanjavur
- **Morning**: Scenic morning transit to the ancient Cauvery delta capital of Thanjavur.
- **Afternoon**: Stand beneath the towering vimana of the UNESCO-inscribed Brihadisvara Temple (Big Temple).
- **Evening**: Discover Tanjore glass paintings and royal Maratha palace library archives.

Day 5: Madurai Meenakshi Amman & Cultural Finale
- **Morning**: Arrive in Madurai, exploring the bustling market corridors surrounding the Meenakshi Temple.
- **Afternoon**: Tour the Indo-Saracenic pillars of Thirumalai Nayakkar Mahal.
- **Evening**: Experience the sacred night chariot ceremony at Meenakshi Temple before departure.

5. Weather Information
Mild winter conditions with pleasant mornings and cool evening breezes. Temperature: 22°C - 29°C.

6. Estimated Budget (Itemized & Total in Indian Rupees INR, ₹)
Category | Item | Estimated Cost (₹)
Flights | Return Flights (LKO - MAA) | ₹22,400
Lodging | 4 Nights Boutique Stays | ₹14,000
Local Transit | Private Cab & Drivers | ₹6,500
Dining & Food | Authentic Tamil Thalis & Street Food | ₹4,200
Entry Tickets | Monuments & Temple Passes | ₹1,500
Total | Total Estimated Trip Outlay | ₹48,600

7. Final Recommendations & Local Tips
- Carry lightweight cotton wear and modest clothing for sacred temple complexes.
- Keep modest cash reserves for temple counter offerings and coconut water stalls.
"""

def test_parse(text):
    # Test section split
    known_headers = [
      ("summary", re.compile(r'(?:Trip Summary|Overview|Introduction|Executive Summary|Destination Overview|Summary)', re.I)),
      ("flights", re.compile(r'(?:Flight|Transit|Airfare|Logistics|Aviation)', re.I)),
      ("hotels", re.compile(r'(?:Hotel|Stay|Accommodations|Lodging|Resort)', re.I)),
      ("weather", re.compile(r'(?:Weather|Climate|Season|Meteorology)', re.I)),
      ("itinerary", re.compile(r'(?:Day[- ]by[- ]Day|Daily Schedule|Itinerary|Travel Plan|Tour Plan|Sightseeing Plan)', re.I)),
      ("budget", re.compile(r'(?:Estimated Budget|Budget Breakdown|Costs|Tariff|Financial Estimates|Expenses)', re.I)),
      ("recommendations", re.compile(r'(?:Final Recommendations|Recommendations|Local Tips|Travel Tips|Practical Tips|Actionable Advice)', re.I))
    ]

    raw_sections = re.split(r'(?=\n#{1,4}\s+|\n\*{0,2}\d+\.\s+)', text)
    sections = {}
    for chunk in raw_sections:
        lines = chunk.strip().split("\n")
        header_line = lines[0] if lines else ""
        for key, rx in known_headers:
            if rx.search(header_line):
                sections[key] = chunk
                break
                
    print("Identified sections:", list(sections.keys()))
    
    # Test day extraction
    day_regex = re.compile(r'(?:^|\n)\s*(?:[-*•]|\d+\.)?\s*(?:#{1,4}\s*)?(?:\*{1,2})?Day\s*0?(\d+)(?:[:\s\-\*–—\(\)]|\b)(.*?)(?:\n|$)', re.IGNORECASE)
    
    matches = list(day_regex.finditer(text))
    print(f"Total day matches found: {len(matches)}")
    
    days = []
    for i, m in enumerate(matches):
        start_idx = m.start()
        end_idx = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        block = text[start_idx:end_idx].strip()
        
        if i == len(matches) - 1:
            next_sec = re.search(r'\n\s*(?:#{1,4}\s+|\d+\.\s+)(?:Estimated Budget|Budget|Final Recommendations|Recommendations|Local Tips|Weather)', block, re.IGNORECASE)
            if next_sec:
                block = block[:next_sec.start()].strip()
                
        d_num = int(m.group(1))
        d_title = re.sub(r'[*_#`~]', '', m.group(2)).strip(' *:-–—()#')
        days.append({'day': d_num, 'title': d_title, 'len': len(block)})
        
    return sections, days

secs, d_list = test_parse(sample_user_output)
for d in d_list:
    print(f"  Day {d['day']}: {d['title']} ({d['len']} chars)")
