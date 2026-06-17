const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
resize(); addEventListener('resize',resize);

const players=[];
const items=[];
const texts=[];

class Player{
 constructor(name){
  this.name=name; this.score=50;
  this.x=Math.random()*800+50; this.y=Math.random()*500+100;
  this.vx=(Math.random()-.5)*1.5; this.vy=(Math.random()-.5)*1.5;
  this.r=35; this.alive=true;
 }
 draw(){
  ctx.strokeStyle='#00ffff'; ctx.lineWidth=2;
  ctx.shadowBlur=15; ctx.shadowColor='#00ffff';
  ctx.strokeRect(this.x-45,this.y-25,90,50);
  ctx.shadowBlur=0;
  ctx.fillStyle='white';
  ctx.textAlign='center';
  ctx.fillText(this.name,this.x,this.y-4);
  ctx.fillText(this.score+' pts',this.x,this.y+14);
 }
 update(){
  if(!this.alive) return;
  this.x+=this.vx; this.y+=this.vy;
  if(this.x<45||this.x>canvas.width-45) this.vx*=-1;
  if(this.y<70||this.y>canvas.height-30) this.vy*=-1;
 }
}

function addPlayer(n){players.push(new Player(n));}

document.getElementById('addBtn').onclick=()=>{
 const n=document.getElementById('nameInput').value.trim();
 if(n){addPlayer(n);document.getElementById('nameInput').value='';}
};

function spawnItem(){
 const arr=['📚','🐍','🤖','💣','⚡'];
 items.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,t:arr[Math.floor(Math.random()*arr.length)]});
}
setInterval(spawnItem,4000);

function floatText(x,y,t){texts.push({x,y,t,a:1});}

function effect(p,item){
 if(item==='📚'){p.score+=20;floatText(p.x,p.y,'+20');}
 if(item==='🐍'){p.score+=50;floatText(p.x,p.y,'+50');}
 if(item==='🤖'){p.score+=100;floatText(p.x,p.y,'+100 IA');}
 if(item==='💣'){p.score-=40;floatText(p.x,p.y,'-40');}
 if(item==='⚡'){p.vx*=2;p.vy*=2;floatText(p.x,p.y,'BOOST'); setTimeout(()=>{p.vx/=2;p.vy/=2;},5000);}
}

function leaderboard(){
 const div=document.getElementById('leaderboard');
 const alive=players.filter(p=>p.alive).sort((a,b)=>b.score-a.score);
 div.innerHTML='<h3>Classement</h3>'+alive.map((p,i)=>
 `${i===0?'👑 ':''}${i+1}. ${p.name} (${p.score})`).join('<br>');
}

function loop(){
 ctx.clearRect(0,0,canvas.width,canvas.height);

 players.forEach(p=>p.update());

 for(let i=0;i<players.length;i++){
  for(let j=i+1;j<players.length;j++){
   let a=players[i],b=players[j];
   if(!a.alive||!b.alive) continue;
   let d=Math.hypot(a.x-b.x,a.y-b.y);
   if(d<70){
    let w=Math.random()<0.5?a:b;
    let l=w===a?b:a;
    w.score+=15; l.score-=10;
    floatText((a.x+b.x)/2,(a.y+b.y)/2,'💥');
    a.vx*=-1; a.vy*=-1; b.vx*=-1; b.vy*=-1;
    if(l.score<=0) l.alive=false;
   }
  }
 }

 items.forEach((it,idx)=>{
   ctx.font='28px Arial';
   ctx.fillText(it.t,it.x,it.y);
   players.forEach(p=>{
      if(p.alive && Math.hypot(p.x-it.x,p.y-it.y)<50){
        effect(p,it.t);
        items.splice(idx,1);
      }
   });
 });

 texts.forEach(t=>{
   ctx.globalAlpha=t.a;
   ctx.fillText(t.t,t.x,t.y);
   ctx.globalAlpha=1;
   t.y-=1; t.a-=0.01;
 });
 for(let i=texts.length-1;i>=0;i--) if(texts[i].a<=0) texts.splice(i,1);

 players.filter(p=>p.alive).forEach(p=>p.draw());
 leaderboard();
 requestAnimationFrame(loop);
}
loop();
