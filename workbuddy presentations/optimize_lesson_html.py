from pathlib import Path
import base64
import hashlib
import html
import re
import urllib.request

src = Path(r"C:\Users\doktu\Downloads\lesson-preint2-revision.html")
out = Path(r"C:\Users\doktu\WorkBuddy AI\2026-08-06-20-15-34\lesson-preint2-revision-mobile.html")
s = src.read_text(encoding="utf-8")

# Extract the actual lesson document embedded inside the platform wrapper.
start = s.index('<meta charset="UTF-8">', 100)
end = s.rindex('</script>') + len('</script>')
content = s[start:end]

# Use direct public CDNs instead of the platform-specific proxy.
content = content.replace(
    'https://artifacts-cdn.chatglm.site/https://fonts.googleapis.com/',
    'https://fonts.googleapis.com/'
).replace(
    'https://artifacts-cdn.chatglm.site/https://cdnjs.cloudflare.com/',
    'https://cdnjs.cloudflare.com/'
)

# Remove Font Awesome's external stylesheet. The local CSS icon map below
# preserves the existing icon markup without requiring a CDN connection.
content = re.sub(
    r'<link[^>]+href="[^"]*font-awesome[^"]*"[^>]*>\s*',
    '',
    content,
    flags=re.IGNORECASE,
)

# Fix malformed fragments from the generated sample.
repairs = {
    'border:1px solid #475/569': 'border:1px solid #475569',
    '&lt;"tr&gt;': '',
    'class="ve5"': 'class="ve"',
    "gap:'6px": "gap:6px",
    'style="gap:18px" 0style="gap:18px"': 'style="gap:18px"',
    'style="font-weight:800;colorA:#065F46': 'style="font-weight:800;color:#065F46',
    'style="background:var(--grn7)': 'style="background:var(--grn)',
    'exp(lore': 'explore',
    'every9day': 'every day',
    '#E2&gt;8F0': '#E2E8F0',
    "type:'?text/html;charset=utf-8'": "type:'text/html;charset=utf-8'",
    '#0EA5=9': '#0EA5E9',
    "rQ(...": "rQ()",
}
for old, new in repairs.items():
    content = content.replace(old, new)

# The source sample references 14 obsolete Unsplash URLs (all return 404).
# Replace them with embedded topic-specific illustrations so images work in
# local files, on phones, and offline without a CDN.
scene_colors = {
    "Beach": ("#FDE68A", "#38BDF8", "☀  BEACH DAY"),
    "Friends": ("#D1FAE5", "#0D9488", "●  FRIENDS"),
    "New experience": ("#EDE9FE", "#8B5CF6", "✦  NEW EXPERIENCE"),
    "Summer": ("#FEF3C7", "#F59E0B", "☀  SUMMER"),
    "Winter": ("#E0F2FE", "#0284C7", "❄  WINTER"),
    "Adventure": ("#DCFCE7", "#16A34A", "↗  ADVENTURE"),
    "Explore": ("#E0F2FE", "#0EA5E9", "⌖  EXPLORE"),
    "Destination": ("#FCE7F3", "#DB2777", "◆  DESTINATION"),
    "Memory": ("#FEF3C7", "#D97706", "♥  MEMORY"),
    "Breathtaking": ("#EDE9FE", "#7C3AED", "✦  BREATHTAKING"),
    "Celebrate": ("#FFE4E6", "#E11D48", "★  CELEBRATE"),
    "Volunteer": ("#D1FAE5", "#059669", "♥  VOLUNTEER"),
    "Unforgettable": ("#FFEDD5", "#EA580C", "★  UNFORGETTABLE"),
    "Camping": ("#DCFCE7", "#15803D", "△  CAMPING"),
}
photo_ids = {
    "Beach": "1507525428034-b723cf961d3e",
    "Friends": "1529156069898-49953e39b3ac",
    "New experience": "1551632811-561732d1e306",
    "Summer": "1494500764479-0c8f2919a3d8",
    "Winter": "1483664852095-d6cc6870702d",
    "Adventure": "1551632811-561732d1e306",
    "Explore": "1500530855697-b586d89ba3ee",
    "Destination": "1476514525535-07fb3b4ae5f1",
    "Memory": "1516321318423-f06f85e504b3",
    "Breathtaking": "1464822759023-fed622ff2c3b",
    "Celebrate": "1492684223066-81342ee5ff30",
    "Volunteer": "1559027615-cd4628902d4a",
    "Unforgettable": "1500534314209-a25ddb2bd429",
    "Camping": "1475483768296-6163e08872a1",
}
image_cache = out.parent / ".lesson-image-cache"
image_cache.mkdir(parents=True, exist_ok=True)

def illustration_data_url(alt):
    bg, accent, label = scene_colors.get(alt, ("#E0F2FE", "#0D9488", "✦  ENGLISH"))
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 240"><rect width="1100" height="240" rx="28" fill="{bg}"/><circle cx="150" cy="120" r="70" fill="{accent}" opacity=".18"/><circle cx="150" cy="120" r="44" fill="{accent}" opacity=".9"/><path d="M32 212l145-105 102 76 108-88 130 117" fill="none" stroke="{accent}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/><path d="M730 40l18 42 45 5-34 29 10 44-39-23-40 23 10-44-34-29 45-5z" fill="{accent}" opacity=".38"/><path d="M900 60c30-30 85-12 85 30 0 48-85 96-85 96s-85-48-85-96c0-42 55-60 85-30z" fill="{accent}" opacity=".22"/><text x="580" y="138" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#1E293B">{label}</text></svg>'''
    return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode('utf-8')).decode('ascii')

def photo_data_url(alt):
    photo_id = photo_ids.get(alt)
    if not photo_id:
        return illustration_data_url(alt)
    url = f'https://images.unsplash.com/photo-{photo_id}?w=900&h=300&fit=crop&auto=format&q=70'
    cache_file = image_cache / (hashlib.sha256(url.encode('utf-8')).hexdigest() + '.jpg')
    try:
        if cache_file.exists() and cache_file.stat().st_size > 1000:
            data = cache_file.read_bytes()
        else:
            request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (WorkBuddy lesson optimizer)'})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read()
            if len(data) < 1000:
                raise ValueError('downloaded image was unexpectedly small')
            cache_file.write_bytes(data)
        return 'data:image/jpeg;base64,' + base64.b64encode(data).decode('ascii')
    except Exception as error:
        print(f'Warning: using embedded illustration for {alt}: {error}')
        return illustration_data_url(alt)

content = re.sub(
    r'<img\s+src="https://images\.unsplash\.com/[^"]+"\s+class="([^"]*)"\s+alt="([^"]*)">',
    lambda m: f'<img src="{photo_data_url(html.unescape(m.group(2)))}" class="{m.group(1)}" alt="{html.unescape(m.group(2))}">',
    content,
)

# Improve semantics/accessibility without changing lesson content.
content = content.replace('<div class="tbar">', '<header class="tbar" aria-label="Teacher controls">', 1)
content = content.replace('</div>\n<div class="ei" id="edI">', '</header>\n<div class="ei" id="edI" role="status" aria-live="polite">', 1)
content = content.replace('<div class="to" id="tst"></div>', '<div class="to" id="tst" role="status" aria-live="polite"></div>')
content = content.replace('<div class="pb">', '<div class="pb" aria-label="Lesson progress">')
content = content.replace('<button class="nb np"', '<button class="nb np" type="button" aria-label="Previous slide"')
content = content.replace('<button class="nb nn"', '<button class="nb nn" type="button" aria-label="Next slide"')
content = content.replace('<div class="sn" id="sC">', '<div class="sn" id="sC" aria-live="polite">')

# Add a phone toolbar toggle and fullscreen control to the existing toolbar.
content = content.replace(
    '<span style="font-weight:800;font-size:14px"><i class="fas fa-chalkboard-teacher"></i> Teacher Panel</span>',
    '<button class="tb menu-toggle" type="button" onclick="toggleTools()" aria-expanded="false" aria-controls="teacherTools"><i class="fas fa-sliders"></i><span>Tools</span></button><span class="teacher-title" style="font-weight:800;font-size:14px"><i class="fas fa-chalkboard-teacher"></i> Teacher Panel</span>'
)
content = content.replace(
    '<div style="display:flex;align-items:center;gap:8px">\n<button class="tb" onclick="saveEd()">',
    '<div id="teacherTools" class="teacher-tools" style="display:flex;align-items:center;gap:8px">\n<button class="tb" type="button" onclick="toggleFullscreen()"><i class="fas fa-expand"></i> <span>Fullscreen</span></button>\n<button class="tb" type="button" onclick="saveEd()">'
)
content = content.replace('<button class="tb" onclick="dlFile()">', '<button class="tb" type="button" onclick="dlFile()">')
content = content.replace('<button class="tb" onclick="openTab()">', '<button class="tb" type="button" onclick="openTab()">')

# Mobile-first overrides. Kept separate so the original visual design remains recognizable.
mobile_css = r'''
/* ===== Self-contained icon set (no Font Awesome CDN required) ===== */
.fas,.fa{display:inline-flex;align-items:center;justify-content:center;min-width:1em;font-family:"Segoe UI Symbol","Apple Color Emoji","Noto Color Emoji",sans-serif;font-style:normal;font-weight:700;line-height:1;text-rendering:auto}
.fas::before,.fa::before{content:"•"}
.fa-arrow-right::before{content:"→"}.fa-backward::before{content:"⏮"}.fa-balance-scale::before{content:"⚖"}.fa-book::before{content:"📘"}.fa-book-open::before{content:"📖"}.fa-book-reader::before{content:"📚"}.fa-brain::before{content:"🧠"}.fa-bug::before{content:"🐞"}.fa-bullseye::before{content:"🎯"}.fa-chalkboard-teacher::before{content:"👩‍🏫"}.fa-check::before{content:"✓"}.fa-check-circle::before{content:"✅"}.fa-chevron-left::before{content:"‹"}.fa-chevron-right::before{content:"›"}.fa-clipboard-check::before{content:"📋"}.fa-code-branch::before{content:"⑂"}.fa-comment-dots::before{content:"💬"}.fa-comments::before{content:"💬"}.fa-copy::before{content:"⧉"}.fa-door-open::before{content:"🚪"}.fa-download::before{content:"⇩"}.fa-dumbbell::before{content:"🏋"}.fa-exclamation-triangle::before{content:"⚠"}.fa-expand::before{content:"⛶"}.fa-external-link-alt::before{content:"↗"}.fa-feather-alt::before{content:"✒"}.fa-fire::before{content:"🔥"}.fa-flag-checkered::before{content:"🏁"}.fa-forward::before{content:"⏭"}.fa-gamepad::before{content:"🎮"}.fa-gavel::before{content:"🔨"}.fa-graduation-cap::before{content:"🎓"}.fa-home::before{content:"⌂"}.fa-key::before{content:"🔑"}.fa-lightbulb::before{content:"💡"}.fa-link::before{content:"🔗"}.fa-list-ol::before{content:"☷"}.fa-lock::before{content:"🔒"}.fa-map-marker-alt::before{content:"📍"}.fa-microphone::before{content:"🎤"}.fa-mobile-screen::before{content:"▯"}.fa-pen::before{content:"✎"}.fa-pen-fancy::before{content:"✍"}.fa-pencil-alt::before{content:"✏"}.fa-project-diagram::before{content:"⌘"}.fa-redo::before{content:"↻"}.fa-repeat::before{content:"↻"}.fa-rocket::before{content:"🚀"}.fa-save::before{content:"▣"}.fa-sliders::before{content:"☷"}.fa-spell-check::before{content:"ABC✓";font-size:.72em}.fa-spinner::before{content:"◌"}.fa-sync-alt::before{content:"↻"}.fa-thumbs-up::before{content:"👍"}.fa-trophy::before{content:"🏆"}.fa-user::before{content:"👤"}.fa-users::before{content:"👥"}
.fa-spinner{animation:icon-spin 1s linear infinite}@keyframes icon-spin{to{transform:rotate(360deg)}}

/* ===== Mobile-first optimization layer ===== */
:root{--toolbar-h:52px;--progress-h:4px;--nav-h:64px;--safe-top:env(safe-area-inset-top,0px);--safe-bottom:env(safe-area-inset-bottom,0px)}
html{height:100%;background:var(--cream);-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{height:100dvh;min-height:100svh;overscroll-behavior:none;touch-action:pan-y;display:block}
button,input,textarea,select{font:inherit}.tbar{height:calc(var(--toolbar-h) + var(--safe-top));padding:calc(8px + var(--safe-top)) 12px 8px;gap:10px}.teacher-tools{min-width:0}.menu-toggle{display:none}.pb{top:calc(var(--toolbar-h) + var(--safe-top))}
/* Use nearly the full viewport on laptop/desktop instead of a narrow centered card. */
.sc{height:100dvh;min-height:100svh;padding:calc(var(--toolbar-h) + var(--progress-h) + 8px + var(--safe-top)) 24px calc(22px + var(--safe-bottom));align-items:stretch}
.sl,.sl[style]{width:100%;max-width:1540px;height:100%;max-height:none;margin:0 auto;overscroll-behavior:contain;scrollbar-gutter:stable;scroll-behavior:smooth}
.nb{width:48px;height:48px;touch-action:manipulation}.sn{bottom:calc(14px + var(--safe-bottom))}.to{bottom:calc(18px + var(--safe-bottom));max-width:calc(100vw - 24px);white-space:normal;text-align:center}
.tb,.bt,.rb,.mi,.qo,.vc,.hw{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.fi,input[type=text]{min-height:40px}.tt2{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.tt2 tbody{display:table;width:100%;min-width:560px}
img{max-width:100%;height:auto}.hi,.si2,.wi2,.vi{object-position:center}.image-fallback{object-fit:contain;background:linear-gradient(135deg,#E0F2FE,#F0FDFA);padding:18px}.sl:focus{outline:none}
.mobile-nav{display:none}
@media (hover:none){.cd:hover,.ic:hover,.vc:hover,.bt:hover,.rb:hover,.nb:hover,.qo:hover,.hw:hover{transform:none;box-shadow:initial}.nb:hover{transform:translateY(-50%)}}
@media(max-width:900px){
  :root{--toolbar-h:52px;--nav-h:62px}
  body{background:#F8FAFC}
  .tbar{justify-content:flex-start;overflow:visible}.teacher-title{display:none}.menu-toggle{display:inline-flex}.teacher-tools{display:none!important;position:fixed;top:calc(var(--toolbar-h) + var(--safe-top) + 8px);left:10px;right:10px;padding:10px;background:var(--dark);border-radius:14px;box-shadow:0 14px 30px rgba(15,23,42,.28);flex-wrap:wrap;z-index:260}.tbar.tools-open .teacher-tools{display:flex!important}.teacher-tools .tb{flex:1 1 auto;justify-content:center;min-height:42px}.tbar label{margin-left:auto;min-height:42px;padding:0 6px}
  .sc{padding:calc(var(--toolbar-h) + var(--progress-h) + 8px + var(--safe-top)) 10px calc(var(--nav-h) + 10px + var(--safe-bottom));align-items:stretch}
  .sl,.sl[style]{max-width:none;width:100%;height:100%;max-height:none;padding:20px 16px 28px!important;border-radius:14px;box-shadow:none;overflow-y:auto;overflow-x:hidden}
  .sl *{min-width:0}.sl h1[style*="font-size"]{font-size:clamp(27px,9vw,38px)!important;line-height:1.12!important;overflow-wrap:anywhere}.sl h2,.sl h3,.sl h4{overflow-wrap:anywhere}
  .g2,.g3,.g4{grid-template-columns:minmax(0,1fr)!important;gap:12px!important}
  .st{font-size:clamp(25px,7vw,34px)}.ss{font-size:15px;margin-bottom:18px}.sb{font-size:11px;margin-bottom:10px}.cd,.ic,.vc,.rc{padding:15px}.oi{font-size:14px}.tt2 td,.tt2 th{padding:9px 10px}.fi{width:min(46vw,180px)!important;max-width:100%;font-size:16px}.bt{min-height:44px}.mi,.qo,.rb,.hw{min-height:46px}
  .hi{max-height:145px;margin-bottom:14px}.si2{height:130px}.wi2{height:145px}.vi{height:110px}
  .nb{top:auto;bottom:calc(8px + var(--safe-bottom));transform:none;width:52px;height:48px;border-radius:15px;background:var(--dark);color:#fff;border:0;box-shadow:0 6px 18px rgba(15,23,42,.25)}.nb:hover{transform:none}.np{left:12px}.nn{right:12px}.sn{bottom:calc(16px + var(--safe-bottom));padding:7px 14px;pointer-events:none}
  .ei{right:10px;left:10px;bottom:calc(var(--nav-h) + 12px + var(--safe-bottom));justify-content:center;text-align:center}
  [contenteditable=true]{min-height:28px}
}
@media(max-width:480px){
  .tbar{padding-left:8px;padding-right:8px}.tbar label{font-size:12px;gap:4px}.tbar input[type=checkbox]{width:18px;height:18px}.menu-toggle span{display:none}
  .sl,.sl[style]{padding:16px 13px 26px!important;border-radius:12px}.st{font-size:clamp(23px,7vw,30px)}.ss{font-size:14px}.cd,.ic,.vc,.rc{padding:13px}.tg{font-size:11px}.sb{max-width:100%}
  .g4 .vc{display:grid;grid-template-columns:92px 1fr;column-gap:10px;align-items:start}.g4 .vc .vi{grid-row:1/4;width:92px;height:92px;margin:0}.g4 .vc .ve{grid-column:1/-1;margin-top:8px}
  .qo{padding:11px 12px}.qo .ol{width:28px;height:28px}.fi{width:min(43vw,160px)!important;padding-inline:4px}
  .teacher-tools .tb span{display:none}.teacher-tools .tb{flex:1 1 44px;padding:8px}
}
@media(orientation:landscape) and (max-height:560px){
  :root{--toolbar-h:44px;--nav-h:54px}.tbar{padding-top:calc(4px + var(--safe-top));padding-bottom:4px}.sc{padding-top:calc(var(--toolbar-h) + var(--progress-h) + 5px + var(--safe-top));padding-bottom:calc(var(--nav-h) + 5px + var(--safe-bottom))}.sl{padding-top:14px;padding-bottom:18px}.st{font-size:25px}.ss{margin-bottom:12px}.nb{height:42px;bottom:calc(6px + var(--safe-bottom))}.sn{bottom:calc(12px + var(--safe-bottom))}
}
@media print{.teacher-tools{display:none!important}.sc{min-height:0}}
'''
content = content.replace('</style>', mobile_css + '\n</style>', 1)

# Add robust interaction enhancements before the lesson's closing script.
addon_js = r'''

// ===== Responsive presentation enhancements =====
function toggleTools(){
  const bar=document.querySelector('.tbar');
  const btn=document.querySelector('.menu-toggle');
  const open=bar.classList.toggle('tools-open');
  if(btn)btn.setAttribute('aria-expanded',String(open));
}
function toggleFullscreen(){
  const el=document.documentElement;
  if(!document.fullscreenElement){
    const p=el.requestFullscreen?.();
    if(p?.catch)p.catch(()=>tS('<i class="fas fa-mobile-screen"></i> Use your browser menu for fullscreen'));
  }else document.exitFullscreen?.();
}
function closeTools(){
  const bar=document.querySelector('.tbar');
  const btn=document.querySelector('.menu-toggle');
  bar?.classList.remove('tools-open');
  btn?.setAttribute('aria-expanded','false');
}
function activeScroller(){return SL[cS]?.querySelector('.sl')}
function imageFallback(img){
  // Embedded images should never fail, but retain a visual illustration fallback
  // for unusual browser decode errors rather than replacing the image with text.
  const bg='#E0F2FE',accent='#0D9488';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 240"><rect width="1100" height="240" rx="28" fill="${bg}"/><circle cx="150" cy="120" r="70" fill="#99F6E4"/><path d="M32 212l145-105 102 76 108-88 130 117" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><circle cx="900" cy="105" r="48" fill="${accent}" opacity=".25"/><text x="580" y="138" text-anchor="middle" font-family="Arial,sans-serif" font-size="36" font-weight="700" fill="#1E293B">English lesson</text></svg>`;
  img.onerror=null;img.src='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));img.classList.add('image-fallback');
}
document.querySelectorAll('img').forEach(img=>{img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.addEventListener('error',()=>imageFallback(img),{once:true});if(img.complete&&!img.naturalWidth)imageFallback(img)});
const originalSS=sS;
sS=function(i){
  originalSS(i);
  activeScroller()?.scrollTo({top:0,behavior:'instant'});
  history.replaceState(null,'',`#slide-${i+1}`);
  closeTools();
};
(function restoreSlide(){
  const m=location.hash.match(/slide-(\d+)/);
  if(m){cS=Math.max(0,Math.min(TL-1,Number(m[1])-1));sS(cS)}
})();
let touchStartX=0,touchStartY=0,touchAt=0;
document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1)return;
  touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;touchAt=Date.now();
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!touchAt||e.changedTouches.length!==1)return;
  const dx=e.changedTouches[0].clientX-touchStartX;
  const dy=e.changedTouches[0].clientY-touchStartY;
  const target=e.target;
  touchAt=0;
  if(target.closest('input,textarea,select,button,[contenteditable=true],.rb,.mi,.qo,.vc,.hw'))return;
  if(Date.now()-touchAt>900)return;
  if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.35){dx<0?nS():pS()}
},{passive:true});
document.addEventListener('click',e=>{if(!e.target.closest('.tbar'))closeTools()});
window.addEventListener('orientationchange',()=>setTimeout(()=>activeScroller()?.scrollTo({top:0}),150));
'''
content = content.replace('\n</script>', addon_js + '\n</script>', 1)

# Fix the swipe elapsed-time variable after injection (capture before reset).
content = content.replace(
    "const target=e.target;\n  touchAt=0;\n  if(target.closest('input,textarea,select,button,[contenteditable=true],.rb,.mi,.qo,.vc,.hw'))return;\n  if(Date.now()-touchAt>900)return;",
    "const target=e.target;\n  const elapsed=Date.now()-touchAt;touchAt=0;\n  if(target.closest('input,textarea,select,button,[contenteditable=true],.rb,.mi,.qo,.vc,.hw'))return;\n  if(elapsed>900)return;"
)

# Keep the standalone file compact but human-readable around major blocks.
body_marker = '<header class="tbar"'
html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' + content[:content.index(body_marker)].strip() + '\n</head>\n<body>\n' + content[content.index(body_marker):].strip() + '\n</body>\n</html>\n'
out.write_text(html, encoding="utf-8")
print(f"Wrote {out} ({len(html):,} chars)")
