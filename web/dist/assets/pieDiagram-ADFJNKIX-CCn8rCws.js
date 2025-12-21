import{a5 as S,a8 as z,aC as j,_ as u,g as q,s as Z,a as H,b as J,q as K,p as Q,l as F,c as X,E as Y,I as tt,O as et,e as at,y as rt,G as nt}from"./index-wYjDYn0g.js";import{p as it}from"./chunk-4BX2VUAB-UAn9Zvwm.js";import{p as st}from"./treemap-KMMF4GRG-Ba54noWJ.js";import{d as R}from"./arc-oFMEu-Jz.js";import{o as lt}from"./ordinal-DxaMzblD.js";import"./semi-ui-BhMcy6rQ.js";import"./react-core-C3cQHg51.js";import"./index-B2FWV8sz.js";import"./tools-Dl0D2Ejr.js";import"./react-components-CL6cw4bs.js";import"./i18n-BQ_8cj7a.js";import"./IllustrationConstruction-CrX4X8hD.js";import"./min-p7NnzK3Q.js";import"./_baseUniq-6fkERLOD.js";import"./init-Gi6I4Gst.js";function ot(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function ct(t){return t}function pt(){var t=ct,a=ot,f=null,y=S(0),s=S(z),o=S(0);function l(e){var n,c=(e=j(e)).length,g,x,h=0,p=new Array(c),i=new Array(c),v=+y.apply(this,arguments),w=Math.min(z,Math.max(-z,s.apply(this,arguments)-v)),m,D=Math.min(Math.abs(w)/c,o.apply(this,arguments)),$=D*(w<0?-1:1),d;for(n=0;n<c;++n)(d=i[p[n]=n]=+t(e[n],n,e))>0&&(h+=d);for(a!=null?p.sort(function(A,C){return a(i[A],i[C])}):f!=null&&p.sort(function(A,C){return f(e[A],e[C])}),n=0,x=h?(w-c*$)/h:0;n<c;++n,v=m)g=p[n],d=i[g],m=v+(d>0?d*x:0)+$,i[g]={data:e[g],index:n,value:d,startAngle:v,endAngle:m,padAngle:D};return i}return l.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),l):t},l.sortValues=function(e){return arguments.length?(a=e,f=null,l):a},l.sort=function(e){return arguments.length?(f=e,a=null,l):f},l.startAngle=function(e){return arguments.length?(y=typeof e=="function"?e:S(+e),l):y},l.endAngle=function(e){return arguments.length?(s=typeof e=="function"?e:S(+e),l):s},l.padAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),l):o},l}var ut=nt.pie,G={sections:new Map,showData:!1},T=G.sections,N=G.showData,gt=structuredClone(ut),dt=u(()=>structuredClone(gt),"getConfig"),ft=u(()=>{T=new Map,N=G.showData,rt()},"clear"),mt=u(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),F.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ht=u(()=>T,"getSections"),vt=u(t=>{N=t},"setShowData"),St=u(()=>N,"getShowData"),L={getConfig:dt,clear:ft,setDiagramTitle:Q,getDiagramTitle:K,setAccTitle:J,getAccTitle:H,setAccDescription:Z,getAccDescription:q,addSection:mt,getSections:ht,setShowData:vt,getShowData:St},yt=u((t,a)=>{it(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),xt={parse:u(async t=>{const a=await st("pie",t);F.debug(a),yt(a,L)},"parse")},wt=u(t=>`
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
`,"getStyles"),At=wt,Ct=u(t=>{const a=[...t.values()].reduce((s,o)=>s+o,0),f=[...t.entries()].map(([s,o])=>({label:s,value:o})).filter(s=>s.value/a*100>=1).sort((s,o)=>o.value-s.value);return pt().value(s=>s.value)(f)},"createPieArcs"),Dt=u((t,a,f,y)=>{F.debug(`rendering pie chart
`+t);const s=y.db,o=X(),l=Y(s.getConfig(),o.pie),e=40,n=18,c=4,g=450,x=g,h=tt(a),p=h.append("g");p.attr("transform","translate("+x/2+","+g/2+")");const{themeVariables:i}=o;let[v]=et(i.pieOuterStrokeWidth);v??(v=2);const w=l.textPosition,m=Math.min(x,g)/2-e,D=R().innerRadius(0).outerRadius(m),$=R().innerRadius(m*w).outerRadius(m*w);p.append("circle").attr("cx",0).attr("cy",0).attr("r",m+v/2).attr("class","pieOuterCircle");const d=s.getSections(),A=Ct(d),C=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let E=0;d.forEach(r=>{E+=r});const O=A.filter(r=>(r.data.value/E*100).toFixed(0)!=="0"),b=lt(C);p.selectAll("mySlices").data(O).enter().append("path").attr("d",D).attr("fill",r=>b(r.data.label)).attr("class","pieCircle"),p.selectAll("mySlices").data(O).enter().append("text").text(r=>(r.data.value/E*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(s.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const W=[...d.entries()].map(([r,M])=>({label:r,value:M})),k=p.selectAll(".legend").data(W).enter().append("g").attr("class","legend").attr("transform",(r,M)=>{const P=n+c,B=P*W.length/2,V=12*n,U=M*P-B;return"translate("+V+","+U+")"});k.append("rect").attr("width",n).attr("height",n).style("fill",r=>b(r.label)).style("stroke",r=>b(r.label)),k.append("text").attr("x",n+c).attr("y",n-c).text(r=>s.getShowData()?`${r.label} [${r.value}]`:r.label);const _=Math.max(...k.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0)),I=x+e+n+c+_;h.attr("viewBox",`0 0 ${I} ${g}`),at(h,g,I,l.useMaxWidth)},"draw"),$t={draw:Dt},_t={parser:xt,db:L,renderer:$t,styles:At};export{_t as diagram};
