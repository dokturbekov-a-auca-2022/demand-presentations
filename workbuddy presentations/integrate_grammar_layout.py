from pathlib import Path
import re

p=Path(r'C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\outputs\lesson-preint2-revision-mobile.html')
s=p.read_text(encoding='utf-8')

for n in '6789':
    # For each grammar slide, wrap all content after the subtitle in a layout shell.
    pat=re.compile(r'(<div class="sc hs" data-slide="'+n+r'">\s*<div class="sl[^"]*">\s*<div class="sb"[\s\S]*?</p>)([\s\S]*?)(</div></div>\s*<!--)', re.I)
    m=pat.search(s)
    if not m:
        raise SystemExit(f'grammar slide {n} boundary not found')
    body=m.group(2)
    visual_match=re.search(r'<div class="grammar-visual" data-tl="g'+n+r'">[\s\S]*?</div>\s*(?=</div>\s*$)', body)
    if not visual_match:
        # visual has nested content; match from marker to the final direct child ending using known tail.
        start=body.find(f'<div class="grammar-visual" data-tl="g{n}">')
        end=body.rfind('</div>')
        if start<0 or end<start: raise SystemExit(f'visual {n} not found')
        visual=body[start:end]
        before=body[:start]
        after=body[end:]
    else:
        visual=visual_match.group(0)
        before=body[:visual_match.start()]
        after=body[visual_match.end():]
    # Mark the practice block before the visual for a predictable two-column desktop layout.
    new_body='<div class="grammar-layout"><div class="grammar-core">'+before+'</div><div class="grammar-side">'+visual+'</div></div>'+after
    s=s[:m.start(2)]+new_body+s[m.end(2):]

css='''
/* ===== Integrated full-screen grammar layout ===== */
.grammar-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(330px,.8fr);gap:24px;align-items:stretch;min-height:0}
.grammar-core{min-width:0;display:flex;flex-direction:column;gap:18px}.grammar-core>.g2,.grammar-core>.g3{margin-bottom:0!important}.grammar-core>.cd{margin-bottom:0!important}.grammar-core>div[style]{margin-top:0!important}
.grammar-side{min-width:0;display:flex;align-items:center}.grammar-side .grammar-visual{width:100%;margin-top:0!important}
@media(min-width:901px) and (min-aspect-ratio:4/3){.grammar-layout{height:calc(100% - 100px);grid-template-columns:minmax(0,1.55fr) minmax(380px,.85fr);gap:32px}.grammar-core{justify-content:space-between;gap:20px}.grammar-side{align-items:center}.grammar-side .grammar-visual{padding:24px}.grammar-side .grammar-visual svg{min-height:220px}.grammar-visual-title{font-size:22px}.grammar-hint{font-size:15px}.grammar-visual-grid{grid-template-columns:1fr;gap:12px}.gv-mini{min-height:145px;padding:18px}.gv-mini strong{font-size:21px}.gv-mini small{font-size:16px}}
@media(max-width:900px){.grammar-layout{display:flex;flex-direction:column;gap:14px}.grammar-side .grammar-visual{margin-top:0!important}}
'''
s=s.replace('</style>',css+'\n</style>',1)
p.write_text(s,encoding='utf-8')
print('integrated grammar layout')
