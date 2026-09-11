"""Generate FaturaPro raster icons from the existing document/swoosh mark."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SCALE = 8


def render(size: int, maskable: bool = False) -> Image.Image:
    canvas = 64 * SCALE
    image = Image.new("RGBA", (canvas, canvas), "#0A0A0F")
    draw = ImageDraw.Draw(image)
    s = SCALE
    if maskable:
        # Keep the mark inside the PWA safe zone.
        inset = 5 * s
        draw.rounded_rectangle((inset, inset, canvas - inset, canvas - inset), radius=13*s, fill="#0A0A0F")
    light = "#EEEAE2"
    primary = "#6366F1"
    highlight = "#7C6CF2"
    width = 4 * s
    # Document outline, with the folded corner drawn as separate segments.
    draw.line([(19*s, 9*s), (41*s, 9*s), (50*s, 18*s), (50*s, 51*s), (46*s, 55*s),
               (19*s, 55*s), (15*s, 51*s), (15*s, 13*s), (19*s, 9*s)], fill=light, width=width, joint="curve")
    draw.line([(41*s, 9*s), (41*s, 19*s), (50*s, 19*s)], fill=light, width=width, joint="curve")
    draw.line([(23*s, 28*s), (41*s, 28*s)], fill=highlight, width=width)
    draw.line([(23*s, 36*s), (37*s, 36*s)], fill=highlight, width=width)
    # Existing swoosh and arrowhead.
    points = [(7,43),(12,48),(20,51),(30,52),(40,50),(52,44),(57,38),(58,33)]
    draw.line([(x*s,y*s) for x,y in points], fill=primary, width=width, joint="curve")
    draw.polygon([(53*s,28*s),(58*s,33*s),(57*s,25*s)], fill=primary)
    return image.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    for size, name in [(16,"favicon-16x16.png"),(32,"favicon-32x32.png"),(180,"apple-touch-icon.png"),(192,"logo192.png"),(512,"logo512.png")]:
        render(size).save(PUBLIC / name, optimize=True)
    render(192, maskable=True).save(PUBLIC / "logo192-maskable.png", optimize=True)
    render(512, maskable=True).save(PUBLIC / "logo512-maskable.png", optimize=True)
    render(64).save(PUBLIC / "favicon.ico", sizes=[(16,16),(32,32),(64,64)])


if __name__ == "__main__":
    main()
