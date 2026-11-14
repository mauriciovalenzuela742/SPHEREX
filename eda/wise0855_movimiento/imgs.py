import sys, numpy as np
from PIL import Image, ImageDraw
from analiza import load, fit, pred
Z=12
def gray(a,lo,hi):
    x=np.clip((a-lo)/(hi-lo),0,1); x=np.arcsinh(x/0.1)/np.arcsinh(10); return (x*255).astype(np.uint8)
def up(rgb): return np.kron(rgb,np.ones((Z,Z,1) if rgb.ndim==3 else (Z,Z))).astype(np.uint8)
def tile(arr,label):
    im=Image.fromarray(np.flipud(up(arr))).convert('RGB'); dr=ImageDraw.Draw(im); dr.text((4,4),label,fill=(255,255,0)); return im
def diff(a0,a1,crop=None):
    q0,_=fit(a0,*pred(D0['t'],n)); q1,_=fit(a1,*pred(D1['t'],n))
    s=(q0[0]*q0[3]**2)/(q1[0]*q1[3]**2)  # iguala flujo del objeto
    d=a1*s-a0; lim=np.nanpercentile(np.abs(d),99.8); x=np.clip(d/lim,-1,1)
    r=np.where(x>0,128+127*x,128*(1+x)); g=128*(1-np.abs(x)); b=np.where(x<0,128-127*x,128*(1-x))
    return np.stack([r,g,b],-1),s,q0,q1
b=int(sys.argv[1]); v0=int(sys.argv[2]); v1=int(sys.argv[3]); tag=sys.argv[4]
F=[load(f'raw/b{b}_v{v}.json') for v in range(5)]
n=F[0][1].shape[0]
allp=np.concatenate([a.ravel() for d,a in F]); lo,hi=np.nanpercentile(allp,[1,99.8])
tiles=[tile(gray(a,lo,hi),f"D{b} {d['t'][:10]} {d['wavelength_um']:.3f}um x{d['n_stacked']}") for d,a in F]
W=sum(t.width for t in tiles); strip=Image.new('RGB',(W,tiles[0].height))
x=0
for t in tiles: strip.paste(t,(x,0)); x+=t.width
strip.save(f'tira_D{b}.png')
(D0,a0),(D1,a1)=F[v0],F[v1]
rgb,s,q0,q1=diff(a0,a1)
im=tile(rgb,f"D{b} v{v1}-v{v0} ({D1['t'][:7]} - {D0['t'][:7]}) lam {D0['wavelength_um']:.2f}/{D1['wavelength_um']:.2f}")
dr=ImageDraw.Draw(im)
for q,c in ((q0,(0,255,255)),(q1,(255,255,0))):
    X=(q[1]+0.5)*Z; Y=(n-q[2]-0.5)*Z; dr.ellipse([X-4,Y-4,X+4,Y+4],outline=c)
# recorte central 12x12 px ampliado
c=(n-1)/2; im.save(f'resta_D{b}_{tag}.png')
im.crop((int((c-6)*Z),int((n-c-7)*Z),int((c+7)*Z),int((n-c+6)*Z))).resize((13*Z*2,13*Z*2),Image.NEAREST).save(f'resta_D{b}_{tag}_zoom.png')
print(f"D{b} v{v0}->v{v1}: scale={s:.2f} shift dx={q1[1]-q0[1]:+.2f} dy={q1[2]-q0[2]:+.2f} px")
