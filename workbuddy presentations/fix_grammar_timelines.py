"""Fix grammar slide timelines: remove misplaced cards (currently outside .sl)
and re-inject them as the LAST child of .sl so they render full-width inside
the slide panel.

Idempotent: detects existing data-tl="gN" markers and either removes-and-readds
(no-op if neither slide ever had a timeline), or just removes if markers present.
"""
from pathlib import Path
import re

OUT = Path(r"C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\outputs\lesson-preint2-revision-mobile.html")
url = OUT.read_text(encoding="utf-8")

# ---- Timeline cards (same designs as before) ------------------------------
TL6 = """<div class="cd" data-tl="g6" style="margin-top:14px;background:#F0FDFA;border-color:#99F6E4">
  <h4 style="font-weight:800;color:#0F766E;margin-bottom:8px">🕒 Time line &mdash; two present tenses</h4>
  <svg viewBox="0 0 1000 210" width="100%" role="img" aria-label="Timeline comparing Present Simple habits with Present Continuous now" style="height:auto;display:block">
    <text x="20" y="34" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#0F172A">Present Simple</text>
    <text x="20" y="124" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#92400E">Present Continuous</text>
    <line x1="250" y1="70" x2="960" y2="70" stroke="#14B8A6" stroke-width="6" stroke-linecap="round"/>
    <circle cx="330" cy="70" r="9" fill="#14B8A6"/><circle cx="470" cy="70" r="9" fill="#14B8A6"/>
    <circle cx="610" cy="70" r="9" fill="#14B8A6"/><circle cx="750" cy="70" r="9" fill="#14B8A6"/>
    <circle cx="900" cy="70" r="9" fill="#14B8A6"/>
    <text x="250" y="98" font-family="Arial,sans-serif" font-size="16" fill="#64748B">always &middot; usually &middot; every day &rarr; repeated &amp; permanent</text>
    <line x1="250" y1="160" x2="960" y2="160" stroke="#F59E0B" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/>
    <circle cx="900" cy="160" r="16" fill="#F59E0B"/>
    <text x="900" y="166" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">NOW</text>
    <text x="250" y="188" font-family="Arial,sans-serif" font-size="16" fill="#64748B">now &middot; at the moment &rarr; happening right now / temporary</text>
  </svg>
</div>"""

TL7 = """<div class="cd" data-tl="g7" style="margin-top:14px;background:#FFF1F2;border-color:#FECDD3">
  <h4 style="font-weight:800;color:#9F1239;margin-bottom:8px">🕒 Time line &mdash; before vs after NOW</h4>
  <svg viewBox="0 0 1000 200" width="100%" role="img" aria-label="Timeline with Past Simple before now and Future Simple after now" style="height:auto;display:block">
    <defs><marker id="ar7" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#0F172A"/></marker></defs>
    <text x="500" y="40" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#64748B">&#8592; before now&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;after now &#8594;</text>
    <line x1="60" y1="100" x2="940" y2="100" stroke="#0F172A" stroke-width="5" stroke-linecap="round" marker-end="url(#ar7)"/>
    <rect x="60" y="78" width="360" height="44" rx="12" fill="#FEE2E8"/>
    <text x="240" y="106" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#BE123C">Past Simple &mdash; done</text>
    <circle cx="500" cy="100" r="14" fill="#0F172A"/>
    <text x="500" y="142" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#0F172A">NOW</text>
    <rect x="580" y="78" width="360" height="44" rx="12" fill="#D1FAE5"/>
    <text x="760" y="106" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#065F46">Future Simple &mdash; will</text>
  </svg>
</div>"""

TL8 = """<div class="cd" data-tl="g8" style="margin-top:14px;background:#F0F9FF;border-color:#BAE6FD">
  <h4 style="font-weight:800;color:#0369A1;margin-bottom:8px">🕒 Time line &mdash; Present Perfect links past to NOW</h4>
  <svg viewBox="0 0 1000 200" width="100%" role="img" aria-label="Present Perfect connects a past event to the present moment" style="height:auto;display:block">
    <text x="60" y="44" font-family="Arial,sans-serif" font-size="16" fill="#64748B">Past event &#9472;&#9472;&#9472;&#9472;&#9654; reaches the present (unfinished time)</text>
    <line x1="60" y1="100" x2="940" y2="100" stroke="#0EA5E9" stroke-width="5" stroke-linecap="round"/>
    <rect x="300" y="80" width="640" height="40" rx="10" fill="#E0F2FE"/>
    <circle cx="300" cy="100" r="10" fill="#0284C7"/>
    <text x="300" y="142" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#0369A1">since 2020 / for 3 years</text>
    <circle cx="940" cy="100" r="16" fill="#0EA5E9"/>
    <text x="916" y="106" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">NOW</text>
    <text x="500" y="172" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#0369A1">ever / never / just / already / yet</text>
  </svg>
</div>"""

TL9 = """<div class="cd" data-tl="g9" style="margin-top:14px;background:#FAF5FF;border-color:#E9D5FF">
  <h4 style="font-weight:800;color:#6D28D9;margin-bottom:8px">🕒 Quick pictures &mdash; three structures</h4>
  <svg viewBox="0 0 1000 210" width="100%" role="img" aria-label="Illustrations for There is/are, comparatives and first conditional" style="height:auto;display:block">
    <!-- Panel 1: there is/are -->
    <rect x="20" y="20" width="300" height="172" rx="14" fill="#F5F3FF"/>
    <text x="170" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#6D28D9">There is / are</text>
    <circle cx="90" cy="105" r="24" fill="#8B5CF6"/>
    <text x="90" y="160" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#6D28D9">There is (1)</text>
    <circle cx="215" cy="85" r="14" fill="#8B5CF6"/><circle cx="248" cy="115" r="14" fill="#8B5CF6"/><circle cx="212" cy="138" r="14" fill="#8B5CF6"/>
    <text x="225" y="172" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#6D28D9">There are (3)</text>
    <!-- Panel 2: comparatives -->
    <rect x="350" y="20" width="300" height="172" rx="14" fill="#FFFBEB"/>
    <text x="500" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#92400E">Comparatives</text>
    <rect x="405" y="85" width="42" height="80" rx="6" fill="#F59E0B"/>
    <rect x="475" y="50" width="42" height="115" rx="6" fill="#D97706"/>
    <text x="500" y="178" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#92400E">small &#8594; bigger</text>
    <!-- Panel 3: first conditional -->
    <rect x="680" y="20" width="300" height="172" rx="14" fill="#F0FDFA"/>
    <text x="830" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#0F766E">1st Conditional</text>
    <rect x="700" y="92" width="124" height="46" rx="10" fill="#CCFBF1"/>
    <text x="762" y="121" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#0F766E">If + Present</text>
    <text x="842" y="122" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#0F766E">&#8594;</text>
    <rect x="862" y="92" width="100" height="46" rx="10" fill="#99F6E4"/>
    <text x="912" y="121" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#0F766E">will + V</text>
  </svg>
</div>"""

TIMELINES = {"6": TL6, "7": TL7, "8": TL8, "9": TL9}

# --- Step 1: remove any existing misplaced timeline cards -----------------
# In the broken state, each TL card sits between the .sl close and the .sc close,
# so the file no longer contains the original consecutive </div></div> at the slide
# tail. We match the misplaced card and remove it (plus reinstate the </div> that
# was lost to the previous "outside" injection so the .sc close remains paired).
for n in TIMELINES:
    # The malformed slide tail currently reads: ...CONTENT</div><div class="cd" data-tl="gN"...>...</div></div>
    # We want to restore: ...CONTENT</div></div>
    misplaced = re.compile(
        r'(</div>)(<div class="cd" data-tl="g' + n + r'"[\s\S]*?</div>)(</div>)\s*(?=<!-- )',
        re.DOTALL,
    )
    new_content, removed = misplaced.subn(r"\1\3", url, count=1)
    if removed:
        url = new_content
        print(f"slide {n}: removed misplaced timeline card")

# --- Step 2: inject each timeline as the LAST child of .sl ----------------
# group1 = <div class="sc hs" data-slide="N">...CONTENT (up to .sl close)
# group2 = .sl close </div>
# group3 = .sc close </div>
inject = re.compile(
    r'(<div class="sc hs" data-slide="(\d+)">[\s\S]*?)(</div>)(</div>)\s*(?=<!-- )',
)
def _inj(m):
    n = m.group(2)
    if n not in TIMELINES:
        return m.group(0)
    if f'data-tl="g{n}"' in m.group(1):
        return m.group(0)  # already inside
    return m.group(1) + TIMELINES[n] + m.group(2) + m.group(3)

# The replacement above accidentally uses group(2) for the .sl close; fix:
def _inj(m):
    n = m.group(2)
    if n not in TIMELINES:
        return m.group(0)
    if f'data-tl="g{n}"' in m.group(1):
        return m.group(0)
    return m.group(1) + TIMELINES[n] + m.group(3) + m.group(4)

url, count = inject.subn(_inj, url)
print(f"injected {count} timeline(s) inside .sl")

# --- Step 3: write back ----------------------------------------------------
OUT.write_text(url, encoding="utf-8")
print(f"Wrote {OUT} ({len(url):,} chars)")
