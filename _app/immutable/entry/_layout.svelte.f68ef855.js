import{S as I,i as M,s as V,C as $,k as m,a as w,e as b,l as u,m as _,h as f,c as D,n as p,b as v,D as q,E as N,F as T,g as j,d as A,G as k,o as C,q as H,r as L,H as d,u as W}from"../chunks/index.787ce9b5.js";import{b as y}from"../chunks/paths.496513bc.js";import{i as z,t as B,l as F}from"../chunks/state.9e09fce5.js";import{s as G,t as S}from"../chunks/theme.7f1d16a5.js";function E(n){let i,o,l,r,c,s=n[0].message+"",t;return{c(){i=m("div"),o=m("div"),l=m("div"),r=w(),c=m("div"),t=H(s),this.h()},l(e){i=u(e,"DIV",{class:!0});var a=_(i);o=u(a,"DIV",{class:!0});var h=_(o);l=u(h,"DIV",{class:!0}),_(l).forEach(f),r=D(h),c=u(h,"DIV",{});var g=_(c);t=L(g,s),g.forEach(f),h.forEach(f),a.forEach(f),this.h()},h(){p(l,"class","loader mx-auto svelte-6pksaq"),p(o,"class","text-indigo-100 text-4xl font-bold my-auto"),p(i,"class","w-screen h-screen z-50 absolute left-0 top-0 bg-gray-600 opacity-50 flex align-middle justify-center")},m(e,a){v(e,i,a),d(i,o),d(o,l),d(o,r),d(o,c),d(c,t)},p(e,a){a&1&&s!==(s=e[0].message+"")&&W(t,s)},d(e){e&&f(i)}}}function R(n){let i,o,l,r;const c=n[2].default,s=$(c,n,n[1],null);let t=n[0].loading&&E(n);return{c(){i=m("main"),s&&s.c(),o=w(),t&&t.c(),l=b(),this.h()},l(e){i=u(e,"MAIN",{class:!0});var a=_(i);s&&s.l(a),a.forEach(f),o=D(e),t&&t.l(e),l=b(),this.h()},h(){p(i,"class","h-screen text-primary-content")},m(e,a){v(e,i,a),s&&s.m(i,null),v(e,o,a),t&&t.m(e,a),v(e,l,a),r=!0},p(e,[a]){s&&s.p&&(!r||a&2)&&q(s,c,e,e[1],r?T(c,e[1],a,null):N(e[1]),null),e[0].loading?t?t.p(e,a):(t=E(e),t.c(),t.m(l.parentNode,l)):t&&(t.d(1),t=null)},i(e){r||(j(s,e),r=!0)},o(e){A(s,e),r=!1},d(e){e&&f(i),s&&s.d(e),e&&f(o),t&&t.d(e),e&&f(l)}}}function x(n,i,o){let l,r;k(n,S,t=>o(3,l=t)),k(n,F,t=>o(0,r=t));let{$$slots:c={},$$scope:s}=i;return C(()=>{window.addEventListener("hashchange",()=>{z()}),"serviceWorker"in navigator&&navigator.serviceWorker.register(`${y}/service-worker.js`,{scope:`${y}/`}).then(function(e){console.log("Registration successful, scope is:",e.scope)}).catch(function(e){console.log("Service worker registration failed, error:",e)});const t=window.matchMedia("(prefers-color-scheme: dark)").matches;l.theme===void 0&&G(t?"dark":"light"),S.subscribe(({theme:e,isDark:a})=>{e&&(document.getElementsByTagName("html")[0].setAttribute("data-theme",e),B(a))})}),n.$$set=t=>{"$$scope"in t&&o(1,s=t.$$scope)},[r,s,c]}class Q extends I{constructor(i){super(),M(this,i,x,R,V,{})}}export{Q as default};