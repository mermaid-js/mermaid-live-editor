import{a0 as ln,a1 as an,a2 as y,a3 as tn,a4 as H,a5 as q,a6 as _,a7 as un,a8 as B,a9 as rn,aa as L,ab as o,ac as sn,ad as on,ae as fn}from"./Br9u7Cn3.js";function cn(l){return l.innerRadius}function yn(l){return l.outerRadius}function gn(l){return l.startAngle}function dn(l){return l.endAngle}function mn(l){return l&&l.padAngle}function pn(l,h,I,D,v,A,C,a){var O=I-l,i=D-h,n=C-v,d=a-A,u=d*O-n*i;if(!(u*u<y))return u=(n*(h-A)-d*(l-v))/u,[l+u*O,h+u*i]}function W(l,h,I,D,v,A,C){var a=l-I,O=h-D,i=(C?A:-A)/L(a*a+O*O),n=i*O,d=-i*a,u=l+n,s=h+d,f=I+n,c=D+d,F=(u+f)/2,t=(s+c)/2,m=f-u,g=c-s,R=m*m+g*g,T=v-A,P=u*c-f*s,S=(g<0?-1:1)*L(fn(0,T*T*R-P*P)),j=(P*g-m*S)/R,z=(-P*m-g*S)/R,w=(P*g+m*S)/R,p=(-P*m+g*S)/R,x=j-F,e=z-t,r=w-F,G=p-t;return x*x+e*e>r*r+G*G&&(j=w,z=p),{cx:j,cy:z,x01:-n,y01:-d,x11:j*(v/T-1),y11:z*(v/T-1)}}function hn(){var l=cn,h=yn,I=B(0),D=null,v=gn,A=dn,C=mn,a=null,O=ln(i);function i(){var n,d,u=+l.apply(this,arguments),s=+h.apply(this,arguments),f=v.apply(this,arguments)-an,c=A.apply(this,arguments)-an,F=un(c-f),t=c>f;if(a||(a=n=O()),s<u&&(d=s,s=u,u=d),!(s>y))a.moveTo(0,0);else if(F>tn-y)a.moveTo(s*H(f),s*q(f)),a.arc(0,0,s,f,c,!t),u>y&&(a.moveTo(u*H(c),u*q(c)),a.arc(0,0,u,c,f,t));else{var m=f,g=c,R=f,T=c,P=F,S=F,j=C.apply(this,arguments)/2,z=j>y&&(D?+D.apply(this,arguments):L(u*u+s*s)),w=_(un(s-u)/2,+I.apply(this,arguments)),p=w,x=w,e,r;if(z>y){var G=sn(z/u*q(j)),M=sn(z/s*q(j));(P-=G*2)>y?(G*=t?1:-1,R+=G,T-=G):(P=0,R=T=(f+c)/2),(S-=M*2)>y?(M*=t?1:-1,m+=M,g-=M):(S=0,m=g=(f+c)/2)}var J=s*H(m),K=s*q(m),N=u*H(T),Q=u*q(T);if(w>y){var U=s*H(g),V=s*q(g),X=u*H(R),Y=u*q(R),E;if(F<rn)if(E=pn(J,K,X,Y,U,V,N,Q)){var Z=J-E[0],$=K-E[1],b=U-E[0],k=V-E[1],nn=1/q(on((Z*b+$*k)/(L(Z*Z+$*$)*L(b*b+k*k)))/2),en=L(E[0]*E[0]+E[1]*E[1]);p=_(w,(u-en)/(nn-1)),x=_(w,(s-en)/(nn+1))}else p=x=0}S>y?x>y?(e=W(X,Y,J,K,s,x,t),r=W(U,V,N,Q,s,x,t),a.moveTo(e.cx+e.x01,e.cy+e.y01),x<w?a.arc(e.cx,e.cy,x,o(e.y01,e.x01),o(r.y01,r.x01),!t):(a.arc(e.cx,e.cy,x,o(e.y01,e.x01),o(e.y11,e.x11),!t),a.arc(0,0,s,o(e.cy+e.y11,e.cx+e.x11),o(r.cy+r.y11,r.cx+r.x11),!t),a.arc(r.cx,r.cy,x,o(r.y11,r.x11),o(r.y01,r.x01),!t))):(a.moveTo(J,K),a.arc(0,0,s,m,g,!t)):a.moveTo(J,K),!(u>y)||!(P>y)?a.lineTo(N,Q):p>y?(e=W(N,Q,U,V,u,-p,t),r=W(J,K,X,Y,u,-p,t),a.lineTo(e.cx+e.x01,e.cy+e.y01),p<w?a.arc(e.cx,e.cy,p,o(e.y01,e.x01),o(r.y01,r.x01),!t):(a.arc(e.cx,e.cy,p,o(e.y01,e.x01),o(e.y11,e.x11),!t),a.arc(0,0,u,o(e.cy+e.y11,e.cx+e.x11),o(r.cy+r.y11,r.cx+r.x11),t),a.arc(r.cx,r.cy,p,o(r.y11,r.x11),o(r.y01,r.x01),!t))):a.arc(0,0,u,T,R,t)}if(a.closePath(),n)return a=null,n+""||null}return i.centroid=function(){var n=(+l.apply(this,arguments)+ +h.apply(this,arguments))/2,d=(+v.apply(this,arguments)+ +A.apply(this,arguments))/2-rn/2;return[H(d)*n,q(d)*n]},i.innerRadius=function(n){return arguments.length?(l=typeof n=="function"?n:B(+n),i):l},i.outerRadius=function(n){return arguments.length?(h=typeof n=="function"?n:B(+n),i):h},i.cornerRadius=function(n){return arguments.length?(I=typeof n=="function"?n:B(+n),i):I},i.padRadius=function(n){return arguments.length?(D=n==null?null:typeof n=="function"?n:B(+n),i):D},i.startAngle=function(n){return arguments.length?(v=typeof n=="function"?n:B(+n),i):v},i.endAngle=function(n){return arguments.length?(A=typeof n=="function"?n:B(+n),i):A},i.padAngle=function(n){return arguments.length?(C=typeof n=="function"?n:B(+n),i):C},i.context=function(n){return arguments.length?(a=n??null,i):a},i}export{hn as d};
