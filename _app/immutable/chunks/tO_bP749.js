import{ab as u,b as g,ac as y,h as d,a1 as E,ad as c,a5 as h,a4 as _,f as r,ae as l,af as b,ag as x,ah as A,J as m,N}from"./PqI9hdxU.js";let n;function D(){n=void 0}function F(t){let e=null,a=d;var f;if(d){for(e=r,n===void 0&&(n=l(document.head));n!==null&&(n.nodeType!==8||n.data!==E);)n=c(n);n===null?h(!1):n=_(c(n))}d||(f=document.head.appendChild(u()));try{g(()=>t(f),y)}finally{a&&(h(!0),n=r,_(e))}}function M(t){var e=document.createElement("template");return e.innerHTML=t,e.content}function s(t,e){var a=m;a.nodes_start===null&&(a.nodes_start=t,a.nodes_end=e)}function R(t,e){var a=(e&x)!==0,f=(e&A)!==0,i,v=!t.startsWith("<!>");return()=>{if(d)return s(r,null),r;i===void 0&&(i=M(v?t:"<!>"+t),a||(i=l(i)));var o=f||b?document.importNode(i,!0):i.cloneNode(!0);if(a){var p=l(o),T=o.lastChild;s(p,T)}else s(o,o);return o}}function H(t=""){if(!d){var e=u(t+"");return s(e,e),e}var a=r;return a.nodeType!==3&&(a.before(a=u()),_(a)),s(a,a),a}function L(){if(d)return s(r,null),r;var t=document.createDocumentFragment(),e=document.createComment(""),a=u();return t.append(e,a),s(e,a),t}function O(t,e){if(d){m.nodes_end=r,N();return}t!==null&&t.before(e)}export{O as a,H as b,L as c,s as d,M as e,F as h,D as r,R as t};
