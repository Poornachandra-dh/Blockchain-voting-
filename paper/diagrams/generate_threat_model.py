#!/usr/bin/env python3
"""
AegisVote — Threat Model & Security Mitigation Diagram
Publication-quality figure for IEEE / MDPI research paper.
Shows adversary capabilities and the cryptographic countermeasures.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np
import os

DPI = 300
FIG_W, FIG_H = 16, 14
OUTPUT = os.path.join(os.path.dirname(__file__), "fig_threat_model.png")

C = {
    "red": "#C62828", "red_bg": "#FFEBEE",
    "green": "#2E7D32", "green_bg": "#E8F5E9",
    "blue": "#1565C0", "blue_bg": "#E3F2FD",
    "orange": "#E65100", "orange_bg": "#FFF3E0",
    "purple": "#6A1B9A", "purple_bg": "#F3E5F5",
    "text": "#212121", "gray": "#757575",
    "arrow_attack": "#D32F2F", "arrow_defense": "#388E3C",
}

# ─── Threat definitions ──────────────────────────────────────────────
THREATS = [
    {
        "name": "T1: Double Voting",
        "desc": "Malicious voter submits\nmultiple ballots",
        "pos": (2.5, 11.5),
        "mitigation": "Credential-Bound\nDeterministic Nullifier\nNF = HMAC(skᵥ, election_id)",
        "mit_pos": (8.5, 11.5),
        "result": "100% Rejection\n(500/500 attacks blocked)",
        "res_pos": (13.5, 11.5),
    },
    {
        "name": "T2: Ballot Stuffing",
        "desc": "Inject out-of-range vector\ne.g., [100, 0, 0, 0]",
        "pos": (2.5, 9.5),
        "mitigation": "NIZK 1-of-K CDS94\nΣ-Protocol Proof\n∀k: vₖ ∈ {0,1}, Σvₖ = 1",
        "mit_pos": (8.5, 9.5),
        "result": "100% Rejection\n(500/500 attacks blocked)",
        "res_pos": (13.5, 9.5),
    },
    {
        "name": "T3: Vote Deanonymization",
        "desc": "Link encrypted ballot\nback to voter identity",
        "pos": (2.5, 7.5),
        "mitigation": "Paillier Homomorphic\nEncryption + Blinded\nCredential Air-Gap",
        "mit_pos": (8.5, 7.5),
        "result": "Semantic Security\n(IND-CPA under DCR)",
        "res_pos": (13.5, 7.5),
    },
    {
        "name": "T4: Single-Authority\nKey Compromise",
        "desc": "Corrupt EC decrypts\nvotes during election",
        "pos": (2.5, 5.5),
        "mitigation": "Shamir (2,3) Threshold\nSecret Sharing across\n3 Sovereign Organizations",
        "mit_pos": (8.5, 5.5),
        "result": "No single party\nholds decryption key",
        "res_pos": (13.5, 5.5),
    },
    {
        "name": "T5: Tally Manipulation",
        "desc": "Modify vote counts\nduring aggregation",
        "pos": (2.5, 3.5),
        "mitigation": "Homomorphic Aggregation\non Blockchain + Merkle\nProof Verification",
        "mit_pos": (8.5, 3.5),
        "result": "O(log₂ N) verifiable\n6-Point Consortium Audit",
        "res_pos": (13.5, 3.5),
    },
]

fig, ax = plt.subplots(1, 1, figsize=(FIG_W, FIG_H))
ax.set_xlim(0, FIG_W)
ax.set_ylim(2.0, FIG_H + 0.5)
ax.set_aspect('equal')
ax.axis('off')

# Title
ax.text(FIG_W/2, FIG_H + 0.1,
        "AegisVote: Threat Model & Cryptographic Countermeasures",
        fontsize=18, fontweight='bold', ha='center', va='top', color=C["text"])

# Column headers
headers = [
    ("ATTACK VECTOR", 2.5, C["red"]),
    ("CRYPTOGRAPHIC COUNTERMEASURE", 8.5, C["blue"]),
    ("SECURITY OUTCOME", 13.5, C["green"]),
]
for text, x, color in headers:
    box = FancyBboxPatch(
        (x - 2.0, 12.8), 4.0, 0.8,
        boxstyle="round,pad=0.1", linewidth=2.5,
        edgecolor=color, facecolor='white', zorder=10
    )
    ax.add_patch(box)
    ax.text(x, 13.2, text, fontsize=11, fontweight='bold', color=color,
            ha='center', va='center', zorder=11)

# Draw each threat row
for t in THREATS:
    # Attack box (red)
    box = FancyBboxPatch(
        (t["pos"][0] - 2.0, t["pos"][1] - 0.75), 4.0, 1.5,
        boxstyle="round,pad=0.12", linewidth=2.0,
        edgecolor=C["red"], facecolor=C["red_bg"], zorder=5
    )
    ax.add_patch(box)
    ax.text(t["pos"][0], t["pos"][1] + 0.35, t["name"],
            fontsize=9, fontweight='bold', color=C["red"],
            ha='center', va='center', zorder=6)
    ax.text(t["pos"][0], t["pos"][1] - 0.2, t["desc"],
            fontsize=7.5, color=C["gray"], ha='center', va='center', zorder=6)

    # Mitigation box (blue)
    box = FancyBboxPatch(
        (t["mit_pos"][0] - 2.2, t["mit_pos"][1] - 0.75), 4.4, 1.5,
        boxstyle="round,pad=0.12", linewidth=2.0,
        edgecolor=C["blue"], facecolor=C["blue_bg"], zorder=5
    )
    ax.add_patch(box)
    ax.text(t["mit_pos"][0], t["mit_pos"][1], t["mitigation"],
            fontsize=8, fontweight='bold', color=C["blue"],
            ha='center', va='center', zorder=6, linespacing=1.4)

    # Result box (green)
    box = FancyBboxPatch(
        (t["res_pos"][0] - 2.0, t["res_pos"][1] - 0.75), 4.0, 1.5,
        boxstyle="round,pad=0.12", linewidth=2.0,
        edgecolor=C["green"], facecolor=C["green_bg"], zorder=5
    )
    ax.add_patch(box)
    ax.text(t["res_pos"][0], t["res_pos"][1], t["result"],
            fontsize=8.5, fontweight='bold', color=C["green"],
            ha='center', va='center', zorder=6, linespacing=1.4)

    # Arrows: Attack → Mitigation → Result
    ax.annotate('', xy=(t["mit_pos"][0] - 2.2, t["pos"][1]),
                xytext=(t["pos"][0] + 2.0, t["pos"][1]),
                arrowprops=dict(arrowstyle='->', color=C["arrow_attack"],
                                lw=2.0, connectionstyle='arc3,rad=0'), zorder=4)
    ax.annotate('', xy=(t["res_pos"][0] - 2.0, t["mit_pos"][1]),
                xytext=(t["mit_pos"][0] + 2.2, t["mit_pos"][1]),
                arrowprops=dict(arrowstyle='->', color=C["arrow_defense"],
                                lw=2.0, connectionstyle='arc3,rad=0'), zorder=4)

# Adversary model box at bottom
adv_box = FancyBboxPatch(
    (1.5, 2.2), FIG_W - 3.0, 0.9,
    boxstyle="round,pad=0.12", linewidth=2.0,
    edgecolor=C["purple"], facecolor=C["purple_bg"], zorder=5
)
ax.add_patch(adv_box)
ax.text(FIG_W/2, 2.65,
        "Adversary Model: Active adversary across 3 sovereign organizations  |  "
        "Honest-but-curious or malicious single-org  |  "
        "Network eavesdroppers on all gRPC/HTTP  |  "
        "2-of-3 threshold required for state modification",
        fontsize=7.5, ha='center', va='center', color=C["purple"],
        fontweight='bold', zorder=6)

# Footer
ax.text(FIG_W/2, 2.0,
        "Figure 3: Threat Model — Five Attack Vectors with Corresponding Cryptographic Countermeasures and Empirical Outcomes",
        fontsize=10, ha='center', va='center', color=C["text"], fontweight='bold')

plt.tight_layout(pad=0.3)
fig.savefig(OUTPUT, dpi=DPI, bbox_inches='tight', facecolor='white', edgecolor='none')
print(f"✅ Saved: {OUTPUT}")
plt.close()
