import sys, numpy as np
from analiza import load, fit, pred
from scipy.ndimage import maximum_filter
b=sys.argv[1]; vs=range(5)
F=[load(f'raw/b{b}_v{v}.json') for v in vs]
st=np.nanmedian([a for d,a in F],axis=0); n=st.shape[0]
nz=1.4826*np.nanmedian(np.abs(st-np.nanmedian(st)))
pk=(st==maximum_filter(st,5))&(st>8*nz)
ys,xs=np.nonzero(pk); c=(n-1)/2
refs=[(x,y) for x,y in zip(xs,ys) if 3<x<n-4 and 3<y<n-4 and np.hypot(x-c,y-c)>3]
print('band',b,'refs',refs)
for v,(d,a) in zip(vs,F):
    off=[]
    for x,y in refs:
        q,e=fit(a,x,y,3)
        if q is not None and abs(q[1]-x)<1.5 and abs(q[2]-y)<1.5: off.append((q[1]-x,q[2]-y))
    off=np.array(off); m=np.median(off,0) if len(off) else (np.nan,np.nan)
    q,e=fit(a,*pred(d['t'],n))
    print(f"v{v} {d['t'][:10]} lam={d['wavelength_um']} nref={len(off)} refoff=({m[0]:+.2f},{m[1]:+.2f}) spread={off.std(0).round(2) if len(off) else ''} target=({q[1]:.2f},{q[2]:.2f}) corr=({q[1]-m[0]:.2f},{q[2]-m[1]:.2f})")
