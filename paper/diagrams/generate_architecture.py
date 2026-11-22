#!/usr/bin/env python3
"""
AegisVote — 7-Tier System Architecture Diagram
Publication-quality figure for IEEE / MDPI research paper.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

# ─── Configuration ────────────────────────────────────────────────────
DPI = 300
FIG_W, FIG_H = 14, 18
OUTPUT = os.path.join(os.path.dirname(__file__), "fig_system_architecture.png")

# Color palette — professional, accessible, IEEE-friendly
COLORS = {
    "tier1": "#E3F2FD",   # light blue   — Client Edge
    "tier2": "#FFF3E0",   # light orange — Gateway
    "tier3": "#E8F5E9",   # light green  — Consensus
    "tier4": "#F3E5F5",   # light purple — Chaincode
    "tier5": "#FFF9C4",   # light yellow — Storage
    "tier6": "#FCE4EC",   # light pink   — Tally
    "tier7": "#E0F7FA",   # light cyan   — Verifier
    "border1": "#1565C0",
    "border2": "#E65100",
    "border3": "#2E7D32",
    "border4": "#6A1B9A",
    "border5": "#F57F17",
    "border6": "#C62828",
    "border7": "#00695C",
    "arrow":   "#37474F",
    "text":    "#212121",
    "subtext": "#616161",
}

def draw_tier_box(ax, y_center, tier_num, title, components, color, border, width=11.5):
    """Draw a rounded tier box with internal component boxes."""
    h = 1.6
    x = 1.25
    # Main tier box
    box = FancyBboxPatch(
        (x, y_center - h/2), width, h,
        boxstyle="round,pad=0.15", linewidth=2.5,
        edgecolor=border, facecolor=color, alpha=0.85, zorder=2
    )
    ax.add_patch(box)

    # Tier label on the left
    ax.text(x + 0.35, y_center + h/2 - 0.28, f"Tier {tier_num}",
            fontsize=10, fontweight='bold', color=border,
            ha='left', va='top', zorder=3,
            fontfamily='monospace')

    # Title
    ax.text(x + width/2, y_center + h/2 - 0.28, title,
            fontsize=13, fontweight='bold', color=COLORS["text"],
            ha='center', va='top', zorder=3)

    # Component sub-boxes
    n = len(components)
    if n == 0:
        return
    margin = 0.6
    gap = 0.3
    total_w = width - 2 * margin
    comp_w = (total_w - (n - 1) * gap) / n
    comp_h = 0.65
    comp_y = y_center - h/2 + 0.2

    for i, (comp_name, comp_detail) in enumerate(components):
        cx = x + margin + i * (comp_w + gap)
        comp_box = FancyBboxPatch(
            (cx, comp_y), comp_w, comp_h,
            boxstyle="round,pad=0.08", linewidth=1.2,
            edgecolor=border, facecolor='white', alpha=0.95, zorder=3
        )
        ax.add_patch(comp_box)
        ax.text(cx + comp_w/2, comp_y + comp_h/2 + 0.08, comp_name,
                fontsize=8.5, fontweight='bold', color=COLORS["text"],
                ha='center', va='center', zorder=4)
        if comp_detail:
            ax.text(cx + comp_w/2, comp_y + comp_h/2 - 0.15, comp_detail,
                    fontsize=6.5, color=COLORS["subtext"],
                    ha='center', va='center', zorder=4, style='italic')


def draw_arrow(ax, y_from, y_to, label="", x=7.0):
    """Draw a downward arrow between tiers."""
    ax.annotate(
        '', xy=(x, y_to + 0.85), xytext=(x, y_from - 0.85),
        arrowprops=dict(
            arrowstyle='->', color=COLORS["arrow"],
            lw=2.0, connectionstyle='arc3,rad=0',
            mutation_scale=18
        ), zorder=5
    )
    if label:
        mid_y = (y_from + y_to) / 2
        ax.text(x + 0.25, mid_y, label, fontsize=7, color=COLORS["arrow"],
                ha='left', va='center', style='italic', zorder=5)


# ─── Build Figure ─────────────────────────────────────────────────────
fig, ax = plt.subplots(1, 1, figsize=(FIG_W, FIG_H))
ax.set_xlim(0, FIG_W)
ax.set_ylim(0, FIG_H)
ax.set_aspect('equal')
ax.axis('off')

# Title
ax.text(FIG_W/2, FIG_H - 0.6,
        "AegisVote: 7-Tier System Architecture",
        fontsize=20, fontweight='bold', ha='center', va='top',
        color=COLORS["text"])
ax.text(FIG_W/2, FIG_H - 1.1,
        "Privacy-Preserving and Verifiable E-Voting on Hyperledger Fabric",
        fontsize=12, ha='center', va='top', color=COLORS["subtext"], style='italic')

# Y-positions for each tier (top to bottom)
y_positions = [15.0, 13.0, 10.8, 8.8, 6.8, 4.8, 2.8]

# Tier 1 — Client Edge
draw_tier_box(ax, y_positions[0], 1, "Client Edge Layer",
              [("React / Vite SPA", "Web Application"),
               ("SubtleCrypto CSPRNG", "Random Generation"),
               ("Paillier Encryption", "Client-Side E(vₖ, rₖ)"),
               ("NIZK Proof Gen", "CDS94 Σ-Protocol")],
              COLORS["tier1"], COLORS["border1"])

# Tier 2 — Gateway Dispatcher
draw_tier_box(ax, y_positions[1], 2, "Gateway Dispatcher",
              [("FastAPI (Async)", "REST API Ingestion"),
               ("Payload Validator", "Schema + ZKP Check"),
               ("gRPC Pool", "Fabric SDK Gateway"),
               ("Rate Limiter", "DoS Protection")],
              COLORS["tier2"], COLORS["border2"])

# Tier 3 — Consortium Consensus
draw_tier_box(ax, y_positions[2], 3, "Consortium Consensus — Hyperledger Fabric 2.5",
              [("Org1: Election\nCommission", "peer0.org1\n:7051"),
               ("Org2: Party\nObserver", "peer0.org2\n:8051"),
               ("Org3: Civil\nSociety NGO", "peer0.org3\n:9051"),
               ("Raft Orderer", "orderer.aegis\n:7050")],
              COLORS["tier3"], COLORS["border3"])

# Tier 4 — Chaincode Execution
draw_tier_box(ax, y_positions[3], 4, "Smart Contract Execution (Chaincode)",
              [("voting_cc:1.0", "Go Smart Contract"),
               ("Nullifier Check", "Atomic Dedup"),
               ("1-of-K ZKP Verify", "Ballot Validation"),
               ("Endorsement Policy", "OutOf(2, Org1-3)")],
              COLORS["tier4"], COLORS["border4"])

# Tier 5 — Dual-Store State
draw_tier_box(ax, y_positions[4], 5, "Dual-Store Persistent State",
              [("LevelDB Block Store", "Append-Only Ledger"),
               ("CouchDB₀ :5984", "Org1 World State"),
               ("CouchDB₁ :6984", "Org2 World State"),
               ("CouchDB₂ :7984", "Org3 World State")],
              COLORS["tier5"], COLORS["border5"])

# Tier 6 — Tally Ceremony
draw_tier_box(ax, y_positions[5], 6, "Tally Ceremony",
              [("Homomorphic\nAggregation", "Cₐgg = ∏ cᵢ,ₖ"),
               ("Shamir (2,3)\nReconstruction", "λ = Σ sⱼ·ℓⱼ(0)"),
               ("Paillier O(1)\nDecryption", "Tₖ = L(Cₐgg^λ)·μ")],
              COLORS["tier6"], COLORS["border6"])

# Tier 7 — Universal Verifier
draw_tier_box(ax, y_positions[6], 7, "Universal Verifier & Audit",
              [("Merkle Proof\nVerification", "O(log₂ N) Proofs"),
               ("6-Point Consortium\nAudit", "X.509 Signed"),
               ("Public Audit\nDashboard", "Any Observer")],
              COLORS["tier7"], COLORS["border7"])

# Arrows between tiers
labels = ["HTTPS/WSS", "gRPC + Protobuf", "Endorsement", "Read/Write Set", "Aggregated Ciphertexts", "Merkle Leaves"]
for i in range(6):
    draw_arrow(ax, y_positions[i], y_positions[i+1], labels[i])

# Voters icon at top
ax.text(FIG_W/2, FIG_H - 1.65, "Voters (Browser Clients)", fontsize=11,
        ha='center', va='top', color=COLORS["subtext"],
        bbox=dict(boxstyle='round,pad=0.3', facecolor='#ECEFF1', edgecolor='#90A4AE', lw=1.5))

# Downward arrow from voters to Tier 1
ax.annotate('', xy=(FIG_W/2, y_positions[0] + 0.85), xytext=(FIG_W/2, FIG_H - 2.15),
            arrowprops=dict(arrowstyle='->', color=COLORS["arrow"], lw=2.0, mutation_scale=18), zorder=5)

# Footer
ax.text(FIG_W/2, 1.5,
        "Figure 1: AegisVote 7-Tier System Architecture — Permissioned Hyperledger Fabric Consortium",
        fontsize=11, ha='center', va='center', color=COLORS["text"], fontweight='bold')

plt.tight_layout(pad=0.5)
fig.savefig(OUTPUT, dpi=DPI, bbox_inches='tight', facecolor='white', edgecolor='none')
print(f"✅ Saved: {OUTPUT}")
plt.close()
