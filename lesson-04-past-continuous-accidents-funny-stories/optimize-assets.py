from pathlib import Path
from PIL import Image

folder = Path(__file__).parent / "assets"
for source in sorted(folder.glob("*-v2.png")):
    destination = source.with_suffix(".webp")
    with Image.open(source) as image:
        image.save(destination, "WEBP", quality=82, method=6)
    print(f"{source.name}: {source.stat().st_size} -> {destination.name}: {destination.stat().st_size}")
