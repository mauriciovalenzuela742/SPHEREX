import glob, os, sys, math, warnings
import numpy as np
from astropy.io import fits
from astropy.wcs import WCS, FITSFixedWarning
from scipy.ndimage import map_coordinates
warnings.simplefilter("ignore", FITSFixedWarning)
sys.path.insert(0, r"D:\dev\spherex-v2-integracion\scaffold\backend")
from app.frames.procesar import lambda_en
PIX = 6.15
GRUPOS = {"corto": (1, 2, 3), "medio": (4,), "largo": (5, 6)}
class Exp:
    def __init__(self, ruta):
        z = np.load(ruta)
        self.img = z["img"].astype(float); self.var = z["var"].astype(float)
        self.x0, self.y0 = int(z["x0"]), int(z["y0"])
        self.cab = fits.Header.fromstring(str(z["cab"])); self.wcs = WCS(self.cab)
        self.xs, self.ys, self.vals = z["xs"], z["ys"], z["vals"]
        self.mjd = float(z["mjd"]); self.banda = int(z["banda"]); self.ruta = ruta
        ok = np.isfinite(self.img)
        self.img = self.img - np.nanmedian(self.img)  # en lugar de ZODI (igual que el backend)
        self.omega = self.wcs.proj_plane_pixel_area().to_value("sr")
    def pix(self, ra, dec):  # coordenadas en la caja (0-based)
        x, y = self.wcs.all_world2pix(np.atleast_1d(ra), np.atleast_1d(dec), 0)
        return x - self.x0, y - self.y0
    def lam(self, xc, yc):
        return lambda_en(self.cab, self.xs, self.ys, self.vals, xc + self.x0, yc + self.y0)
def cargar(oid):
    ex = [Exp(r) for r in sorted(glob.glob(rf"D:\dev\informes_v2\huella_espectral\cajas\{oid}\*.npz"))]
    ex.sort(key=lambda e: e.mjd)
    pas = [[ex[0]]]
    for e in ex[1:]:
        (pas[-1].append(e) if e.mjd - pas[-1][-1].mjd <= 30 else pas.append([e]))
    return pas
def wcs_grid(ra, dec, n, esc):
    w = WCS(naxis=2); w.wcs.ctype = ["RA---TAN", "DEC--TAN"]; w.wcs.crval = [ra, dec]
    w.wcs.crpix = [(n + 1) / 2, (n + 1) / 2]; w.wcs.cdelt = [-esc / 3600, esc / 3600]; return w
def apilar(exps, wg, n):
    yy, xx = np.mgrid[0:n, 0:n]; ra, dec = wg.wcs_pix2world(xx, yy, 0)
    num = np.zeros((n, n)); den = np.zeros((n, n))
    for e in exps:
        xi, yi = e.pix(ra.ravel(), dec.ravel())
        val = np.isfinite(e.img) & np.isfinite(e.var) & (e.var > 0)
        im = map_coordinates(np.where(val, e.img, 0), [yi, xi], order=1, cval=np.nan).reshape(n, n)
        pv = map_coordinates(val.astype(float), [yi, xi], order=1, cval=0).reshape(n, n)
        vv = map_coordinates(np.where(val, e.var, 0), [yi, xi], order=1, cval=np.nan).reshape(n, n)
        ok = (pv > 0.99) & np.isfinite(im) & (vv > 0)
        w = np.where(ok, 1 / np.where(ok, vv, 1), 0)
        num += np.where(ok, im, 0) * w; den += w
    st = np.where(den > 0, num / np.where(den > 0, den, 1), np.nan)
    return st, np.where(den > 0, 1 / np.where(den > 0, den, 1), np.nan), den
