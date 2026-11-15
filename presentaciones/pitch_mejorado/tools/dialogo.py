"""Diálogo exacto del presentador (fuente única). Genera DIALOGO_PRESENTADOR.md y copia cada lámina a las notas de
astrotrack_pitch.html; después `python tools/hacer_pptx.py` las lleva al PowerPoint.

Los tiempos del video (lámina 4) salen de revisar demo_pitch.mp4 segundo a segundo: el subtítulo que aparece en
pantalla va entre comillas angulares para que el presentador se guíe por él.
Uso, desde presentaciones/pitch_mejorado:  python tools/dialogo.py
"""
import html
import re
from pathlib import Path

AQUI = Path(__file__).resolve().parent.parent

# (lámina, título, desde, hasta, [(t0, t1, qué se ve, qué dice)])
GUION = [
    (1, "Pregunta", "0:00", "0:08", [
        ("0:00", "0:08", "Portada", "Levanten la mano: ¿quién cree que podría descubrir una estrella que nadie conoce? "
         "[pausa de 2 segundos, mirar al público] Doscientas mil personas ya lo hicieron."),
    ]),
    (2, "Cualquiera puede descubrir", "0:08", "0:32", [
        ("0:08", "0:32", "Backyard Worlds → WISE se apagó → SPHEREx",
         "En Backyard Worlds, un proyecto de la NASA, voluntarios hicieron parpadear fotos del cielo y encontraron más "
         "de tres mil enanas marrones nuevas: duplicaron las que se conocían. Pero el telescopio que usaban, WISE, se "
         "apagó en 2024. Hoy SPHEREx fotografía todo el cielo cada seis meses, en 102 colores infrarrojos. Faltaba una "
         "herramienta para que cualquiera pudiera explorarlo."),
    ]),
    (3, "¿Chile lo necesita?", "0:32", "0:42", [
        ("0:32", "0:42", "7,5 %",
         "¿Y a Chile le importa? Tenemos telescopios gigantes, pero solo el 7,5 % de quienes estudian carreras STEM "
         "elige ciencias naturales o matemáticas."),
    ]),
    (4, "Demo en video (30 s, corre solo)", "0:42", "1:12", [
        ("0:42", "0:44", "«Anyone can start…» · foto de Epsilon Indi B", "Por eso creamos AstroTRACK."),
        ("0:44", "0:49", "«Spring 2025…» y «…October 2026» · se marcan A y B",
         "Entras y ves una foto de SPHEREx: Epsilon Indi B, una enana marrón cercana. Marcas dos fechas…"),
        ("0:49", "0:51", "«A − B» · par rojo y azul", "…las restas, y aparece: rojo donde estaba, azul donde está."),
        ("0:51", "0:53", "«One switch opens the science tools»", "Con un interruptor se abre lo científico:"),
        ("0:53", "0:59", "«Its spectrum…» y «The tool's reading…» · espectro y ficha",
         "su espectro en 102 colores, con huecos de agua y metano. La herramienta dice: enana marrón."),
        ("0:59", "1:02", "«Leave a note…» · comentario guardado", "Y dejas una nota para el próximo explorador."),
        ("1:02", "1:12", "«Every star has a history…» · Barnard en 2000, 2010 y 2026",
         "Cualquier estrella tiene historia: la de Barnard, en 2000, en 2010 y hoy, siempre avanzando."),
    ]),
    (5, "Lo que puedes hacer + resultado", "1:12", "1:42", [
        ("1:12", "1:42", "Explorar · Consultar · Analizar, y el recuadro 8,67″",
         "Y no es un juguete. Solo con imágenes de SPHEREx, sin catálogos, medimos que WISE 0855 se movió 8,7 segundos "
         "de arco en un año; la física predecía 8,0. Cuando se cruza con una estrella, usamos sus colores para borrar "
         "las estrellas quietas y dejarla sola. Así, cualquiera puede explorar y ganarse su insignia, Spherix le explica "
         "cada paso, y quien quiera hace ciencia de verdad."),
    ]),
    (6, "Cierre", "1:42", "2:00", [
        ("1:42", "2:00", "Logo y QR",
         "Somos Transientes: un equipo de 17 a 52 años, y nos ilusiona democratizar el acceso a la ciencia de frontera. "
         "Escaneen el QR y conviértanse en los próximos cazadores de estrellas. [pausa] Yo ya tengo mi insignia."),
    ]),
]


def seg(t):
    m, s = t.split(":")
    return int(m) * 60 + int(s)


def palabras(t):
    return len(re.findall(r"[\wáéíóúñÁÉÍÓÚÑ0-9,″]+", re.sub(r"\[[^\]]*\]", "", t)))


def main():
    out = ["# Diálogo del presentador · AstroTRACK (2:00)", "",
           "Láminas en inglés, se habla en español. El video de la lámina 4 dura 30 s y corre solo: se habla encima, "
           "siguiendo los subtítulos que aparecen en pantalla (entre « »). Ritmo de referencia: unas 2,3 palabras por "
           "segundo. Lo que va entre [corchetes] no se dice.", ""]
    notas = {}
    for n, titulo, a, b, filas in GUION:
        total = sum(palabras(f[3]) for f in filas)
        dur = seg(b) - seg(a)
        out += [f"## Lámina {n} · {titulo} · {a}–{b} ({dur} s, {total} palabras)", ""]
        if len(filas) > 1:
            out += ["| Tiempo | En pantalla | Dice |", "|---|---|---|"]
            out += [f"| {t0}–{t1} | {v} | {d} |" for t0, t1, v, d in filas]
        else:
            out += [f"> {filas[0][3]}"]
        out += [""]
        notas[n] = " ".join(f[3] for f in filas)
    out += ["## Si sobra o falta tiempo", "",
            "- **Si vas atrasado:** en la lámina 2 se puede omitir «un proyecto de la NASA», y en la 5, la frase de "
            "borrar estrellas.",
            "- **Si el video no arranca:** pulsa V o haz clic en él. Si no funciona, narra con la imagen fija: es el par "
            "rojo/azul de Epsilon Indi B.", ""]
    (AQUI / "DIALOGO_PRESENTADOR.md").write_text("\n".join(out), encoding="utf-8")

    p = AQUI / "astrotrack_pitch.html"
    h = p.read_text(encoding="utf-8")
    for n, texto in notas.items():
        h = re.sub(rf'(id="s{n}" data-t="[^"]*"\s*data-notes=")[^"]*(")',
                   lambda m: m.group(1) + html.escape(texto, quote=True) + m.group(2), h)
    p.write_text(h, encoding="utf-8")
    for n, titulo, a, b, filas in GUION:
        print(f"lámina {n}: {seg(b) - seg(a):>2} s, {sum(palabras(f[3]) for f in filas):>3} palabras, "
              f"{sum(palabras(f[3]) for f in filas) / (seg(b) - seg(a)):.1f} pal/s")


if __name__ == "__main__":
    main()
