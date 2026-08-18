from pathlib import Path

p=Path(r'C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\outputs\lesson-preint2-revision-mobile.html')
s=p.read_text(encoding='utf-8')

def slide_block(n):
    token=f'<div class="sc hs" data-slide="{n}">'
    start=s.find(token)
    if start<0: raise ValueError(n)
    nxt=s.find('<div class="sc hs" data-slide="',start+len(token))
    if nxt<0: nxt=s.find('<script>',start)
    return start,nxt,s[start:nxt]

def remove_zone(cls):
    global s
    marker=f'<div class="teach-zone {cls}">'
    start=s.find(marker)
    if start<0:return ''
    depth=0;pos=start
    while True:
        no=s.find('<div',pos); nc=s.find('</div>',pos)
        if nc<0: raise ValueError(cls)
        if no>=0 and no<nc:
            depth+=1;pos=no+4
        else:
            depth-=1;pos=nc+6
            if depth==0:break
    chunk=s[start:pos];s=s[:start]+s[pos:]
    return chunk

# Move zones accidentally nested in slide 19 to their intended slides.
recap=remove_zone('recap-zone')
progress=remove_zone('progress-zone')
exit_zone=remove_zone('exit-zone')
for n,chunk in [(16,recap),(18,progress),(19,exit_zone)]:
    if not chunk: continue
    start,end,block=slide_block(n)
    close=block.rfind('</div></div>')
    block=block[:close]+chunk+block[close:]
    s=s[:start]+block+s[end:]

# Desktop gap-fill: put exercise and right-side helper in a real two-column layout.
start,end,block=slide_block(10)
marker='<div class="teach-zone gap-side">'
z=block.find(marker)
if z>=0 and 'class="gap-layout"' not in block:
    # The helper is the final direct child, immediately before the slide closes.
    helper=block[z:block.rfind('</div></div>')]
    before=block[:z]
    # Everything after subtitle belongs to exercise core.
    subtitle_end=before.find('</p>')+4
    head=before[:subtitle_end]
    core=before[subtitle_end:]
    block=head+'<div class="gap-layout"><div class="gap-core">'+core+'</div>'+helper+'</div>'+block[block.rfind('</div></div>'):]
    s=s[:start]+block+s[end:]

CSS=r'''
/* ===== Balanced desktop arrangements for enhanced slides ===== */
.gap-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(360px,.75fr);gap:30px;align-items:stretch}.gap-core{min-width:0;display:flex;flex-direction:column;justify-content:flex-start}.gap-core>div:first-child{display:grid!important;grid-template-columns:1fr 1fr;gap:12px 20px!important}.gap-core>div:first-child>div{background:rgba(248,250,252,.85);border:1px solid #E2E8F0;border-radius:12px;padding:10px 12px!important;font-size:16px!important}.gap-core .fi{min-width:90px}.gap-core .bt{align-self:flex-start}.gap-layout .gap-side{margin-top:0!important}
@media(min-width:901px) and (min-aspect-ratio:4/3){.sc[data-slide="10"] .sl{padding-bottom:28px!important}.gap-layout{height:calc(100% - 105px)}.gap-core>div:first-child{margin-bottom:14px!important}.gap-core>div:first-child>div{display:flex;align-items:center;flex-wrap:wrap;gap:5px}.sc[data-slide="16"] .recap-zone{max-width:760px;margin-top:38px}.sc[data-slide="18"] .sl{display:grid;grid-template-columns:minmax(360px,.8fr) minmax(420px,1.2fr);grid-template-rows:auto auto 1fr;column-gap:48px}.sc[data-slide="18"] .sb,.sc[data-slide="18"] .st{grid-column:1}.sc[data-slide="18"] .sl>div:not(.sb):not(.progress-zone){grid-column:1}.sc[data-slide="18"] .progress-zone{grid-column:2;grid-row:1/4;align-self:center}.sc[data-slide="19"] .exit-zone{max-width:720px;margin-left:auto;margin-right:auto}}
@media(max-width:900px){.gap-layout{display:flex;flex-direction:column;gap:14px}.gap-core>div:first-child{display:flex!important;flex-direction:column}.sc[data-slide="18"] .sl{display:block}}
'''
s=s.replace('</style>',CSS+'\n</style>',1)
p.write_text(s,encoding='utf-8')
print('fixed zone placement and balanced gap-fill layout')
