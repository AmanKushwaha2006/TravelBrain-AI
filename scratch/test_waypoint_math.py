def ease(t):
    return t * t * (3 - 2 * t)

waypoints = [
    {"p": 0.00, "pos": [2.2, 6.2, 0.0], "rot": [0.03, -0.52, 0.07], "scale": 1.0},
    {"p": 0.20, "pos": [3.8, 6.8, -1.0], "rot": [0.08, -0.65, 0.18], "scale": 0.95},
    {"p": 0.50, "pos": [3.2, 6.4, -0.5], "rot": [0.02, -0.44, -0.04], "scale": 1.05},
    {"p": 0.75, "pos": [4.2, 5.6, -1.8], "rot": [-0.04, -0.58, -0.14], "scale": 0.90},
    {"p": 1.00, "pos": [2.5, 5.0, -1.0], "rot": [0.02, -0.50, 0.04], "scale": 0.85}
]

def get_pose(p):
    p = max(0.0, min(1.0, p))
    i = 0
    while i < len(waypoints) - 2 and p > waypoints[i+1]["p"]:
        i += 1
    a, b = waypoints[i], waypoints[i+1]
    t = ease((p - a["p"]) / (b["p"] - a["p"]))
    pos = [a["pos"][j] + (b["pos"][j] - a["pos"][j]) * t for j in range(3)]
    rot = [a["rot"][j] + (b["rot"][j] - a["rot"][j]) * t for j in range(3)]
    scale = a["scale"] + (b["scale"] - a["scale"]) * t
    return pos, rot, scale

for test_p in [0.0, 0.1, 0.25, 0.5, 0.75, 1.0]:
    pos, rot, scale = get_pose(test_p)
    print(f"p={test_p:.2f} -> pos={pos[0]:.2f}, {pos[1]:.2f}, {pos[2]:.2f} | rot={rot[0]:.2f}, {rot[1]:.2f}, {rot[2]:.2f} | scale={scale:.2f}")
