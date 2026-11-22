#!/usr/bin/env python3
"""
AegisVote — Voting Protocol Sequence Diagram
Publication-quality figure for IEEE / MDPI research paper.
Shows the complete lifecycle: Registration → Encryption → Submission → Tally → Audit
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import os

DPI = 300
FIG_W, FIG_H = 16, 22
OUTPUT = os.path.join(os.path.dirname(__file__), "fig_protocol_sequence.png")

# Colors
C = {
    "voter":   "#1565C0",
    "gateway": "#E65100",
    "fabric":  "#2E7D32",
    "tally":   "#C62828",
    "audit":   "#00695C",
    "bg":      "#FAFAFA",
    "phase_bg": ["#E3F2FD", "#FFF3E0", "#E8F5E9", "#FCE4EC", "#E0F7FA"],
    "text":    "#212121",
    "gray":    "#9E9E9E",
    "msg":     "#37474F",
}

ACTORS = [
    ("Voter\n(Browser)", C["voter"], 2.5),
    ("FastAPI\nGateway", C["gateway"], 6.0),
    ("Fabric\nConsortium", C["fabric"], 9.5),
    ("Tally\nCeremony", C["tally"], 13.0),
]

PHASES = [
    ("Phase 1: Voter Registration & Credential Issuance", 19.5, 17.4),
    ("Phase 2: Client-Side Encryption & Proof Generation", 17.0, 14.0),
    ("Phase 3: Ballot Submission & Consensus", 13.6, 10.3),
    ("Phase 4: Homomorphic Tallying & Threshold Decryption", 9.9, 7.0),
    ("Phase 5: Universal Verification & Public Audit", 6.6, 4.5),
]

MESSAGES = [
    # Phase 1: Registration
    (0, 1, 18.8, "1. POST /register (identity docs, biometric hash)", "solid"),
    (1, 2, 18.2, "2. InvokeChaincode('RegisterVoter', identity_commitment)", "solid"),
    (2, 1, 17.6, "3. Return: blinded_credential, sk_v", "dashed"),

    # Phase 2: Encryption
    (0, 0, 16.5, "4. Generate CSPRNG rₖ ∈ ℤ*ₙ  (SubtleCrypto)", "self"),
    (0, 0, 15.8, "5. Encrypt: cₖ = E(vₖ, rₖ) = g^vₖ · rₖⁿ mod n²", "self"),
    (0, 0, 15.1, "6. Generate NIZK 1-of-K proof πₛₑₗ (CDS94)", "self"),
    (0, 0, 14.4, "7. Derive NF = HMAC-SHA256(sk_v, NULLIFIER ∥ election_id)", "self"),

    # Phase 3: Submission
    (0, 1, 13.1, "8. POST /vote {encrypted_ballot[], π_sel, NF, π_bind}", "solid"),
    (1, 1, 12.5, "9. Validate payload schema + verify ZKP π_sel", "self"),
    (1, 2, 11.8, "10. InvokeChaincode('CastBallot', ballot, NF)", "solid"),
    (2, 2, 11.2, "11. Check NF uniqueness (atomic, world state)", "self"),
    (2, 1, 10.6, "12. Endorsement 2-of-3 → Raft order → Commit block", "dashed"),

    # Phase 4: Tally
    (2, 3, 9.4, "13. Read all ciphertexts from CouchDB world state", "solid"),
    (3, 3, 8.8, "14. Cₐgg[k] = ∏ᵢ cᵢ,ₖ  mod n²  (homomorphic aggregation)", "self"),
    (3, 3, 8.2, "15. 2-of-3 Shamir shares → reconstruct λ", "self"),
    (3, 3, 7.6, "16. Tₖ = L(Cₐgg[k]^λ mod n²) · μ mod n   [O(1) decrypt]", "self"),

    # Phase 5: Audit
    (3, 2, 6.1, "17. Publish Tₖ + Merkle root to blockchain", "solid"),
    (2, 2, 5.5, "18. 6-point consortium audit (X.509 signatures)", "self"),
    (2, 0, 4.9, "19. Return: Merkle proof πₘₑᵣₖₗₑ for individual ballot", "dashed"),
]


fig, ax = plt.subplots(1, 1, figsize=(FIG_W, FIG_H))
ax.set_xlim(0, FIG_W)
ax.set_ylim(3.5, FIG_H + 0.5)
ax.set_aspect('equal')
ax.axis('off')

# Title
ax.text(FIG_W/2, FIG_H + 0.15,
        "AegisVote: Complete Voting Protocol Sequence",
        fontsize=18, fontweight='bold', ha='center', va='top', color=C["text"])

# Phase background bands
for i, (phase_name, y_top, y_bot) in enumerate(PHASES):
    rect = FancyBboxPatch(
        (0.5, y_bot), FIG_W - 1.0, y_top - y_bot,
        boxstyle="round,pad=0.1", linewidth=0,
        facecolor=C["phase_bg"][i], alpha=0.4, zorder=0
    )
    ax.add_patch(rect)
    ax.text(0.8, y_top - 0.15, phase_name, fontsize=9.5, fontweight='bold',
            color=C["text"], ha='left', va='top', zorder=1, style='italic')

# Actor lifelines and headers
for name, color, x in ACTORS:
    # Header box
    box = FancyBboxPatch(
        (x - 1.0, 20.0), 2.0, 1.2,
        boxstyle="round,pad=0.12", linewidth=2.5,
        edgecolor=color, facecolor='white', zorder=10
    )
    ax.add_patch(box)
    ax.text(x, 20.6, name, fontsize=10, fontweight='bold', color=color,
            ha='center', va='center', zorder=11)

    # Lifeline (dashed vertical)
    ax.plot([x, x], [20.0, 4.3], linestyle='--', color=C["gray"],
            linewidth=1.2, zorder=1, alpha=0.6)

# Messages
for msg in MESSAGES:
    frm, to, y, label, style = msg
    x_from = ACTORS[frm][2]
    x_to = ACTORS[to][2]

    if style == "self":
        # Self-message (loop)
        loop_w = 1.8
        ax.annotate('', xy=(x_from + loop_w, y - 0.25),
                     xytext=(x_from, y - 0.25),
                     arrowprops=dict(arrowstyle='->', color=C["msg"], lw=1.5), zorder=5)
        ax.plot([x_from, x_from + loop_w], [y, y], color=C["msg"], lw=1.5, zorder=5)
        ax.plot([x_from + loop_w, x_from + loop_w], [y, y - 0.25], color=C["msg"], lw=1.5, zorder=5)
        ax.text(x_from + loop_w + 0.15, y - 0.1, label, fontsize=7.2, color=C["msg"],
                ha='left', va='center', zorder=6)
    else:
        ls = '-' if style == "solid" else '--'
        ax.annotate('', xy=(x_to, y), xytext=(x_from, y),
                     arrowprops=dict(arrowstyle='->', color=C["msg"], lw=1.8,
                                     linestyle=ls), zorder=5)
        mid_x = (x_from + x_to) / 2
        offset_y = 0.18
        ax.text(mid_x, y + offset_y, label, fontsize=7.2, color=C["msg"],
                ha='center', va='bottom', zorder=6,
                bbox=dict(boxstyle='round,pad=0.12', facecolor='white', edgecolor='none', alpha=0.85))

# Footer
ax.text(FIG_W/2, 3.9,
        "Figure 2: End-to-End Voting Protocol Sequence — Registration through Universal Verification",
        fontsize=11, ha='center', va='center', color=C["text"], fontweight='bold')

plt.tight_layout(pad=0.3)
fig.savefig(OUTPUT, dpi=DPI, bbox_inches='tight', facecolor='white', edgecolor='none')
print(f"✅ Saved: {OUTPUT}")
plt.close()
