import{i as M,G as P}from"./layout.720ce1c8.js";import{Z as R,U as L,N as u,V as q,H as C,R as I,W as $,T as E,M as _,_ as U,X as F}from"./state.725a5fde.js";import{f as H}from"./flowDb-52e24d17.23f6e9ee.js";import{r as W}from"./index-5219d011.c154ad1e.js";import{s as X}from"./selectAll.85d0305d.js";function se(e,l){return!!e.children(l).length}function ne(e){return N(e.v)+":"+N(e.w)+":"+N(e.name)}var Z=/:/g;function N(e){return e?String(e).replace(Z,"\\:"):""}function J(e,l){l&&e.attr("style",l)}function ie(e,l,c){l&&e.attr("class",l).attr("class",c+" "+e.attr("class"))}function ce(e,l){var c=l.graph();if(M(c)){var a=c.transition;if(R(a))return a(e)}return e}function K(e,l){var c=e.append("foreignObject").attr("width","100000"),a=c.append("xhtml:div");a.attr("xmlns","http://www.w3.org/1999/xhtml");var i=l.label;switch(typeof i){case"function":a.insert(i);break;case"object":a.insert(function(){return i});break;default:a.html(i)}J(a,l.labelStyle),a.style("display","inline-block"),a.style("white-space","nowrap");var d=a.node().getBoundingClientRect();return c.attr("width",d.width).attr("height",d.height),c}const G={},Q=function(e){const l=Object.keys(e);for(const c of l)G[c]=e[c]},z=function(e,l,c,a,i,d){const w=a.select(`[id="${c}"]`);Object.keys(e).forEach(function(p){const r=e[p];let k="default";r.classes.length>0&&(k=r.classes.join(" ")),k=k+" flowchart-label";const h=L(r.styles);let t=r.text!==void 0?r.text:r.id,n;if(u.info("vertex",r,r.labelType),r.labelType==="markdown")u.info("vertex",r,r.labelType);else if(q(C().flowchart.htmlLabels)){const v={label:t.replace(/fa[blrs]?:fa-[\w-]+/g,g=>`<i class='${g.replace(":"," ")}'></i>`)};n=K(w,v).node(),n.parentNode.removeChild(n)}else{const v=i.createElementNS("http://www.w3.org/2000/svg","text");v.setAttribute("style",h.labelStyle.replace("color:","fill:"));const g=t.split(I.lineBreakRegex);for(const T of g){const m=i.createElementNS("http://www.w3.org/2000/svg","tspan");m.setAttributeNS("http://www.w3.org/XML/1998/namespace","xml:space","preserve"),m.setAttribute("dy","1em"),m.setAttribute("x","1"),m.textContent=T,v.appendChild(m)}n=v}let f=0,o="";switch(r.type){case"round":f=5,o="rect";break;case"square":o="rect";break;case"diamond":o="question";break;case"hexagon":o="hexagon";break;case"odd":o="rect_left_inv_arrow";break;case"lean_right":o="lean_right";break;case"lean_left":o="lean_left";break;case"trapezoid":o="trapezoid";break;case"inv_trapezoid":o="inv_trapezoid";break;case"odd_right":o="rect_left_inv_arrow";break;case"circle":o="circle";break;case"ellipse":o="ellipse";break;case"stadium":o="stadium";break;case"subroutine":o="subroutine";break;case"cylinder":o="cylinder";break;case"group":o="rect";break;case"doublecircle":o="doublecircle";break;default:o="rect"}l.setNode(r.id,{labelStyle:h.labelStyle,shape:o,labelText:t,labelType:r.labelType,rx:f,ry:f,class:k,style:h.style,id:r.id,link:r.link,linkTarget:r.linkTarget,tooltip:d.db.getTooltip(r.id)||"",domId:d.db.lookUpDomId(r.id),haveCallback:r.haveCallback,width:r.type==="group"?500:void 0,dir:r.dir,type:r.type,props:r.props,padding:C().flowchart.padding}),u.info("setNode",{labelStyle:h.labelStyle,labelType:r.labelType,shape:o,labelText:t,rx:f,ry:f,class:k,style:h.style,id:r.id,domId:d.db.lookUpDomId(r.id),width:r.type==="group"?500:void 0,type:r.type,dir:r.dir,props:r.props,padding:C().flowchart.padding})})},V=function(e,l,c){u.info("abc78 edges = ",e);let a=0,i={},d,w;if(e.defaultStyle!==void 0){const s=L(e.defaultStyle);d=s.style,w=s.labelStyle}e.forEach(function(s){a++;var p="L-"+s.start+"-"+s.end;i[p]===void 0?(i[p]=0,u.info("abc78 new entry",p,i[p])):(i[p]++,u.info("abc78 new entry",p,i[p]));let r=p+"-"+i[p];u.info("abc78 new link id to be used is",p,r,i[p]);var k="LS-"+s.start,h="LE-"+s.end;const t={style:"",labelStyle:""};switch(t.minlen=s.length||1,s.type==="arrow_open"?t.arrowhead="none":t.arrowhead="normal",t.arrowTypeStart="arrow_open",t.arrowTypeEnd="arrow_open",s.type){case"double_arrow_cross":t.arrowTypeStart="arrow_cross";case"arrow_cross":t.arrowTypeEnd="arrow_cross";break;case"double_arrow_point":t.arrowTypeStart="arrow_point";case"arrow_point":t.arrowTypeEnd="arrow_point";break;case"double_arrow_circle":t.arrowTypeStart="arrow_circle";case"arrow_circle":t.arrowTypeEnd="arrow_circle";break}let n="",f="";switch(s.stroke){case"normal":n="fill:none;",d!==void 0&&(n=d),w!==void 0&&(f=w),t.thickness="normal",t.pattern="solid";break;case"dotted":t.thickness="normal",t.pattern="dotted",t.style="fill:none;stroke-width:2px;stroke-dasharray:3;";break;case"thick":t.thickness="thick",t.pattern="solid",t.style="stroke-width: 3.5px;fill:none;";break;case"invisible":t.thickness="invisible",t.pattern="solid",t.style="stroke-width: 0;fill:none;";break}if(s.style!==void 0){const o=L(s.style);n=o.style,f=o.labelStyle}t.style=t.style+=n,t.labelStyle=t.labelStyle+=f,s.interpolate!==void 0?t.curve=$(s.interpolate,E):e.defaultInterpolate!==void 0?t.curve=$(e.defaultInterpolate,E):t.curve=$(G.curve,E),s.text===void 0?s.style!==void 0&&(t.arrowheadStyle="fill: #333"):(t.arrowheadStyle="fill: #333",t.labelpos="c"),t.labelType=s.labelType,t.label=s.text.replace(I.lineBreakRegex,`
`),s.style===void 0&&(t.style=t.style||"stroke: #333; stroke-width: 1.5px;fill:none;"),t.labelStyle=t.labelStyle.replace("color:","fill:"),t.id=r,t.classes="flowchart-link "+k+" "+h,l.setEdge(s.start,s.end,t,a)})},Y=function(e,l){u.info("Extracting classes"),l.db.clear();try{return l.parse(e),l.db.getClasses()}catch{return}},j=function(e,l,c,a){u.info("Drawing flowchart"),a.db.clear(),H.setGen("gen-2"),a.parser.parse(e);let i=a.db.getDirection();i===void 0&&(i="TD");const{securityLevel:d,flowchart:w}=C(),s=w.nodeSpacing||50,p=w.rankSpacing||50;let r;d==="sandbox"&&(r=_("#i"+l));const k=d==="sandbox"?_(r.nodes()[0].contentDocument.body):_("body"),h=d==="sandbox"?r.nodes()[0].contentDocument:document,t=new P({multigraph:!0,compound:!0}).setGraph({rankdir:i,nodesep:s,ranksep:p,marginx:0,marginy:0}).setDefaultEdgeLabel(function(){return{}});let n;const f=a.db.getSubGraphs();u.info("Subgraphs - ",f);for(let b=f.length-1;b>=0;b--)n=f[b],u.info("Subgraph - ",n),a.db.addVertex(n.id,{text:n.title,type:n.labelType},"group",void 0,n.classes,n.dir);const o=a.db.getVertices(),v=a.db.getEdges();u.info("Edges",v);let g=0;for(g=f.length-1;g>=0;g--){n=f[g],X("cluster").append("text");for(let b=0;b<n.nodes.length;b++)u.info("Setting up subgraphs",n.nodes[b],n.id),t.setParent(n.nodes[b],n.id)}z(o,t,l,k,h,a),V(v,t);const T=k.select(`[id="${l}"]`),m=k.select("#"+l+" g");if(W(m,t,["point","circle","cross"],"flowchart",l),U.insertTitle(T,"flowchartTitleText",w.titleTopMargin,a.db.getDiagramTitle()),F(t,T,w.diagramPadding,w.useMaxWidth),a.db.indexNodes("subGraph"+g),!w.htmlLabels){const b=h.querySelectorAll('[id="'+l+'"] .edgeLabel .label');for(const x of b){const S=x.getBBox(),y=h.createElementNS("http://www.w3.org/2000/svg","rect");y.setAttribute("rx",0),y.setAttribute("ry",0),y.setAttribute("width",S.width),y.setAttribute("height",S.height),x.insertBefore(y,x.firstChild)}}Object.keys(o).forEach(function(b){const x=o[b];if(x.link){const S=_("#"+l+' [id="'+b+'"]');if(S){const y=h.createElementNS("http://www.w3.org/2000/svg","a");y.setAttributeNS("http://www.w3.org/2000/svg","class",x.classes.join(" ")),y.setAttributeNS("http://www.w3.org/2000/svg","href",x.link),y.setAttributeNS("http://www.w3.org/2000/svg","rel","noopener"),d==="sandbox"?y.setAttributeNS("http://www.w3.org/2000/svg","target","_top"):x.linkTarget&&y.setAttributeNS("http://www.w3.org/2000/svg","target",x.linkTarget);const A=S.insert(function(){return y},":first-child"),B=S.select(".label-container");B&&A.append(function(){return B.node()});const D=S.select(".label");D&&A.append(function(){return D.node()})}}})},de={setConf:Q,addVertices:z,addEdges:V,getClasses:Y,draw:j},O=e=>`.label {
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
`,pe=O;export{J as a,K as b,ce as c,ie as d,ne as e,de as f,pe as g,se as i};
