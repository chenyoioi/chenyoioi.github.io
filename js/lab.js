/* ═══════════════════════════════════════════════
   Creative Lab — v3 · 14 experiments
   ═══════════════════════════════════════════════ */
(function(){
"use strict";
if(window.__creativeLabScriptLoaded){return;}
window.__creativeLabScriptLoaded=true;

var labLowPower = !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var labCardObserver=null;

function fitCanvas(c){
  var r=c.parentElement.getBoundingClientRect();
  var w=Math.max(1,Math.floor(r.width));
  var h=Math.max(1,Math.floor(r.height||240));
  var maxPixels=c.classList.contains('lab-fs-canvas')?900000:180000;
  if(labLowPower)maxPixels=Math.floor(maxPixels*0.58);
  var scale=w*h>maxPixels?Math.sqrt(maxPixels/(w*h)):1;
  c.width=Math.max(1,Math.floor(w*scale));
  c.height=Math.max(1,Math.floor(h*scale));
  c.dataset.renderScale=String(scale);
}

/* ── Perlin Noise ── */
var _n2_perm=new Uint8Array(512);
(function(){var p=new Uint8Array(256);for(var i=0;i<256;i++)p[i]=i;for(var i=255;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=p[i];p[i]=p[j];p[j]=t;}for(var i=0;i<512;i++)_n2_perm[i]=p[i&255];})();
function _n2_dot(g,x,y){return g[0]*x+g[1]*y;}
var _n2_grad=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
function noise2D(x,y){
  var X=Math.floor(x)&255,Y=Math.floor(y)&255;
  x-=Math.floor(x);y-=Math.floor(y);
  var u=x*x*x*(x*(x*6-15)+10),v=y*y*y*(y*(y*6-15)+10);
  var a=_n2_perm[X]+Y,b=_n2_perm[X+1]+Y;
  var g00=_n2_grad[_n2_perm[a]&7],g10=_n2_grad[_n2_perm[b]&7];
  var g01=_n2_grad[_n2_perm[a+1]&7],g11=_n2_grad[_n2_perm[b+1]&7];
  var n00=_n2_dot(g00,x,y),n10=_n2_dot(g10,x-1,y);
  var n01=_n2_dot(g01,x,y-1),n11=_n2_dot(g11,x-1,y-1);
  return n00+u*(n10-n00)+v*(n01-n00)+u*v*(n11-n10-n01+n00);
}

var exps={};

/* ═══ 1. Conway Life ═══ */
exps.life=(function(){
  var S=6,W,H,grid,next,ctx,alive=false,c,ages;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');
    W=Math.floor(c.width/S);H=Math.floor(c.height/S);
    grid=new Uint8Array(W*H);next=new Uint8Array(W*H);ages=new Uint16Array(W*H);
    c.onclick=function(e){var r=c.getBoundingClientRect(),gx=Math.floor((e.clientX-r.left)/S),gy=Math.floor((e.clientY-r.top)/S);
      if(gx>=0&&gx<W&&gy>=0&&gy<H){var cr=3;for(var dy=-cr;dy<=cr;dy++)for(var dx=-cr;dx<=cr;dx++){var nx=gx+dx,ny=gy+dy;if(nx>=0&&nx<W&&ny>=0&&ny<H&&Math.random()>.3){grid[ny*W+nx]=1;ages[ny*W+nx]=1;}}}};
    draw();
  }
  function step(){for(var y=0;y<H;y++)for(var x=0;x<W;x++){var n=0,i=y*W+x;
    for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){if(dx===0&&dy===0)continue;var nx=(x+dx+W)%W,ny=(y+dy+H)%H;if(grid[ny*W+nx])n++;}
    next[i]=grid[i]?(n===2||n===3)?1:0:n===3?1:0;
    if(next[i]&&grid[i])ages[i]=Math.min(ages[i]+1,60);else if(next[i])ages[i]=1;else ages[i]=0;
  }var t=grid;grid=next;next=t;}
  function draw(){ctx.fillStyle='#080c14';ctx.fillRect(0,0,c.width,c.height);
    // batch cells by age-color: 41 buckets (age 0..40)
    var buckets=[];for(var k=0;k<=40;k++)buckets[k]=[];
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){if(grid[y*W+x]){
      var a=Math.min(ages[y*W+x],40);buckets[a].push(x,y);}}
    for(var k=0;k<=40;k++){var cells=buckets[k];if(!cells.length)continue;
      var al=k/40,h2=200+al*80,l2=45+al*20;
      ctx.fillStyle='hsl('+h2+',80%,'+l2+'%)';
      for(var j=0;j<cells.length;j+=2){ctx.fillRect(cells[j]*S,cells[j+1]*S,S-1,S-1);}}}
  function tick(){if(!alive)return;step();draw();requestAnimationFrame(tick);}
  function preset(name){grid.fill(0);ages.fill(0);var cx=Math.floor(W/2),cy=Math.floor(H/2);
    if(name==='glider'){[[0,1],[1,2],[2,0],[2,1],[2,2]].forEach(function(p){var x=cx+p[1]-1,y=cy+p[0]-1;if(x>=0&&x<W&&y>=0&&y<H){grid[y*W+x]=1;ages[y*W+x]=1;}});}
    else if(name==='rpentomino'){[[0,1],[0,2],[1,0],[1,1],[2,1]].forEach(function(p){var x=cx+p[1]-1,y=cy+p[0]-1;if(x>=0&&x<W&&y>=0&&y<H){grid[y*W+x]=1;ages[y*W+x]=1;}});}
    else if(name==='gosper'){var pts=[[0,4],[0,5],[1,4],[1,5],[6,4],[6,5],[6,6],[7,3],[7,7],[8,2],[8,8],[9,2],[9,8],[10,5],[11,3],[11,7],[12,4],[12,5],[12,6],[13,5],[16,2],[16,3],[16,4],[17,2],[17,3],[17,4],[18,1],[18,5],[20,0],[20,1],[20,5],[20,6],[30,2],[30,3],[31,2],[31,3]];pts.forEach(function(p){var x=cx+p[1]-15,y=cy+p[0]-3;if(x>=0&&x<W&&y>=0&&y<H){grid[y*W+x]=1;ages[y*W+x]=1;}});}
    else{for(var i=0;i<W*H*0.15;i++){var idx=Math.floor(Math.random()*W*H);grid[idx]=1;ages[idx]=1;}}draw();}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){grid.fill(0);ages.fill(0);draw();alive=false;},preset:preset};
})();

/* ═══ 2. Lorenz Attractor ═══ */
exps.lorenz=(function(){
  var pts,x=1,y=1,z=1,dt=0.005,sigma=10,rho=28,beta=8/3,ctx,c,alive=false;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');pts=[];x=y=z=1;clear();draw();}
  function step(){for(var i=0;i<8;i++){var dx=sigma*(y-x),dy=x*(rho-z)-y,dz=x*y-beta*z;x+=dx*dt;y+=dy*dt;z+=dz*dt;
    var px=x*6+c.width/2,py=-z*6+c.height*2.4;pts.push({x:px,y:py,h:(z*3)%360});}if(pts.length>12000)pts=pts.slice(-8000);}
  function clear(){ctx.fillStyle='#080c14';ctx.fillRect(0,0,c.width,c.height);}
  function draw(){if(pts.length<2)return;
    for(var i=Math.max(1,pts.length-8000);i<pts.length;i++){var p=pts[i],prev=pts[i-1];if(!prev)continue;
      var a=(i-pts.length+8000)/8000;if(a<0)a=0;
      ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);
      ctx.strokeStyle='hsla('+p.h+',80%,65%,'+a*.7+')';ctx.lineWidth=1.2;ctx.stroke();}}
  function tick(){if(!alive)return;step();draw();requestAnimationFrame(tick);}
  function preset(name){pts=[];x=y=z=1;dt=0.005;sigma=10;rho=28;beta=8/3;
    if(name==='storm'){sigma=14;rho=40;beta=4;dt=0.003;}else if(name==='wing'){sigma=16;rho=35;beta=3;dt=0.004;}clear();}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){pts=[];x=y=z=1;clear();},preset:preset};
})();

/* ═══ 3. Double Pendulum ═══ */
exps.pendulum=(function(){
  var ctx,c,alive=false,th1,th2,w1,w2,L1=120,L2=100,m1=10,m2=10,g=9.81,trail=[];
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');th1=Math.PI*0.75;th2=Math.PI*0.5;w1=0;w2=0;trail=[];draw();}
  function step(){var d=th1-th2;
    var a1=(-g*(2*m1+m2)*Math.sin(th1)-m2*g*Math.sin(th1-2*d)-2*Math.sin(d)*m2*(w2*w2*L2+w1*w1*L1*Math.cos(d)))/(L1*(2*m1+m2-m2*Math.cos(2*d)));
    var a2=(2*Math.sin(d)*(w1*w1*L1*(m1+m2)+g*(m1+m2)*Math.cos(th1)+w2*w2*L2*m2*Math.cos(d)))/(L2*(2*m1+m2-m2*Math.cos(2*d)));
    w1+=a1*0.05;w2+=a2*0.05;th1+=w1*0.05;th2+=w2*0.05;
    var ox=c.width/2,oy=c.height*0.35;
    trail.push({x:ox+L2*Math.sin(th2)+L1*Math.sin(th1),y:oy+L2*Math.cos(th2)+L1*Math.cos(th1),h:(Date.now()*0.04)%360});
    if(trail.length>500)trail.shift();}
  function draw(){ctx.fillStyle='rgba(8,12,20,.12)';ctx.fillRect(0,0,c.width,c.height);
    var ox=c.width/2,oy=c.height*0.35;
    var x1=ox+L1*Math.sin(th1),y1=oy+L1*Math.cos(th1);
    var x2=x1+L2*Math.sin(th2),y2=y1+L2*Math.cos(th2);
    if(trail.length>1){
      // rainbow trail (only draw once)
      for(var i=Math.max(1,trail.length-200);i<trail.length;i++){
        var t=trail[i],tp=trail[i-1],al=(i-trail.length+200)/200;
        ctx.beginPath();ctx.moveTo(tp.x,tp.y);ctx.lineTo(t.x,t.y);
        ctx.strokeStyle='hsla('+t.h+',80%,65%,'+al*.6+')';ctx.lineWidth=1.5;ctx.stroke();
      }}
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);
    ctx.strokeStyle='#d8e2f0';ctx.lineWidth=2.5;ctx.stroke();
    [{x:ox,y:oy},{x:x1,y:y1},{x:x2,y:y2}].forEach(function(p,s){
      ctx.beginPath();ctx.arc(p.x,p.y,s===0?4:s===1?6:8,0,Math.PI*2);
      ctx.fillStyle=s===2?'#5b8def':'#d8e2f0';ctx.fill();});}
  function tick(){if(!alive)return;for(var i=0;i<3;i++)step();draw();requestAnimationFrame(tick);}
  function preset(name){th1=Math.PI*0.75;th2=Math.PI*0.5;w1=0;w2=0;trail=[];
    if(name==='gentle'){th1=0.5;th2=0.3;}else if(name==='spiral'){th1=Math.PI*0.9;th2=Math.PI*0.8;w1=0.5;}}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){th1=Math.PI*0.75;th2=Math.PI*0.5;w1=0;w2=0;trail=[];draw();},preset:preset};
})();

/* ═══ 4. Boids Flocking ═══ */
exps.boids=(function(){
  var c,ctx,alive=false,boids=[],sep=30,ali=50,coh=50;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');boids=[];
    for(var i=0;i<120;i++)boids.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4});draw();}
  function step(){for(var i=0;i<boids.length;i++){
    var b=boids[i],sx=0,sy=0,ax=0,ay=0,cx2=0,cy2=0,sn=0,an=0,cn=0;
    for(var j=0;j<boids.length;j++){if(i===j)continue;var o=boids[j];
      var dx=b.x-o.x,dy=b.y-o.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<sep){sx+=dx;sy+=dy;sn++;}if(d<ali){ax+=o.vx;ay+=o.vy;an++;}if(d<coh){cx2+=o.x;cy2+=o.y;cn++;}}
    if(sn){b.vx+=sx/sn*0.05;b.vy+=sy/sn*0.05;}if(an){b.vx+=(ax/an-b.vx)*0.05;b.vy+=(ay/an-b.vy)*0.05;}if(cn){b.vx+=(cx2/cn-b.x)*0.005;b.vy+=(cy2/cn-b.y)*0.005;}
    var sp=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(sp>4){b.vx=b.vx/sp*4;b.vy=b.vy/sp*4;}
    b.x+=b.vx;b.y+=b.vy;
    if(b.x<0)b.x+=c.width;if(b.x>c.width)b.x-=c.width;
    if(b.y<0)b.y+=c.height;if(b.y>c.height)b.y-=c.height;}}
  function draw(){ctx.fillStyle='rgba(8,12,20,.25)';ctx.fillRect(0,0,c.width,c.height);
    for(var i=0;i<boids.length;i++){var b=boids[i],a=Math.atan2(b.vy,b.vx);
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);
      ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-4,-3.5);ctx.lineTo(-4,3.5);ctx.closePath();
      ctx.fillStyle='hsla('+(200+i*1.2)+',75%,65%,.85)';ctx.fill();ctx.restore();}}
  function tick(){if(!alive)return;step();draw();requestAnimationFrame(tick);}
  function preset(name){sep=30;ali=50;coh=50;
    if(name==='school'){sep=20;ali=70;coh=80;}else if(name==='tornado'){sep=15;ali=30;coh=100;}else if(name==='calm'){sep=40;ali=60;coh=40;}}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){boids=[];for(var i=0;i<120;i++)boids.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4});draw();},preset:preset};
})();

/* ═══ 5. Mandelbrot ═══ */
exps.mandelbrot=(function(){
  var c,ctx,alive=false,cx=-0.5,cy=0,zoom=1.5,maxI=80,dirty=true;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');cx=-0.5;cy=0;zoom=1.5;dirty=true;
    c.onclick=function(e){var r=c.getBoundingClientRect();var mx=(e.clientX-r.left)/c.width-0.5,my=(e.clientY-r.top)/c.height-0.5;
      cx+=mx*zoom*2;cy+=my*zoom*2;zoom*=0.5;dirty=true;};
    c.onwheel=function(e){e.preventDefault();zoom*=e.deltaY>0?1.3:0.7;dirty=true;};
    draw();}
  function render(){var w=c.width,h=c.height,img=ctx.createImageData(w,h),d=img.data;
    for(var py=0;py<h;py++)for(var px=0;px<w;px++){
      var x0=cx+(px/w-0.5)*zoom*2,y0=cy+(py/h-0.5)*zoom*2,x=0,y=0,i=0;
      while(x*x+y*y<=4&&i<maxI){var t=x*x-y*y+y0;y=2*x*y+x0;x=t;i++;}
      var p=(py*w+px)*4;
      if(i===maxI){d[p]=8;d[p+1]=12;d[p+2]=20;}
      else{var t2=i/maxI,h2=(220+t2*140)%360,s=70+t2*30,l=20+t2*40;
        var a2=l<50?s*l/50/100:s*(100-l)/50/100,f=(l-a2*50)/50,r1,g1,b1;
        if(h2<60){r1=1;g1=h2/60;b1=0;}else if(h2<120){r1=1-(h2-60)/60;g1=1;b1=0;}
        else if(h2<180){r1=0;g1=1;b1=(h2-120)/60;}else if(h2<240){r1=0;g1=1-(h2-180)/60;b1=1;}
        else if(h2<300){r1=(h2-240)/60;g1=0;b1=1;}else{r1=1;g1=0;b1=1-(h2-300)/60;}
        d[p]=Math.floor((r1*a2+f)*255);d[p+1]=Math.floor((g1*a2+f)*255);d[p+2]=Math.floor((b1*a2+f)*255);}
      d[p+3]=255;}ctx.putImageData(img,0,0);}
  function draw(){if(dirty){render();dirty=false;}}
  function tick(){if(!alive)return;draw();requestAnimationFrame(tick);}
  function preset(name){cx=-0.5;cy=0;zoom=1.5;
    if(name==='seahorse'){cx=-0.7463;cy=0.1102;zoom=0.01;}else if(name==='spiral'){cx=-0.7489;cy=0.05;zoom=0.003;}else if(name==='center'){cx=-0.5;cy=0;zoom=1.5;}dirty=true;}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){cx=-0.5;cy=0;zoom=1.5;dirty=true;draw();},preset:preset};
})();

/* ═══ 6. Reaction-Diffusion ═══ */
exps.reaction=(function(){
  var c,ctx,alive=false,W,H,a,b,dA=1,dB=0.5,feed=0.055,kill=0.062,dt=1,scale=4;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');W=Math.floor(c.width/scale);H=Math.floor(c.height/scale);
    a=new Float32Array(W*H);b=new Float32Array(W*H);for(var i=0;i<W*H;i++){a[i]=1;b[i]=0;}seedSpots();draw();}
  function seedSpots(){for(var k=0;k<8;k++){var rx=Math.floor(Math.random()*W),ry=Math.floor(Math.random()*H),r=6;
    for(var y=-r;y<=r;y++)for(var x=-r;x<=r;x++){var px=(rx+x+W)%W,py=(ry+y+H)%H;if(x*x+y*y<r*r)b[py*W+px]=1;}}}
  function lap(arr,x,y){var i=y*W+x;return arr[((y-1+H)%H)*W+x]+arr[((y+1)%H)*W+x]+arr[y*W+(x-1+W)%W]+arr[y*W+(x+1)%W]-4*arr[i];}
  function step(){var na=new Float32Array(W*H),nb=new Float32Array(W*H);
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){var i=y*W+x,av=a[i],bv=b[i],abb=av*bv*bv;
      na[i]=Math.max(0,Math.min(1,av+(dA*lap(a,x,y)-abb+feed*(1-av))*dt));
      nb[i]=Math.max(0,Math.min(1,bv+(dB*lap(b,x,y)+abb-(kill+feed)*bv)*dt));}a=na;b=nb;}
  function draw(){var img=ctx.createImageData(W*scale,H*scale),d=img.data;
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){var v=Math.floor((a[y*W+x]-b[y*W+x])*255);if(v<0)v=0;if(v>255)v=255;
      var R=v*0.2|0,G=(v*0.4+30)|0,B=(v*0.8+50)|0;
      for(var dy=0;dy<scale;dy++)for(var dx=0;dx<scale;dx++){var p2=((y*scale+dy)*(W*scale)+(x*scale+dx))*4;d[p2]=R;d[p2+1]=G;d[p2+2]=B;d[p2+3]=255;}}
    ctx.putImageData(img,0,0);}
  function tick(){if(!alive)return;for(var i=0;i<2;i++)step();draw();requestAnimationFrame(tick);}
  function preset(name){feed=0.055;kill=0.062;
    if(name==='spots'){feed=0.035;kill=0.06;}else if(name==='stripes'){feed=0.04;kill=0.06;}else if(name==='maze'){feed=0.029;kill=0.057;}a.fill(1);b.fill(0);seedSpots();}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){a.fill(1);b.fill(0);draw();},preset:preset};
})();

/* ═══ 7. Symmetry Canvas ═══ */
exps.symmetry=(function(){
  var c,ctx,alive=false,folds=6,drawing=false,last=null;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');folds=6;c.style.cursor='crosshair';
    c.onmousedown=function(e){drawing=true;last=pos(e);};
    c.onmousemove=function(e){if(!drawing)return;var p=pos(e);drawSym(last,p);last=p;};
    c.onmouseup=function(){drawing=false;last=null;};c.onmouseleave=function(){drawing=false;last=null;};
    c.ontouchstart=function(e){e.preventDefault();drawing=true;last=posT(e);};
    c.ontouchmove=function(e){e.preventDefault();if(!drawing)return;var p=posT(e);drawSym(last,p);last=p;};
    c.ontouchend=function(){drawing=false;last=null;};clear();}
  function pos(e){var r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function posT(e){var r=c.getBoundingClientRect();var t=e.touches[0];return{x:t.clientX-r.left,y:t.clientY-r.top};}
  function drawSym(p1,p2){var cx2=c.width/2,cy=c.height/2;var hue=(Date.now()*0.05)%360;
    for(var i=0;i<folds;i++){var a=i*Math.PI*2/folds;
      ctx.save();ctx.translate(cx2,cy);ctx.rotate(a);
      ctx.beginPath();ctx.moveTo(p1.x-cx2,p1.y-cy);ctx.lineTo(p2.x-cx2,p2.y-cy);
      ctx.strokeStyle='hsla('+hue+',80%,65%,.7)';ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke();
      ctx.scale(1,-1);ctx.beginPath();ctx.moveTo(p1.x-cx2,p1.y-cy);ctx.lineTo(p2.x-cx2,p2.y-cy);ctx.stroke();ctx.restore();}}
  function clear(){ctx.fillStyle='#080c14';ctx.fillRect(0,0,c.width,c.height);
    var cx2=c.width/2,cy=c.height/2;for(var i=0;i<folds;i++){var a=i*Math.PI*2/folds;
      ctx.beginPath();ctx.moveTo(cx2,cy);ctx.lineTo(cx2+Math.cos(a)*999,cy+Math.sin(a)*999);
      ctx.strokeStyle='rgba(91,141,239,.06)';ctx.lineWidth=1;ctx.stroke();}}
  function tick(){}
  function preset(name){folds=6;if(name==='8fold')folds=8;else if(name==='12fold')folds=12;clear();}
  return{init:init,tick:function(){alive=true;},stop:function(){alive=false;},reset:function(){clear();},preset:preset};
})();

/* ═══ 8. Perlin Flow Field ═══ */
exps.flow=(function(){
  var c,ctx,alive=false,particles=[],scale=20,cols,rows,zoff=0,speed=1.5,turb=0.003;
  var particleCount=420;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');
    cols=Math.ceil(c.width/scale);rows=Math.ceil(c.height/scale);
    particles=[];for(var i=0;i<particleCount;i++)particles.push({x:Math.random()*c.width,y:Math.random()*c.height});zoff=0;clear();draw();}
  function step(){zoff+=turb;for(var i=0;i<particles.length;i++){var p=particles[i];
    var col=Math.floor(p.x/scale),row=Math.floor(p.y/scale);
    if(col<0||col>=cols||row<0||row>=rows){p.x=Math.random()*c.width;p.y=Math.random()*c.height;continue;}
    var angle=noise2D(col*0.1,row*0.1+zoff)*Math.PI*4;
    p.x+=Math.cos(angle)*speed;p.y+=Math.sin(angle)*speed;
    if(p.x<0||p.x>c.width||p.y<0||p.y>c.height){p.x=Math.random()*c.width;p.y=Math.random()*c.height;}}}
  function clear(){ctx.fillStyle='rgba(8,12,20,.15)';ctx.fillRect(0,0,c.width,c.height);}
  function draw(){clear();for(var i=0;i<particles.length;i++){var p=particles[i];
    var hue=(noise2D(p.x*0.005,p.y*0.005)*360+200)%360;
    ctx.beginPath();ctx.arc(p.x,p.y,1.6,0,Math.PI*2);
    ctx.fillStyle='hsla('+hue+',70%,65%,.75)';ctx.fill();}}
  function tick(){if(!alive)return;step();draw();requestAnimationFrame(tick);}
  function preset(name){speed=1.5;turb=0.003;
    if(name==='river'){speed=2.5;turb=0.002;}else if(name==='storm'){speed=3.5;turb=0.008;}
    particles=[];for(var i=0;i<particleCount;i++)particles.push({x:Math.random()*c.width,y:Math.random()*c.height});
    clear();}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){clear();for(var i=0;i<particles.length;i++){particles[i].x=Math.random()*c.width;particles[i].y=Math.random()*c.height;}},preset:preset};
})();

/* ═══ 9. 3D Particle Sphere ═══ */
exps.sphere3d=(function(){
  var c,ctx,alive=false,pts=[],N=900,R=0,angX=0,angY=0,mouseX=0,mouseY=0,dragging=false,mode='globe';
  var lastMX=0,lastMY=0;

  function sphPt(){var a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);return{x:R*Math.sin(b)*Math.cos(a),y:R*Math.sin(b)*Math.sin(a),z:R*Math.cos(b),ox:0,oy:0,oz:0};}
  function helixPt(i){var t=i/N*6*Math.PI,r=R*0.6;return{x:r*Math.cos(t),y:(i/N-0.5)*R*2,z:r*Math.sin(t),ox:0,oy:0,oz:0};}

  function init(cv){
    c=cv;fitCanvas(c);ctx=c.getContext('2d');R=Math.min(c.width,c.height)*0.36;
    pts=[];angX=0.3;angY=0;mode='globe';
    for(var i=0;i<N;i++){var p=sphPt();p.ox=p.x;p.oy=p.y;p.oz=p.z;pts.push(p);}
    c.onmousedown=function(e){dragging=true;lastMX=e.clientX;lastMY=e.clientY;};
    c.onmousemove=function(e){if(dragging){angY+=(e.clientX-lastMX)*0.008;angX+=(e.clientY-lastMY)*0.008;lastMX=e.clientX;lastMY=e.clientY;}mouseX=e.clientX;mouseY=e.clientY;};
    c.onmouseup=function(){dragging=false;};
    c.onmouseleave=function(){dragging=false;};
    step();
  }

  function rotateX(p,a){var c2=Math.cos(a),s=Math.sin(a);var y=p.y*c2-p.z*s,z=p.y*s+p.z*c2;p.y=y;p.z=z;}
  function rotateY(p,a){var c2=Math.cos(a),s=Math.sin(a);var x=p.x*c2+p.z*s,z=-p.x*s+p.z*c2;p.x=x;p.z=z;}

  function step(){
    if(!dragging){angY+=0.008;}
    for(var i=0;i<pts.length;i++){
      var p=pts[i];
      // smooth interpolation toward target
      var tx=p.ox,ty=p.oy,tz=p.oz;
      if(mode==='explode'){tx=p.ox*2.5;ty=p.oy*2.5;tz=p.oz*2.5;}
      p.x+=(tx-p.x)*0.06;p.y+=(ty-p.y)*0.06;p.z+=(tz-p.z)*0.06;
      rotateX(p,angX);rotateY(p,angY);
    }
    // depth bucket sort (16 buckets, much faster than Array.sort on 1600 items)
    var cx=c.width/2,cy=c.height/2;
    ctx.fillStyle='rgba(8,12,20,.3)';ctx.fillRect(0,0,c.width,c.height);
    var buckets=[];for(var b=0;b<16;b++)buckets[b]=[];
    for(var i=0;i<pts.length;i++){
      var bi=Math.floor((pts[i].z+R)/(R*2)*15.99);
      if(bi<0)bi=0;if(bi>15)bi=15;
      buckets[bi].push(pts[i]);
    }
    // draw connecting lines for nearby particles
    ctx.lineWidth=0.3;
    for(var bi=0;bi<16;bi++){var bucket=buckets[bi];
    for(var i=0;i<bucket.length;i++){
      var p=bucket[i];
      for(var j=i+1;j<Math.min(i+6,bucket.length);j++){
        var q=bucket[j];
        var dx=p.x-q.x,dy=p.y-q.y,dz=p.z-q.z;
        if(dx*dx+dy*dy+dz*dz<(R*0.35)*(R*0.35)){
          var al=Math.max(0,0.12-(p.z+R)/(R*2)*0.1);
          ctx.beginPath();ctx.moveTo(cx+p.x,cy+p.y);ctx.lineTo(cx+q.x,cy+q.y);
          ctx.strokeStyle='rgba(99,102,241,'+al+')';ctx.stroke();
        }
      }
    }
    // draw particles in this depth bucket
    for(var i=0;i<bucket.length;i++){
      var p=bucket[i];
      var depth=(p.z+R)/(R*2); // 0=far, 1=near
      var sz=1+depth*3;
      var al=0.2+depth*0.8;
      var h=220+depth*60;
      ctx.beginPath();ctx.arc(cx+p.x,cy+p.y,sz,0,Math.PI*2);
      ctx.fillStyle='hsla('+h+',75%,'+(40+depth*25)+'%,'+al+')';ctx.fill();
    }}
  }

  function tick(){if(!alive)return;step();requestAnimationFrame(tick);}

  function preset(name){
    mode=name||'globe';
    R=Math.min(c.width,c.height)*0.36;
    if(name==='dna'){
      for(var i=0;i<N;i++){var p=helixPt(i);pts[i].ox=p.x;pts[i].oy=p.y;pts[i].oz=p.z;}
    }else if(name==='explode'){
      for(var i=0;i<pts.length;i++){var p=sphPt();pts[i].ox=p.x;pts[i].oy=p.y;pts[i].oz=p.z;}
    }else{
      for(var i=0;i<pts.length;i++){var p=sphPt();pts[i].ox=p.x;pts[i].oy=p.y;pts[i].oz=p.z;}
    }
  }

  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){
    R=Math.min(c.width,c.height)*0.36;mode='globe';angX=0.3;angY=0;
    for(var i=0;i<pts.length;i++){var p=sphPt();pts[i].ox=p.x;pts[i].oy=p.y;pts[i].oz=p.z;pts[i].x=p.x;pts[i].y=p.y;pts[i].z=p.z;}
    step();
  },preset:preset};
})();

/* ═══ 10. Audio Visualization ═══ */
exps.audio=(function(){
  var c,ctx,alive=false,mode='bars',audioCtx,analyser,freqData,timeData,source,demoOsc,demoGain;
  var started=false,demoInterval=null,demoOscs=[];

  function init(cv){
    c=cv;fitCanvas(c);ctx=c.getContext('2d');mode='bars';started=false;
    drawIdle();
  }

  function drawIdle(){
    ctx.fillStyle='#080c14';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='rgba(255,255,255,.15)';ctx.font='13px sans-serif';ctx.textAlign='center';
    ctx.fillText('点击 ▶ 开始 · 需要麦克风权限',c.width/2,c.height/2);
  }

  function startAudio(){
    if(started)return;started=true;
    try{
      audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      analyser=audioCtx.createAnalyser();analyser.fftSize=256;
      freqData=new Uint8Array(analyser.frequencyBinCount);
      timeData=new Uint8Array(analyser.frequencyBinCount);
      // Try microphone first
      if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
          source=audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
        }).catch(function(){startDemo();});
      }else{startDemo();}
    }catch(e){startDemo();}
  }

  function startDemo(){
    // Fallback: generate demo audio with oscillators
    demoOsc=audioCtx.createOscillator();demoOsc.type='sine';demoOsc.frequency.value=220;
    var osc2=audioCtx.createOscillator();osc2.type='sawtooth';osc2.frequency.value=110;
    var osc3=audioCtx.createOscillator();osc3.type='triangle';osc3.frequency.value=330;
    demoOscs=[demoOsc,osc2,osc3];
    demoGain=audioCtx.createGain();demoGain.gain.value=0.08;
    var merger=audioCtx.createChannelMerger(2);
    demoOsc.connect(merger,0,0);osc2.connect(merger,0,1);osc3.connect(demoGain);
    demoGain.connect(analyser);merger.connect(analyser);
    demoOsc.start();osc2.start();osc3.start();
    // Modulate frequencies
    var t=audioCtx.currentTime;
    demoOsc.frequency.setValueAtTime(220,t);
    demoOsc.frequency.linearRampToValueAtTime(440,t+2);
    demoOsc.frequency.linearRampToValueAtTime(330,t+4);
    osc2.frequency.setValueAtTime(110,t);
    osc2.frequency.linearRampToValueAtTime(220,t+3);
    // Loop modulation — track interval for cleanup
    demoInterval=setInterval(function(){
      if(!audioCtx||audioCtx.state==='closed')return;
      var now=audioCtx.currentTime;
      demoOsc.frequency.setTargetAtTime(200+Math.random()*300,now,0.5);
      osc2.frequency.setTargetAtTime(100+Math.random()*200,now,0.8);
      osc3.frequency.setTargetAtTime(250+Math.random()*400,now,0.3);
    },2000);
  }

  function drawBars(){
    analyser.getByteFrequencyData(freqData);
    var w=c.width,h=c.height,n=freqData.length,barW=w/n*2;
    ctx.fillStyle='rgba(8,12,20,.25)';ctx.fillRect(0,0,w,h);
    for(var i=0;i<n;i++){
      var v=freqData[i]/255,bh=v*h*0.85;
      var h2=(i/n)*240+200;
      var g=ctx.createLinearGradient(0,h-bh,0,h);
      g.addColorStop(0,'hsla('+h2+',80%,65%,.9)');
      g.addColorStop(1,'hsla('+h2+',80%,40%,.4)');
      ctx.fillStyle=g;
      ctx.fillRect(i*barW,h-bh,barW-1,bh);
    }
  }

  function drawWave(){
    analyser.getByteTimeDomainData(timeData);
    var w=c.width,h=c.height,n=timeData.length;
    ctx.fillStyle='rgba(8,12,20,.2)';ctx.fillRect(0,0,w,h);
    ctx.beginPath();
    for(var i=0;i<n;i++){
      var x=i/n*w,y=(timeData[i]/255)*h;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.strokeStyle='rgba(91,141,239,.8)';ctx.lineWidth=2;ctx.stroke();
    // glow
    ctx.strokeStyle='rgba(91,141,239,.2)';ctx.lineWidth=6;ctx.stroke();
  }

  function drawCircular(){
    analyser.getByteFrequencyData(freqData);
    var w=c.width,h=c.height,cx=w/2,cy=h/2,n=freqData.length;
    ctx.fillStyle='rgba(8,12,20,.2)';ctx.fillRect(0,0,w,h);
    var baseR=Math.min(w,h)*0.22;
    for(var i=0;i<n;i++){
      var v=freqData[i]/255;
      var a=i/n*Math.PI*2-Math.PI/2;
      var r1=baseR,r2=baseR+v*baseR*1.5;
      ctx.beginPath();
      ctx.moveTo(cx+r1*Math.cos(a),cy+r1*Math.sin(a));
      ctx.lineTo(cx+r2*Math.cos(a),cy+r2*Math.sin(a));
      var h2=(i/n)*240+200;
      ctx.strokeStyle='hsla('+h2+',80%,65%,'+(0.4+v*0.6)+')';
      ctx.lineWidth=Math.max(1,(w/n*2)*0.6);ctx.stroke();
    }
    // center circle
    ctx.beginPath();ctx.arc(cx,cy,baseR,0,Math.PI*2);
    ctx.strokeStyle='rgba(99,102,241,.2)';ctx.lineWidth=1;ctx.stroke();
  }

  function step(){
    if(!analyser)return;
    if(mode==='bars')drawBars();
    else if(mode==='wave')drawWave();
    else drawCircular();
  }

  function tick(){if(!alive)return;if(!started)startAudio();step();requestAnimationFrame(tick);}

  function preset(name){mode=name||'bars';}

  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){
    if(demoInterval){clearInterval(demoInterval);demoInterval=null;}
    demoOscs.forEach(function(o){try{o.stop();}catch(e){}});demoOscs=[];
    if(demoOsc){try{demoOsc.stop();}catch(e){}demoOsc=null;}
    if(source&&source.mediaStream){source.mediaStream.getTracks().forEach(function(t){t.stop();});}
    if(audioCtx){try{audioCtx.close();}catch(e){}}
    audioCtx=null;analyser=null;source=null;started=false;drawIdle();
  },preset:preset};
})();

/* ═══ 11. Ray Tracer ═══ */
exps.raytrace=(function(){
  var c,ctx,alive=false,W,H,imgData,row=0,scene,eye,ambient=0.08;
  var offCanvas,offCtx,totalRows=0; // cached offscreen canvas

  // tiny vec3 helpers
  function v3(x,y,z){return{x:x,y:y,z:z};}
  function v3add(a,b){return{x:a.x+b.x,y:a.y+b.y,z:a.z+b.z};}
  function v3sub(a,b){return{x:a.x-b.x,y:a.y-b.y,z:a.z-b.z};}
  function v3mul(a,s){return{x:a.x*s,y:a.y*s,z:a.z*s};}
  function v3dot(a,b){return a.x*b.x+a.y*b.y+a.z*b.z;}
  function v3norm(a){var l=Math.sqrt(v3dot(a,a))||1;return{x:a.x/l,y:a.y/l,z:a.z/l};}
  function v3reflect(d,n){return v3sub(d,v3mul(n,2*v3dot(d,n)));}

  function makeScene(preset){
    var spheres=[
      {c:v3(-1.2,0,-4),r:1,clr:v3(.9,.2,.2),spec:80,refl:0.3,refr:0},
      {c:v3(1.2,0,-4),r:1,clr:v3(.2,.5,.9),spec:120,refl:0.4,refr:0},
      {c:v3(0,-5001,-4),r:5000,clr:v3(.6,.6,.6),spec:10,refl:0.1,refr:0}
    ];
    if(preset==='mirror'){
      spheres[0].refl=0.85;spheres[1].refl=0.85;spheres[0].spec=200;spheres[1].spec=200;
    }else if(preset==='glass'){
      spheres[0].refl=0.5;spheres[0].refr=0.8;spheres[0].clr=v3(.95,.95,.95);
      spheres[1].refl=0.3;spheres[1].refr=0.6;spheres[1].clr=v3(.8,.9,1);
      spheres.push({c:v3(0,1.5,-3),r:0.6,clr:v3(.2,.9,.3),spec:100,refl:0.2,refr:0});
    }
    return{spheres:spheres,lights:[v3(-5,5,-2),v3(3,6,-1)]};
  }

  function trace(ori,dir,depth){
    if(depth>3)return v3(0,0,0);
    var tMin=1e9,hitObj=null;
    for(var i=0;i<scene.spheres.length;i++){
      var s=scene.spheres[i];
      var oc=v3sub(ori,s.c);
      var a=v3dot(dir,dir);
      var b=2*v3dot(oc,dir);
      var cc=v3dot(oc,oc)-s.r*s.r;
      var disc=b*b-4*a*cc;
      if(disc<0)continue;
      var t=(-b-Math.sqrt(disc))/(2*a);
      if(t>0.001&&t<tMin){tMin=t;hitObj=s;}
    }
    if(!hitObj)return v3(0,0,0);
    var P=v3add(ori,v3mul(dir,tMin));
    var N=v3norm(v3sub(P,hitObj.c));
    var col=v3(ambient,ambient,ambient);
    // lighting
    for(var l=0;l<scene.lights.length;l++){
      var L=v3norm(v3sub(scene.lights[l],P));
      // shadow
      var inShadow=false;
      for(var i=0;i<scene.spheres.length;i++){
        var ss=scene.spheres[i];if(ss===hitObj)continue;
        var oc2=v3sub(P,ss.c);var b2=2*v3dot(oc2,L);var c2=v3dot(oc2,oc2)-ss.r*ss.r;
        var d2=b2*b2-4*c2;if(d2>0){var tt=(-b2-Math.sqrt(d2))/2;if(tt>0.001){inShadow=true;break;}}
      }
      if(inShadow)continue;
      var diff=Math.max(0,v3dot(N,L));
      col=v3add(col,v3mul(hitObj.clr,diff*0.8));
      // specular
      if(hitObj.spec>0){
        var R2=v3reflect(v3mul(L,-1),N);
        var spec=Math.pow(Math.max(0,-v3dot(R2,dir)),hitObj.spec);
        col=v3add(col,v3(spec,spec,spec));
      }
    }
    // reflection
    if(hitObj.refl>0.01){
      var reflDir=v3reflect(dir,N);
      var reflCol=trace(v3add(P,v3mul(N,0.001)),reflDir,depth+1);
      col=v3add(v3mul(col,1-hitObj.refl),v3mul(reflCol,hitObj.refl));
    }
    // refraction (simplified)
    if(hitObj.refr>0.01){
      var refrDir=v3norm(v3add(v3mul(dir,0.8),v3mul(N,-0.3)));
      var refrCol=trace(v3add(P,v3mul(N,-0.001)),refrDir,depth+1);
      col=v3add(v3mul(col,1-hitObj.refr*0.5),v3mul(refrCol,hitObj.refr*0.5));
    }
    return col;
  }

  function init(cv){
    c=cv;fitCanvas(c);ctx=c.getContext('2d');
    // render at lower resolution for performance
    W=Math.floor(c.width/3);H=Math.floor(c.height/3);
    if(W<60)W=60;if(H<40)H=40;
    imgData=ctx.createImageData(W,H);
    // cache offscreen canvas (reused every frame)
    offCanvas=document.createElement('canvas');offCanvas.width=W;offCanvas.height=H;
    offCtx=offCanvas.getContext('2d');
    scene=makeScene('classic');eye=v3(0,0,0);row=0;totalRows=0;
    ctx.fillStyle='#080c14';ctx.fillRect(0,0,c.width,c.height);
  }

  function step(){
    if(!imgData)return;
    var d=imgData.data;
    var rowsPerFrame=Math.max(2,Math.floor(H/30));
    for(var r=0;r<rowsPerFrame;r++){
      var y=(row+r)%H;
      for(var x=0;x<W;x++){
        var px=(x/W-0.5)*2;
        var py=-(y/H-0.5)*2*(H/W);
        var dir=v3norm(v3(px,py,-1.5));
        var col=trace(eye,dir,0);
        var idx=(y*W+x)*4;
        d[idx]=Math.min(255,Math.floor(col.x*255));
        d[idx+1]=Math.min(255,Math.floor(col.y*255));
        d[idx+2]=Math.min(255,Math.floor(col.z*255));
        d[idx+3]=255;
      }
    }
    row=(row+rowsPerFrame)%H;
    totalRows+=rowsPerFrame;
    // render to cached offscreen canvas then scale up
    offCtx.putImageData(imgData,0,0);
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(offCanvas,0,0,c.width,c.height);
    // progress overlay (fades out after first full pass)
    if(totalRows<H*2){
      var pct=Math.min(100,Math.floor(totalRows/H*100));
      var al=Math.max(0,1-totalRows/(H*2));
      ctx.fillStyle='rgba(8,12,20,'+(al*0.6)+')';
      ctx.fillRect(c.width/2-60,c.height/2-18,120,36);
      ctx.fillStyle='rgba(255,255,255,'+al+')';
      ctx.font='13px sans-serif';ctx.textAlign='center';
      ctx.fillText('渲染中 '+pct+'%',c.width/2,c.height/2+5);
    }
  }

  function tick(){if(!alive)return;step();requestAnimationFrame(tick);}

  function preset(name){
    scene=makeScene(name||'classic');
    row=0;totalRows=0;
    if(imgData){var d=imgData.data;for(var i=0;i<d.length;i+=4){d[i]=8;d[i+1]=12;d[i+2]=20;d[i+3]=255;}}
  }

  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){
    scene=makeScene('classic');row=0;totalRows=0;
    if(imgData){var d=imgData.data;for(var i=0;i<d.length;i+=4){d[i]=8;d[i+1]=12;d[i+2]=20;d[i+3]=255;}}
    ctx.fillStyle='#080c14';ctx.fillRect(0,0,c.width,c.height);
  },preset:preset};
})();

/* ═══ 12. Pixel Sand Box ═══ */
exps.sandbox=(function(){
  var c,ctx,alive=false,W,H,S=4,cells,next,brush='sand',drawing=false;
  var palette={sand:[230,181,80],water:[66,153,225],wall:[148,163,184],plant:[52,211,153]};
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');S=labLowPower?5:4;W=Math.floor(c.width/S);H=Math.floor(c.height/S);
    cells=new Uint8Array(W*H);next=new Uint8Array(W*H);bind();seed();draw();}
  function bind(){
    c.style.cursor='crosshair';
    c.onmousedown=function(e){drawing=true;paint(e);};
    c.onmousemove=function(e){if(drawing)paint(e);};
    c.onmouseup=function(){drawing=false;};
    c.onmouseleave=function(){drawing=false;};
    c.ontouchstart=function(e){e.preventDefault();drawing=true;paint(e.touches[0]);};
    c.ontouchmove=function(e){e.preventDefault();if(drawing)paint(e.touches[0]);};
    c.ontouchend=function(){drawing=false;};
  }
  function idx(x,y){return y*W+x;}
  function set(x,y,v){if(x>=0&&x<W&&y>=0&&y<H)cells[idx(x,y)]=v;}
  function paint(e){var r=c.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*W),y=Math.floor((e.clientY-r.top)/r.height*H),v=brush==='water'?2:brush==='wall'?3:brush==='plant'?4:1,rad=brush==='wall'?2:4;
    for(var yy=-rad;yy<=rad;yy++)for(var xx=-rad;xx<=rad;xx++){if(xx*xx+yy*yy<=rad*rad&&Math.random()>.25)set(x+xx,y+yy,v);}}
  function seed(){cells.fill(0);for(var x=0;x<W;x++){set(x,H-1,3);if(x%6<3)set(x,H-2,3);}for(var i=0;i<W*H*0.045;i++)set((Math.random()*W)|0,(Math.random()*H*.35)|0,1);}
  function fall(i,ni){next[ni]=cells[i];next[i]=0;}
  function step(){next.set(cells);for(var y=H-2;y>=0;y--)for(var x=0;x<W;x++){var i=idx(x,y),v=cells[i];if(!v||v===3)continue;
      var down=idx(x,y+1),dir=Math.random()<.5?-1:1,dx=x+dir,dx2=x-dir;
      if(v===1){if(!cells[down])fall(i,down);else if(dx>=0&&dx<W&&!cells[idx(dx,y+1)])fall(i,idx(dx,y+1));else if(dx2>=0&&dx2<W&&!cells[idx(dx2,y+1)])fall(i,idx(dx2,y+1));}
      else if(v===2){if(!cells[down])fall(i,down);else if(dx>=0&&dx<W&&!cells[idx(dx,y)])fall(i,idx(dx,y));else if(dx2>=0&&dx2<W&&!cells[idx(dx2,y)])fall(i,idx(dx2,y));}
      else if(v===4){if(Math.random()<.012&&y>1&&!cells[idx(x,y-1)])next[idx(x,y-1)]=4;}
    }var t=cells;cells=next;next=t;}
  function draw(){ctx.fillStyle='#050914';ctx.fillRect(0,0,c.width,c.height);
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){var v=cells[idx(x,y)];if(!v)continue;var p=v===1?palette.sand:v===2?palette.water:v===3?palette.wall:palette.plant;
      ctx.fillStyle='rgb('+p[0]+','+p[1]+','+p[2]+')';ctx.fillRect(x*S,y*S,S,S);}}
  function tick(){if(!alive)return;for(var i=0;i<(labLowPower?1:2);i++)step();draw();requestAnimationFrame(tick);}
  function preset(name){brush=name||'sand';}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){seed();draw();},preset:preset};
})();

/* ═══ 13. Particle Text ═══ */
exps.textstorm=(function(){
  var c,ctx,alive=false,particles=[],targets=[],phrase='BLOG',tickN=0;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');build(phrase);draw();}
  function build(text){phrase=text||'BLOG';targets=[];particles=[];var off=document.createElement('canvas'),ow=Math.min(520,c.width),oh=Math.min(180,c.height);off.width=ow;off.height=oh;var o=off.getContext('2d');
    o.fillStyle='#000';o.fillRect(0,0,ow,oh);o.fillStyle='#fff';o.textAlign='center';o.textBaseline='middle';o.font='800 '+Math.floor(ow/(phrase.length*.72+1))+'px sans-serif';o.fillText(phrase,ow/2,oh/2);
    var d=o.getImageData(0,0,ow,oh).data,step=labLowPower?8:6,ox=(c.width-ow)/2,oy=(c.height-oh)/2;
    for(var y=0;y<oh;y+=step)for(var x=0;x<ow;x+=step){if(d[(y*ow+x)*4]>80)targets.push({x:ox+x,y:oy+y});}
    var cap=labLowPower?520:900;if(targets.length>cap)targets=targets.filter(function(_,i){return i%Math.ceil(targets.length/cap)===0;});
    for(var i=0;i<targets.length;i++)particles.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:0,vy:0,tx:targets[i].x,ty:targets[i].y,h:(190+i*.5)%360});}
  function step(){tickN++;for(var i=0;i<particles.length;i++){var p=particles[i],dx=p.tx-p.x,dy=p.ty-p.y;p.vx=(p.vx+dx*.018)*.82;p.vy=(p.vy+dy*.018)*.82;p.x+=p.vx+Math.sin((tickN+i)*.025)*.12;p.y+=p.vy;}}
  function draw(){ctx.fillStyle='rgba(5,9,20,.28)';ctx.fillRect(0,0,c.width,c.height);for(var i=0;i<particles.length;i++){var p=particles[i];ctx.beginPath();ctx.arc(p.x,p.y,1.7,0,Math.PI*2);ctx.fillStyle='hsla('+p.h+',78%,64%,.88)';ctx.fill();}}
  function tick(){if(!alive)return;step();draw();requestAnimationFrame(tick);}
  function preset(name){build(name==='hexo'?'HEXO':name==='dream'?'DREAM':'BLOG');}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){build(phrase);draw();},preset:preset};
})();

/* ═══ 14. Poster Texture Generator ═══ */
exps.poster=(function(){
  var c,ctx,alive=false,mode='waves',frame=0,seeds=[];
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');resetSeeds();render();}
  function resetSeeds(){seeds=[];for(var i=0;i<24;i++)seeds.push({x:Math.random(),y:Math.random(),r:.08+Math.random()*.22,h:170+Math.random()*130});}
  function render(){var w=c.width,h=c.height;ctx.fillStyle='#06101a';ctx.fillRect(0,0,w,h);
    if(mode==='glass'){for(var i=0;i<seeds.length;i++){var s=seeds[i],g=ctx.createRadialGradient(s.x*w,s.y*h,0,s.x*w,s.y*h,s.r*w);g.addColorStop(0,'hsla('+s.h+',70%,62%,.32)');g.addColorStop(1,'hsla('+s.h+',70%,30%,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}}
    else{ctx.lineWidth=1.2;for(var y=0;y<h;y+=8){ctx.beginPath();for(var x=0;x<=w;x+=10){var n=noise2D(x*.008+frame*.01,y*.018+(mode==='topo'?0:frame*.006));var yy=y+n*(mode==='topo'?24:12);x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);}ctx.strokeStyle='hsla('+(190+y/h*80)+',70%,62%,.28)';ctx.stroke();}}
    for(var k=0;k<70;k++){var x2=(Math.sin(k*97.13+frame*.01)*.5+.5)*w,y2=(Math.sin(k*41.7)*.5+.5)*h;ctx.fillStyle='rgba(255,255,255,.035)';ctx.fillRect(x2,y2,1,1);}
  }
  function tick(){if(!alive)return;frame++;if(frame%2===0)render();requestAnimationFrame(tick);}
  function preset(name){mode=name||'waves';resetSeeds();render();}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){frame=0;resetSeeds();render();},preset:preset};
})();

/* ── Lab UI ── */
function applyLabFilters(page){
  var cards=page.querySelectorAll('.lab-card');
  var search=page.querySelector('#labSearch');
  var count=page.querySelector('#labCount');
  var empty=page.querySelector('#labEmpty');
  var clear=page.querySelector('#labClear');
  var cat=page.dataset.labCat||'all';
  var query=(search&&search.value?search.value:'').trim().toLowerCase();
  var visible=0;
  cards.forEach(function(card){
    var hay=(card.dataset.search||card.textContent||'').toLowerCase();
    var catOk=cat==='all'||card.dataset.cat===cat;
    var searchOk=!query||hay.indexOf(query)>-1;
    var show=catOk&&searchOk;
    card.hidden=!show;
    if(!show&&labActiveRunner&&labActiveRunner.card===card){
      labActiveRunner.stop();
    }
    if(show)visible++;
  });
  if(count)count.textContent='显示 '+visible+' / '+cards.length+' 个实验';
  if(empty)empty.classList.toggle('show',visible===0);
  if(clear)clear.classList.toggle('show',!!query);
}

function initFilters(page){
  if(page.dataset.labFiltersReady)return;
  page.dataset.labFiltersReady='true';
  page.dataset.labCat='all';
  var chips=page.querySelectorAll('.lab-chip');
  var search=page.querySelector('#labSearch');
  var clear=page.querySelector('#labClear');
  chips.forEach(function(chip){chip.addEventListener('click',function(){
    chips.forEach(function(c){c.classList.remove('active');});
    chip.classList.add('active');
    page.dataset.labCat=chip.dataset.cat||'all';
    applyLabFilters(page);
  });});
  if(search){search.addEventListener('input',function(){applyLabFilters(page);});}
  if(clear){clear.addEventListener('click',function(){if(search){search.value='';search.focus();}applyLabFilters(page);});}
  applyLabFilters(page);
}

/* ── Fullscreen Manager ── */
var fsOverlay=null;
var fsState={active:false,expName:null,card:null,running:false,origCanvas:null,exp:null};
var labActiveRunner=null;

function drawPlaceholder(canvas,card){
  fitCanvas(canvas);
  canvas.onmousedown=null;canvas.onmousemove=null;canvas.onmouseup=null;canvas.onmouseleave=null;
  canvas.onclick=null;canvas.onwheel=null;canvas.ontouchstart=null;canvas.ontouchmove=null;canvas.ontouchend=null;
  canvas.style.cursor='';
  var ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  ctx.fillStyle='#050914';ctx.fillRect(0,0,w,h);
  var title=(card&&card.dataset.title)||'Experiment';
  var cat=(card&&card.dataset.catName)||'Creative Lab';
  for(var i=0;i<18;i++){
    var x=(Math.sin(i*47.7)*0.5+0.5)*w;
    var y=(Math.sin(i*21.3)*0.5+0.5)*h;
    var r=Math.max(w,h)*(0.08+(i%5)*0.018);
    var g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,'hsla('+(185+i*12)+',70%,58%,.14)');
    g.addColorStop(1,'hsla('+(185+i*12)+',70%,30%,0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  }
  ctx.fillStyle='rgba(229,237,247,.86)';
  ctx.font='700 15px sans-serif';ctx.textAlign='center';
  ctx.fillText(title,w/2,h/2-8);
  ctx.fillStyle='rgba(142,160,184,.78)';
  ctx.font='12px sans-serif';
  ctx.fillText(cat+' · 点击播放启动',w/2,h/2+16);
}

function ensureCardReady(card){
  var canvas=card.querySelector('.lab-canvas');
  var expName=canvas&&canvas.dataset.exp;
  var exp=exps[expName];
  if(!canvas||!exp)return null;
  if(card.dataset.labInited!=='true'){
    exp.init(canvas);
    card.dataset.labInited='true';
  }
  return exp;
}

function stopActiveRunner(except){
  if(labActiveRunner&&labActiveRunner!==except){
    labActiveRunner.stop();
  }
}

function enterFullscreen(card){
  fsOverlay=document.getElementById('labFullscreen');
  if(!fsOverlay)return;
  var canvas=card.querySelector('.lab-canvas');
  var expName=canvas.dataset.exp;
  var exp=exps[expName];
  if(!exp)return;
  ensureCardReady(card);

  var cardPlayBtn=card.querySelector('[data-action="play"]');
  if(cardPlayBtn&&cardPlayBtn.classList.contains('active')){
    cardPlayBtn.click();
  }

  var icon=card.querySelector('.lab-icon').textContent;
  var title=card.querySelector('.lab-meta h3').textContent;
  fsOverlay.querySelector('.lab-fs-icon').textContent=icon;
  fsOverlay.querySelector('.lab-fs-title').textContent=title;

  var fsCtrl=fsOverlay.querySelector('.lab-fs-ctrl');
  fsCtrl.innerHTML='';
  var origCtrl=card.querySelector('.lab-ctrl');
  origCtrl.querySelectorAll('.lab-btn').forEach(function(btn){fsCtrl.appendChild(btn.cloneNode(true));});

  var fsCanvas=fsOverlay.querySelector('.lab-fs-canvas');
  exp.init(fsCanvas);

  var fsRunning=false;
  var fsPlayBtn=fsCtrl.querySelector('[data-action="play"]');
  if(fsPlayBtn){
    fsPlayBtn.addEventListener('click',function(){
      if(fsRunning){exp.stop();fsPlayBtn.textContent='▶';fsPlayBtn.classList.remove('active');fsRunning=false;}
      else{exp.tick();fsPlayBtn.textContent='⏸';fsPlayBtn.classList.add('active');fsRunning=true;}
    });
  }
  var resetBtn=fsCtrl.querySelector('[data-action="reset"]');
  if(resetBtn){resetBtn.addEventListener('click',function(){
    exp.stop();fsRunning=false;if(fsPlayBtn){fsPlayBtn.textContent='▶';fsPlayBtn.classList.remove('active');}exp.reset();
  });}
  fsCtrl.querySelectorAll('[data-preset]').forEach(function(btn){
    btn.addEventListener('click',function(){
      fsCtrl.querySelectorAll('[data-preset]').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');exp.preset(btn.dataset.preset);
    });
  });

  fsOverlay.classList.add('active');
  document.body.style.overflow='hidden';
  fsState={active:true,expName:expName,card:card,running:false,origCanvas:canvas,exp:exp};
}

function exitFullscreen(){
  if(!fsState.active)return;
  var exp=fsState.exp;
  exp.stop();
  if(fsState.card){
    fsState.card.dataset.labInited='false';
    drawPlaceholder(fsState.origCanvas,fsState.card);
  }
  if(fsOverlay)fsOverlay.classList.remove('active');
  document.body.style.overflow='';
  fsState={active:false,expName:null,card:null,running:false,origCanvas:null,exp:null};
}

document.addEventListener('keydown',function(e){if(e.key==='Escape'&&fsState.active)exitFullscreen();});

/* ── Card Controls ── */
function initCards(page){
  page.querySelectorAll('.lab-card').forEach(function(card){
    if(card.dataset.labReady)return;
    card.dataset.labReady='true';
    var canvas=card.querySelector('.lab-canvas');
    var expName=canvas.dataset.exp;
    var exp=exps[expName];
    if(!exp)return;
    drawPlaceholder(canvas,card);

    var playBtn=card.querySelector('[data-action="play"]');
    var running=false;
    var runner={
      card:card,
      stop:function(){
        var readyExp=ensureCardReady(card)||exp;
        readyExp.stop();
        playBtn.textContent='▶';
        playBtn.classList.remove('active');
        running=false;
        if(labActiveRunner===runner)labActiveRunner=null;
      }
    };
    playBtn.addEventListener('click',function(){
      if(running){runner.stop();}
      else{
        stopActiveRunner(runner);
        var readyExp=ensureCardReady(card)||exp;
        readyExp.tick();
        playBtn.textContent='⏸';
        playBtn.classList.add('active');
        running=true;
        labActiveRunner=runner;
      }
    });
    card.querySelector('[data-action="reset"]').addEventListener('click',function(){
      var readyExp=ensureCardReady(card)||exp;
      runner.stop();readyExp.reset();
    });
    card.querySelectorAll('[data-preset]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var readyExp=ensureCardReady(card)||exp;
        card.querySelectorAll('[data-preset]').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');readyExp.preset(btn.dataset.preset);
      });
    });
    card.querySelector('[data-action="fullscreen"]').addEventListener('click',function(){enterFullscreen(card);});
    if(window.IntersectionObserver){
      if(!labCardObserver){
        labCardObserver=new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(!entry.isIntersecting&&labActiveRunner&&labActiveRunner.card===entry.target){
              labActiveRunner.stop();
            }
          });
        },{threshold:0.08});
      }
      labCardObserver.observe(card);
    }
  });
}

/* ── Init (pjax compatible) ── */
function boot(){
  var page=document.querySelector('.lab-page');
  if(!page)return;
  fsOverlay=document.getElementById('labFullscreen');
  initFilters(page);initCards(page);
  if(fsOverlay&&!fsOverlay.dataset.closeReady){
    fsOverlay.dataset.closeReady='true';
    var closeBtn=fsOverlay.querySelector('[data-action="fs-close"]');
    if(closeBtn)closeBtn.addEventListener('click',exitFullscreen);
  }
  var siteName=document.getElementById('site-name');
  if(siteName&&!siteName.dataset.labHomeReady){siteName.dataset.labHomeReady='true';siteName.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    if(window.pjax){pjax.loadUrl('/');}
    else{window.location.href='/';}
  });}
}
function destroyLab(){
  if(labActiveRunner)labActiveRunner.stop();
  if(fsState.active)exitFullscreen();
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}
else{boot();}
document.addEventListener('pjax:complete',boot);
document.addEventListener('pjax:success',boot);
document.addEventListener('pjax:send',destroyLab);
window.addEventListener('beforeunload',destroyLab);
})();


