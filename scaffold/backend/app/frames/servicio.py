"""`/api/frames`: un fotograma por visita, con presupuesto de tiempo y respuesta parcial (ADR-001).

Una visita es un paso de SPHEREx por la zona (varias exposiciones en pocos días). Para ver movimiento
importa la base temporal, así que se procesan primero la primera y la última visita. Si se acaba el
presupuesto, se devuelve lo listo y en `pending` los epoch_id que faltan; el cliente vuelve a pedir con
`epochs=<pending>` y, para que la escala no salte, con los `vmin`/`vmax` de la primera respuesta.
"""

from __future__ import annotations

import time
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait

from app.irsa.config import CUTOUTS_EN_PARALELO
from app.irsa.cutouts import cutout
from app.irsa.sia2 import buscar_epocas, filtrar_fechas

from . import rangos, render
from .procesar import (
    ESCALA_ARCSEC,
    Fotograma,
    agrupar_visitas,
    apilar,
    del_centro,
    desde_cutout,
    n_pixeles,
)

MODOS = ("zodi_subtracted", "raw", "diff_first", "diff_prev")


def banda_de(detector: str) -> int | None:
    d = detector.strip()[-1:]
    return int(d) if d.isdigit() else None


def _una_exposicion(
    e: dict, banda: int, ra: float, dec: float, size: float, n: int, rapido: bool
) -> Fotograma:
    if rapido:
        try:
            return rangos.leer(e, banda, ra, dec, n)
        except Exception:
            pass  # respaldo: servicio de recortes (trae FLAGS)
    return desde_cutout(cutout(e, ra, dec, size), e, banda, ra, dec, n)


def _visita(
    grupo: list[dict], banda: int, ra: float, dec: float, size: float, n: int, rapido: bool
) -> Fotograma:
    fs, errores = [], []
    for e in grupo:
        try:
            fs.append(_una_exposicion(e, banda, ra, dec, size, n, rapido))
        except Exception as ex:  # una exposición mala no tumba la visita
            errores.append(f"{e['id']}: {type(ex).__name__}")
    if not fs:
        raise RuntimeError("; ".join(errores))
    f = apilar(fs)
    f.avisos += errores
    return f


def fotogramas(
    ra: float,
    dec: float,
    size: float = 0.1,
    band: int = 4,
    mode: str = "zodi_subtracted",
    stretch: str = "asinh",
    desde: str | None = None,
    hasta: str | None = None,
    per_visit: int = 1,
    budget_s: float = 8.0,
    epochs: list[str] | None = None,
    vmin: float | None = None,
    vmax: float | None = None,
    rapido: bool = True,
) -> dict:
    t_inicio = time.monotonic()
    avisos: list[str] = []
    todas = filtrar_fechas(buscar_epocas(ra, dec, size), desde, hasta)
    # El presupuesto cuenta desde aquí: la búsqueda (SIA2) va aparte y queda en caché en disco.
    t0 = time.monotonic()
    de_banda = [e for e in todas if banda_de(e["detector"]) == band]
    visitas = agrupar_visitas(de_banda)
    grupos = {f"{del_centro(v, 1)[0]['id']}D{band}": del_centro(v, per_visit) for v in visitas}
    orden = list(grupos)  # cronológico
    n = n_pixeles(size)

    pedidos = [k for k in orden if not epochs or k in set(epochs)]
    # La resta necesita su referencia aunque no se haya pedido.
    necesarias = list(pedidos)
    if mode == "diff_first" and orden and orden[0] not in necesarias:
        necesarias.insert(0, orden[0])
    if mode == "diff_prev":
        for k in pedidos:
            i = orden.index(k)
            if i > 0 and orden[i - 1] not in necesarias:
                necesarias.append(orden[i - 1])
    # Primero los extremos (dan la base temporal), luego el resto.
    extremos = [k for k in (orden[:1] + orden[-1:]) if k in necesarias]
    cola = extremos + [k for k in necesarias if k not in extremos]

    listos: dict[str, Fotograma] = {}
    ex = ThreadPoolExecutor(CUTOUTS_EN_PARALELO)
    futuros = {ex.submit(_visita, grupos[k], band, ra, dec, size, n, rapido): k for k in cola}
    restantes = set(futuros)
    while restantes:
        quedan = budget_s - (time.monotonic() - t0)
        if quedan <= 0:
            break
        hechos, restantes = wait(restantes, timeout=quedan, return_when=FIRST_COMPLETED)
        for fu in hechos:
            k = futuros[fu]
            try:
                listos[k] = fu.result()
                avisos += listos[k].avisos
            except Exception as e:
                avisos.append(f"{k}: se omitió ({e})")
    ex.shutdown(wait=False, cancel_futures=True)
    pendientes = [futuros[fu] for fu in restantes if futuros[fu] in pedidos]

    salida = [k for k in pedidos if k in listos]
    if vmin is None or vmax is None:
        vmin, vmax = render.escala_comun([listos[k].datos for k in salida])
    frames = []
    for k in salida:
        f = listos[k]
        if mode in ("diff_first", "diff_prev"):
            ref_k = orden[0] if mode == "diff_first" else orden[max(0, orden.index(k) - 1)]
            ref = listos.get(ref_k)
            png = (
                render.png_resta(f.datos, ref.datos)[0] if ref is not None and ref_k != k else None
            )
            if png is None:
                png = render.png_gris(f.datos, vmin, vmax, stretch)
                if ref is None:
                    avisos.append(f"{k}: falta su referencia para la resta; se muestra la imagen.")
        else:
            png = render.png_gris(f.datos, vmin, vmax, stretch)
        frames.append(
            {
                "t": f.t,
                "epoch_id": k,
                "collection": f.collection,
                "wavelength_um": None if f.wavelength_um is None else round(f.wavelength_um, 4),
                "bandwidth_um": None if f.bandwidth_um is None else round(f.bandwidth_um, 4),
                "png": png,
                "n_stacked": f.n_stacked,
                "method": f.method,
                "flagged_fraction": None
                if f.flagged_fraction is None
                else round(f.flagged_fraction, 4),
                "vmin": vmin,
                "vmax": vmax,
            }
        )

    lams = [f["wavelength_um"] for f in frames if f["wavelength_um"]]
    if len(lams) >= 2 and max(lams) - min(lams) > 0.1:
        avisos.append(
            f"Las visitas están a λ distintas ({min(lams):.2f}–{max(lams):.2f} µm): parte del "
            "cambio de brillo puede ser del filtro, no del objeto."
        )
    if not visitas:
        avisos.append(
            f"Sin observaciones de la banda {band} en ese rango. Prueba otra banda u otras fechas."
        )

    return {
        "ra": ra,
        "dec": dec,
        "size": size,
        "band": band,
        "mode": mode,
        "stretch": stretch,
        "pixel_scale_arcsec": ESCALA_ARCSEC,
        "n_pixels": n,
        "wcs": {
            "crval1": ra,
            "crval2": dec,
            "cdelt1": -ESCALA_ARCSEC / 3600,
            "cdelt2": ESCALA_ARCSEC / 3600,
        },
        "n_visits": len(orden),
        "n_frames": len(frames),
        "frames": frames,
        "pending": pendientes,
        "elapsed_s": round(time.monotonic() - t_inicio, 2),
        "warnings": avisos,
    }
