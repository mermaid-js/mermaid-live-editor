import"../chunks/Bg9kRutz.js";import{p as $,o as w,D as q,a as j,G as a,n as M,H as o,I as m,F as D}from"../chunks/BmNgevel.js";import{s as T}from"../chunks/DkwME7AB.js";import{i as z,s as H,a as v}from"../chunks/B04ZTNXm.js";import{t as u,a as p}from"../chunks/CoY_8xzt.js";import{s as O,a as W,t as f}from"../chunks/CRPyTlon.js";import{b as g}from"../chunks/DQW58RcD.js";import{i as A,aJ as E,aK as F}from"../chunks/CHlfJ8du.js";const G=!0,I=!0,J=!1,K="ignore",Y=Object.freeze(Object.defineProperty({__proto__:null,csr:I,prerender:G,ssr:J,trailingSlash:K},Symbol.toStringTag,{value:"Module"}));var L=u('<div class="absolute left-0 top-0 z-50 flex h-screen w-screen justify-center bg-gray-600 align-middle opacity-50 svelte-6pksaq"><div class="my-auto text-4xl font-bold text-indigo-100 svelte-6pksaq"><div class="loader mx-auto svelte-6pksaq"></div> <div class="svelte-6pksaq"> </div></div></div>'),P=u('<main class="h-screen text-primary-content svelte-6pksaq"><!></main> <!>',1);function Z(h,i){$(i,!0);const[n,_]=H(),k=()=>v(f,"$themeStore",n),l=()=>v(F,"$loadingStateStore",n);w(()=>{window.addEventListener("hashchange",()=>{A()}),"serviceWorker"in navigator&&navigator.serviceWorker.register(`${g}/service-worker.js`,{scope:`${g}/`}).then(function(e){console.log("Registration successful, scope is:",e.scope)}).catch(function(e){console.log("Service worker registration failed, error:",e)});const t=window.matchMedia("(prefers-color-scheme: dark)").matches;k().theme===void 0&&W(t?"dark":"light"),f.subscribe(({theme:e,isDark:s})=>{e&&(document.querySelectorAll("html")[0].dataset.theme=e,E(s))})});var c=P(),r=q(c),S=a(r);O(S,()=>i.children??M),o(r);var b=m(r,2);{var y=t=>{var e=L(),s=a(e),d=m(a(s),2),x=a(d,!0);o(d),o(s),o(e),D(()=>T(x,l().message)),p(t,e)};z(b,t=>{l().loading&&t(y)})}p(h,c),j(),_()}export{Z as component,Y as universal};
