var $n=Array.isArray,ln=Array.prototype.indexOf,Kn=Array.from,zn=Object.defineProperty,Tt=Object.getOwnPropertyDescriptor,un=Object.getOwnPropertyDescriptors,Zn=Object.prototype,Jn=Array.prototype,on=Object.getPrototypeOf;function Qn(t){return typeof t=="function"}const P=()=>{};function Wn(t){return t()}function ht(t){for(var n=0;n<t.length;n++)t[n]()}const y=2,Rt=4,V=8,dt=16,R=32,G=64,J=128,m=256,Q=512,h=1024,k=2048,Y=4096,M=8192,st=16384,fn=32768,kt=65536,Xn=1<<17,_n=1<<19,Ot=1<<20,gt=Symbol("$state"),te=Symbol("legacy props"),ne=Symbol("");function St(t){return t===this.v}function Dt(t,n){return t!=t?n==n:t!==n||t!==null&&typeof t=="object"||typeof t=="function"}function ee(t,n){return t!==n}function Nt(t){return!Dt(t,this.v)}function cn(t){throw new Error("https://svelte.dev/e/effect_in_teardown")}function vn(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function pn(t){throw new Error("https://svelte.dev/e/effect_orphan")}function hn(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function re(){throw new Error("https://svelte.dev/e/hydration_failed")}function se(t){throw new Error("https://svelte.dev/e/props_invalid_value")}function ae(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function le(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function dn(){throw new Error("https://svelte.dev/e/state_unsafe_local_read")}function En(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}let at=!1;function ue(){at=!0}const oe=1,ie=2,fe=4,_e=8,ce=16,ve=1,pe=2,he=4,de=8,Ee=16,ye=1,we=2,Te=4,ge=1,me=2,yn="[",wn="[!",Tn="]",xt={},Ae=Symbol();function Ct(t){console.warn("https://svelte.dev/e/hydration_mismatch")}let v=null;function mt(t){v=t}function be(t,n=!1,e){v={p:v,c:null,e:null,m:!1,s:t,x:null,l:null},at&&!n&&(v.l={s:null,u:null,r1:[],r2:Et(!1)})}function Ie(t){const n=v;if(n!==null){const l=n.e;if(l!==null){var e=_,r=i;n.e=null;try{for(var s=0;s<l.length;s++){var a=l[s];nt(a.effect),tt(a.reaction),Bt(a.fn)}}finally{nt(e),tt(r)}}v=n.p,n.m=!0}return{}}function lt(){return!at||v!==null&&v.l===null}function Et(t,n){var e={f:0,v:t,reactions:null,equals:St,rv:0,wv:0};return e}function Re(t){return gn(Et(t))}function ke(t,n=!1){var r;const e=Et(t);return n||(e.equals=Nt),at&&v!==null&&v.l!==null&&((r=v.l).s??(r.s=[])).push(e),e}function gn(t){return i!==null&&!I&&i.f&y&&(g===null?qn([t]):g.push(t)),t}function Oe(t,n){return i!==null&&!I&&lt()&&i.f&(y|dt)&&(g===null||!g.includes(t))&&En(),mn(t,n)}function mn(t,n){return t.equals(n)||(t.v,t.v=n,t.wv=Qt(),qt(t,k),lt()&&_!==null&&_.f&h&&!(_.f&(R|G))&&(b===null?Pn([t]):b.push(t))),n}function qt(t,n){var e=t.reactions;if(e!==null)for(var r=lt(),s=e.length,a=0;a<s;a++){var l=e[a],o=l.f;o&k||!r&&l===_||(A(l,n),o&(h|m)&&(o&y?qt(l,Y):ot(l)))}}let D=!1;function Se(t){D=t}let w;function B(t){if(t===null)throw Ct(),xt;return w=t}function De(){return B(x(w))}function Ne(t){if(D){if(x(w)!==null)throw Ct(),xt;w=t}}function xe(t=1){if(D){for(var n=t,e=w;n--;)e=x(e);w=e}}function Ce(){for(var t=0,n=w;;){if(n.nodeType===8){var e=n.data;if(e===Tn){if(t===0)return n;t-=1}else(e===yn||e===wn)&&(t+=1)}var r=x(n);n.remove(),n=r}}var At,Pt,Ft;function qe(){if(At===void 0){At=window;var t=Element.prototype,n=Node.prototype;Pt=Tt(n,"firstChild").get,Ft=Tt(n,"nextSibling").get,t.__click=void 0,t.__className="",t.__attributes=null,t.__styles=null,t.__e=void 0,Text.prototype.__t=void 0}}function ft(t=""){return document.createTextNode(t)}function _t(t){return Pt.call(t)}function x(t){return Ft.call(t)}function Pe(t,n){if(!D)return _t(t);var e=_t(w);if(e===null)e=w.appendChild(ft());else if(n&&e.nodeType!==3){var r=ft();return e==null||e.before(r),B(r),r}return B(e),e}function Fe(t,n){if(!D){var e=_t(t);return e instanceof Comment&&e.data===""?x(e):e}return w}function Le(t,n=1,e=!1){let r=D?w:t;for(var s;n--;)s=r,r=x(r);if(!D)return r;var a=r==null?void 0:r.nodeType;if(e&&a!==3){var l=ft();return r===null?s==null||s.after(l):r.before(l),B(l),l}return B(r),r}function Me(t){t.textContent=""}function Lt(t){var n=y|k,e=i!==null&&i.f&y?i:null;return _===null||e!==null&&e.f&m?n|=m:_.f|=Ot,{ctx:v,deps:null,effects:null,equals:St,f:n,fn:t,reactions:null,rv:0,v:null,wv:0,parent:e??_}}function Ye(t){const n=Lt(t);return n.equals=Nt,n}function Mt(t){var n=t.effects;if(n!==null){t.effects=null;for(var e=0;e<n.length;e+=1)N(n[e])}}function An(t){for(var n=t.parent;n!==null;){if(!(n.f&y))return n;n=n.parent}return null}function bn(t){var n,e=_;nt(An(t));try{Mt(t),n=Xt(t)}finally{nt(e)}return n}function Yt(t){var n=bn(t),e=(S||t.f&m)&&t.deps!==null?Y:h;A(t,e),t.equals(n)||(t.v=n,t.wv=Qt())}function Ht(t){_===null&&i===null&&pn(),i!==null&&i.f&m&&_===null&&vn(),yt&&cn()}function In(t,n){var e=n.last;e===null?n.last=n.first=t:(e.next=t,t.prev=e,n.last=t)}function H(t,n,e,r=!0){var s=(t&G)!==0,a=_,l={ctx:v,deps:null,nodes_start:null,nodes_end:null,f:t|k,first:null,fn:n,last:null,next:null,parent:s?null:a,prev:null,teardown:null,transitions:null,wv:0};if(e){var o=F;try{bt(!0),wt(l),l.f|=fn}catch(T){throw N(l),T}finally{bt(o)}}else n!==null&&ot(l);var c=e&&l.deps===null&&l.first===null&&l.nodes_start===null&&l.teardown===null&&(l.f&(Ot|J))===0;if(!c&&!s&&r&&(a!==null&&In(l,a),i!==null&&i.f&y)){var u=i;(u.effects??(u.effects=[])).push(l)}return l}function He(t){const n=H(V,null,!1);return A(n,h),n.teardown=t,n}function Be(t){Ht();var n=_!==null&&(_.f&R)!==0&&v!==null&&!v.m;if(n){var e=v;(e.e??(e.e=[])).push({fn:t,effect:_,reaction:i})}else{var r=Bt(t);return r}}function je(t){return Ht(),Rn(t)}function Ue(t){const n=H(G,t,!0);return(e={})=>new Promise(r=>{e.outro?Sn(n,()=>{N(n),r(void 0)}):(N(n),r(void 0))})}function Bt(t){return H(Rt,t,!1)}function Rn(t){return H(V,t,!0)}function Ve(t,n=[],e=Lt){const r=n.map(e);return kn(()=>t(...r.map(Bn)))}function kn(t,n=0){return H(V|dt|n,t,!0)}function Ge(t,n=!0){return H(V|R,t,!0,n)}function jt(t){var n=t.teardown;if(n!==null){const e=yt,r=i;It(!0),tt(null);try{n.call(null)}finally{It(e),tt(r)}}}function Ut(t,n=!1){var e=t.first;for(t.first=t.last=null;e!==null;){var r=e.next;N(e,n),e=r}}function On(t){for(var n=t.first;n!==null;){var e=n.next;n.f&R||N(n),n=e}}function N(t,n=!0){var e=!1;if((n||t.f&_n)&&t.nodes_start!==null){for(var r=t.nodes_start,s=t.nodes_end;r!==null;){var a=r===s?null:x(r);r.remove(),r=a}e=!0}Ut(t,n&&!e),rt(t,0),A(t,st);var l=t.transitions;if(l!==null)for(const c of l)c.stop();jt(t);var o=t.parent;o!==null&&o.first!==null&&Vt(t),t.next=t.prev=t.teardown=t.ctx=t.deps=t.fn=t.nodes_start=t.nodes_end=null}function Vt(t){var n=t.parent,e=t.prev,r=t.next;e!==null&&(e.next=r),r!==null&&(r.prev=e),n!==null&&(n.first===t&&(n.first=r),n.last===t&&(n.last=e))}function Sn(t,n){var e=[];Gt(t,e,!0),Dn(e,()=>{N(t),n&&n()})}function Dn(t,n){var e=t.length;if(e>0){var r=()=>--e||n();for(var s of t)s.out(r)}else n()}function Gt(t,n,e){if(!(t.f&M)){if(t.f^=M,t.transitions!==null)for(const l of t.transitions)(l.is_global||e)&&n.push(l);for(var r=t.first;r!==null;){var s=r.next,a=(r.f&kt)!==0||(r.f&R)!==0;Gt(r,n,a?e:!1),r=s}}}function $e(t){$t(t,!0)}function $t(t,n){if(t.f&M){t.f^=M,t.f&h||(t.f^=h),$(t)&&(A(t,k),ot(t));for(var e=t.first;e!==null;){var r=e.next,s=(e.f&kt)!==0||(e.f&R)!==0;$t(e,s?n:!1),e=r}if(t.transitions!==null)for(const a of t.transitions)(a.is_global||n)&&a.in()}}const Nn=typeof requestIdleCallback>"u"?t=>setTimeout(t,1):requestIdleCallback;let W=!1,X=!1,ct=[],vt=[];function Kt(){W=!1;const t=ct.slice();ct=[],ht(t)}function zt(){X=!1;const t=vt.slice();vt=[],ht(t)}function Ke(t){W||(W=!0,queueMicrotask(Kt)),ct.push(t)}function ze(t){X||(X=!0,Nn(zt)),vt.push(t)}function xn(){W&&Kt(),X&&zt()}const Zt=0,Cn=1;let z=!1,Z=Zt,j=!1,U=null,F=!1,yt=!1;function bt(t){F=t}function It(t){yt=t}let O=[],L=0;let i=null,I=!1;function tt(t){i=t}let _=null;function nt(t){_=t}let g=null;function qn(t){g=t}let d=null,E=0,b=null;function Pn(t){b=t}let Jt=1,et=0,S=!1;function Qt(){return++Jt}function $(t){var u;var n=t.f;if(n&k)return!0;if(n&Y){var e=t.deps,r=(n&m)!==0;if(e!==null){var s,a,l=(n&Q)!==0,o=r&&_!==null&&!S,c=e.length;if(l||o){for(s=0;s<c;s++)a=e[s],(l||!((u=a==null?void 0:a.reactions)!=null&&u.includes(t)))&&(a.reactions??(a.reactions=[])).push(t);l&&(t.f^=Q)}for(s=0;s<c;s++)if(a=e[s],$(a)&&Yt(a),a.wv>t.wv)return!0}(!r||_!==null&&!S)&&A(t,h)}return!1}function Fn(t,n){for(var e=n;e!==null;){if(e.f&J)try{e.fn(t);return}catch{e.f^=J}e=e.parent}throw z=!1,t}function Ln(t){return(t.f&st)===0&&(t.parent===null||(t.parent.f&J)===0)}function ut(t,n,e,r){if(z){if(e===null&&(z=!1),Ln(n))throw t;return}e!==null&&(z=!0);{Fn(t,n);return}}function Wt(t,n,e=0){var r=t.reactions;if(r!==null)for(var s=0;s<r.length;s++){var a=r[s];a.f&y?Wt(a,n,e+1):n===a&&(e===0?A(a,k):a.f&h&&A(a,Y),ot(a))}}function Xt(t){var K;var n=d,e=E,r=b,s=i,a=S,l=g,o=v,c=I,u=t.f;d=null,E=0,b=null,i=u&(R|G)?null:t,S=(u&m)!==0&&(!F||(s===null||c)&&t.parent!==null),g=null,mt(t.ctx),I=!1,et++;try{var T=(0,t.fn)(),p=t.deps;if(d!==null){var f;if(rt(t,E),p!==null&&E>0)for(p.length=E+d.length,f=0;f<d.length;f++)p[E+f]=d[f];else t.deps=p=d;if(!S)for(f=E;f<p.length;f++)((K=p[f]).reactions??(K.reactions=[])).push(t)}else p!==null&&E<p.length&&(rt(t,E),p.length=E);if(lt()&&b!==null&&!(t.f&(y|Y|k)))for(f=0;f<b.length;f++)Wt(b[f],t);return s!==null&&et++,T}finally{d=n,E=e,b=r,i=s,S=a,g=l,mt(o),I=c}}function Mn(t,n){let e=n.reactions;if(e!==null){var r=ln.call(e,t);if(r!==-1){var s=e.length-1;s===0?e=n.reactions=null:(e[r]=e[s],e.pop())}}e===null&&n.f&y&&(d===null||!d.includes(n))&&(A(n,Y),n.f&(m|Q)||(n.f^=Q),Mt(n),rt(n,0))}function rt(t,n){var e=t.deps;if(e!==null)for(var r=n;r<e.length;r++)Mn(t,e[r])}function wt(t){var n=t.f;if(!(n&st)){A(t,h);var e=_,r=v;_=t;try{n&dt?On(t):Ut(t),jt(t);var s=Xt(t);t.teardown=typeof s=="function"?s:null,t.wv=Jt;var a=t.deps,l}catch(o){ut(o,t,e,r||t.ctx)}finally{_=e}}}function tn(){if(L>1e3){L=0;try{hn()}catch(t){if(U!==null)ut(t,U,null);else throw t}}L++}function nn(t){var n=t.length;if(n!==0){tn();var e=F;F=!0;try{for(var r=0;r<n;r++){var s=t[r];s.f&h||(s.f^=h);var a=[];en(s,a),Yn(a)}}finally{F=e}}}function Yn(t){var n=t.length;if(n!==0)for(var e=0;e<n;e++){var r=t[e];if(!(r.f&(st|M)))try{$(r)&&(wt(r),r.deps===null&&r.first===null&&r.nodes_start===null&&(r.teardown===null?Vt(r):r.fn=null))}catch(s){ut(s,r,null,r.ctx)}}}function Hn(){if(j=!1,L>1001)return;const t=O;O=[],nn(t),j||(L=0,U=null)}function ot(t){Z===Zt&&(j||(j=!0,queueMicrotask(Hn))),U=t;for(var n=t;n.parent!==null;){n=n.parent;var e=n.f;if(e&(G|R)){if(!(e&h))return;n.f^=h}}O.push(n)}function en(t,n){var e=t.first,r=[];t:for(;e!==null;){var s=e.f,a=(s&R)!==0,l=a&&(s&h)!==0,o=e.next;if(!l&&!(s&M))if(s&V){if(a)e.f^=h;else{var c=i;try{i=e,$(e)&&wt(e)}catch(f){ut(f,e,null,e.ctx)}finally{i=c}}var u=e.first;if(u!==null){e=u;continue}}else s&Rt&&r.push(e);if(o===null){let f=e.parent;for(;f!==null;){if(t===f)break t;var T=f.next;if(T!==null){e=T;continue t}f=f.parent}}e=o}for(var p=0;p<r.length;p++)u=r[p],n.push(u),en(u,n)}function rn(t){var n=Z,e=O;try{tn();const s=[];Z=Cn,O=s,j=!1,nn(e);var r=t==null?void 0:t();return xn(),(O.length>0||s.length>0)&&rn(),L=0,U=null,r}finally{Z=n,O=e}}async function Ze(){await Promise.resolve(),rn()}function Bn(t){var n=t.f,e=(n&y)!==0;if(i!==null&&!I){g!==null&&g.includes(t)&&dn();var r=i.deps;t.rv<et&&(t.rv=et,d===null&&r!==null&&r[E]===t?E++:d===null?d=[t]:d.push(t))}else if(e&&t.deps===null&&t.effects===null){var s=t,a=s.parent;a!==null&&!(a.f&m)&&(s.f^=m)}return e&&(s=t,$(s)&&Yt(s)),t.v}function jn(t){var n=I;try{return I=!0,t()}finally{I=n}}const Un=-7169;function A(t,n){t.f=t.f&Un|n}function Je(t){if(!(typeof t!="object"||!t||t instanceof EventTarget)){if(gt in t)pt(t);else if(!Array.isArray(t))for(let n in t){const e=t[n];typeof e=="object"&&e&&gt in e&&pt(e)}}}function pt(t,n=new Set){if(typeof t=="object"&&t!==null&&!(t instanceof EventTarget)&&!n.has(t)){n.add(t),t instanceof Date&&t.getTime();for(let r in t)try{pt(t[r],n)}catch{}const e=on(t);if(e!==Object.prototype&&e!==Array.prototype&&e!==Map.prototype&&e!==Set.prototype&&e!==Date.prototype){const r=un(e);for(let s in r){const a=r[s].get;if(a)try{a.call(t)}catch{}}}}}function sn(t,n,e){if(t==null)return n(void 0),e&&e(void 0),P;const r=jn(()=>t.subscribe(n,e));return r.unsubscribe?()=>r.unsubscribe():r}const q=[];function Vn(t,n){return{subscribe:Gn(t,n).subscribe}}function Gn(t,n=P){let e=null;const r=new Set;function s(o){if(Dt(t,o)&&(t=o,e)){const c=!q.length;for(const u of r)u[1](),q.push(u,t);if(c){for(let u=0;u<q.length;u+=2)q[u][0](q[u+1]);q.length=0}}}function a(o){s(o(t))}function l(o,c=P){const u=[o,c];return r.add(u),r.size===1&&(e=n(s,a)||P),o(t),()=>{r.delete(u),r.size===0&&e&&(e(),e=null)}}return{set:s,update:a,subscribe:l}}function Qe(t,n,e){const r=!Array.isArray(t),s=r?[t]:t;if(!s.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const a=n.length<2;return Vn(e,(l,o)=>{let c=!1;const u=[];let T=0,p=P;const f=()=>{if(T)return;p();const C=n(r?u[0]:u,l,o);a?l(C):p=typeof C=="function"?C:P},K=s.map((C,it)=>sn(C,an=>{u[it]=an,T&=~(1<<it),c&&f()},()=>{T|=1<<it}));return c=!0,f(),function(){ht(K),p(),c=!1}})}function We(t){let n;return sn(t,e=>n=e)(),n}export{te as $,Be as A,je as B,Wn as C,ht as D,kt as E,Bn as F,Je as G,wn as H,Lt as I,ue as J,Zn as K,Jn as L,Et as M,le as N,Oe as O,Tt as P,_ as Q,ae as R,gt as S,on as T,Ae as U,$n as V,se as W,Xn as X,he as Y,Nt as Z,de as _,Ie as a,pe as a0,R as a1,G as a2,nt as a3,ve as a4,ke as a5,Ee as a6,Ye as a7,_t as a8,ge as a9,fe as aA,M as aB,oe as aC,mn as aD,ie as aE,_e as aF,Gt as aG,Dn as aH,ce as aI,ze as aJ,ne as aK,un as aL,dt as aM,fn as aN,Te as aO,ye as aP,we as aQ,Qn as aR,me as aa,ft as ab,sn as ac,We as ad,He as ae,zn as af,rn as ag,Re as ah,Ze as ai,tt as aj,i as ak,qe as al,yn as am,x as an,xt as ao,Tn as ap,Ct as aq,re as ar,Me as as,Kn as at,Ue as au,xe as av,Qe as aw,lt as ax,ee as ay,Dt as az,Ne as b,Pe as c,kn as d,Bt as e,Fe as f,Ge as g,N as h,D as i,w as j,De as k,Ce as l,B as m,P as n,Se as o,be as p,Ke as q,Rn as r,Le as s,Ve as t,jn as u,$e as v,Gn as w,Sn as x,v as y,at as z};
