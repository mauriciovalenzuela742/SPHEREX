import numpy as np
from analiza import load, fit, pred, yr, ESC
for b in (5,6):
    T=[];X=[];Y=[];W=[]
    for v in range(5):
        d,a=load(f'raw/b{b}_v{v}.json'); q,e=fit(a,*pred(d['t'],a.shape[0]))
        T.append(yr(d['t']));X.append(q[1]);Y.append(q[2]);W.append(1/max(e[1],0.05)**2)
    T=np.array(T)-2026;X=np.array(X);Y=np.array(Y);W=np.array(W)
    px=np.polyfit(T,X,1,w=np.sqrt(W));py=np.polyfit(T,Y,1,w=np.sqrt(W))
    rx=X-np.polyval(px,T)
    print(f"D{b}: dx/dt={px[0]:.2f} px/yr (pred 1.32) -> pmra={-px[0]*ESC*1000:.0f} mas/yr (pred -8124); dy/dt={py[0]:.2f} px/yr (pred 0.11) -> pmdec={py[0]*ESC*1000:.0f}; rms resid x={rx.std():.2f}px")
