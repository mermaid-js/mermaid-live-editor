import{p as U}from"./chunk-OQCM5LHU.QG6Xk3Tt.js";import{ah as S,a9 as z,aN as j,D as Z,u as q,v as H,s as J,g as K,d as Q,c as X,_ as p,n as F,y as Y,e as tt,E as et,I as at,P as rt,o as nt}from"./state.DOvSwSUM.js";import{p as it}from"./gitGraph-YCYPL57B.ZsghWixU.js";import{d as I}from"./arc.CRKb2ys2.js";import{o as st}from"./ordinal.BYWQX77i.js";function ot(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function lt(t){return t}function ct(){var t=lt,a=ot,h=null,o=S(0),g=S(z),x=S(0);function i(e){var r,l=(e=j(e)).length,c,A,m=0,u=new Array(l),n=new Array(l),v=+o.apply(this,arguments),w=Math.min(z,Math.max(-z,g.apply(this,arguments)-v)),f,T=Math.min(Math.abs(w)/l,x.apply(this,arguments)),$=T*(w<0?-1:1),d;for(r=0;r<l;++r)(d=n[u[r]=r]=+t(e[r],r,e))>0&&(m+=d);for(a!=null?u.sort(function(y,D){return a(n[y],n[D])}):h!=null&&u.sort(function(y,D){return h(e[y],e[D])}),r=0,A=m?(w-l*$)/m:0;r<l;++r,v=f)c=u[r],d=n[c],f=v+(d>0?d*A:0)+$,n[c]={data:e[c],index:r,value:d,startAngle:v,endAngle:f,padAngle:T};return n}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),i):t},i.sortValues=function(e){return arguments.length?(a=e,h=null,i):a},i.sort=function(e){return arguments.length?(h=e,a=null,i):h},i.startAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),i):o},i.endAngle=function(e){return arguments.length?(g=typeof e=="function"?e:S(+e),i):g},i.padAngle=function(e){return arguments.length?(x=typeof e=="function"?e:S(+e),i):x},i}var O=Z.pie,G={sections:new Map,showData:!1,config:O},M=G.sections,N=G.showData,ut=structuredClone(O),pt=p(()=>structuredClone(ut),"getConfig"),gt=p(()=>{M=new Map,N=G.showData,Y()},"clear"),dt=p(({label:t,value:a})=>{M.has(t)||(M.set(t,a),F.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ft=p(()=>M,"getSections"),ht=p(t=>{N=t},"setShowData"),mt=p(()=>N,"getShowData"),R={getConfig:pt,clear:gt,setDiagramTitle:q,getDiagramTitle:H,setAccTitle:J,getAccTitle:K,setAccDescription:Q,getAccDescription:X,addSection:dt,getSections:ft,setShowData:ht,getShowData:mt},vt=p((t,a)=>{U(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),yt={parse:p(async t=>{const a=await it("pie",t);F.debug(a),vt(a,R)},"parse")},St=p(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),xt=St,At=p(t=>{const a=[...t.entries()].map(o=>({label:o[0],value:o[1]})).sort((o,g)=>g.value-o.value);return ct().value(o=>o.value)(a)},"createPieArcs"),wt=p((t,a,h,o)=>{F.debug(`rendering pie chart
`+t);const g=o.db,x=tt(),i=et(g.getConfig(),x.pie),e=40,r=18,l=4,c=450,A=c,m=at(a),u=m.append("g");u.attr("transform","translate("+A/2+","+c/2+")");const{themeVariables:n}=x;let[v]=rt(n.pieOuterStrokeWidth);v??(v=2);const w=i.textPosition,f=Math.min(A,c)/2-e,T=I().innerRadius(0).outerRadius(f),$=I().innerRadius(f*w).outerRadius(f*w);u.append("circle").attr("cx",0).attr("cy",0).attr("r",f+v/2).attr("class","pieOuterCircle");const d=g.getSections(),y=At(d),D=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12],C=st(D);u.selectAll("mySlices").data(y).enter().append("path").attr("d",T).attr("fill",s=>C(s.data.label)).attr("class","pieCircle");let P=0;d.forEach(s=>{P+=s}),u.selectAll("mySlices").data(y).enter().append("text").text(s=>(s.data.value/P*100).toFixed(0)+"%").attr("transform",s=>"translate("+$.centroid(s)+")").style("text-anchor","middle").attr("class","slice"),u.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-(c-50)/2).attr("class","pieTitleText");const b=u.selectAll(".legend").data(C.domain()).enter().append("g").attr("class","legend").attr("transform",(s,E)=>{const k=r+l,_=k*C.domain().length/2,B=12*r,V=E*k-_;return"translate("+B+","+V+")"});b.append("rect").attr("width",r).attr("height",r).style("fill",C).style("stroke",C),b.data(y).append("text").attr("x",r+l).attr("y",r-l).text(s=>{const{label:E,value:k}=s.data;return g.getShowData()?`${E} [${k}]`:E});const L=Math.max(...b.selectAll("text").nodes().map(s=>(s==null?void 0:s.getBoundingClientRect().width)??0)),W=A+e+r+l+L;m.attr("viewBox",`0 0 ${W} ${c}`),nt(m,c,W,i.useMaxWidth)},"draw"),Dt={draw:wt},Mt={parser:yt,db:R,renderer:Dt,styles:xt};export{Mt as diagram};
