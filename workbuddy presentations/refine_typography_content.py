from pathlib import Path

P = Path(r'C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\outputs\lesson-preint2-revision-mobile.html')
s = P.read_text(encoding='utf-8')

# Show the base word/form students should transform in the gap-fill.
repls = {
    'I usually <input class="fi"': 'I usually <span class="prompt-word">(wake)</span> <input class="fi"',
    'Look! It <input class="fi"': 'Look! It <span class="prompt-word">(snow)</span> <input class="fi"',
    'We <input class="fi" data-answer="went"': 'We <span class="prompt-word">(go)</span> <input class="fi" data-answer="went"',
    'I think she <input class="fi"': 'I think she <span class="prompt-word">(love)</span> <input class="fi"',
    'He <input class="fi" data-answer="has never been"': 'He <span class="prompt-word">(be)</span> <input class="fi" data-answer="has never been"',
    '<input class="fi" data-answer="There are"': '<span class="prompt-word">(there / be)</span> <input class="fi" data-answer="There are"',
    'This hotel is <input class="fi"': 'This hotel is <span class="prompt-word">(comfortable)</span> <input class="fi"',
    'If we <input class="fi"': 'If we <span class="prompt-word">(leave)</span> <input class="fi"',
}
for old, new in repls.items():
    s = s.replace(old, new, 1)

# Add four more compact error-correction cards, with the sentence and reveal
# kept close together. This remains normal sentence text inside each card.
marker = '</div></div><aside class="error-guide">'
if 'data-error-extra="7"' not in s:
    extra = '''<div class="cd error-card-extra" data-error-extra="7"><div><span class="error-no">7</span> She <span class="ew">has visited</span> London last year.</div><div class="rb" onclick="this.classList.toggle('rv')"><span class="rp">Show</span><span class="ha">She <strong>visited</strong> London last year.</span></div></div><div class="cd error-card-extra" data-error-extra="8"><div><span class="error-no">8</span> If it <span class="ew">will rain</span>, we will stay home.</div><div class="rb" onclick="this.classList.toggle('rv')"><span class="rp">Show</span><span class="ha">If it <strong>rains</strong>, we will stay home.</span></div></div><div class="cd error-card-extra" data-error-extra="9"><div><span class="error-no">9</span> There <span class="ew">is</span> three parks near here.</div><div class="rb" onclick="this.classList.toggle('rv')"><span class="rp">Show</span><span class="ha">There <strong>are</strong> three parks near here.</span></div></div><div class="cd error-card-extra" data-error-extra="10"><div><span class="error-no">10</span> I <span class="ew">am seeing</span> my friends every Friday.</div><div class="rb" onclick="this.classList.toggle('rv')"><span class="rp">Show</span><span class="ha">I <strong>see</strong> my friends every Friday.</span></div></div>'''
    if marker not in s:
        raise SystemExit('error insertion marker not found')
    s = s.replace(marker, extra + marker, 1)

CSS = r'''
/* ===== Final typography and proportion refinement ===== */
.prompt-word{display:inline-block;padding:2px 7px;border-radius:7px;background:#E2E8F0;color:#475569;font-family:'Nunito',sans-serif;font-size:.82em;font-weight:800;white-space:nowrap}.error-no{display:inline-grid;place-items:center;width:25px;height:25px;border-radius:8px;background:var(--coral-l);color:#BE123C;font-family:'Nunito',sans-serif;font-weight:900;margin-right:5px}
@media(min-width:901px) and (min-aspect-ratio:4/3){
  /* Slightly smaller cards, larger content: preserve the dashboard silhouette without empty boxes. */
  .grammar-core{height:auto!important;justify-content:flex-start!important;gap:12px!important}.grammar-core>.g2,.grammar-core>.g3{flex:none!important;height:auto!important;min-height:0!important}.grammar-core>.g2>.cd,.grammar-core>.g3>.cd{height:auto!important;min-height:0!important;padding:18px 20px!important}.grammar-core>.g2>.cd p,.grammar-core>.g3>.cd p{font-size:clamp(16px,1.15vw,19px)!important;line-height:1.45}.grammar-core .tt2{font-size:clamp(14px,1vw,17px)!important}.grammar-core .tt2 td,.grammar-core .tt2 th{padding:9px 11px}.grammar-core .signal-strip,.grammar-core .structure-cue{font-size:14px!important;padding:10px 12px}.grammar-side .grammar-visual{height:calc(100% - 18px)!important}
  .gap-core>div:first-child>div{font-size:clamp(17px,1.25vw,20px)!important;line-height:1.45;padding:12px 14px!important;min-height:0}.gap-core .fi{font-size:clamp(17px,1.2vw,20px)!important}.gap-core .tg{font-size:13px!important}.gap-routine span{font-size:13px}.gap-routine b{flex:0 0 27px;width:27px;height:27px}
  .error-grid{gap:9px!important;grid-auto-rows:minmax(118px,auto)}.error-grid>.cd,.error-card-extra{min-height:118px!important;padding:13px 15px!important}.error-grid>.cd>div:first-child,.error-card-extra>div:first-child{font-size:18px!important;line-height:1.35}.error-grid .rb,.error-card-extra .rb{margin-top:5px!important;padding:7px 10px!important;font-size:14px!important}.error-guide{height:calc(100% - 2px);min-height:430px}.error-guide ol{font-size:17px}.error-example{font-size:16px}
  .reading-story .cd p{font-size:19px!important;line-height:1.7!important}.reading-questions .rb{font-size:17px!important;line-height:1.35;min-height:54px}.reading-lens span{font-size:15px}.reading-questions>h4{font-size:24px!important}
  .sc[data-slide="13"] .rc li{font-size:18px!important;line-height:1.75!important}.sc[data-slide="13"] .rc{padding:24px!important}.sc[data-slide="13"] .speaking-zone{font-size:16px}.sc[data-slide="13"] .speaking-flow b{font-size:20px}
}
@media(max-width:900px){.grammar-core>.g2>.cd,.grammar-core>.g3>.cd{padding:14px!important}.gap-core>div:first-child>div{font-size:16px!important}.error-grid>.cd,.error-card-extra{min-height:0!important}.error-grid>.cd>div:first-child,.error-card-extra>div:first-child{font-size:16px!important}.reading-story .cd p{font-size:16px!important}.sc[data-slide="13"] .rc li{font-size:16px!important;line-height:1.65!important}}
'''
s = s.replace('</style>', CSS + '\n</style>', 1)
P.write_text(s, encoding='utf-8')
print('refined card sizing, prompts, error items, and typography')
