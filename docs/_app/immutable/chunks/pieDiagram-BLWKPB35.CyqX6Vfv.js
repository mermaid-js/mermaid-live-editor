import{p as U}from"./chunk-BAOP5US2.Dyi4OwCq.js";import{ab as x,a3 as z,aP as j,C as q,q as H,r as Z,s as J,g as K,c as Q,b as X,_ as p,l as P,x as Y,d as tt,D as et,H as at,P as rt,m as nt}from"./state.Qixy50aq.js";import{p as it}from"./gitGraph-YCYPL57B.C7p1sW8C.js";import{d as O}from"./arc.DGNE9sAq.js";import{o as st}from"./ordinal.BYWQX77i.js";function ot(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function lt(t){return t}function ct(){var t=lt,a=ot,h=null,o=x(0),g=x(z),y=x(0);function i(e){var r,l=(e=j(e)).length,c,A,m=0,u=new Array(l),n=new Array(l),v=+o.apply(this,arguments),w=Math.min(z,Math.max(-z,g.apply(this,arguments)-v)),f,T=Math.min(Math.abs(w)/l,y.apply(this,arguments)),$=T*(w<0?-1:1),d;for(r=0;r<l;++r)(d=n[u[r]=r]=+t(e[r],r,e))>0&&(m+=d);for(a!=null?u.sort(function(S,C){return a(n[S],n[C])}):h!=null&&u.sort(function(S,C){return h(e[S],e[C])}),r=0,A=m?(w-l*$)/m:0;r<l;++r,v=f)c=u[r],d=n[c],f=v+(d>0?d*A:0)+$,n[c]={data:e[c],index:r,value:d,startAngle:v,endAngle:f,padAngle:T};return n}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:x(+e),i):t},i.sortValues=function(e){return arguments.length?(a=e,h=null,i):a},i.sort=function(e){return arguments.length?(h=e,a=null,i):h},i.startAngle=function(e){return arguments.length?(o=typeof e=="function"?e:x(+e),i):o},i.endAngle=function(e){return arguments.length?(g=typeof e=="function"?e:x(+e),i):g},i.padAngle=function(e){return arguments.length?(y=typeof e=="function"?e:x(+e),i):y},i}var R=q.pie,F={sections:new Map,showData:!1,config:R},E=F.sections,G=F.showData,ut=structuredClone(R),pt=p(()=>structuredClone(ut),"getConfig"),gt=p(()=>{E=new Map,G=F.showData,Y()},"clear"),dt=p(({label:t,value:a})=>{E.has(t)||(E.set(t,a),P.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ft=p(()=>E,"getSections"),ht=p(t=>{G=t},"setShowData"),mt=p(()=>G,"getShowData"),I={getConfig:pt,clear:gt,setDiagramTitle:H,getDiagramTitle:Z,setAccTitle:J,getAccTitle:K,setAccDescription:Q,getAccDescription:X,addSection:dt,getSections:ft,setShowData:ht,getShowData:mt},vt=p((t,a)=>{U(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),St={parse:p(async t=>{const a=await it("pie",t);P.debug(a),vt(a,I)},"parse")},xt=p(t=>`
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
`,"getStyles"),yt=xt,At=p(t=>{const a=[...t.entries()].map(o=>({label:o[0],value:o[1]})).sort((o,g)=>g.value-o.value);return ct().value(o=>o.value)(a)},"createPieArcs"),wt=p((t,a,h,o)=>{P.debug(`rendering pie chart
`+t);const g=o.db,y=tt(),i=et(g.getConfig(),y.pie),e=40,r=18,l=4,c=450,A=c,m=at(a),u=m.append("g");u.attr("transform","translate("+A/2+","+c/2+")");const{themeVariables:n}=y;let[v]=rt(n.pieOuterStrokeWidth);v??(v=2);const w=i.textPosition,f=Math.min(A,c)/2-e,T=O().innerRadius(0).outerRadius(f),$=O().innerRadius(f*w).outerRadius(f*w);u.append("circle").attr("cx",0).attr("cy",0).attr("r",f+v/2).attr("class","pieOuterCircle");const d=g.getSections(),S=At(d),C=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12],D=st(C);u.selectAll("mySlices").data(S).enter().append("path").attr("d",T).attr("fill",s=>D(s.data.label)).attr("class","pieCircle");let W=0;d.forEach(s=>{W+=s}),u.selectAll("mySlices").data(S).enter().append("text").text(s=>(s.data.value/W*100).toFixed(0)+"%").attr("transform",s=>"translate("+$.centroid(s)+")").style("text-anchor","middle").attr("class","slice"),u.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-(c-50)/2).attr("class","pieTitleText");const M=u.selectAll(".legend").data(D.domain()).enter().append("g").attr("class","legend").attr("transform",(s,b)=>{const k=r+l,_=k*D.domain().length/2,B=12*r,V=b*k-_;return"translate("+B+","+V+")"});M.append("rect").attr("width",r).attr("height",r).style("fill",D).style("stroke",D),M.data(S).append("text").attr("x",r+l).attr("y",r-l).text(s=>{const{label:b,value:k}=s.data;return g.getShowData()?`${b} [${k}]`:b});const L=Math.max(...M.selectAll("text").nodes().map(s=>(s==null?void 0:s.getBoundingClientRect().width)??0)),N=A+e+r+l+L;m.attr("viewBox",`0 0 ${N} ${c}`),nt(m,c,N,i.useMaxWidth)},"draw"),Ct={draw:wt},Et={parser:St,db:I,renderer:Ct,styles:yt};export{Et as diagram};
