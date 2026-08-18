# -*- coding: utf-8 -*-
import io, re

path = r'c:\Users\doktu\OneDrive\Desktop\presentations\workbuddy presentations\lesson-preint2-revision-mobile.html'
with io.open(path, 'r', encoding='utf-8') as f:
    content = f.read()

slides = []
pos = 0
while True:
    start = content.find('data-slide="', pos)
    if start == -1:
        break
    q1 = content.find('"', start + 12)
    slide_num = int(content[start + 12:q1])
    slides.append((slide_num, start))
    pos = start + 1

print(f'Total slides found: {len(slides)}')
for n, p in slides:
    print(f'  data-slide={n} at pos {p}')

# Show raw region between end of slide 3 and start of slide 4
s3_pos = next(p for n,p in slides if n==3)
s4_pos = next(p for n,p in slides if n==4)

region = content[s3_pos - 50 : s4_pos + 600]
region_clean = re.sub(r'src="data:image[^"]{0,20}[^"]*"', 'src="[IMG]"', region)
region_clean = re.sub(r'\s+', ' ', region_clean)
print()
print('=== Slide 3 end / Slide 4 start transition ===')
print(region_clean[:1200])

# Count all opening/closing .sc divs  
print()
print('=== div balance per slide ===')
for i, (n, p) in enumerate(slides):
    end = slides[i+1][1] if i+1 < len(slides) else len(content)
    chunk = content[p:end]
    opens = chunk.count('<div')
    closes = chunk.count('</div>')
    print(f'  slide {n}: <div={opens} </div>={closes} diff={opens-closes}')
