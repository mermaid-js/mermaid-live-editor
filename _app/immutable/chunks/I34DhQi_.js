import{b as n,E as i,c as l,n as c,d as f,h as p,f as d,w as h}from"./PqI9hdxU.js";import{ar as u,as as g,at as k}from"./Br9u7Cn3.js";function w(a,s,...o){var r=a,e=c,t;n(()=>{e!==(e=s())&&(t&&(f(t),t=null),t=l(()=>e(r,...o)))},i),p&&(r=d)}const S=u(h({isDark:!1}),g(),"themeStore"),b=new Set(["dark","synthwave","halloween","aqua","forest","luxury","black","dracula"]),y=a=>{a.includes(" ")&&(a=a.split(" ")[1].trim());const s=b.has(a);console.log("Setting theme",a),S.set({theme:a,isDark:s}),k("themeChange",{theme:a,isDark:s})};export{y as a,w as s,S as t};
