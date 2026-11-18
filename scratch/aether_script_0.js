
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
// Sky shifts from dawn to golden hour to dusk as you scroll
const SKY=[[0,'#0a2a42','#6f9fb8'],[.3,'#1d5b86','#a9d0e3'],[.6,'#0f3a5c','#e7c999'],[.85,'#1a1a3a','#c9806a'],[1,'#071c2b','#3b4f6b']].map(k=>[k[0],hex(k[1]),hex(k[2])]);
function seg(arr,p){let i=0;while(i<arr.length-2&&p>arr[i+1][0])i++;const a=arr[i],b=arr[i+1];return[a,b,ease(clamp((p-a[0])/(b[0]-a[0])))]}
// Jet path keyframes: progress, x%, y%, scale
const PATH=[[0,66,46,1],[.18,72,34,.9],[.35,60,52,1.15],[.5,70,40,.85],[.68,58,56,1.25],[.85,68,44,1],[1,74,62,.8]];
const pose=p=>{const[a,b,t]=seg(PATH,p);return[1,2,3].map(i=>lerp(a[i],b[i],t))};
// Clouds
const cl=$('#clouds'),C=[];let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
for(let i=0;i<18;i++){const w=170+rnd()*380,d=.25+rnd()*1.5,e=document.createElement('i');e.style.cssText=`width:${w}px;height:${w*.32}px;top:${8+rnd()*88}%;opacity:${.14+rnd()*.3*d/1.5}`;cl.appendChild(e);C.push({e,w,d,x:rnd()*1800})}
const jet=$('#jet'),sun=$('#sun'),root=document.documentElement,scenes=$$('.scene .box'),secs=$$('main [id]'),links=$$('.links a');
const alt=p=>35000*(p<.14?ease(p/.14):p<.78?1:1-ease((p-.78)/.22));
const status=p=>p<.03?'Boarding':p<.14?'Climbing':p<.78?'Cruising':p<.97?'Descending':'Landed';
let sp=0,W,H,jw;
const size=()=>{W=innerWidth;H=innerHeight;jw=jet.offsetWidth};size();addEventListener('resize',size);
function frame(t){
 const max=root.scrollHeight-H,p=max>0?clamp(scrollY/max):0;
 sp=rm?p:sp+(p-sp)*.075;
 const[a,b,k]=seg(SKY,sp),mix=i=>a[i].map((v,j)=>Math.round(lerp(v,b[i][j],k))).join(',');
 root.style.setProperty('--sky-top',`rgb(${mix(1)})`);root.style.setProperty('--sky-bot',`rgb(${mix(2)})`);
 sun.style.transform=`translate3d(${lerp(.72,.3,sp)*W}px,${lerp(.22,.72,sp)*H}px,0)`;
 const tt=rm?0:t*.01;
 for(const c of C){const span=W+c.w*2,x=((c.x-(sp*1400+tt)*c.d)%span+span)%span-c.w;c.e.style.transform=`translate3d(${x}px,0,0)`}
 let[x,y,s]=pose(sp);const q=pose(Math.min(1,sp+.006));
 if(W<700){x=50+(x-66)*.5;y=y*.5+8;}
 const rot=clamp((q[1]-y)*(W<700?70:40),-12,12),bob=rm?0:Math.sin(t/900)*6;
 jet.style.transform=`translate3d(${x/100*W-jw/2}px,${y/100*H-jw/6+bob}px,0) rotate(${rot}deg) scale(${s})`;
 for(const el of scenes){const r=el.parentElement.getBoundingClientRect(),d=(r.top+r.height/2-H/2)/H,o=clamp(1-(Math.abs(d)-.12)/.4);el.style.opacity=o;el.style.transform=`translate3d(0,${d*44}px,0)`;el.style.pointerEvents=o>.4?'auto':'none'}
 const al=Math.round(alt(p)/100)*100;
 $('#alt').textContent=al.toLocaleString('en-US')+' ft';$('#spd').textContent='M '+(al?(.4+.45*al/35000).toFixed(2):'0.00');
 $('#st').textContent=status(p);$('#bar').style.width=p*100+'%';$('#pct').textContent=String(Math.round(p*100)).padStart(2,'0')+'%';
 let cur=secs[0];for(const s of secs)if(s.getBoundingClientRect().top<=H*.5)cur=s;
 links.forEach(l=>l.classList.toggle('on',l.getAttribute('href')==='#'+cur.id));
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
