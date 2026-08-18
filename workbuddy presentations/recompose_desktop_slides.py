from pathlib import Path

P=Path(r'C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\outputs\lesson-preint2-revision-mobile.html')
s=P.read_text(encoding='utf-8')

def matching_div(text,start):
    depth=0;pos=start
    while True:
        op=text.find('<div',pos);cl=text.find('</div>',pos)
        if cl<0: raise ValueError('unclosed div')
        if op>=0 and op<cl:
            depth+=1;pos=op+4
        else:
            depth-=1;pos=cl+6
            if depth==0:return pos

def slide_bounds(n):
    token=f'<div class="sc hs" data-slide="{n}">';a=s.find(token)
    if a<0:raise ValueError(f'slide {n}')
    b=s.find('<div class="sc hs" data-slide="',a+len(token))
    if b<0:b=s.find('<script>',a)
    return a,b

# 1) Fill grammar-side vertical space with short teaching prompts.
extras={
6:'''<div class="grammar-side-extra"><div><b>Teacher cue</b><span>Ask: “Is it a routine or is it happening now?”</span></div><div><b>Quick check</b><span>every Monday → Present Simple<br>at the moment → Present Continuous</span></div></div>''',
7:'''<div class="grammar-side-extra"><div><b>Teacher cue</b><span>Point left for finished past; point right for a prediction.</span></div><div><b>Quick check</b><span>last night → Past Simple<br>I think… → Future Simple</span></div></div>''',
8:'''<div class="grammar-side-extra"><div><b>Teacher cue</b><span>Ask: “Do we know exactly when?” If not, Present Perfect may fit.</span></div><div><b>Past Simple contrast</b><span>I visited Rome <em>in 2024</em>.<br>I have visited Rome.</span></div></div>''',
9:'''<div class="grammar-side-extra compact"><div><b>One-minute challenge</b><span>Describe the classroom, compare two objects, then make one real future condition.</span></div></div>'''
}
for n,extra in extras.items():
    a,b=slide_bounds(n);block=s[a:b]
    if 'grammar-side-extra' in block:continue
    marker=f'<div class="grammar-visual" data-tl="g{n}">';s0=block.find(marker)
    if s0<0:raise ValueError(f'grammar visual {n}')
    e0=matching_div(block,s0)
    block=block[:e0-6]+extra+block[e0-6:]
    s=s[:a]+block+s[b:]

# 2) Add a simple solve routine to the gap-fill helper panel.
if 'class="gap-routine"' not in s:
    marker='<div class="mini-timer">'
    routine='''<div class="gap-routine"><div><b>1</b><span>Find the time clue</span></div><div><b>2</b><span>Build the verb form</span></div><div><b>3</b><span>Read the whole sentence</span></div></div>'''
    s=s.replace(marker,routine+marker,1)

# 3) Error correction: 2-column card grid + compact strategy panel.
a,b=slide_bounds(11);block=s[a:b]
if 'class="error-layout"' not in block:
    old='<div style="display:flex;flex-direction:column;gap:10px">'
    if old not in block:raise ValueError('error container')
    block=block.replace(old,'<div class="error-layout"><div class="error-grid">',1)
    tail=block.rfind('</div></div></div>')
    if tail<0:raise ValueError('error tail')
    aside='''<aside class="error-guide"><div class="bug-illustration"><span>×</span><i></i><b>✓</b></div><h3>Fix it in 3 steps</h3><ol><li><strong>Spot</strong> the time clue.</li><li><strong>Check</strong> the helping verb.</li><li><strong>Repair</strong> only the wrong part.</li></ol><div class="error-example"><small>Example</small><span>Did you <del>saw</del> <strong>see</strong> it?</span></div></aside>'''
    block=block[:tail]+'</div>'+aside+'</div>'+block[tail+6:]
    s=s[:a]+block+s[b:]

# 4) Reading: image + passage left, comprehension panel right.
a,b=slide_bounds(12);block=s[a:b]
if 'class="reading-layout"' not in block:
    img=block.find('<img ');img_end=block.find('>',img)+1
    passage=block.find('<div class="cd cb"',img_end);passage_end=matching_div(block,passage)
    qh=block.find('<h4',passage_end);qh_end=block.find('</h4>',qh)+5
    questions=block.find('<div class="g2"',qh_end);questions_end=matching_div(block,questions)
    if min(img,passage,qh,questions)<0:raise ValueError('reading pieces')
    lens='''<div class="reading-lens"><b>Reading lens</b><span>First read: What happened?</span><span>Second read: Which tenses can you find?</span><span>Bonus: Retell it in 3 sentences.</span></div>'''
    layout='<div class="reading-layout"><div class="reading-story">'+block[img:passage_end]+'</div><aside class="reading-questions">'+block[qh:questions_end]+lens+'</aside></div>'
    block=block[:img]+layout+block[questions_end:]
    s=s[:a]+block+s[b:]

CSS=r'''
/* ===== Desktop-first recomposition: grammar, practice and reading ===== */
.grammar-side-extra{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.grammar-side-extra>div{border-radius:12px;padding:12px;background:#fff;border:1px solid #E2E8F0;display:flex;flex-direction:column;gap:5px}.grammar-side-extra b{font-family:'Nunito',sans-serif;color:var(--teal-d);font-size:14px}.grammar-side-extra span{color:var(--mid);font-size:13px;line-height:1.35}.grammar-side-extra.compact{grid-template-columns:1fr}
.gap-routine{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.gap-routine>div{border-radius:10px;background:#fff;border:1px solid #D1FAE5;padding:9px;display:flex;align-items:center;gap:7px}.gap-routine b{width:24px;height:24px;border-radius:50%;background:var(--teal);color:#fff;display:grid;place-items:center;font-family:'Nunito',sans-serif}.gap-routine span{font-size:12px;color:var(--mid);line-height:1.2}
.error-layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(300px,.65fr);gap:28px;align-items:stretch}.error-grid{display:grid!important;grid-template-columns:1fr 1fr;gap:12px!important}.error-grid>.cd{padding:14px 16px!important;display:flex;flex-direction:column;justify-content:space-between;min-width:0}.error-grid>.cd>div:first-child{font-size:16px!important;line-height:1.35}.error-grid .rb{font-size:13px!important;padding:8px 10px!important}.error-guide{border:2px solid #FECDD3;border-radius:18px;background:linear-gradient(145deg,#FFF1F2,#fff);padding:22px;display:flex;flex-direction:column;justify-content:center}.error-guide h3{font-family:'Nunito',sans-serif;font-size:22px;color:#9F1239;margin:10px 0}.error-guide ol{padding-left:22px;color:var(--mid);font-size:16px;line-height:1.8}.error-example{margin-top:16px;border-radius:12px;background:#fff;border:1px solid #FECDD3;padding:12px;display:flex;flex-direction:column;gap:4px}.error-example small{color:#BE123C;font-weight:800;text-transform:uppercase}.error-example strong{color:var(--grn)}.bug-illustration{height:80px;position:relative;display:flex;align-items:center;justify-content:center;gap:14px}.bug-illustration span,.bug-illustration b{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;font-size:28px}.bug-illustration span{background:var(--coral-l);color:var(--coral)}.bug-illustration b{background:var(--grn-l);color:var(--grn)}.bug-illustration i{width:70px;height:4px;border-radius:4px;background:linear-gradient(90deg,var(--coral),var(--grn));position:relative}.bug-illustration i::after{content:'→';position:absolute;right:-4px;top:-16px;color:var(--grn);font-size:26px}
.reading-layout{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(390px,.82fr);gap:30px;align-items:stretch}.reading-story{display:flex;flex-direction:column;gap:16px}.reading-story .wi2{height:220px;margin:0}.reading-story .cd{margin:0!important;flex:1;display:flex;align-items:center}.reading-story .cd p{font-size:18px!important;line-height:1.65!important}.reading-questions{border:2px solid #BAE6FD;border-radius:18px;background:linear-gradient(145deg,#F0F9FF,#fff);padding:22px;display:flex;flex-direction:column}.reading-questions>h4{font-family:'Nunito',sans-serif;font-size:22px!important;color:#0369A1;margin-bottom:14px!important}.reading-questions>.g2{grid-template-columns:1fr!important;gap:10px!important}.reading-questions .rb{text-align:left!important;font-size:15px!important;padding:12px 14px}.reading-lens{margin-top:auto;padding-top:18px;display:flex;flex-direction:column;gap:8px}.reading-lens b{font-family:'Nunito',sans-serif;color:#0369A1}.reading-lens span{border-left:4px solid var(--blu);padding:7px 10px;background:#fff;border-radius:0 9px 9px 0;color:var(--mid);font-size:14px}
@media(min-width:901px) and (min-aspect-ratio:4/3){.grammar-side{align-items:stretch!important}.grammar-side .grammar-visual{height:100%;display:flex;flex-direction:column;justify-content:center}.grammar-side .grammar-visual svg{flex:1;min-height:245px;max-height:360px}.grammar-side .grammar-visual-grid{flex:1;align-content:center}.grammar-side-extra{margin-top:auto}.sc[data-slide="11"] .error-layout,.sc[data-slide="12"] .reading-layout{height:calc(100% - 105px)}.sc[data-slide="12"] .sl{overflow:hidden}.sc[data-slide="10"] .gap-side{justify-content:space-between}}
@media(max-width:900px){.grammar-side-extra{grid-template-columns:1fr}.gap-routine{grid-template-columns:1fr}.error-layout,.reading-layout{display:flex;flex-direction:column;gap:14px}.error-grid{grid-template-columns:1fr}.error-guide{padding:16px}.reading-story .wi2{height:150px}.reading-story .cd p{font-size:15px!important}.reading-questions{padding:15px}.reading-lens{margin-top:14px}}
'''
s=s.replace('</style>',CSS+'\n</style>',1)
P.write_text(s,encoding='utf-8')
print('recomposed grammar, gap-fill, error correction and reading slides')
