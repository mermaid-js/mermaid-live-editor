import"../chunks/CWj6FrbW.js";import{p as $,o as w,x as q,a as j,z as a,n as M,A as o,B as m,y as z}from"../chunks/PqI9hdxU.js";import{s as T}from"../chunks/DKZ2kXim.js";import{i as A,s as D,a as v}from"../chunks/CEUc2JjY.js";import{t as u,a as p}from"../chunks/tO_bP749.js";import{s as O,a as W,t as f}from"../chunks/CunwtqGg.js";import{b as g}from"../chunks/D0D6q6ul.js";import{i as B,aJ as E,aK as H}from"../chunks/wgTb7_hX.js";const J=!0,K=!0,L=!1,P="ignore",Y=Object.freeze(Object.defineProperty({__proto__:null,csr:K,prerender:J,ssr:L,trailingSlash:P},Symbol.toStringTag,{value:"Module"}));var R=u('<div class="absolute left-0 top-0 z-50 flex h-screen w-screen justify-center bg-gray-600 align-middle opacity-50 svelte-6pksaq"><div class="my-auto text-4xl font-bold text-indigo-100 svelte-6pksaq"><div class="loader mx-auto svelte-6pksaq"></div> <div class="svelte-6pksaq"> </div></div></div>'),C=u('<main class="h-screen text-primary-content svelte-6pksaq"><!></main> <!>',1);function Z(h,i){$(i,!0);const[n,_]=D(),k=()=>v(f,"$themeStore",n),l=()=>v(H,"$loadingStateStore",n);w(()=>{window.addEventListener("hashchange",()=>{B()}),"serviceWorker"in navigator&&navigator.serviceWorker.register(`${g}/service-worker.js`,{scope:`${g}/`}).then(function(e){console.log("Registration successful, scope is:",e.scope)}).catch(function(e){console.log("Service worker registration failed, error:",e)});const t=window.matchMedia("(prefers-color-scheme: dark)").matches;k().theme===void 0&&W(t?"dark":"light"),f.subscribe(({theme:e,isDark:s})=>{e&&(document.querySelectorAll("html")[0].dataset.theme=e,E(s))})});var c=C(),r=q(c),S=a(r);O(S,()=>i.children??M),o(r);var b=m(r,2);{var y=t=>{var e=R(),s=a(e),d=m(a(s),2),x=a(d,!0);o(d),o(s),o(e),z(()=>T(x,l().message)),p(t,e)};A(b,t=>{l().loading&&t(y)})}p(h,c),j(),_()}export{Z as component,Y as universal};
