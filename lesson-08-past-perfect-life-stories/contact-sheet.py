from pathlib import Path
import sys
from PIL import Image, ImageDraw

folder = Path(sys.argv[1])
files = sorted(folder.glob("scene-*.png"))
thumb_w, thumb_h, label_h, cols, rows = 380, 214, 28, 4, 4

for sheet_number, group in enumerate((files[:13], files[13:]), 1):
    sheet = Image.new("RGB", (thumb_w * cols, (thumb_h + label_h) * rows), (7, 26, 46))
    draw = ImageDraw.Draw(sheet)
    for index, source in enumerate(group):
        x = (index % cols) * thumb_w
        y = (index // cols) * (thumb_h + label_h)
        image = Image.open(source).convert("RGB").resize((thumb_w, thumb_h))
        sheet.paste(image, (x, y + label_h))
        draw.text((x + 8, y + 7), source.stem, fill="white")
    sheet.save(folder / f"contact-{sheet_number}.jpg", quality=91)
