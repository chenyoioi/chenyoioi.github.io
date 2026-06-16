/* ═══════════════════════════════════════════════
   Creative Lab — Fullscreen Edition
   8 experiments with fullscreen support
   ═══════════════════════════════════════════════ */
(function(){
"use strict";

function fitCanvas(c){
  var r=c.parentElement.getBoundingClientRect();
  c.width=Math.floor(r.width);
  c.height=Math.floor(r.height||240);
}

/* ── Noise ── */
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
  var S=6,W,H,grid,next,ctx,alive=false,c;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');
    W=Math.floor(c.width/S);H=Math.floor(c.height/S);
    grid=new Uint8Array(W*H);next=new Uint8Array(W*H);
    c.onclick=function(e){var r=c.getBoundingClientRect(),gx=Math.floor((e.clientX-r.left)/S),gy=Math.floor((e.clientY-r.top)/S);
      if(gx>=0&&gx<W&&gy>=0&&gy<H){var cr=3;for(var dy=-cr;dy<=cr;dy++)for(var dx=-cr;dx<=cr;dx++){var nx=gx+dx,ny=gy+dy;if(nx>=0&&nx<W&&ny>=0&&ny<H&&Math.random()>.3)grid[ny*W+nx]=1;}}};
    draw();
  }
  function step(){for(var y=0;y<H;y++)for(var x=0;x<W;x++){var n=0,i=y*W+x;
    for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){if(dx===0&&dy===0)continue;var nx=(x+dx+W)%W,ny=(y+dy+H)%H;if(grid[ny*W+nx])n++;}
    next[i]=grid[i]?(n===2||n===3)?1:0:n===3?1:0;}var t=grid;grid=next;next=t;}
  function draw(){ctx.fillStyle='#080c14';ctx.fillRect(0,0,c.width,c.height);
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){if(grid[y*W+x]){ctx.fillStyle='hsl('+(200+x*0.5+y*0.3)+',80%,60%)';ctx.fillRect(x*S,y*S,S-1,S-1);}}}
  function tick(){if(!alive)return;step();draw();requestAnimationFrame(tick);}
  function preset(name){grid.fill(0);var cx=Math.floor(W/2),cy=Math.floor(H/2);
    if(name==='glider'){[[0,1],[1,2],[2,0],[2,1],[2,2]].forEach(function(p){var x=cx+p[1]-1,y=cy+p[0]-1;if(x>=0&&x<W&&y>=0&&y<H)grid[y*W+x]=1;});}
    else if(name==='rpentomino'){[[0,1],[0,2],[1,0],[1,1],[2,1]].forEach(function(p){var x=cx+p[1]-1,y=cy+p[0]-1;if(x>=0&&x<W&&y>=0&&y<H)grid[y*W+x]=1;});}
    else if(name==='gosper'){var pts=[[0,4],[0,5],[1,4],[1,5],[6,4],[6,5],[6,6],[7,3],[7,7],[8,2],[8,8],[9,2],[9,8],[10,5],[11,3],[11,7],[12,4],[12,5],[12,6],[13,5],[16,2],[16,3],[16,4],[17,2],[17,3],[17,4],[18,1],[18,5],[20,0],[20,1],[20,5],[20,6],[30,2],[30,3],[31,2],[31,3]];pts.forEach(function(p){var x=cx+p[1]-15,y=cy+p[0]-3;if(x>=0&&x<W&&y>=0&&y<H)grid[y*W+x]=1;});}
    else{for(var i=0;i<W*H*0.15;i++)grid[Math.floor(Math.random()*W*H)]=1;}draw();}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){grid.fill(0);draw();alive=false;},preset:preset};
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
    trail.push({x:ox+L2*Math.sin(th2)+L1*Math.sin(th1),y:oy+L2*Math.cos(th2)+L1*Math.cos(th1)});
    if(trail.length>400)trail.shift();}
  function draw(){ctx.fillStyle='rgba(8,12,20,.15)';ctx.fillRect(0,0,c.width,c.height);
    var ox=c.width/2,oy=c.height*0.35;
    var x1=ox+L1*Math.sin(th1),y1=oy+L1*Math.cos(th1);
    var x2=x1+L2*Math.sin(th2),y2=y1+L2*Math.cos(th2);
    if(trail.length>1){ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);
      for(var i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);
      ctx.strokeStyle='rgba(91,141,239,.35)';ctx.lineWidth=1.5;ctx.stroke();}
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
    var b=boids[i],sx=0,sy=0,ax=0,ay=0,cx=0,cy=0,sn=0,an=0,cn=0;
    for(var j=0;j<boids.length;j++){if(i===j)continue;var o=boids[j];
      var dx=b.x-o.x,dy=b.y-o.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<sep){sx+=dx;sy+=dy;sn++;}if(d<ali){ax+=o.vx;ay+=o.vy;an++;}if(d<coh){cx+=o.x;cy+=o.y;cn++;}}
    if(sn){b.vx+=sx/sn*0.05;b.vy+=sy/sn*0.05;}if(an){b.vx+=(ax/an-b.vx)*0.05;b.vy+=(ay/an-b.vy)*0.05;}if(cn){b.vx+=(cx/cn-b.x)*0.005;b.vy+=(cy/cn-b.y)*0.005;}
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
  var c,ctx,alive=false,W,H,a,b,dA=1,dB=0.5,feed=0.055,kill=0.062,dt=1,scale=3;
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
  function tick(){if(!alive)return;for(var i=0;i<4;i++)step();draw();requestAnimationFrame(tick);}
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
  var c,ctx,alive=false,particles=[],scale=20,cols,rows,zoff=0;
  function init(cv){c=cv;fitCanvas(c);ctx=c.getContext('2d');
    cols=Math.ceil(c.width/scale);rows=Math.ceil(c.height/scale);
    particles=[];for(var i=0;i<800;i++)particles.push({x:Math.random()*c.width,y:Math.random()*c.height});zoff=0;clear();draw();}
  function step(){zoff+=0.003;for(var i=0;i<particles.length;i++){var p=particles[i];
    var col=Math.floor(p.x/scale),row=Math.floor(p.y/scale);
    if(col<0||col>=cols||row<0||row>=rows){p.x=Math.random()*c.width;p.y=Math.random()*c.height;continue;}
    var angle=noise2D(col*0.1,row*0.1+zoff)*Math.PI*4;
    p.x+=Math.cos(angle)*1.5;p.y+=Math.sin(angle)*1.5;
    if(p.x<0||p.x>c.width||p.y<0||p.y>c.height){p.x=Math.random()*c.width;p.y=Math.random()*c.height;}}}
  function clear(){ctx.fillStyle='rgba(8,12,20,.08)';ctx.fillRect(0,0,c.width,c.height);}
  function draw(){clear();for(var i=0;i<particles.length;i++){var p=particles[i];
    var hue=(noise2D(p.x*0.005,p.y*0.005)*360+200)%360;
    ctx.beginPath();ctx.arc(p.x,p.y,1.2,0,Math.PI*2);
    ctx.fillStyle='hsla('+hue+',70%,60%,.6)';ctx.fill();}}
  function tick(){if(!alive)return;step();draw();requestAnimationFrame(tick);}
  function preset(name){}
  return{init:init,tick:function(){alive=true;tick();},stop:function(){alive=false;},reset:function(){clear();for(var i=0;i<particles.length;i++){particles[i].x=Math.random()*c.width;particles[i].y=Math.random()*c.height;}},preset:preset};
})();

/* ╀── Filters ── */
function initFilters(){
  var chips=document.querySelectorAll('.lab-page .lab-chip');
  var cards=document.querySelectorAll('.lab-page .lab-card');
  chips.forEach(function(chip){chip.addEventListener('click',function(){
    chips.forEach(function(c){c.classList.remove('active');});chip.classList.add('active');
    var cat=chip.dataset.cat;
    cards.forEach(function(card){card.style.display=(cat==='all'||card.dataset.cat===cat)?'':'none';});});});
}

/* ╀── Fullscreen Manager ── */
var fsOverlay=document.getElementById('labFullscreen');
var fsState={active:false,expName:null,card:null,running:false,origCanvas:null,exp:null};

function enterFullscreen(card){
  var canvas=card.querySelector('.lab-canvas');
  var expName=canvas.dataset.exp;
  var exp=exps[expName];
  if(!exp)return;

  // Stop card experiment
  var cardPlayBtn=card.querySelector('[data-action="play"]');
  if(cardPlayBtn&&cardPlayBtn.classList.contains('active')){
    exp.stop();cardPlayBtn.classList.remove('active');cardPlayBtn.textContent='▶';
  }

  // Populate overlay header
  var icon=card.querySelector('.lab-icon').textContent;
  var title=card.querySelector('.lab-meta h3').textContent;
  var cat='';
  fsOverlay.querySelector('.lab-fs-icon').textContent=icon;
  fsOverlay.querySelector('.lab-fs-title').textContent=title;
  var fsCatEl=fsOverlay.querySelector('.lab-fs-cat');if(fsCatEl)fsCatEl.textContent=cat;

  // Copy control buttons
  var fsCtrl=fsOverlay.querySelector('.lab-fs-ctrl');
  fsCtrl.innerHTML='';
  var origCtrl=card.querySelector('.lab-ctrl');
  origCtrl.querySelectorAll('.lab-btn').forEach(function(btn){
    var clone=btn.cloneNode(true);
    fsCtrl.appendChild(clone);
  });

  // Init experiment on fullscreen canvas
  var fsCanvas=fsOverlay.querySelector('.lab-fs-canvas');
  exp.init(fsCanvas);

  // Wire fullscreen controls
  var fsRunning=false;
  var fsPlayBtn=fsCtrl.querySelector('[data-action="play"]');
  if(fsPlayBtn){
    fsPlayBtn.addEventListener('click',function(){
      if(fsRunning){exp.stop();fsPlayBtn.textContent='▶';fsPlayBtn.classList.remove('active');fsRunning=false;}
      else{exp.tick();fsPlayBtn.textContent='⏸';fsPlayBtn.classList.add('active');fsRunning=true;}
    });
  }
  fsCtrl.querySelector('[data-action="reset"]').addEventListener('click',function(){
    exp.stop();fsRunning=false;if(fsPlayBtn){fsPlayBtn.textContent='▶';fsPlayBtn.classList.remove('active');}exp.reset();
  });
  fsCtrl.querySelectorAll('[data-preset]').forEach(function(btn){
    btn.addEventListener('click',function(){
      fsCtrl.querySelectorAll('[data-preset]').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');exp.preset(btn.dataset.preset);
      if(fsRunning){exp.stop();exp.tick();}});
  });

  // Show overlay
  fsOverlay.classList.add('active');
  document.body.style.overflow='hidden';

  fsState={active:true,expName:expName,card:card,running:false,origCanvas:canvas,exp:exp};
}

function exitFullscreen(){
  if(!fsState.active)return;
  var exp=fsState.exp;
  exp.stop();

  // Reinit on card canvas
  exp.init(fsState.origCanvas);

  fsOverlay.classList.remove('active');
  document.body.style.overflow='';
  fsState={active:false,expName:null,card:null,running:false,origCanvas:null,exp:null};
}

/* ESC to close */
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&fsState.active)exitFullscreen();});
/* Close button */
if(fsOverlay){fsOverlay.querySelector('[data-action="fs-close"]').addEventListener('click',exitFullscreen);}

/* ╀── Card Controls ── */
function initCards(){
  document.querySelectorAll('.lab-page .lab-card').forEach(function(card){
    var canvas=card.querySelector('.lab-canvas');
    var expName=canvas.dataset.exp;
    var exp=exps[expName];
    if(!exp)return;
    exp.init(canvas);

    var playBtn=card.querySelector('[data-action="play"]');
    var running=false;
    playBtn.addEventListener('click',function(){
      if(running){exp.stop();playBtn.textContent='▶';playBtn.classList.remove('active');running=false;}
      else{exp.tick();playBtn.textContent='⏸';playBtn.classList.add('active');running=true;}
    });
    card.querySelector('[data-action="reset"]').addEventListener('click',function(){
      exp.stop();running=false;playBtn.textContent='▶';playBtn.classList.remove('active');exp.reset();
    });
    card.querySelectorAll('[data-preset]').forEach(function(btn){
      btn.addEventListener('click',function(){
        card.querySelectorAll('[data-preset]').forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');exp.preset(btn.dataset.preset);
        if(running){exp.stop();exp.tick();}});
    });
    /* Fullscreen button */
    card.querySelector('[data-action="fullscreen"]').addEventListener('click',function(){
      enterFullscreen(card);
    });
  });
}

/* ╀── Init ── */
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot);}else{boot();}
function boot(){
  initFilters();initCards();
  /* Ensure site-name navigates to homepage */
  var siteName=document.getElementById('site-name');
  if(siteName){siteName.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    if(window.pjax){pjax.loadUrl('/');}
    else{window.location.href='/';}
  });}
}

})();
