"""Construye astrotrack_pitch.pptx (editable) a partir del diseño de astrotrack_pitch.html: mismas imágenes, colores y
posiciones (el HTML mide 1920×1080 px; aquí 1 px = 1/144 pulgada en un lienzo de 13,333 × 7,5″), el video de 30 s
incrustado en la lámina 4 y el guion en las notas del orador.

Uso, desde presentaciones/pitch_mejorado:  python tools/hacer_pptx.py
"""
import html
import re
from pathlib import Path

from PIL import Image, ImageDraw
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Pt

AQUI = Path(__file__).resolve().parent.parent
IMG, FIG = AQUI / "img", AQUI / "figures"
SALIDA = AQUI / "astrotrack_pitch.pptx"
PX = 914400 / 144  # EMU por píxel del HTML
SERIF, SANS = "Cambria", "Calibri"
INK, SOFT = "F4F1FB", "C9C2DC"
BAND, PURPLE, ORANGE, BLUE = "241E3E", "5B3D8F", "F5821F", "4A7CF0"
AMBER, CYAN, MAGENTA = "FFC23D", "62D8F0", "FF5AD1"


def e(px):
    return Emu(int(px * PX))


def rgb(h):
    return RGBColor.from_string(h)


def fondo(s, archivo):
    """Imagen a sangre recortada a 16:9 (como background-size: cover) y un velo oscuro como el del HTML."""
    im = Image.open(IMG / archivo)
    w, h = im.size
    if w / h > 16 / 9:
        nw = int(h * 16 / 9)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w * 9 / 16)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    p = AQUI / "tools" / f"_bg_{archivo}"
    im.convert("RGB").resize((1920, 1080)).save(p, quality=85)
    s.shapes.add_picture(str(p), 0, 0, e(1920), e(1080))
    velo = caja(s, 0, 0, 1920, 1080, "050610")
    velo.fill.fore_color.rgb = rgb("050610")
    _transparencia(velo, 55)
    return p


def _transparencia(shape, pct):
    from pptx.oxml.ns import qn
    sf = shape.fill._xPr.find(qn("a:solidFill"))
    clr = sf[0]
    a = clr.makeelement(qn("a:alpha"), {"val": str(int((100 - pct) * 1000))})
    clr.append(a)


def caja(s, x, y, w, h, color, redondeada=False, borde=None):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if redondeada else MSO_SHAPE.RECTANGLE, e(x), e(y), e(w), e(h))
    if redondeada:
        sh.adjustments[0] = 0.06
    sh.fill.solid()
    sh.fill.fore_color.rgb = rgb(color)
    if borde:
        sh.line.color.rgb = rgb(borde)
        sh.line.width = Pt(2)
    else:
        sh.line.fill.background()
    sh.shadow.inherit = False
    return sh


def texto(s, x, y, w, h, partes, size, font=SANS, color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, shape=None,
          margen=0, interlinea=1.15):
    """partes: lista de párrafos; cada párrafo es una lista de (texto, {bold, color, size, font})."""
    if shape is None:
        shape = s.shapes.add_textbox(e(x), e(y), e(w), e(h))
    tf = shape.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    tf.vertical_anchor = anchor
    for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, m, e(margen))
    for i, par in enumerate(partes):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = interlinea
        for t, o in par:
            r = p.add_run()
            r.text = t
            f = r.font
            f.name = o.get("font", font)
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", False)
            f.color.rgb = rgb(o.get("color", color))
    return shape


def banda(s, x, y, w, h, t, size):
    sh = caja(s, x, y, w, h, BAND)
    _transparencia(sh, 10)
    texto(s, 0, 0, 0, 0, [[(t, {})]], size, font=SERIF, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, shape=sh)


def imagen(s, archivo, x, y, w=None, h=None):
    return s.shapes.add_picture(str(archivo), e(x), e(y), e(w) if w else None, e(h) if h else None)


def imagen_recortada(s, archivo, x, y, w, h, foco=(0.5, 0.5), zoom=1.0):
    im = Image.open(archivo).convert("RGB")
    iw, ih = im.size
    escala = max(w / iw, h / ih) * zoom
    cw, ch = w / escala, h / escala
    cx, cy = foco[0] * iw, foco[1] * ih
    l = min(max(cx - cw / 2, 0), iw - cw)
    t = min(max(cy - ch / 2, 0), ih - ch)
    p = AQUI / "tools" / f"_crop_{Path(archivo).stem}.jpg"
    im.crop((int(l), int(t), int(l + cw), int(t + ch))).resize((int(w * 1.5), int(h * 1.5))).save(p, quality=88)
    return imagen(s, p, x, y, w, h)


def imagen_contenida(s, archivo, x, y, w, h, fondo_color):
    caja(s, x, y, w, h, fondo_color, redondeada=True)
    iw, ih = Image.open(archivo).size
    k = min(w / iw, h / ih)
    imagen(s, archivo, x + (w - iw * k) / 2, y + (h - ih * k) / 2, iw * k, ih * k)


def qr_png():
    js = (IMG / "qr.js").read_text(encoding="utf-8")
    n = int(re.search(r'viewBox="0 0 (\d+) \d+"', js).group(1))
    rects = [(int(a), int(b)) for a, b in re.findall(r'<rect x="(\d+)" y="(\d+)" width="1" height="1"/>', js)]
    k = 20
    im = Image.new("RGB", (n * k, n * k), "white")
    d = ImageDraw.Draw(im)
    for x, y in rects:
        d.rectangle([x * k, y * k, x * k + k - 1, y * k + k - 1], fill="black")
    p = AQUI / "tools" / "_qr.png"
    im.save(p)
    return p


def notas_html():
    h = (AQUI / "astrotrack_pitch.html").read_text(encoding="utf-8")
    return [html.unescape(n) for n in re.findall(r'data-notes="([^"]*)"', h)]


def main():
    prs = Presentation()
    prs.slide_width, prs.slide_height = e(1920), e(1080)
    blank = prs.slide_layouts[6]
    notas = notas_html()
    tiempos = re.findall(r'data-t="([^"]*)"', (AQUI / "astrotrack_pitch.html").read_text(encoding="utf-8"))
    temporales = []

    # 1 · portada
    s = prs.slides.add_slide(blank)
    temporales.append(fondo(s, "bg_cover.jpg"))
    imagen(s, IMG / "logo.png", 58, 42, w=270)
    texto(s, 64, 330, 950, 200, [[("ASTROTRACK", {"bold": True})]], 75, font=SERIF)
    texto(s, 68, 560, 900, 130, [[("A free web viewer for NASA's SPHEREx infrared sky: simple enough for any curious mind, "
                                   "deep enough for science (SDG 4).", {})]], 17, interlinea=1.3)
    texto(s, 1050, 290, 780, 300, [[("Who here could discover ", {}), ("a star nobody knows?", {"color": AMBER})]], 33,
          font=SERIF, align=PP_ALIGN.RIGHT)
    texto(s, 900, 990, 930, 40, [[("NASA Space Apps Challenge 2026 · Planet X and SPHEREx · Team Transientes", {})]], 12,
          color=SOFT, align=PP_ALIGN.RIGHT)

    # 2 · cualquiera puede descubrir
    s = prs.slides.add_slide(blank)
    temporales.append(fondo(s, "bg_trees.jpg"))
    banda(s, 150, 48, 860, 130, "Anyone can discover", 44)
    texto(s, 140, 225, 560, 60, [[("Backyard Worlds", {"bold": True})]], 23)
    b = caja(s, 110, 295, 560, 270, PURPLE)
    texto(s, 0, 0, 0, 0, [[("≈200,000 volunteers", {})], [("3,000+ brown dwarfs", {"bold": True})],
                          [("doubled the known ones", {})],
                          [("NASA Science, “NASA Volunteers Double Known Population of Brown Dwarfs”, 5 May 2026",
                            {"size": 10, "color": "E6DCFF"})]], 21, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
          shape=b, margen=24)
    imagen(s, IMG / "backyard.jpg", 180, 600, w=420)
    texto(s, 700, 430, 140, 140, [[("→", {"bold": True})]], 60, color=AMBER, align=PP_ALIGN.CENTER)
    imagen(s, IMG / "spherex.png", 860, 200, w=330)
    b1 = caja(s, 1210, 200, 620, 160, PURPLE)
    texto(s, 0, 0, 0, 0, [[("WISE", {"bold": True}), (", the telescope they searched, was ", {}),
                          ("switched off in 2024", {"bold": True}), (".", {})]], 20, anchor=MSO_ANCHOR.MIDDLE,
          shape=b1, margen=28)
    b2 = caja(s, 1210, 382, 620, 200, ORANGE)
    texto(s, 0, 0, 0, 0, [[("SPHEREx", {"bold": True}), (" (NASA, 2025) maps ", {}),
                          ("the whole sky every 6 months, in 102 infrared colors", {"bold": True}), (".", {})]], 20,
          anchor=MSO_ANCHOR.MIDDLE, shape=b2, margen=28)
    texto(s, 160, 870, 1600, 70, [[("Citizen science works. ", {"bold": True}),
                                   ("SPHEREx had no tool for it — until now.", {"bold": True, "color": AMBER})]], 22,
          align=PP_ALIGN.CENTER)
    texto(s, 180, 1010, 1300, 40, [[("Credits: Zooniverse / Backyard Worlds: Planet 9 · Illustration: NASA/JPL-Caltech", {})]],
          10, color=SOFT)

    # 3 · Chile
    s = prs.slides.add_slide(blank)
    temporales.append(fondo(s, "bg_milky.jpg"))
    banda(s, 300, 60, 960, 130, "Does Chile need this?", 44)
    b = caja(s, 120, 300, 760, 420, ORANGE, redondeada=True)
    texto(s, 0, 0, 0, 0, [[("7.5%", {"font": SERIF, "size": 95})],
                          [("of STEM students in Chile choose ", {}), ("natural sciences or mathematics", {"bold": True}),
                           (".", {})]], 21, anchor=MSO_ANCHOR.MIDDLE, shape=b, margen=46)
    b1 = caja(s, 1000, 320, 800, 160, BLUE, redondeada=True)
    texto(s, 0, 0, 0, 0, [[("STEM enrollment ", {}), ("almost doubled", {"bold": True}),
                          (": 193k → 354k students (2007–2023).", {})]], 20, anchor=MSO_ANCHOR.MIDDLE, shape=b1, margen=34)
    b2 = caja(s, 1000, 510, 800, 200, PURPLE, redondeada=True)
    texto(s, 0, 0, 0, 0, [[("Chile hosts many of the world's largest telescopes, yet ", {}),
                          ("few students choose the sciences", {"bold": True}), (" that use them.", {})]], 20,
          anchor=MSO_ANCHOR.MIDDLE, shape=b2, margen=34)
    texto(s, 60, 1020, 1400, 40, [[("Source: Minuta 24, OPPES-USACH (2024), pp. 4 and 6; data from mifuturo.cl.", {})]], 10,
          color=SOFT)

    # 4 · demo
    s = prs.slides.add_slide(blank)
    temporales.append(fondo(s, "bg_nebula.jpg"))
    banda(s, 60, 28, 1200, 100, "AstroTRACK, live on real SPHEREx data", 30)
    s.shapes.add_movie(str(FIG / "demo_pitch.mp4"), e(180), e(150), e(1560), e(877.5),
                       poster_frame_image=str(FIG / "demo_pitch_poster.png"), mime_type="video/mp4")
    texto(s, 900, 1035, 960, 40, [[("Recorded from the real app · data cached so the video does not wait for downloads", {})]],
          10, color=SOFT, align=PP_ALIGN.RIGHT)

    # 5 · lo que puedes hacer + resultado
    s = prs.slides.add_slide(blank)
    temporales.append(fondo(s, "bg_nebula.jpg"))
    banda(s, 60, 34, 900, 110, "With AstroTRACK you can…", 32)
    colw = (1800 - 68) / 3
    cols = [("EXPLORE & PLAY", AMBER, "Blink dates and colors, then earn your badge in Mission mode."),
            ("CONSULT", CYAN, "Spherix, the in-app guide, walks you through every step, in English or Spanish."),
            ("ANALYZE", MAGENTA, "Subtract, stack and build the 102-color spectrum of any spot.")]
    for i, (t, c, d) in enumerate(cols):
        x = 60 + i * (colw + 34)
        texto(s, x, 190, colw, 44, [[(t, {"bold": True, "color": c})]], 17)
        texto(s, x, 234, colw, 80, [[(d, {})]], 13, color=SOFT)
        if i == 0:
            imagen_contenida(s, IMG / "badge.jpg", x, 320, colw, 330, "0B0F26")
        elif i == 1:
            imagen_contenida(s, IMG / "spherix.jpg", x, 320, colw, 330, "000000")
        else:
            imagen_recortada(s, IMG / "app_spectrum.png", x, 320, colw, 330, foco=(0.55, 0.32))
    b = caja(s, 60, 680, 1800, 360, "140F28", redondeada=True, borde=AMBER)
    b.adjustments[0] = 0.04
    texto(s, 90, 700, 640, 330, [
        [("REAL SCIENCE · SPHEREx IMAGES ONLY, NO CATALOGS", {"bold": True, "color": AMBER, "size": 12})],
        [("8.67″ ", {"font": SERIF, "size": 40}), ("± 0.66″", {"font": SERIF, "size": 20, "color": SOFT})],
        [("WISE 0855 moved in one year; proper motion + parallax predict ", {}), ("8.04″", {"bold": True}),
         (". In a blind search, matching by position found ", {}), ("no", {"bold": True}),
         (" moving source; matching by its ", {}), ("spectral fingerprint", {"bold": True}), (" found ", {}),
         ("one: WISE 0855", {"bold": True}), (". Subtracting its colors erases the stars next to it.", {})]],
          12, interlinea=1.15)
    imagen_contenida(s, IMG / "fig_moved.png", 764, 704, 1066, 312, "FFFFFF")

    # 6 · cierre
    s = prs.slides.add_slide(blank)
    temporales.append(fondo(s, "bg_cover.jpg"))
    imagen(s, IMG / "logo.png", 90, 150, w=520)
    texto(s, 90, 470, 1050, 240, [[("Be the next ", {}), ("star hunter", {"color": AMBER}), (".", {})]], 48, font=SERIF)
    texto(s, 94, 720, 1000, 110, [[("Team Transientes", {"bold": True}),
                                   (" · ages 17 to 52 · making frontier science reachable for anyone with a browser.", {})]],
          16, interlinea=1.4)
    caja(s, 1260, 200, 520, 520, "FFFFFF", redondeada=True)
    q = qr_png()
    temporales.append(q)
    imagen(s, q, 1290, 230, 460, 460)
    texto(s, 1200, 740, 640, 44, [[("spherex-planet-x-tau.vercel.app", {"bold": True})]], 14, align=PP_ALIGN.CENTER)
    texto(s, 1200, 784, 640, 40, [[("Free · no sign-up · English & Spanish", {})]], 12, color=SOFT, align=PP_ALIGN.CENTER)
    texto(s, 94, 1010, 1700, 50, [[("This project uses data products from SPHEREx, a joint project of JPL and Caltech funded "
                                    "by NASA, via NASA/IPAC IRSA; 2MASS and AllWISE via CDS/IRSA. Built with Aladin Lite and "
                                    "Astropy.", {})]], 10, color=SOFT)

    for sl, n, t in zip(prs.slides, notas, tiempos):
        sl.notes_slide.notes_text_frame.text = f"[{t}] {n}"
    prs.save(SALIDA)
    for p in AQUI.glob("tools/_crop_*"):
        temporales.append(p)
    for p in set(temporales):
        p.unlink(missing_ok=True)
    print(SALIDA, f"{SALIDA.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
