from pathlib import Path
p=Path(r'C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\outputs\lesson-preint2-revision-mobile.html')
s=p.read_text(encoding='utf-8')
css=r'''
/* ===== Final desktop ratio polish ===== */
@media(min-width:901px) and (min-aspect-ratio:4/3){
  /* Grammar dashboards: distribute both columns over the usable slide height. */
  .grammar-core{height:100%;justify-content:space-between!important}
  .grammar-core>.g2,.grammar-core>.g3{flex:1;align-items:stretch}
  .grammar-core>.g2>.cd,.grammar-core>.g3>.cd{height:100%;display:flex;flex-direction:column;justify-content:flex-start}
  .grammar-core>.g2>.cd table{margin-top:4px}
  .grammar-core>.g2>.cd>div:last-child{margin-top:auto!important;padding-top:8px}
  .grammar-side .grammar-visual{justify-content:flex-start!important}
  .grammar-side .grammar-visual svg{width:100%;min-height:300px;max-height:none!important;margin:auto 0}
  .grammar-side-extra>div{min-height:96px;justify-content:center}
  .sc[data-slide="8"] .grammar-core>.cd{flex:1;display:flex;flex-direction:column;justify-content:center}
  .sc[data-slide="9"] .grammar-visual-grid{gap:15px}.sc[data-slide="9"] .gv-mini{min-height:150px;justify-content:center}
  /* Gap-fill: the activity itself should occupy the left column vertically. */
  .gap-core>div:first-child{flex:1;grid-template-rows:repeat(4,1fr)}
  .gap-core>div:first-child>div{min-height:78px;align-content:center;padding:14px 16px!important}
  .gap-core .bt{margin-top:2px;min-height:44px}
  .gap-side{padding:22px!important}.tense-map{gap:12px}.tense-chip{min-height:52px!important;font-size:16px}.hint-bubble{font-size:15px;min-height:72px;display:flex;align-items:center}.gap-routine>div{min-height:58px}
  /* Error correction: compact cards, but avoid giant empty card bodies. */
  .error-layout{height:auto!important;align-items:start;margin-top:8px}.error-grid{grid-auto-rows:minmax(126px,auto)}
  .error-grid>.cd{min-height:126px}.error-guide{height:402px;align-self:start}
  .error-grid>.cd>div:first-child{margin-bottom:10px}.error-grid .rb{margin-top:auto!important}
  /* Reading: maintain left text / right questions while filling the canvas cleanly. */
  .reading-layout{height:calc(100% - 88px)!important}.reading-story .wi2{height:235px}.reading-story .cd{padding:24px!important}.reading-questions{padding:26px}.reading-questions .rb{min-height:48px;display:flex;align-items:center}
}
'''
s=s.replace('</style>',css+'\n</style>',1)
p.write_text(s,encoding='utf-8')
print('applied final desktop ratio polish')
