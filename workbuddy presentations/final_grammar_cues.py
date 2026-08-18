from pathlib import Path

P=Path(r'C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\outputs\lesson-preint2-revision-mobile.html')
s=P.read_text(encoding='utf-8')

def block(n):
    token=f'<div class="sc hs" data-slide="{n}">';a=s.find(token);b=s.find('<div class="sc hs" data-slide="',a+len(token))
    if b<0:b=s.find('<script>',a)
    return a,b,s[a:b]

def inject(n,old,new,count=1):
    global s
    a,b,x=block(n)
    if old in x and new not in x:
        x=x.replace(old,new,count)
        s=s[:a]+x+s[b:]

# Fill the large desktop grammar cards with useful, memorable sentence cues.
inject(6,'</table><div style="margin-top:6px"><span class="tg tt">always</span>', '''</table><div class="signal-strip"><b>Signal:</b> a repeated pattern = Simple · a live snapshot = Continuous</div><div style="margin-top:6px"><span class="tg tt">always</span>''')
inject(7,'</table></div><div class="cd cg">', '''</table><div class="signal-strip"><b>Example:</b> I visited Paris last year.</div></div><div class="cd cg">''')
inject(7,'</table></div></div><div style="text-align:center">', '''</table><div class="signal-strip"><b>Example:</b> I will travel next summer.</div></div></div><div style="text-align:center">''')
inject(8,'</table></div></div><div style="margin-top:8px">', '''</table><div class="signal-strip"><b>Remember:</b> no finished time is named; the experience matters now.</div></div></div><div style="margin-top:8px">''')
inject(9,'</div></div></div><div class="cd" style="background:#FEF2F2;', '''</div></div></div><div class="structure-cue"><b>Build it:</b> count the noun → compare two things → connect a real condition to a result.</div><div class="cd" style="background:#FEF2F2;''')

CSS=r'''
/* Small rule cues make the large desktop grammar cards instructional, not empty. */
.signal-strip,.structure-cue{margin-top:auto;padding:11px 13px;border-radius:11px;background:#fff;border:1px dashed #CBD5E1;color:var(--mid);font-size:13px;line-height:1.35}.signal-strip b,.structure-cue b{color:var(--teal-d);font-family:'Nunito',sans-serif}.structure-cue{margin:0 0 12px;border-color:#99F6E4;background:#F0FDFA}
@media(max-width:900px){.signal-strip,.structure-cue{margin-top:10px;font-size:12px}}
'''
s=s.replace('</style>',CSS+'\n</style>',1)
P.write_text(s,encoding='utf-8')
print('added final grammar teaching cues')
