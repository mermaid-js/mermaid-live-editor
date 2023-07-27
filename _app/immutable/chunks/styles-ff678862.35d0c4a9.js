import{i as R,G as q}from"./layout.0895040f.js";import{_ as D,$ as M,a0 as F,a1 as U,a2 as W,a3 as X,V as N,O as u,W as H,I as $,R as G,X as C,U as E,N as _,a4 as Y,Y as J,a5 as K}from"./state.bbd198cf.js";import{f as Q}from"./flowDb-8f9fc471.1d31edc8.js";import{r as Z}from"./index-4c4adb72.23813916.js";function j(e){return typeof e=="string"?new D([document.querySelectorAll(e)],[document.documentElement]):new D([F(e)],M)}const O=(e,l)=>U.lang.round(W.parse(e)[l]),ee=O;function ue(e,l){return!!e.children(l).length}function we(e){return L(e.v)+":"+L(e.w)+":"+L(e.name)}var te=/:/g;function L(e){return e?String(e).replace(te,"\\:"):""}function re(e,l){l&&e.attr("style",l)}function he(e,l,c){l&&e.attr("class",l).attr("class",c+" "+e.attr("class"))}function ye(e,l){var c=l.graph();if(R(c)){var a=c.transition;if(X(a))return a(e)}return e}function le(e,l){var c=e.append("foreignObject").attr("width","100000"),a=c.append("xhtml:div");a.attr("xmlns","http://www.w3.org/1999/xhtml");var i=l.label;switch(typeof i){case"function":a.insert(i);break;case"object":a.insert(function(){return i});break;default:a.html(i)}re(a,l.labelStyle),a.style("display","inline-block"),a.style("white-space","nowrap");var d=a.node().getBoundingClientRect();return c.attr("width",d.width).attr("height",d.height),c}const z={},ae=function(e){const l=Object.keys(e);for(const c of l)z[c]=e[c]},V=function(e,l,c,a,i,d){const w=a.select(`[id="${c}"]`);Object.keys(e).forEach(function(p){const r=e[p];let g="default";r.classes.length>0&&(g=r.classes.join(" ")),g=g+" flowchart-label";const h=N(r.styles);let t=r.text!==void 0?r.text:r.id,s;if(u.info("vertex",r,r.labelType),r.labelType==="markdown")u.info("vertex",r,r.labelType);else if(H($().flowchart.htmlLabels)){const m={label:t.replace(/fa[blrs]?:fa-[\w-]+/g,k=>`<i class='${k.replace(":"," ")}'></i>`)};s=le(w,m).node(),s.parentNode.removeChild(s)}else{const m=i.createElementNS("http://www.w3.org/2000/svg","text");m.setAttribute("style",h.labelStyle.replace("color:","fill:"));const k=t.split(G.lineBreakRegex);for(const T of k){const v=i.createElementNS("http://www.w3.org/2000/svg","tspan");v.setAttributeNS("http://www.w3.org/XML/1998/namespace","xml:space","preserve"),v.setAttribute("dy","1em"),v.setAttribute("x","1"),v.textContent=T,m.appendChild(v)}s=m}let b=0,o="";switch(r.type){case"round":b=5,o="rect";break;case"square":o="rect";break;case"diamond":o="question";break;case"hexagon":o="hexagon";break;case"odd":o="rect_left_inv_arrow";break;case"lean_right":o="lean_right";break;case"lean_left":o="lean_left";break;case"trapezoid":o="trapezoid";break;case"inv_trapezoid":o="inv_trapezoid";break;case"odd_right":o="rect_left_inv_arrow";break;case"circle":o="circle";break;case"ellipse":o="ellipse";break;case"stadium":o="stadium";break;case"subroutine":o="subroutine";break;case"cylinder":o="cylinder";break;case"group":o="rect";break;case"doublecircle":o="doublecircle";break;default:o="rect"}l.setNode(r.id,{labelStyle:h.labelStyle,shape:o,labelText:t,labelType:r.labelType,rx:b,ry:b,class:g,style:h.style,id:r.id,link:r.link,linkTarget:r.linkTarget,tooltip:d.db.getTooltip(r.id)||"",domId:d.db.lookUpDomId(r.id),haveCallback:r.haveCallback,width:r.type==="group"?500:void 0,dir:r.dir,type:r.type,props:r.props,padding:$().flowchart.padding}),u.info("setNode",{labelStyle:h.labelStyle,labelType:r.labelType,shape:o,labelText:t,rx:b,ry:b,class:g,style:h.style,id:r.id,domId:d.db.lookUpDomId(r.id),width:r.type==="group"?500:void 0,type:r.type,dir:r.dir,props:r.props,padding:$().flowchart.padding})})},P=function(e,l,c){u.info("abc78 edges = ",e);let a=0,i={},d,w;if(e.defaultStyle!==void 0){const n=N(e.defaultStyle);d=n.style,w=n.labelStyle}e.forEach(function(n){a++;const p="L-"+n.start+"-"+n.end;i[p]===void 0?(i[p]=0,u.info("abc78 new entry",p,i[p])):(i[p]++,u.info("abc78 new entry",p,i[p]));let r=p+"-"+i[p];u.info("abc78 new link id to be used is",p,r,i[p]);const g="LS-"+n.start,h="LE-"+n.end,t={style:"",labelStyle:""};switch(t.minlen=n.length||1,n.type==="arrow_open"?t.arrowhead="none":t.arrowhead="normal",t.arrowTypeStart="arrow_open",t.arrowTypeEnd="arrow_open",n.type){case"double_arrow_cross":t.arrowTypeStart="arrow_cross";case"arrow_cross":t.arrowTypeEnd="arrow_cross";break;case"double_arrow_point":t.arrowTypeStart="arrow_point";case"arrow_point":t.arrowTypeEnd="arrow_point";break;case"double_arrow_circle":t.arrowTypeStart="arrow_circle";case"arrow_circle":t.arrowTypeEnd="arrow_circle";break}let s="",b="";switch(n.stroke){case"normal":s="fill:none;",d!==void 0&&(s=d),w!==void 0&&(b=w),t.thickness="normal",t.pattern="solid";break;case"dotted":t.thickness="normal",t.pattern="dotted",t.style="fill:none;stroke-width:2px;stroke-dasharray:3;";break;case"thick":t.thickness="thick",t.pattern="solid",t.style="stroke-width: 3.5px;fill:none;";break;case"invisible":t.thickness="invisible",t.pattern="solid",t.style="stroke-width: 0;fill:none;";break}if(n.style!==void 0){const o=N(n.style);s=o.style,b=o.labelStyle}t.style=t.style+=s,t.labelStyle=t.labelStyle+=b,n.interpolate!==void 0?t.curve=C(n.interpolate,E):e.defaultInterpolate!==void 0?t.curve=C(e.defaultInterpolate,E):t.curve=C(z.curve,E),n.text===void 0?n.style!==void 0&&(t.arrowheadStyle="fill: #333"):(t.arrowheadStyle="fill: #333",t.labelpos="c"),t.labelType=n.labelType,t.label=n.text.replace(G.lineBreakRegex,`
`),n.style===void 0&&(t.style=t.style||"stroke: #333; stroke-width: 1.5px;fill:none;"),t.labelStyle=t.labelStyle.replace("color:","fill:"),t.id=r,t.classes="flowchart-link "+g+" "+h,l.setEdge(n.start,n.end,t,a)})},oe=function(e,l){u.info("Extracting classes"),l.db.clear();try{return l.parse(e),l.db.getClasses()}catch{return}},ne=async function(e,l,c,a){u.info("Drawing flowchart"),a.db.clear(),Q.setGen("gen-2"),a.parser.parse(e);let i=a.db.getDirection();i===void 0&&(i="TD");const{securityLevel:d,flowchart:w}=$(),n=w.nodeSpacing||50,p=w.rankSpacing||50;let r;d==="sandbox"&&(r=_("#i"+l));const g=d==="sandbox"?_(r.nodes()[0].contentDocument.body):_("body"),h=d==="sandbox"?r.nodes()[0].contentDocument:document,t=new q({multigraph:!0,compound:!0}).setGraph({rankdir:i,nodesep:n,ranksep:p,marginx:0,marginy:0}).setDefaultEdgeLabel(function(){return{}});let s;const b=a.db.getSubGraphs();u.info("Subgraphs - ",b);for(let f=b.length-1;f>=0;f--)s=b[f],u.info("Subgraph - ",s),a.db.addVertex(s.id,{text:s.title,type:s.labelType},"group",void 0,s.classes,s.dir);const o=a.db.getVertices(),m=a.db.getEdges();u.info("Edges",m);let k=0;for(k=b.length-1;k>=0;k--){s=b[k],j("cluster").append("text");for(let f=0;f<s.nodes.length;f++)u.info("Setting up subgraphs",s.nodes[f],s.id),t.setParent(s.nodes[f],s.id)}V(o,t,l,g,h,a),P(m,t);const T=g.select(`[id="${l}"]`),v=g.select("#"+l+" g");if(await Z(v,t,["point","circle","cross"],"flowchart",l),Y.insertTitle(T,"flowchartTitleText",w.titleTopMargin,a.db.getDiagramTitle()),J(t,T,w.diagramPadding,w.useMaxWidth),a.db.indexNodes("subGraph"+k),!w.htmlLabels){const f=h.querySelectorAll('[id="'+l+'"] .edgeLabel .label');for(const x of f){const S=x.getBBox(),y=h.createElementNS("http://www.w3.org/2000/svg","rect");y.setAttribute("rx",0),y.setAttribute("ry",0),y.setAttribute("width",S.width),y.setAttribute("height",S.height),x.insertBefore(y,x.firstChild)}}Object.keys(o).forEach(function(f){const x=o[f];if(x.link){const S=_("#"+l+' [id="'+f+'"]');if(S){const y=h.createElementNS("http://www.w3.org/2000/svg","a");y.setAttributeNS("http://www.w3.org/2000/svg","class",x.classes.join(" ")),y.setAttributeNS("http://www.w3.org/2000/svg","href",x.link),y.setAttributeNS("http://www.w3.org/2000/svg","rel","noopener"),d==="sandbox"?y.setAttributeNS("http://www.w3.org/2000/svg","target","_top"):x.linkTarget&&y.setAttributeNS("http://www.w3.org/2000/svg","target",x.linkTarget);const A=S.insert(function(){return y},":first-child"),B=S.select(".label-container");B&&A.append(function(){return B.node()});const I=S.select(".label");I&&A.append(function(){return I.node()})}}})},ge={setConf:ae,addVertices:V,addEdges:P,getClasses:oe,draw:ne},se=(e,l)=>{const c=ee,a=c(e,"r"),i=c(e,"g"),d=c(e,"b");return K(a,i,d,l)},ie=e=>`.label {
    font-family: ${e.fontFamily};
    color: ${e.nodeTextColor||e.textColor};
  }
  .cluster-label text {
    fill: ${e.titleColor};
  }
  .cluster-label span,p {
    color: ${e.titleColor};
  }

  .label text,span,p {
    fill: ${e.nodeTextColor||e.textColor};
    color: ${e.nodeTextColor||e.textColor};
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${e.mainBkg};
    stroke: ${e.nodeBorder};
    stroke-width: 1px;
  }
  .flowchart-label text {
    text-anchor: middle;
  }
  // .flowchart-label .text-outer-tspan {
  //   text-anchor: middle;
  // }
  // .flowchart-label .text-inner-tspan {
  //   text-anchor: start;
  // }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${e.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${e.lineColor};
    stroke-width: 2.0px;
  }

  .flowchart-link {
    stroke: ${e.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${e.edgeLabelBackground};
    rect {
      opacity: 0.5;
      background-color: ${e.edgeLabelBackground};
      fill: ${e.edgeLabelBackground};
    }
    text-align: center;
  }

  /* For html labels only */
  .labelBkg {
    background-color: ${se(e.edgeLabelBackground,.5)};
    // background-color: 
  }

  .cluster rect {
    fill: ${e.clusterBkg};
    stroke: ${e.clusterBorder};
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${e.titleColor};
  }

  .cluster span,p {
    color: ${e.titleColor};
  }
  /* .cluster div {
    color: ${e.titleColor};
  } */

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${e.fontFamily};
    font-size: 12px;
    background: ${e.tertiaryColor};
    border: 1px solid ${e.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .flowchartTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${e.textColor};
  }
`,ke=ie;export{re as a,le as b,ye as c,he as d,we as e,ge as f,ke as g,ue as i,j as s};
