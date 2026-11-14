import json, base64, sys, numpy as np
from scipy.optimize import curve_fit
from datetime import datetime
ESC=6.15
def load(p):
    d=json.load(open(p)); n=d['n_px']
    a=np.frombuffer(base64.b64decode(d['data']),'<f4').reshape(n,n).astype(float)
    return d,a
def yr(t): dt=datetime.fromisoformat(t.replace('Z','+00:00')); return dt.year+(dt.timetuple().tm_yday-0.5)/365.25
def pred(t,n):
    dt=yr(t)-2026.0
    dx=-(-8123.7*dt/1000)/ESC; dy=(673.2*dt/1000)/ESC
    c=(n-1)/2; return c+dx,c+dy
def g2(xy,A,x0,y0,s,B):
    x,y=xy; return (A*np.exp(-((x-x0)**2+(y-y0)**2)/(2*s*s))+B).ravel()
def fit(a,x0,y0,r=4):
    n=a.shape[0]; yy,xx=np.mgrid[0:n,0:n]
    m=(np.hypot(xx-x0,yy-y0)<=r)&np.isfinite(a)
    try:
        p,cov=curve_fit(lambda xy,*q:g2(xy,*q),(xx[m],yy[m]),a[m],p0=[np.nanmax(a[m]),x0,y0,1.0,0],maxfev=5000)
        e=np.sqrt(np.diag(cov)); return p,e
    except Exception as ex: return None,None
if __name__=='__main__':
    for p in sys.argv[1:]:
        d,a=load(p); n=d['n_px']; px,py=pred(d['t'],n)
        noise=1.4826*np.nanmedian(np.abs(a-np.nanmedian(a)))
        q,e=fit(a,px,py)
        s=f"{p}: t={d['t'][:10]} lam={d['wavelength_um']} nst={d['n_stacked']} nan={np.isnan(a).mean():.2f} noise={noise:.3g} pred=({px:.2f},{py:.2f})"
        if q is not None: s+=f" fit A/noise={q[0]/noise:.1f} x={q[1]:.2f}±{e[1]:.2f} y={q[2]:.2f}±{e[2]:.2f} sig={q[3]:.2f}"
        print(s)
