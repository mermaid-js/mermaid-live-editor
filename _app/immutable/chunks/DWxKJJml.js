import{S as O,C,D as F,F as h,G,m as b,U as _,H as y,I as A,J as K,K as Z,L as $,M as V,h as M,N as z,b as H,E as J,c as Q,O as W,f as X,P as k,Q as p,t as U,R as ee,T as re,V as ne,W as te,u as Y,X as ae,Y as ie,Z as fe,_ as ue,$ as se,a0 as de}from"./PqI9hdxU.js";import{c as ve}from"./CEUc2JjY.js";function E(r,d=null,P){if(typeof r!="object"||r===null||O in r)return r;const o=$(r);if(o!==C&&o!==F)return r;var i=new Map,v=V(r),m=h(0);v&&i.set("length",h(r.length));var I;return new Proxy(r,{defineProperty(f,e,n){(!("value"in n)||n.configurable===!1||n.enumerable===!1||n.writable===!1)&&Z();var a=i.get(e);return a===void 0?(a=h(n.value),i.set(e,a)):y(a,E(n.value,I)),!0},deleteProperty(f,e){var n=i.get(e);if(n===void 0)e in f&&i.set(e,h(_));else{if(v&&typeof e=="string"){var a=i.get("length"),t=Number(e);Number.isInteger(t)&&t<a.v&&y(a,t)}y(n,_),j(m)}return!0},get(f,e,n){var l;if(e===O)return r;var a=i.get(e),t=e in f;if(a===void 0&&(!t||(l=A(f,e))!=null&&l.writable)&&(a=h(E(t?f[e]:_,I)),i.set(e,a)),a!==void 0){var u=b(a);return u===_?void 0:u}return Reflect.get(f,e,n)},getOwnPropertyDescriptor(f,e){var n=Reflect.getOwnPropertyDescriptor(f,e);if(n&&"value"in n){var a=i.get(e);a&&(n.value=b(a))}else if(n===void 0){var t=i.get(e),u=t==null?void 0:t.v;if(t!==void 0&&u!==_)return{enumerable:!0,configurable:!0,value:u,writable:!0}}return n},has(f,e){var u;if(e===O)return!0;var n=i.get(e),a=n!==void 0&&n.v!==_||Reflect.has(f,e);if(n!==void 0||K!==null&&(!a||(u=A(f,e))!=null&&u.writable)){n===void 0&&(n=h(a?E(f[e],I):_),i.set(e,n));var t=b(n);if(t===_)return!1}return a},set(f,e,n,a){var S;var t=i.get(e),u=e in f;if(v&&e==="length")for(var l=n;l<t.v;l+=1){var R=i.get(l+"");R!==void 0?y(R,_):l in f&&(R=h(_),i.set(l+"",R))}t===void 0?(!u||(S=A(f,e))!=null&&S.writable)&&(t=h(void 0),y(t,E(n,I)),i.set(e,t)):(u=t.v!==_,y(t,E(n,I)));var c=Reflect.getOwnPropertyDescriptor(f,e);if(c!=null&&c.set&&c.set.call(a,n),!u){if(v&&typeof e=="string"){var N=i.get("length"),x=Number(e);Number.isInteger(x)&&x>=N.v&&y(N,x+1)}j(m)}return!0},ownKeys(f){b(m);var e=Reflect.ownKeys(f).filter(t=>{var u=i.get(t);return u===void 0||u.v!==_});for(var[n,a]of i)a.v!==_&&!(n in f)&&e.push(n);return e},setPrototypeOf(){G()}})}function j(r,d=1){y(r,r.v+d)}function q(r){return r!==null&&typeof r=="object"&&O in r?r[O]:r}function ce(r,d){return Object.is(q(r),q(d))}function oe(r,d,P){M&&z();var o=r,i,v;H(()=>{i!==(i=d())&&(v&&(W(v),v=null),i&&(v=Q(()=>P(o,i))))},J),M&&(o=X)}function B(r){var d;return((d=r.ctx)==null?void 0:d.d)??!1}function be(r,d,P,o){var L;var i=(P&se)!==0,v=!fe||(P&ue)!==0,m=(P&ae)!==0,I=(P&de)!==0,f=!1,e;m?[e,f]=ve(()=>r[d]):e=r[d];var n=O in r||ie in r,a=m&&(((L=A(r,d))==null?void 0:L.set)??(n&&d in r&&(s=>r[d]=s)))||void 0,t=o,u=!0,l=!1,R=()=>(l=!0,u&&(u=!1,I?t=Y(o):t=o),t);e===void 0&&o!==void 0&&(a&&v&&k(),e=R(),a&&a(e));var c;if(v)c=()=>{var s=r[d];return s===void 0?R():(u=!0,l=!1,s)};else{var N=(i?U:ee)(()=>r[d]);N.f|=p,c=()=>{var s=b(N);return s!==void 0&&(t=void 0),s===void 0?t:s}}if(!(P&re))return c;if(a){var x=r.$$legacy;return function(s,w){return arguments.length>0?((!v||!w||x||f)&&a(w?c():s),s):c()}}var S=!1,D=te(e),g=U(()=>{var s=c(),w=b(D);return S?(S=!1,w):D.v=s});return m&&b(g),i||(g.equals=ne),function(s,w){if(arguments.length>0){const T=w?b(g):v&&m?E(s):s;if(!g.equals(T)){if(S=!0,y(D,T),l&&t!==void 0&&(t=T),B(g))return s;Y(()=>b(g))}return s}return B(g)?g.v:b(g)}}export{E as a,oe as c,ce as i,be as p};
