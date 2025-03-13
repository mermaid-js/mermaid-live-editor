import{r as lt,A as O,a as at,W as L,k as st,X as ut,U as ft,D as Le,v as ct,N as me,t as dt,V as Ve,M as pt,d as I,b as mt,L as ht,c as gt,J as vt,e as yt,T as j,f as Fe,u as Ie,g as Ue,h as wt,C as he,Z as bt,i as G,K as xt,F as Tt,j as Ct,l as ne,m as ge,n as At,o as Et,p as St,q as Rt,s as Ot,w as Lt}from"./C7eeh343.js";const _e=["top","right","bottom","left"],De=["start","end"],Pe=_e.reduce((e,t)=>e.concat(t,t+"-"+De[0],t+"-"+De[1]),[]),ee=Math.min,Z=Math.max,se=Math.round,ae=Math.floor,q=e=>({x:e,y:e}),Ft={left:"right",right:"left",bottom:"top",top:"bottom"},Dt={start:"end",end:"start"};function we(e,t,n){return Z(e,ee(t,n))}function Y(e,t){return typeof e=="function"?e(t):e}function U(e){return e.split("-")[0]}function H(e){return e.split("-")[1]}function qe(e){return e==="x"?"y":"x"}function xe(e){return e==="y"?"height":"width"}function de(e){return["top","bottom"].includes(U(e))?"y":"x"}function Te(e){return qe(de(e))}function Xe(e,t,n){n===void 0&&(n=!1);const r=H(e),i=Te(e),o=xe(i);let l=i==="x"?r===(n?"end":"start")?"right":"left":r==="start"?"bottom":"top";return t.reference[o]>t.floating[o]&&(l=fe(l)),[l,fe(l)]}function Pt(e){const t=fe(e);return[ue(e),t,ue(t)]}function ue(e){return e.replace(/start|end/g,t=>Dt[t])}function kt(e,t,n){const r=["left","right"],i=["right","left"],o=["top","bottom"],l=["bottom","top"];switch(e){case"top":case"bottom":return n?t?i:r:t?r:i;case"left":case"right":return t?o:l;default:return[]}}function Bt(e,t,n,r){const i=H(e);let o=kt(U(e),n==="start",r);return i&&(o=o.map(l=>l+"-"+i),t&&(o=o.concat(o.map(ue)))),o}function fe(e){return e.replace(/left|right|bottom|top/g,t=>Ft[t])}function jt(e){return{top:0,right:0,bottom:0,left:0,...e}}function Ze(e){return typeof e!="number"?jt(e):{top:e,right:e,bottom:e,left:e}}function ce(e){const{x:t,y:n,width:r,height:i}=e;return{width:r,height:i,top:n,left:t,right:t+r,bottom:n+i,x:t,y:n}}function ke(e,t,n){let{reference:r,floating:i}=e;const o=de(t),l=Te(t),a=xe(l),u=U(t),f=o==="y",c=r.x+r.width/2-i.width/2,p=r.y+r.height/2-i.height/2,v=r[a]/2-i[a]/2;let d;switch(u){case"top":d={x:c,y:r.y-i.height};break;case"bottom":d={x:c,y:r.y+r.height};break;case"right":d={x:r.x+r.width,y:p};break;case"left":d={x:r.x-i.width,y:p};break;default:d={x:r.x,y:r.y}}switch(H(t)){case"start":d[l]-=v*(n&&f?-1:1);break;case"end":d[l]+=v*(n&&f?-1:1);break}return d}const Nt=async(e,t,n)=>{const{placement:r="bottom",strategy:i="absolute",middleware:o=[],platform:l}=n,a=o.filter(Boolean),u=await(l.isRTL==null?void 0:l.isRTL(t));let f=await l.getElementRects({reference:e,floating:t,strategy:i}),{x:c,y:p}=ke(f,r,u),v=r,d={},s=0;for(let h=0;h<a.length;h++){const{name:g,fn:y}=a[h],{x:w,y:b,data:x,reset:T}=await y({x:c,y:p,initialPlacement:r,placement:v,strategy:i,middlewareData:d,rects:f,platform:l,elements:{reference:e,floating:t}});c=w??c,p=b??p,d={...d,[g]:{...d[g],...x}},T&&s<=50&&(s++,typeof T=="object"&&(T.placement&&(v=T.placement),T.rects&&(f=T.rects===!0?await l.getElementRects({reference:e,floating:t,strategy:i}):T.rects),{x:c,y:p}=ke(f,v,u)),h=-1)}return{x:c,y:p,placement:v,strategy:i,middlewareData:d}};async function re(e,t){var n;t===void 0&&(t={});const{x:r,y:i,platform:o,rects:l,elements:a,strategy:u}=e,{boundary:f="clippingAncestors",rootBoundary:c="viewport",elementContext:p="floating",altBoundary:v=!1,padding:d=0}=Y(t,e),s=Ze(d),h=a[v?p==="floating"?"reference":"floating":p],g=ce(await o.getClippingRect({element:(n=await(o.isElement==null?void 0:o.isElement(h)))==null||n?h:h.contextElement||await(o.getDocumentElement==null?void 0:o.getDocumentElement(a.floating)),boundary:f,rootBoundary:c,strategy:u})),y=p==="floating"?{x:r,y:i,width:l.floating.width,height:l.floating.height}:l.reference,w=await(o.getOffsetParent==null?void 0:o.getOffsetParent(a.floating)),b=await(o.isElement==null?void 0:o.isElement(w))?await(o.getScale==null?void 0:o.getScale(w))||{x:1,y:1}:{x:1,y:1},x=ce(o.convertOffsetParentRelativeRectToViewportRelativeRect?await o.convertOffsetParentRelativeRectToViewportRelativeRect({elements:a,rect:y,offsetParent:w,strategy:u}):y);return{top:(g.top-x.top+s.top)/b.y,bottom:(x.bottom-g.bottom+s.bottom)/b.y,left:(g.left-x.left+s.left)/b.x,right:(x.right-g.right+s.right)/b.x}}const $t=e=>({name:"arrow",options:e,async fn(t){const{x:n,y:r,placement:i,rects:o,platform:l,elements:a,middlewareData:u}=t,{element:f,padding:c=0}=Y(e,t)||{};if(f==null)return{};const p=Ze(c),v={x:n,y:r},d=Te(i),s=xe(d),h=await l.getDimensions(f),g=d==="y",y=g?"top":"left",w=g?"bottom":"right",b=g?"clientHeight":"clientWidth",x=o.reference[s]+o.reference[d]-v[d]-o.floating[s],T=v[d]-o.reference[d],E=await(l.getOffsetParent==null?void 0:l.getOffsetParent(f));let m=E?E[b]:0;(!m||!await(l.isElement==null?void 0:l.isElement(E)))&&(m=a.floating[b]||o.floating[s]);const C=x/2-T/2,S=m/2-h[s]/2-1,F=ee(p[y],S),$=ee(p[w],S),R=F,k=m-h[s]-$,D=m/2-h[s]/2+C,B=we(R,D,k),W=!u.arrow&&H(i)!=null&&D!==B&&o.reference[s]/2-(D<R?F:$)-h[s]/2<0,V=W?D<R?D-R:D-k:0;return{[d]:v[d]+V,data:{[d]:B,centerOffset:D-B-V,...W&&{alignmentOffset:V}},reset:W}}});function Wt(e,t,n){return(e?[...n.filter(r=>H(r)===e),...n.filter(r=>H(r)!==e)]:n.filter(r=>U(r)===r)).filter(r=>e?H(r)===e||(t?ue(r)!==r:!1):!0)}const Ht=function(e){return e===void 0&&(e={}),{name:"autoPlacement",options:e,async fn(t){var n,r,i;const{rects:o,middlewareData:l,placement:a,platform:u,elements:f}=t,{crossAxis:c=!1,alignment:p,allowedPlacements:v=Pe,autoAlignment:d=!0,...s}=Y(e,t),h=p!==void 0||v===Pe?Wt(p||null,d,v):v,g=await re(t,s),y=((n=l.autoPlacement)==null?void 0:n.index)||0,w=h[y];if(w==null)return{};const b=Xe(w,o,await(u.isRTL==null?void 0:u.isRTL(f.floating)));if(a!==w)return{reset:{placement:h[0]}};const x=[g[U(w)],g[b[0]],g[b[1]]],T=[...((r=l.autoPlacement)==null?void 0:r.overflows)||[],{placement:w,overflows:x}],E=h[y+1];if(E)return{data:{index:y+1,overflows:T},reset:{placement:E}};const m=T.map(S=>{const F=H(S.placement);return[S.placement,F&&c?S.overflows.slice(0,2).reduce(($,R)=>$+R,0):S.overflows[0],S.overflows]}).sort((S,F)=>S[1]-F[1]),C=((i=m.filter(S=>S[2].slice(0,H(S[0])?2:3).every(F=>F<=0))[0])==null?void 0:i[0])||m[0][0];return C!==a?{data:{index:y+1,overflows:T},reset:{placement:C}}:{}}}},Mt=function(e){return e===void 0&&(e={}),{name:"flip",options:e,async fn(t){var n,r;const{placement:i,middlewareData:o,rects:l,initialPlacement:a,platform:u,elements:f}=t,{mainAxis:c=!0,crossAxis:p=!0,fallbackPlacements:v,fallbackStrategy:d="bestFit",fallbackAxisSideDirection:s="none",flipAlignment:h=!0,...g}=Y(e,t);if((n=o.arrow)!=null&&n.alignmentOffset)return{};const y=U(i),w=U(a)===a,b=await(u.isRTL==null?void 0:u.isRTL(f.floating)),x=v||(w||!h?[fe(a)]:Pt(a));!v&&s!=="none"&&x.push(...Bt(a,h,s,b));const T=[a,...x],E=await re(t,g),m=[];let C=((r=o.flip)==null?void 0:r.overflows)||[];if(c&&m.push(E[y]),p){const R=Xe(i,l,b);m.push(E[R[0]],E[R[1]])}if(C=[...C,{placement:i,overflows:m}],!m.every(R=>R<=0)){var S,F;const R=(((S=o.flip)==null?void 0:S.index)||0)+1,k=T[R];if(k)return{data:{index:R,overflows:C},reset:{placement:k}};let D=(F=C.filter(B=>B.overflows[0]<=0).sort((B,W)=>B.overflows[1]-W.overflows[1])[0])==null?void 0:F.placement;if(!D)switch(d){case"bestFit":{var $;const B=($=C.map(W=>[W.placement,W.overflows.filter(V=>V>0).reduce((V,ot)=>V+ot,0)]).sort((W,V)=>W[1]-V[1])[0])==null?void 0:$[0];B&&(D=B);break}case"initialPlacement":D=a;break}if(i!==D)return{reset:{placement:D}}}return{}}}};function Be(e,t){return{top:e.top-t.height,right:e.right-t.width,bottom:e.bottom-t.height,left:e.left-t.width}}function je(e){return _e.some(t=>e[t]>=0)}const zt=function(e){return e===void 0&&(e={}),{name:"hide",options:e,async fn(t){const{rects:n}=t,{strategy:r="referenceHidden",...i}=Y(e,t);switch(r){case"referenceHidden":{const o=await re(t,{...i,elementContext:"reference"}),l=Be(o,n.reference);return{data:{referenceHiddenOffsets:l,referenceHidden:je(l)}}}case"escaped":{const o=await re(t,{...i,altBoundary:!0}),l=Be(o,n.floating);return{data:{escapedOffsets:l,escaped:je(l)}}}default:return{}}}}};async function Vt(e,t){const{placement:n,platform:r,elements:i}=e,o=await(r.isRTL==null?void 0:r.isRTL(i.floating)),l=U(n),a=H(n),u=de(n)==="y",f=["left","top"].includes(l)?-1:1,c=o&&u?-1:1,p=Y(t,e);let{mainAxis:v,crossAxis:d,alignmentAxis:s}=typeof p=="number"?{mainAxis:p,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...p};return a&&typeof s=="number"&&(d=a==="end"?s*-1:s),u?{x:d*c,y:v*f}:{x:v*f,y:d*c}}const It=function(e){return e===void 0&&(e=0),{name:"offset",options:e,async fn(t){var n,r;const{x:i,y:o,placement:l,middlewareData:a}=t,u=await Vt(t,e);return l===((n=a.offset)==null?void 0:n.placement)&&(r=a.arrow)!=null&&r.alignmentOffset?{}:{x:i+u.x,y:o+u.y,data:{...u,placement:l}}}}},Ut=function(e){return e===void 0&&(e={}),{name:"shift",options:e,async fn(t){const{x:n,y:r,placement:i}=t,{mainAxis:o=!0,crossAxis:l=!1,limiter:a={fn:g=>{let{x:y,y:w}=g;return{x:y,y:w}}},...u}=Y(e,t),f={x:n,y:r},c=await re(t,u),p=de(U(i)),v=qe(p);let d=f[v],s=f[p];if(o){const g=v==="y"?"top":"left",y=v==="y"?"bottom":"right",w=d+c[g],b=d-c[y];d=we(w,d,b)}if(l){const g=p==="y"?"top":"left",y=p==="y"?"bottom":"right",w=s+c[g],b=s-c[y];s=we(w,s,b)}const h=a.fn({...t,[v]:d,[p]:s});return{...h,data:{x:h.x-n,y:h.y-r}}}}};function J(e){return Ce(e)?(e.nodeName||"").toLowerCase():"#document"}function P(e){var t;return(e==null||(t=e.ownerDocument)==null?void 0:t.defaultView)||window}function _(e){var t;return(t=(Ce(e)?e.ownerDocument:e.document)||window.document)==null?void 0:t.documentElement}function Ce(e){return e instanceof Node||e instanceof P(e).Node}function M(e){return e instanceof Element||e instanceof P(e).Element}function z(e){return e instanceof HTMLElement||e instanceof P(e).HTMLElement}function Ne(e){return typeof ShadowRoot>"u"?!1:e instanceof ShadowRoot||e instanceof P(e).ShadowRoot}function le(e){const{overflow:t,overflowX:n,overflowY:r,display:i}=N(e);return/auto|scroll|overlay|hidden|clip/.test(t+r+n)&&!["inline","contents"].includes(i)}function _t(e){return["table","td","th"].includes(J(e))}function Ae(e){const t=Ee(),n=N(e);return n.transform!=="none"||n.perspective!=="none"||(n.containerType?n.containerType!=="normal":!1)||!t&&(n.backdropFilter?n.backdropFilter!=="none":!1)||!t&&(n.filter?n.filter!=="none":!1)||["transform","perspective","filter"].some(r=>(n.willChange||"").includes(r))||["paint","layout","strict","content"].some(r=>(n.contain||"").includes(r))}function qt(e){let t=X(e);for(;z(t)&&!te(t);){if(Ae(t))return t;t=X(t)}return null}function Ee(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function te(e){return["html","body","#document"].includes(J(e))}function N(e){return P(e).getComputedStyle(e)}function pe(e){return M(e)?{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}:{scrollLeft:e.pageXOffset,scrollTop:e.pageYOffset}}function X(e){if(J(e)==="html")return e;const t=e.assignedSlot||e.parentNode||Ne(e)&&e.host||_(e);return Ne(t)?t.host:t}function Ke(e){const t=X(e);return te(t)?e.ownerDocument?e.ownerDocument.body:e.body:z(t)&&le(t)?t:Ke(t)}function ie(e,t,n){var r;t===void 0&&(t=[]),n===void 0&&(n=!0);const i=Ke(e),o=i===((r=e.ownerDocument)==null?void 0:r.body),l=P(i);return o?t.concat(l,l.visualViewport||[],le(i)?i:[],l.frameElement&&n?ie(l.frameElement):[]):t.concat(i,ie(i,[],n))}function Ye(e){const t=N(e);let n=parseFloat(t.width)||0,r=parseFloat(t.height)||0;const i=z(e),o=i?e.offsetWidth:n,l=i?e.offsetHeight:r,a=se(n)!==o||se(r)!==l;return a&&(n=o,r=l),{width:n,height:r,$:a}}function Se(e){return M(e)?e:e.contextElement}function Q(e){const t=Se(e);if(!z(t))return q(1);const n=t.getBoundingClientRect(),{width:r,height:i,$:o}=Ye(t);let l=(o?se(n.width):n.width)/r,a=(o?se(n.height):n.height)/i;return(!l||!Number.isFinite(l))&&(l=1),(!a||!Number.isFinite(a))&&(a=1),{x:l,y:a}}const Xt=q(0);function Je(e){const t=P(e);return!Ee()||!t.visualViewport?Xt:{x:t.visualViewport.offsetLeft,y:t.visualViewport.offsetTop}}function Zt(e,t,n){return t===void 0&&(t=!1),!n||t&&n!==P(e)?!1:t}function K(e,t,n,r){t===void 0&&(t=!1),n===void 0&&(n=!1);const i=e.getBoundingClientRect(),o=Se(e);let l=q(1);t&&(r?M(r)&&(l=Q(r)):l=Q(e));const a=Zt(o,n,r)?Je(o):q(0);let u=(i.left+a.x)/l.x,f=(i.top+a.y)/l.y,c=i.width/l.x,p=i.height/l.y;if(o){const v=P(o),d=r&&M(r)?P(r):r;let s=v,h=s.frameElement;for(;h&&r&&d!==s;){const g=Q(h),y=h.getBoundingClientRect(),w=N(h),b=y.left+(h.clientLeft+parseFloat(w.paddingLeft))*g.x,x=y.top+(h.clientTop+parseFloat(w.paddingTop))*g.y;u*=g.x,f*=g.y,c*=g.x,p*=g.y,u+=b,f+=x,s=P(h),h=s.frameElement}}return ce({width:c,height:p,x:u,y:f})}const Kt=[":popover-open",":modal"];function Re(e){return Kt.some(t=>{try{return e.matches(t)}catch{return!1}})}function Yt(e){let{elements:t,rect:n,offsetParent:r,strategy:i}=e;const o=i==="fixed",l=_(r),a=t?Re(t.floating):!1;if(r===l||a&&o)return n;let u={scrollLeft:0,scrollTop:0},f=q(1);const c=q(0),p=z(r);if((p||!p&&!o)&&((J(r)!=="body"||le(l))&&(u=pe(r)),z(r))){const v=K(r);f=Q(r),c.x=v.x+r.clientLeft,c.y=v.y+r.clientTop}return{width:n.width*f.x,height:n.height*f.y,x:n.x*f.x-u.scrollLeft*f.x+c.x,y:n.y*f.y-u.scrollTop*f.y+c.y}}function Jt(e){return Array.from(e.getClientRects())}function Ge(e){return K(_(e)).left+pe(e).scrollLeft}function Gt(e){const t=_(e),n=pe(e),r=e.ownerDocument.body,i=Z(t.scrollWidth,t.clientWidth,r.scrollWidth,r.clientWidth),o=Z(t.scrollHeight,t.clientHeight,r.scrollHeight,r.clientHeight);let l=-n.scrollLeft+Ge(e);const a=-n.scrollTop;return N(r).direction==="rtl"&&(l+=Z(t.clientWidth,r.clientWidth)-i),{width:i,height:o,x:l,y:a}}function Qt(e,t){const n=P(e),r=_(e),i=n.visualViewport;let o=r.clientWidth,l=r.clientHeight,a=0,u=0;if(i){o=i.width,l=i.height;const f=Ee();(!f||f&&t==="fixed")&&(a=i.offsetLeft,u=i.offsetTop)}return{width:o,height:l,x:a,y:u}}function en(e,t){const n=K(e,!0,t==="fixed"),r=n.top+e.clientTop,i=n.left+e.clientLeft,o=z(e)?Q(e):q(1),l=e.clientWidth*o.x,a=e.clientHeight*o.y,u=i*o.x,f=r*o.y;return{width:l,height:a,x:u,y:f}}function $e(e,t,n){let r;if(t==="viewport")r=Qt(e,n);else if(t==="document")r=Gt(_(e));else if(M(t))r=en(t,n);else{const i=Je(e);r={...t,x:t.x-i.x,y:t.y-i.y}}return ce(r)}function Qe(e,t){const n=X(e);return n===t||!M(n)||te(n)?!1:N(n).position==="fixed"||Qe(n,t)}function tn(e,t){const n=t.get(e);if(n)return n;let r=ie(e,[],!1).filter(a=>M(a)&&J(a)!=="body"),i=null;const o=N(e).position==="fixed";let l=o?X(e):e;for(;M(l)&&!te(l);){const a=N(l),u=Ae(l);!u&&a.position==="fixed"&&(i=null),(o?!u&&!i:!u&&a.position==="static"&&i&&["absolute","fixed"].includes(i.position)||le(l)&&!u&&Qe(e,l))?r=r.filter(f=>f!==l):i=a,l=X(l)}return t.set(e,r),r}function nn(e){let{element:t,boundary:n,rootBoundary:r,strategy:i}=e;const o=[...n==="clippingAncestors"?Re(t)?[]:tn(t,this._c):[].concat(n),r],l=o[0],a=o.reduce((u,f)=>{const c=$e(t,f,i);return u.top=Z(c.top,u.top),u.right=ee(c.right,u.right),u.bottom=ee(c.bottom,u.bottom),u.left=Z(c.left,u.left),u},$e(t,l,i));return{width:a.right-a.left,height:a.bottom-a.top,x:a.left,y:a.top}}function rn(e){const{width:t,height:n}=Ye(e);return{width:t,height:n}}function on(e,t,n){const r=z(t),i=_(t),o=n==="fixed",l=K(e,!0,o,t);let a={scrollLeft:0,scrollTop:0};const u=q(0);if(r||!r&&!o)if((J(t)!=="body"||le(i))&&(a=pe(t)),r){const p=K(t,!0,o,t);u.x=p.x+t.clientLeft,u.y=p.y+t.clientTop}else i&&(u.x=Ge(i));const f=l.left+a.scrollLeft-u.x,c=l.top+a.scrollTop-u.y;return{x:f,y:c,width:l.width,height:l.height}}function ve(e){return N(e).position==="static"}function We(e,t){return!z(e)||N(e).position==="fixed"?null:t?t(e):e.offsetParent}function et(e,t){const n=P(e);if(Re(e))return n;if(!z(e)){let i=X(e);for(;i&&!te(i);){if(M(i)&&!ve(i))return i;i=X(i)}return n}let r=We(e,t);for(;r&&_t(r)&&ve(r);)r=We(r,t);return r&&te(r)&&ve(r)&&!Ae(r)?n:r||qt(e)||n}const ln=async function(e){const t=this.getOffsetParent||et,n=this.getDimensions,r=await n(e.floating);return{reference:on(e.reference,await t(e.floating),e.strategy),floating:{x:0,y:0,width:r.width,height:r.height}}};function an(e){return N(e).direction==="rtl"}const sn={convertOffsetParentRelativeRectToViewportRelativeRect:Yt,getDocumentElement:_,getClippingRect:nn,getOffsetParent:et,getElementRects:ln,getClientRects:Jt,getDimensions:rn,getScale:Q,isElement:M,isRTL:an};function un(e,t){let n=null,r;const i=_(e);function o(){var a;clearTimeout(r),(a=n)==null||a.disconnect(),n=null}function l(a,u){a===void 0&&(a=!1),u===void 0&&(u=1),o();const{left:f,top:c,width:p,height:v}=e.getBoundingClientRect();if(a||t(),!p||!v)return;const d=ae(c),s=ae(i.clientWidth-(f+p)),h=ae(i.clientHeight-(c+v)),g=ae(f),y={rootMargin:-d+"px "+-s+"px "+-h+"px "+-g+"px",threshold:Z(0,ee(1,u))||1};let w=!0;function b(x){const T=x[0].intersectionRatio;if(T!==u){if(!w)return l();T?l(!1,T):r=setTimeout(()=>{l(!1,1e-7)},1e3)}w=!1}try{n=new IntersectionObserver(b,{...y,root:i.ownerDocument})}catch{n=new IntersectionObserver(b,y)}n.observe(e)}return l(!0),o}function fn(e,t,n,r){r===void 0&&(r={});const{ancestorScroll:i=!0,ancestorResize:o=!0,elementResize:l=typeof ResizeObserver=="function",layoutShift:a=typeof IntersectionObserver=="function",animationFrame:u=!1}=r,f=Se(e),c=i||o?[...f?ie(f):[],...ie(t)]:[];c.forEach(y=>{i&&y.addEventListener("scroll",n,{passive:!0}),o&&y.addEventListener("resize",n)});const p=f&&a?un(f,n):null;let v=-1,d=null;l&&(d=new ResizeObserver(y=>{let[w]=y;w&&w.target===f&&d&&(d.unobserve(t),cancelAnimationFrame(v),v=requestAnimationFrame(()=>{var b;(b=d)==null||b.observe(t)})),n()}),f&&!u&&d.observe(f),d.observe(t));let s,h=u?K(e):null;u&&g();function g(){const y=K(e);h&&(y.x!==h.x||y.y!==h.y||y.width!==h.width||y.height!==h.height)&&n(),h=y,s=requestAnimationFrame(g)}return n(),()=>{var y;c.forEach(w=>{i&&w.removeEventListener("scroll",n),o&&w.removeEventListener("resize",n)}),p==null||p(),(y=d)==null||y.disconnect(),d=null,u&&cancelAnimationFrame(s)}}const cn=It,dn=Ht,pn=Ut,mn=Mt,hn=zt,gn=$t,vn=(e,t,n)=>{const r=new Map,i={platform:sn,...n},o={...i.platform,_c:r};return Nt(e,t,{...i,platform:o})};function yn(e){return e!=null&&typeof e=="object"&&"$el"in e}function be(e){if(yn(e)){const t=e.$el;return Ce(t)&&J(t)==="#comment"?null:t}return e}function wn(e){return{name:"arrow",options:e,fn(t){const n=be(I(e.element));return n==null?{}:gn({element:n,padding:e.padding}).fn(t)}}}function tt(e){return typeof window>"u"?1:(e.ownerDocument.defaultView||window).devicePixelRatio||1}function He(e,t){const n=tt(e);return Math.round(t*n)/n}function bn(e,t,n){n===void 0&&(n={});const r=n.whileElementsMounted,i=L(()=>{var m;return(m=I(n.open))!=null?m:!0}),o=L(()=>I(n.middleware)),l=L(()=>{var m;return(m=I(n.placement))!=null?m:"bottom"}),a=L(()=>{var m;return(m=I(n.strategy))!=null?m:"absolute"}),u=L(()=>{var m;return(m=I(n.transform))!=null?m:!0}),f=L(()=>be(e.value)),c=L(()=>be(t.value)),p=O(0),v=O(0),d=O(a.value),s=O(l.value),h=Ie({}),g=O(!1),y=L(()=>{const m={position:d.value,left:"0",top:"0"};if(!c.value)return m;const C=He(c.value,p.value),S=He(c.value,v.value);return u.value?{...m,transform:"translate("+C+"px, "+S+"px)",...tt(c.value)>=1.5&&{willChange:"transform"}}:{position:d.value,left:C+"px",top:S+"px"}});let w;function b(){f.value==null||c.value==null||vn(f.value,c.value,{middleware:o.value,placement:l.value,strategy:a.value}).then(m=>{p.value=m.x,v.value=m.y,d.value=m.strategy,s.value=m.placement,h.value=m.middlewareData,g.value=!0})}function x(){typeof w=="function"&&(w(),w=void 0)}function T(){if(x(),r===void 0){b();return}if(f.value!=null&&c.value!=null){w=r(f.value,c.value,b);return}}function E(){i.value||(g.value=!1)}return j([o,l,a],b,{flush:"sync"}),j([f,c],T,{flush:"sync"}),j(i,E,{flush:"sync"}),xt()&&Tt(x),{x:G(p),y:G(v),strategy:G(d),placement:G(s),middlewareData:G(h),isPositioned:G(g),floatingStyles:y,update:b}}var xn=Object.defineProperty,Tn=(e,t,n)=>t in e?xn(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Cn=(e,t,n)=>(Tn(e,t+"",n),n);function oe(e){return e==null||e.value==null?null:e.value instanceof Node?e.value:"$el"in e.value&&e.value.$el?oe(O(e.value.$el)):"getBoundingClientRect"in e.value?e.value:null}function nt(e){return e.reduce((t,n)=>n.type===Ve?t.concat(nt(n.children)):t.concat(n),[])}function An(e){return e==null?!1:typeof e.type=="string"||typeof e.type=="object"||typeof e.type=="function"}function Me(e){return e=I(e),e&&(e==null?void 0:e.nodeType)!==Node.COMMENT_NODE}class En{constructor(){Cn(this,"current",this.detect())}set(t){this.current!==t&&(this.current=t)}reset(){this.set(this.detect())}get isServer(){return this.current==="server"}get isClient(){return this.current==="client"}detect(){return typeof window>"u"||typeof document>"u"?"server":"client"}}const Oe=new En;function Sn(e){if(Oe.isServer)return null;if(e instanceof Node)return e.ownerDocument;if(Object.prototype.hasOwnProperty.call(e,"value")){const t=oe(e);if(t)return t.ownerDocument}return document}function Rn(e,t){!t.vueTransition&&(t.transitionName||t.transitionType)&&console.warn(`[headlessui-float]: <${e} /> pass "transition-name" or "transition-type" prop, must be set "vue-transition" prop.`)}function On(e,t,n,r,i){j([()=>i.offset,()=>i.flip,()=>i.shift,()=>i.autoPlacement,()=>i.arrow,()=>i.hide,()=>i.middleware],()=>{const o=[];(typeof i.offset=="number"||typeof i.offset=="object"||typeof i.offset=="function")&&o.push(cn(i.offset)),(i.flip===!0||typeof i.flip=="number"||typeof i.flip=="object")&&o.push(mn({padding:typeof i.flip=="number"?i.flip:void 0,...typeof i.flip=="object"?i.flip:{}})),(i.shift===!0||typeof i.shift=="number"||typeof i.shift=="object")&&o.push(pn({padding:typeof i.shift=="number"?i.shift:void 0,...typeof i.shift=="object"?i.shift:{}})),(i.autoPlacement===!0||typeof i.autoPlacement=="object")&&o.push(dn(typeof i.autoPlacement=="object"?i.autoPlacement:void 0)),o.push(...typeof i.middleware=="function"?i.middleware({referenceEl:t,floatingEl:n}):i.middleware||[]),(i.arrow===!0||typeof i.arrow=="number")&&o.push(wn({element:r,padding:i.arrow===!0?0:i.arrow})),(i.hide===!0||typeof i.hide=="object"||Array.isArray(i.hide))&&(Array.isArray(i.hide)?i.hide:[i.hide]).forEach(l=>{o.push(hn(typeof l=="object"?l:void 0))}),e.value=o},{immediate:!0})}function Ln(e,t,n){let r=()=>{};Ue(()=>{if(e&&Oe.isClient&&typeof ResizeObserver<"u"&&t.value&&t.value instanceof Element){const i=new ResizeObserver(([o])=>{n.value=o.borderBoxSize.reduce((l,{inlineSize:a})=>l+a,0)});i.observe(t.value),r=()=>{i.disconnect(),n.value=null}}}),Ct(()=>{r()})}const Fn=e=>{switch(e){case"top":return"origin-bottom";case"bottom":return"origin-top";case"left":return"origin-right";case"right":return"origin-left";case"top-start":case"right-end":return"origin-bottom-left";case"top-end":case"left-end":return"origin-bottom-right";case"right-start":case"bottom-start":return"origin-top-left";case"left-start":case"bottom-end":return"origin-top-right";default:return"origin-center"}};function Dn(e,t){const n=L(()=>{if(typeof e.originClass=="function")return e.originClass(t.value);if(typeof e.originClass=="string")return e.originClass;if(e.tailwindcssOriginClass)return Fn(t.value)}),r=L(()=>e.enter||n.value?`${e.enter||""} ${n.value||""}`:void 0),i=L(()=>e.leave||n.value?`${e.leave||""} ${n.value||""}`:void 0);return{originClassRef:n,enterActiveClassRef:r,leaveActiveClassRef:i}}function rt(e,t,...n){if(e in t){const i=t[e];return typeof i=="function"?i(...n):i}const r=new Error(`Tried to handle "${e}" but there is no handler defined. Only defined handlers are: ${Object.keys(t).map(i=>`"${i}"`).join(", ")}.`);throw Error.captureStackTrace&&Error.captureStackTrace(r,rt),r}const ze=["[contentEditable=true]","[tabindex]","a[href]","area[href]","button:not([disabled])","iframe","input:not([disabled])","select:not([disabled])","textarea:not([disabled])"].map(e=>`${e}:not([tabindex='-1'])`).join(",");var it=(e=>(e[e.Strict=0]="Strict",e[e.Loose=1]="Loose",e))(it||{});function Pn(e,t=0){var n;return e===((n=Sn(e))==null?void 0:n.body)?!1:rt(t,{0(){return e.matches(ze)},1(){let r=e;for(;r!==null;){if(r.matches(ze))return!0;r=r.parentElement}return!1}})}function ye(e,t,n){Oe.isServer||bt(r=>{document.addEventListener(e,t,n),r(()=>document.removeEventListener(e,t,n))})}function kn(e,t,n=L(()=>!0)){function r(o,l){if(!n.value||o.defaultPrevented)return;const a=l(o);if(a===null||!a.getRootNode().contains(a))return;const u=function f(c){return typeof c=="function"?f(c()):Array.isArray(c)||c instanceof Set?c:[c]}(e);for(const f of u){if(f===null)continue;const c=f instanceof HTMLElement?f:oe(f);if(c!=null&&c.contains(a)||o.composed&&o.composedPath().includes(c))return}return!Pn(a,it.Loose)&&a.tabIndex!==-1&&o.preventDefault(),t(o,a)}const i=O(null);ye("mousedown",o=>{var l,a;n.value&&(i.value=((a=(l=o.composedPath)==null?void 0:l.call(o))==null?void 0:a[0])||o.target)},!0),ye("click",o=>{i.value&&(r(o,()=>i.value),i.value=null)},!0),ye("blur",o=>r(o,()=>window.document.activeElement instanceof HTMLIFrameElement?window.document.activeElement:null),!0)}const Bn=Symbol("ArrowContext"),A={as:{type:[String,Function],default:"template"},show:{type:Boolean,default:null},placement:{type:String,default:"bottom-start"},strategy:{type:String,default:"absolute"},offset:[Number,Function,Object],shift:{type:[Boolean,Number,Object],default:!1},flip:{type:[Boolean,Number,Object],default:!1},arrow:{type:[Boolean,Number],default:!1},autoPlacement:{type:[Boolean,Object],default:!1},autoUpdate:{type:[Boolean,Object],default:!0},zIndex:{type:[Number,String],default:9999},vueTransition:{type:Boolean,default:!1},transitionName:String,transitionType:String,enter:String,enterFrom:String,enterTo:String,leave:String,leaveFrom:String,leaveTo:String,originClass:[String,Function],tailwindcssOriginClass:{type:Boolean,default:!1},portal:{type:Boolean,default:!1},transform:{type:Boolean,default:!1},middleware:{type:[Array,Function],default:()=>[]}};function jn(e,t,n,r){const{floatingRef:i,props:o,mounted:l,show:a,referenceHidden:u,escaped:f,placement:c,floatingStyles:p,referenceElWidth:v,updateFloating:d}=r,s=he({...o,as:o.floatingAs},t),{enterActiveClassRef:h,leaveActiveClassRef:g}=Dn(s,c),y={show:l.value?s.show:!1,enter:h.value,enterFrom:s.enterFrom,enterTo:s.enterTo,leave:g.value,leaveFrom:s.leaveFrom,leaveTo:s.leaveTo,onBeforeEnter(){a.value=!0},onAfterLeave(){a.value=!1}},w={name:s.transitionName,type:s.transitionType,appear:!0,...s.transitionName?{}:{enterActiveClass:h.value,enterFromClass:s.enterFrom,enterToClass:s.enterTo,leaveActiveClass:g.value,leaveFromClass:s.leaveFrom,leaveToClass:s.leaveTo},onBeforeEnter(){a.value=!0},onAfterLeave(){a.value=!1}},b={class:[u.value?s.referenceHiddenClass:void 0,f.value?s.escapedClass:void 0].filter(m=>!!m).join(" "),style:{...p.value,zIndex:s.zIndex}};if(s.adaptiveWidth&&typeof v.value=="number"){const m={attribute:"width",...typeof s.adaptiveWidth=="object"?s.adaptiveWidth:{}};b.style[m.attribute]=`${v.value}px`}function x(m){return s.portal?l.value?ne(At,()=>m):ge():m}function T(m){const C=he(b,n,s.dialog?{}:{ref:i});return s.as==="template"?m:typeof s.as=="string"?ne(s.as,C,m):ne(s.as,C,()=>m)}function E(){function m(){var C;const S=s.as==="template"?he(b,n,s.dialog?{}:{ref:i}):null,F=Ot(e,S);return((C=e.props)==null?void 0:C.unmount)===!1?(d(),F):s.vueTransition&&s.show===!1?ge():F}return l.value?s.vueTransition?ne(Et,{...s.dialog?{ref:i}:{},...w},m):ne(s.transitionChild?St:Rt,{key:`placement-${c.value}`,...s.dialog?{ref:i}:{},as:"template",...y},m):ge()}return x(T(E()))}function Nn(e,t,n,r,i){const o=O(!1),l=Fe(r,"placement"),a=Fe(r,"strategy"),u=Ie({}),f=O(void 0),c=O(void 0),p=O(null),v=O(void 0),d=O(void 0),s=L(()=>oe(t)),h=L(()=>oe(n)),g=L(()=>Me(s)&&Me(h)),{placement:y,middlewareData:w,isPositioned:b,floatingStyles:x,update:T}=bn(s,h,{placement:l,strategy:a,middleware:u,transform:r.dialog?!1:r.transform,whileElementsMounted:r.dialog?()=>()=>{}:void 0}),E=O(null);Ue(()=>{o.value=!0}),j(e,(R,k)=>{R&&!k?i("show"):!R&&k&&i("hide")},{immediate:!0});function m(){g.value&&(T(),i("update"))}j([l,a,u],m,{flush:"sync"}),On(u,s,h,p,r),j([w,()=>r.hide,b],()=>{var R,k;(r.hide===!0||typeof r.hide=="object"||Array.isArray(r.hide))&&(f.value=((R=w.value.hide)==null?void 0:R.referenceHidden)||!b.value,c.value=(k=w.value.hide)==null?void 0:k.escaped)}),j(w,()=>{const R=w.value.arrow;v.value=R==null?void 0:R.x,d.value=R==null?void 0:R.y}),Ln(!!r.adaptiveWidth,s,E),j([e,g],async(R,k,D)=>{if(await wt(),e.value&&g.value&&r.autoUpdate){const B=fn(s.value,h.value,m,typeof r.autoUpdate=="object"?r.autoUpdate:void 0);D(B)}},{flush:"post",immediate:!0});const C=O(!0);j(s,()=>{!(s.value instanceof Element)&&g.value&&C.value&&(C.value=!1,window.requestAnimationFrame(()=>{C.value=!0,m()}))},{flush:"sync"});const S={referenceRef:t,placement:y},F={floatingRef:n,props:r,mounted:o,show:e,referenceHidden:f,escaped:c,placement:y,floatingStyles:x,referenceElWidth:E,updateFloating:m},$={ref:p,placement:y,x:v,y:d};return Lt(Bn,$),{referenceApi:S,floatingApi:F,arrowApi:$,placement:y,referenceEl:s,floatingEl:h,middlewareData:w,update:m}}({...A.as});const $n={as:A.as,show:A.show,placement:A.placement,strategy:A.strategy,offset:A.offset,shift:A.shift,flip:A.flip,arrow:A.arrow,autoPlacement:A.autoPlacement,autoUpdate:A.autoUpdate,zIndex:A.zIndex,vueTransition:A.vueTransition,transitionName:A.transitionName,transitionType:A.transitionType,enter:A.enter,enterFrom:A.enterFrom,enterTo:A.enterTo,leave:A.leave,leaveFrom:A.leaveFrom,leaveTo:A.leaveTo,originClass:A.originClass,tailwindcssOriginClass:A.tailwindcssOriginClass,portal:A.portal,transform:A.transform,middleware:A.middleware},Wn={name:"FloatVirtual",inheritAttrs:!1,props:$n,emits:["initial","show","hide","update"],setup(e,{emit:t,slots:n,attrs:r}){var i;Rn("FloatVirtual",e);const o=O((i=e.show)!=null?i:!1),l=O({getBoundingClientRect(){return{x:0,y:0,top:0,left:0,bottom:0,right:0,width:0,height:0}}}),a=O(null),{floatingApi:u,placement:f}=Nn(o,l,a,e,t);j(()=>e.show,()=>{var p;o.value=(p=e.show)!=null?p:!1});function c(){o.value=!1}return t("initial",{show:o,placement:f,reference:l,floating:a}),()=>{if(!n.default)return;const p={placement:f.value,close:c},[v]=nt(n.default(p)).filter(An);return jn(v,{as:e.as,show:o.value},r,u)}}};({...A.flip});const Hn={class:"flex bg-white shadow-md z-10 rounded-md p-1"},Mn=["onClick"],Vn=lt({__name:"StylePanel",setup(e){const t=O({value:null}),n=at(),r=L(()=>n.getters.onContentChange||(()=>{})),i=L(()=>st(n.getters.diagramElement)+ut),o=L(()=>n.getters.code),l=p=>{n.dispatch("updateCode",{code:p}),r.value(p)},a=O([]);let u;const f=({show:p,reference:v,floating:d})=>{let s,h,g,y,w,b;n.commit("onMessageClick",(x,T)=>{var E;if(s=x.value.start.start,h=gt(o.value,s),g=vt(o.value,s),y=((E=o.value.slice(h).match(/^\s*/))==null?void 0:E[0])||"",w=g.trim().startsWith("//"),w){const m=g.trimStart().slice(2).trimStart(),C=m.indexOf("["),S=m.indexOf("]");b=!!(C===0&&S),b?a.value=m.slice(C+1,S).split(",").map(F=>F.trim()):a.value=[]}v.value={getBoundingClientRect:()=>T.getBoundingClientRect()},t.value=x,p.value=!0}),kn(d,()=>{p.value=!1,a.value=[]},L(()=>p.value)),u=x=>{var T;if(p.value=!1,!!t.value.value)if(w){let E="";if(b){let m;a.value.includes(x)?m=a.value.filter(C=>C!==x):m=[...a.value,x],E=`${y}// [${m.filter(Boolean).join(", ")}] ${g.slice(g.indexOf("]")+1).trimStart()}`}else E=`${y}// [${x}] ${g.slice((((T=g.match(/\/\/*/))==null?void 0:T.index)||-2)+2).trimStart()}`;E.endsWith(`
`)||(E+=`
`),l(o.value.slice(0,yt(o.value,s))+E+o.value.slice(h))}else l(o.value.slice(0,h)+`${y}// [${x}]
`+o.value.slice(h))}},c=[{name:"bold",content:"B",class:"font-bold"},{name:"italic",content:"I",class:"italic"},{name:"underline",content:"U",class:"underline"},{name:"strikethrough",content:"S",class:"line-through"}];return(p,v)=>(Le(),ft(I(Wn),{key:"tool",onInitial:f,placement:"top",offset:5,flip:{padding:i.value},shift:"",zIndex:"30"},{default:ct(()=>[me("div",Hn,[(Le(),dt(Ve,null,pt(c,d=>me("div",{onClick:()=>I(u)(d.class),key:d.name},[me("div",{class:mt(["w-6 mx-1 py-1 rounded-md text-black text-center cursor-pointer hover:bg-gray-200",[d.class,{"bg-gray-100":a.value.includes(d.class)}]])},ht(d.content),3)],8,Mn)),64))])],void 0,!0),_:1},8,["flip"]))}});export{Vn as default};
