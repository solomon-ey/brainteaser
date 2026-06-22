import { GRADES } from '../data/grades.js';
import { PROFESSIONS } from '../data/professions.js';
import { WORDS } from '../data/words.js';
import { AFF_DISCLOSURE, RECS } from '../data/affiliates.js';
import '../styles/styles.css';

const $=id=>document.getElementById(id);
const app=$('app'), sub=$('sub'), crumbs=$('crumbs');
const TYPE_COLOR={Pattern:'var(--sky)',Logic:'var(--leaf)',Verbal:'var(--grape)',Numbers:'var(--lantern)',Spatial:'var(--berry)',Lateral:'var(--clay)'};
const PASS=0.6;

const SUBJECTS=[
  {id:'math',  name:'Numbers', icon:'🔢', color:'var(--lantern)', blurb:'Counting, sums and number patterns.'},
  {id:'words', name:'Words',   icon:'💬', color:'var(--grape)',   blurb:'Meanings, opposites and word links.'},
  {id:'logic', name:'Logic',   icon:'🧩', color:'var(--sky)',     blurb:'Patterns, deduction and puzzles.'},
  {id:'science',name:'Science',icon:'🌿', color:'var(--leaf)',    blurb:'Why things happen in nature.'},
];

// ===================== REFS =====================
const pcluster=$('pcluster'), modal=$('modal'), mcard=$('mcard'), fxLayer=$('fx');

// ===================== PROFILE + STORE =====================
const AVATARS=[{e:'🦊',lv:1},{e:'🦉',lv:1},{e:'🐢',lv:1},{e:'🐝',lv:2},{e:'🦋',lv:3},{e:'🐙',lv:4},{e:'🦄',lv:5},{e:'🐉',lv:7},{e:'🦅',lv:9},{e:'🐳',lv:12}];
const avatarLv=e=>{const a=AVATARS.find(x=>x.e===e);return a?a.lv:1;};
const unlockedCount=lvl=>AVATARS.filter(a=>lvl>=a.lv).length;
const defaultProfile=()=>({name:'',avatar:'🦊',xp:0,badges:{},stars:{},unlocked:0,prof:{},daily:{},mind:{},seen:{},arcade:{},expBest:0,settings:{sound:true,timed:false}});
let P=defaultProfile();
const KEY='brainteaser_profile';
const Store={
  async load(){
    try{const ls=localStorage.getItem(KEY)||localStorage.getItem('tl_profile');if(ls)return JSON.parse(ls);}catch(e){}
    try{if(window.storage){const r=await window.storage.get(KEY);if(r&&r.value)return JSON.parse(r.value);}}catch(e){}
    return null;
  },
  save(){const data=JSON.stringify(P);
    try{localStorage.setItem(KEY,data);}catch(e){}
    try{if(window.storage)window.storage.set(KEY,data);}catch(e){}
  }
};

// ===================== HELPERS =====================
const TYPES=['Logic','Pattern','Numbers','Verbal','Spatial','Lateral'];
const levelFor=xp=>Math.floor(xp/100)+1;
const xpInto=xp=>xp%100;
function starsFor(score,total){ if(score>=total)return 3; if(score/total>=PASS)return 2; if(score>0)return 1; return 0; }
const subjKey=(gi,sid)=>GRADES[gi].id+'.'+sid;
const subjStars=(gi,sid)=>P.stars[subjKey(gi,sid)]||0;
const subjLit=(gi,sid)=>subjStars(gi,sid)>=2;
const gradeComplete=gi=>SUBJECTS.every(s=>subjLit(gi,s.id));
const litCount=gi=>SUBJECTS.filter(s=>subjLit(gi,s.id)).length;
const MAX_STARS=GRADES.length*SUBJECTS.length*3;
const totalStars=()=>{let t=0;GRADES.forEach((g,i)=>SUBJECTS.forEach(su=>t+=Math.min(3,subjStars(i,su.id))));return t;};
const allGradesComplete=()=>GRADES.every((_,i)=>gradeComplete(i));
const starHTML=n=>`<span class="stars">${[0,1,2].map(i=>`<span class="s ${i<n?'on':''}">★</span>`).join('')}</span>`;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const KID_ROUND=5;
function prepQ(q){const order=shuffle(q.o.map((_,i)=>i));return Object.assign({},q,{o:order.map(i=>q.o[i]),a:order.indexOf(q.a)});}
function drawSubset(arr,n,key){
  if(arr.length<=n)return shuffle(arr);
  P.seen=P.seen||{};let seen=Array.isArray(P.seen[key])?P.seen[key]:[];
  const idxs=arr.map((_,i)=>i);let unseen=idxs.filter(i=>!seen.includes(i));
  if(unseen.length<n){seen=[];unseen=idxs;}
  const chosen=shuffle(unseen).slice(0,n);
  P.seen[key]=Array.from(new Set(seen.concat(chosen)));Store.save();
  return shuffle(chosen.map(i=>arr[i]));
}
function kidQuiz(gi,sid){const g=GRADES[gi],su=SUBJECTS.find(x=>x.id===sid);S.gradeIdx=gi;S.subjId=sid;
  startQuiz(drawSubset(g.subjects[sid],KID_ROUND,g.id+'.'+sid),g.name+' · '+su.name,su.color,'child');}
const exploredTypes=()=>TYPES.filter(t=>P.mind[t]&&P.mind[t].t>0).length;
function addMind(type,correct){P.mind[type]=P.mind[type]||{c:0,t:0};P.mind[type].t++;if(correct)P.mind[type].c++;}

// ===================== AUDIO =====================
let actx=null;
function actxInit(){try{if(!actx)actx=new (window.AudioContext||window.webkitAudioContext)();if(actx&&actx.state==='suspended')actx.resume();}catch(e){}}
function tone(freq,t0,dur,type,vol){if(!P.settings.sound)return;actxInit();if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();o.type=type||'sine';o.frequency.value=freq;o.connect(g);g.connect(actx.destination);const t=actx.currentTime+t0;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.18,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.02);}
const SFX={
  correct(){tone(660,0,.12,'sine',.18);tone(990,.08,.16,'sine',.18);},
  wrong(){tone(200,0,.18,'sawtooth',.13);tone(150,.06,.2,'sawtooth',.11);},
  click(){tone(520,0,.04,'square',.05);},
  star(){tone(880,0,.1,'triangle',.16);tone(1320,.07,.13,'triangle',.14);},
  level(){[523,659,784,1046].forEach((f,i)=>tone(f,i*.09,.2,'triangle',.18));},
};

// ===================== CELEBRATION =====================
function confetti(n){const colors=['#ffb43d','#34d39a','#4fb6ff','#ff6f9d','#b48cff'];n=n||90;
  for(let i=0;i<n;i++){const d=document.createElement('div');d.className='conf';d.style.background=colors[i%colors.length];
    d.style.left=Math.random()*100+'vw';d.style.top='-20px';fxLayer.appendChild(d);
    const dx=(Math.random()-.5)*260,dur=1500+Math.random()*1300,rot=Math.random()*720;
    d.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${window.innerHeight+80}px) rotate(${rot}deg)`,opacity:.9}],{duration:dur,easing:'cubic-bezier(.2,.6,.5,1)'}).onfinish=()=>d.remove();}}
function showModal(html){mcard.innerHTML=html;modal.classList.add('show');
  setTimeout(()=>{const f=mcard.querySelector('button,[href],input');if(f)f.focus();},50);
  mcard.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal.classList.remove('show'));
  modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show');};}
let toastT;function toast(html){const t=$('toast');t.innerHTML=html;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);}

// ===================== PWA INSTALL PROMPT =====================
let _deferredInstall=null;
function showInstallBanner(){const ban=$('install-banner');if(!ban||sessionStorage.getItem('ib_dismissed'))return;ban.classList.add('visible');}
function hideInstallBanner(){const ban=$('install-banner');if(ban)ban.classList.remove('visible');}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();_deferredInstall=e;setTimeout(showInstallBanner,5000);});
window.addEventListener('appinstalled',()=>{hideInstallBanner();_deferredInstall=null;});
document.addEventListener('DOMContentLoaded',()=>{
  const btn=$('install-btn'),dis=$('install-dismiss');
  if(btn)btn.onclick=async()=>{if(!_deferredInstall)return;_deferredInstall.prompt();const{outcome}=await _deferredInstall.userChoice;if(outcome==='accepted')hideInstallBanner();_deferredInstall=null;};
  if(dis)dis.onclick=()=>{sessionStorage.setItem('ib_dismissed','1');hideInstallBanner();};
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream;
  const isStandalone=window.navigator.standalone===true||window.matchMedia('(display-mode: standalone)').matches;
  if(isIOS&&!isStandalone&&!sessionStorage.getItem('ib_dismissed')){setTimeout(()=>toast('💡 Tap the Share button ↑ then <b>Add to Home Screen</b>'),6000);}
});

// ===================== QUIZ AFFILIATE HELPER =====================
function quizAffCard(){
  const kid=S.mode==='child';
  const keys=kid?['math','words','logic','science']:[S.profId||'dev'];
  const pool=keys.flatMap(k=>(RECS[k]||[]).filter(x=>x.u&&x.u!=='#'));
  if(!pool.length)return '';
  const it=pool[Math.floor(Math.random()*pool.length)];
  return `<a class="quiz-aff" href="${it.u}" target="_blank" rel="sponsored nofollow noopener" aria-label="${it.t} — sponsored link">
    <span class="qa-emoji">${it.e}</span>
    <span class="qa-body"><span class="qa-t">${it.t}</span><span class="qa-b">${it.b}</span></span>
    <span class="qa-cta">View ›</span></a>`;}


// ===================== BADGES =====================
const BADGES=[
 {id:'first_light',ic:'✦',n:'First Light',d:'Light your first subject.'},
 {id:'perfect',ic:'💯',n:'Flawless',d:'Get a perfect round.'},
 {id:'on_fire',ic:'🔥',n:'On Fire',d:'Hit a 5-answer streak.'},
 {id:'explorer',ic:'🧭',n:'Grade Master',d:'Complete every subject in a grade.'},
 {id:'climber',ic:'🪜',n:'Climber',d:'Reach Grade 3.'},
 {id:'summit',ic:'🏔️',n:'Summit',d:'Complete Grade 6.'},
 {id:'brainiac',ic:'🧠',n:'Brainiac',d:'Earn 500 XP.'},
 {id:'pro',ic:'💼',n:'Pro Thinker',d:'Ace any profession set.'},
 {id:'pathfinder',ic:'🏁',n:'Pathfinder',d:'Score 100+ in an Expedition.'},
 {id:'cartographer',ic:'🗺️',n:'Cartographer',d:'Practise all six reasoning types.'},
 {id:'collector',ic:'🌈',n:'Spirit Collector',d:'Unlock five spirits.'},
 {id:'arcadia',ic:'🕹️',n:'Arcade Ace',d:'Score 400+ in a Brain Arcade game.'},
 {id:'graduate',ic:'🎓',n:'Graduate',d:'Complete all six grades.'},
 {id:'scholar',ic:'🌟',n:'Star Scholar',d:'Earn 3 stars on every subject.'},
 {id:'reader',ic:'📖',n:'Reader',d:'Finish a Reading Club round.'},
];
const badgeDef=id=>BADGES.find(b=>b.id===id);
function award(id){if(P.badges[id])return false;P.badges[id]=Date.now();return true;}

// ===================== AFFILIATE / BRAIN SHELF =====================
function recCard(it){return `<a class="rec" href="${it.u}" target="_blank" rel="sponsored nofollow noopener"><span class="remoji">${it.e}</span><span class="rmeta"><span class="rt">${it.t}</span><span class="rb">${it.b}</span></span><span class="rcta">View ›</span></a>`;}
function recBlock(key,opts){opts=opts||{};const items=(RECS[key]||[]).filter(x=>x.u&&x.u!=='#').slice(0,opts.limit||2);if(!items.length)return '';
  return `<div class="recwrap">${opts.parent?`<div class="forgrownups">For grown-ups</div>`:''}<h4>${opts.heading||'You might like'}</h4>
    <div class="reclist">${items.map(recCard).join('')}</div><div class="disc">${AFF_DISCLOSURE}</div></div>`;}

// ===================== STATE =====================
let S={ screen:'home', audience:null, mode:null, qi:0, answers:[], gradeIdx:0, subjId:null, profId:null,
        quiz:null, locked:false, streakLive:0, timed:false, qStart:0, exp:null };

// ===================== DAILY =====================
function dailyKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function buildDaily(){
  const all=[];GRADES.forEach(g=>SUBJECTS.forEach(s=>g.subjects[s.id].forEach(q=>all.push(q))));PROFESSIONS.forEach(p=>p.questions.forEach(q=>all.push(q)));
  let seed=0;for(const c of dailyKey())seed=(seed*31+c.charCodeAt(0))>>>0;seed=seed||1;
  const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const idx=new Set();let guard=0;while(idx.size<5&&guard++<999)idx.add(Math.floor(rng()*all.length));
  return [...idx].map(i=>all[i]);
}

// ===================== EXPEDITION POOL =====================
let EXP_POOL=null;
function expPool(){if(EXP_POOL)return EXP_POOL;const p=[];
  GRADES.forEach((g,i)=>SUBJECTS.forEach(s=>g.subjects[s.id].forEach(q=>p.push({q,tier:i+1}))));
  PROFESSIONS.forEach(pr=>pr.questions.forEach(q=>p.push({q,tier:6})));EXP_POOL=p;return p;}

// ===================== ROUTER + CHROME =====================
let timerHandle=null;
function clearTimer(){if(timerHandle){clearInterval(timerHandle);timerHandle=null;}}
function render(){
  clearTimer();clearArc();renderChrome();crumbs.innerHTML='';
  if(['cats','subjects','quiz','results','profile','expedition','expresults','shelf','arcade','arcplay','arcresult','profstages','reading','readplay','readresult'].includes(S.screen)) addCrumb('Home',()=>go('home'));
  if(S.audience==='child'){
    if(['subjects','quiz','results'].includes(S.screen)&&S.mode!=='daily') addCrumb('The path',()=>go('cats'));
    if(['quiz','results'].includes(S.screen)&&S.mode==='child') addCrumb(GRADES[S.gradeIdx].name,()=>go('subjects'));
  } else if(S.audience==='adult'){
    if(['quiz','results'].includes(S.screen)&&S.mode==='adult') addCrumb('Professions',()=>go('cats'));
  }
  ({home:screenHome,cats:screenCats,subjects:screenSubjects,quiz:screenQuiz,results:screenResults,welcome:screenWelcome,profile:screenProfile,expedition:screenExpedition,expresults:screenExpResults,shelf:screenShelf,arcade:screenArcade,arcplay:screenArcPlay,arcresult:screenArcResult,profstages:screenProfStages,reading:screenReading,readplay:screenReadPlay,readresult:screenReadResult}[S.screen])();
  app.classList.remove('screen-in');void app.offsetWidth;app.classList.add('screen-in');
}
function renderChrome(){
  if(!P.name||S.screen==='welcome'){pcluster.innerHTML='';return;}
  const lvl=levelFor(P.xp), into=xpInto(P.xp);
  pcluster.innerHTML=`
    <button class="iconbtn ${P.settings.sound?'on':''}" id="soundBtn" aria-label="${P.settings.sound?'Sound on — click to mute':'Sound muted — click to enable'}" title="Sound">${P.settings.sound?'🔊':'🔇'}</button>
    <button class="pchip" id="pchip" aria-label="View profile for ${P.name}, Level ${lvl}">
      <span class="pav" aria-hidden="true">${P.avatar}</span>
      <span class="pmeta"><span class="pname">${P.name}</span>
      <span class="plvl">Lv ${lvl}<span class="xpbar"><i style="width:${into}%"></i></span></span></span>
    </button>`;
  $('soundBtn').onclick=()=>{P.settings.sound=!P.settings.sound;Store.save();if(P.settings.sound){actxInit();SFX.click();}renderChrome();};
  $('pchip').onclick=()=>{SFX.click();go('profile');};
}
function addCrumb(label,fn){const b=document.createElement('button');b.className='crumb';b.textContent='‹ '+label;b.onclick=()=>{SFX.click();fn();};crumbs.appendChild(b);}
function go(s){S.screen=s;window.scrollTo(0,0);render();}
const STAGE_SIZE=10;
const profStageCount=pr=>Math.min(10,Math.max(1,Math.ceil(pr.questions.length/STAGE_SIZE)));
const profStageQs=(pr,i)=>pr.questions.slice(i*STAGE_SIZE,i*STAGE_SIZE+STAGE_SIZE);
const stageStars=(id,i)=>P.prof[id+'#'+i]||0;
const stageCleared=(id,i)=>stageStars(id,i)>=2;
const stageUnlocked=(pr,i)=>i===0||stageCleared(pr.id,i-1);
const profClearedCount=pr=>{let n=0;for(let i=0;i<profStageCount(pr);i++)if(stageCleared(pr.id,i))n++;return n;};
// Exam stage helpers
const examStageCount=pr=>Math.ceil(((pr.examQ||[]).length)/STAGE_SIZE);
const examStageQs=(pr,i)=>(pr.examQ||[]).slice(i*STAGE_SIZE,i*STAGE_SIZE+STAGE_SIZE);
const examKey=(id,i)=>id+'#exam#'+i;
const examStars=(id,i)=>P.prof[examKey(id,i)]||0;
const examCleared=(id,i)=>examStars(id,i)>=2;
const examUnlocked=(pr,i)=>i===0||examCleared(pr.id,i-1);
function startStage(id,i,isExam=false){const pr=PROFESSIONS.find(p=>p.id===id);const pool=isExam?examStageQs(pr,i):profStageQs(pr,i);const k=isExam?'ex.'+id+'.'+i:'st.'+id+'.'+i;const label=isExam?(pr.name+' · Exam '+(i+1)):(pr.name+' · Stage '+(i+1));const col=isExam?'var(--berry)':pr.color;S.profId=id;S.stageIdx=i;S.examMode=isExam||false;const round=drawSubset(pool,Math.min(STAGE_SIZE,pool.length),k);startQuiz(round,label,col,'adult');}
function startQuiz(questions,title,color,mode){S.quiz={questions:shuffle(questions).map(prepQ),title,color};S.mode=mode;S.qi=0;S.answers=[];S.streakLive=0;S.timed=!!P.settings.timed;go('quiz');}

// ===================== WELCOME =====================
let pickAv=AVATARS[0].e;
function screenWelcome(){
  sub.textContent='Make your spirit';
  app.innerHTML=`<div class="hero"><h1>Welcome, little maker.</h1><p>Pick a light-spirit and a name. You'll earn XP, light up stars, collect badges and unlock new spirits as you climb.</p></div>
    <div class="qcard"><h4 class="lab" style="margin-bottom:6px">Choose your spirit</h4><div class="avgrid" id="avg"></div>
    <h4 class="lab" style="margin-bottom:6px">Your name</h4><input class="namein" id="nm" maxlength="16" placeholder="Type a name…">
    <div class="qfoot"><button class="next" id="startP">Begin ✦</button></div></div>`;
  const g=$('avg');AVATARS.forEach(a=>{const open=a.lv<=1;const b=document.createElement('button');b.className='avpick'+(a.e===pickAv?' on':'');
    b.innerHTML=open?a.e:`🔒`;if(!open)b.style.opacity='.4';
    if(open)b.onclick=()=>{pickAv=a.e;SFX.click();[...g.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');};
    else b.title='Unlocks at Level '+a.lv;g.appendChild(b);});
  $('startP').onclick=()=>{const nm=$('nm').value.trim()||'Explorer';P.name=nm;P.avatar=pickAv;Store.save();actxInit();SFX.level();confetti(60);go('home');};
}

// ===================== MIND MAP RADAR =====================
function mindRadar(){
  const cx=110,cy=104,R=78,N=TYPES.length;
  const pt=(i,r)=>{const ang=-Math.PI/2+i*2*Math.PI/N;return[cx+Math.cos(ang)*r,cy+Math.sin(ang)*r];};
  let rings='';[0.34,0.67,1].forEach(f=>{const p=TYPES.map((_,i)=>pt(i,R*f).join(',')).join(' ');rings+=`<polygon points="${p}" fill="none" stroke="rgba(255,255,255,.10)"/>`;});
  let axes='',labels='';
  TYPES.forEach((t,i)=>{const[x,y]=pt(i,R);axes+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.10)"/>`;
    const[lx,ly]=pt(i,R+16);labels+=`<text x="${lx}" y="${ly}" font-size="10" fill="#a99fd6" text-anchor="middle" dominant-baseline="middle" font-family="Nunito,sans-serif">${t}</text>`;});
  const poly=TYPES.map((t,i)=>{const m=P.mind[t];const acc=m&&m.t?m.c/m.t:0;const r=12+acc*(R-12);return pt(i,m&&m.t?r:12).join(',');}).join(' ');
  return `<svg viewBox="0 0 220 210" style="width:100%;max-width:300px;display:block;margin:0 auto">${rings}${axes}
    <polygon points="${poly}" fill="rgba(255,180,61,.22)" stroke="var(--lantern)" stroke-width="2"/>
    ${TYPES.map((t,i)=>{const m=P.mind[t];const acc=m&&m.t?m.c/m.t:0;const[x,y]=pt(i,m&&m.t?12+acc*(R-12):12);return `<circle cx="${x}" cy="${y}" r="3" fill="var(--lantern-soft)"/>`;}).join('')}
    ${labels}</svg>`;
}

// ===================== PROFILE =====================
function screenProfile(){
  sub.textContent='Your profile';
  const lvl=levelFor(P.xp), into=xpInto(P.xp), earned=Object.keys(P.badges).length;
  app.innerHTML=`<div class="hero" style="display:flex;align-items:center;gap:18px">
      <div class="pav" style="width:64px;height:64px;font-size:36px;border-radius:18px">${P.avatar}</div>
      <div style="flex:1"><h1 style="margin:0">${P.name}</h1>
        <div class="plvl" style="font-size:13px;margin-top:6px">Level ${lvl} · ${P.xp} XP
          <span class="xpbar" style="width:130px;height:8px"><i style="width:${into}%"></i></span></div>
        ${P.expBest?`<div class="age" style="margin-top:6px">🏁 Best Expedition: ${P.expBest}</div>`:''}</div></div>

    <div class="qcard"><h4 class="lab">Mind Map · explored ${exploredTypes()}/6 types</h4>
      ${mindRadar()}
      <div class="resnote" style="text-align:center;margin-top:4px">Play across subjects and modes to grow your shape. The further out a point, the stronger that thinking.</div></div>

    <div class="qcard" style="margin-top:16px"><h4 class="lab">Spirits · ${unlockedCount(lvl)}/${AVATARS.length} unlocked</h4><div class="avgrid" id="avg"></div></div>

    <div class="qcard" style="margin-top:16px"><h4 class="lab">Badges · ${earned}/${BADGES.length}</h4><div class="bgrid" id="bg"></div></div>

    <div class="qcard" style="margin-top:16px"><h4 class="lab">Credits earned</h4>
      <div class="credits-display">
        <div class="credits-amount">${xpToCredits(P.xp)}</div>
        <div class="credits-sub">from ${P.xp.toLocaleString()} XP · ${XP_MILESTONES.filter(m=>P.xp>=m).length}/${XP_MILESTONES.length} milestones reached</div>
        <div class="credits-bar"><div class="credits-fill" style="width:${Math.min(100,P.xp/XP_MILESTONES[XP_MILESTONES.length-1]*100)}%"></div></div>
        <a class="btn ghost" href="https://www.udemy.com/courses/search/?q=reasoning" target="_blank" rel="noopener sponsored" style="margin-top:10px;display:inline-block;font-size:13px">Redeem on Udemy →</a>
      </div></div>
    <div class="qcard" style="margin-top:16px"><h4 class="lab">Settings</h4>
      <div class="resbtns" style="justify-content:flex-start">
        <button class="btn ghost" id="sndT">${P.settings.sound?'🔊 Sound: on':'🔇 Sound: off'}</button>
        <button class="btn ghost" id="tmrT">${P.settings.timed?'⏱ Beat-the-clock: on':'⏱ Beat-the-clock: off'}</button>
        <button class="btn ghost" id="rst">↺ Reset progress</button>
        <button class="btn" id="hm">Back to start</button>
      </div>
      <div class="dev-credit">Built by <a href="https://solomon-ey.netlify.app/" target="_blank" rel="noopener">Solomon Etchie</a></div></div>`;
  const av=$('avg');AVATARS.forEach(a=>{const open=lvl>=a.lv;const b=document.createElement('button');
    b.className='avpick'+(P.avatar===a.e?' on':'');b.innerHTML=open?a.e:'🔒';if(!open){b.style.opacity='.4';b.title='Unlocks at Level '+a.lv;}
    if(open)b.onclick=()=>{P.avatar=a.e;Store.save();SFX.star();render();};av.appendChild(b);});
  const bg=$('bg');BADGES.forEach(b=>{const has=!!P.badges[b.id];const d=document.createElement('div');d.className='badge'+(has?'':' locked');
    d.innerHTML=`<div class="bic">${has?b.ic:'🔒'}</div><div><div class="bn">${b.n}</div><div class="bd">${b.d}</div></div>`;bg.appendChild(d);});
  $('sndT').onclick=()=>{P.settings.sound=!P.settings.sound;Store.save();SFX.click();render();};
  $('tmrT').onclick=()=>{P.settings.timed=!P.settings.timed;Store.save();SFX.click();render();};
  $('hm').onclick=()=>{SFX.click();go('home');};
  $('rst').onclick=()=>{showModal(`<div class="big">↺</div><h2>Reset everything?</h2><p>This clears your XP, stars, badges and Mind Map. Your spirit stays.</p>
    <div class="resbtns"><button class="btn" id="rok">Yes, reset</button><button class="btn ghost" data-close>Keep it</button></div>`);
    setTimeout(()=>{const ok=document.getElementById('rok');if(ok)ok.onclick=()=>{const nm=P.name,av=P.avatar,st=P.settings;P=defaultProfile();P.name=nm;P.avatar=av;P.settings=st;Store.save();modal.classList.remove('show');go('home');};},30);};
}

// ===================== HOME =====================
function screenHome(){
  sub.textContent='Reasoning challenges for curious minds.';
  const dk=dailyKey(), dDone=P.daily[dk]!==undefined;
  app.innerHTML=`
    <button class="daily ${dDone?'done':''}" id="daily">
      <div class="dic">${dDone?'✓':'⚡'}</div>
      <div><h3>Daily Challenge</h3><p>${dDone?`Done today — you scored ${P.daily[dk]}/5. Back tomorrow!`:'Five fresh mixed questions. New set every day.'}</p></div>
      <span class="go">${dDone?'Replay':'Play ›'}</span></button>
    <button class="daily" id="exped" style="background:linear-gradient(110deg,rgba(79,182,255,.16),var(--night-2));border-color:rgba(79,182,255,.32)">
      <div class="dic" style="background:rgba(79,182,255,.2)">🏁</div>
      <div><h3>Expedition</h3><p>Endless mixed run — 3 lives, rising difficulty, build a combo. ${P.expBest?`Your best: ${P.expBest}.`:'How far can you go?'}</p></div>
      <span class="go" style="color:var(--sky)">Start ›</span></button>
    <button class="daily" id="arcTile" style="background:linear-gradient(110deg,rgba(255,111,157,.16),var(--night-2));border-color:rgba(255,111,157,.32)">
      <div class="dic" style="background:rgba(255,111,157,.2)">🕹️</div>
      <div><h3>Brain Arcade</h3><p>Fast puzzle games — memory, speed and focus. For all ages.</p></div>
      <span class="go" style="color:var(--berry)">Open ›</span></button>
    <div class="hero"><h1>Who's thinking today?</h1>
      <p>Children climb grade stages — each grade opening into four subjects; grown-ups explore professions. Earn XP, stars, spirits and badges as you go.</p>
      <div class="disclaimer">A note: this is brain practice and reasoning fun — <b>not</b> a clinical IQ test or a measure of how clever anyone is.</div></div>
    <div class="cards two" id="aud"></div>
    <button class="daily" id="shelfTile" style="margin-top:18px;background:linear-gradient(110deg,rgba(180,140,255,.16),var(--night-2));border-color:rgba(180,140,255,.32)">
      <div class="dic" style="background:rgba(180,140,255,.2)">🛍️</div>
      <div><h3>Brain Shelf</h3><p>Hand-picked books, kits and courses to go deeper — for grown-ups.</p></div>
      <span class="go" style="color:var(--grape)">Browse ›</span></button>`;
  $('daily').onclick=()=>{SFX.click();S.audience='daily';startQuiz(buildDaily(),'Daily Challenge','var(--lantern)','daily');};
  $('exped').onclick=()=>{SFX.click();startExpedition();};
  $('arcTile').onclick=()=>{SFX.click();go('arcade');};
  $('shelfTile').onclick=()=>{SFX.click();go('shelf');};
  const w=$('aud');
  [['child','🧒','For Children','Climb grade stages — Numbers, Words, Logic and Science.','var(--leaf)',GRADES.length+' grades'],
   ['adult','🧑‍💼','For Adults','Reasoning puzzles in the flavour of real professions.','var(--sky)',PROFESSIONS.length+' professions']]
  .forEach(([id,ic,name,blurb,col,meta])=>{const b=document.createElement('button');b.className='card';b.style.setProperty('--rc',col);
    b.innerHTML=`<div class="ic">${ic}</div><h3>${name}</h3><p>${blurb}</p><div class="meta">${meta} ›</div>`;
    b.onclick=()=>{SFX.click();S.audience=id;go('cats');};w.appendChild(b);});
}

// ===================== BRAIN SHELF (affiliate hub) =====================
function screenShelf(){
  sub.textContent='Brain Shelf';
  const grp=(title,keys)=>{const cards=keys.flatMap(k=>RECS[k]||[]).filter(x=>x.u&&x.u!=='#').map(recCard).join('');return cards?`<div class="shelfgroup"><div class="gh">${title}</div><div class="reclist">${cards}</div></div>`:'';};
  app.innerHTML=`<div class="hero"><h1>🛍️ Brain Shelf</h1><p>Books, kits and courses chosen to match what you're learning here. Picks are for grown-ups to choose.</p>
    <div class="disclaimer">${AFF_DISCLOSURE}</div></div>
    ${grp("For children — grown-up picks",['math','words','logic','science'])}
    ${grp("For adults — by field",['dev','doctor','lawyer','designer','engineer','teacher','nurse','founder'])}
    ${grp("Sharpen a thinking strength",['Logic','Pattern','Numbers','Verbal','Spatial','Lateral'])}`;
}

function screenCats(){ S.audience==='child'?screenLadder():screenProfessions(); }

function screenProfessions(){
  sub.textContent='Adults · pick a profession';
  app.innerHTML=`<div class="hero"><h1>The career quarter</h1><p>Each field is a ladder of stages — 10 reasoning puzzles each, harder as you climb. Clear a stage to unlock the next.</p></div><div class="cards multi" id="cats"></div>`;
  const w=$('cats');PROFESSIONS.forEach(c=>{const sc=profStageCount(c),cl=profClearedCount(c);const b=document.createElement('button');b.className='card'+(cl>0&&cl===sc?' done-sub':'');b.style.setProperty('--rc',c.color);
    b.innerHTML=`<div class="ic">${c.icon}</div><h3>${c.name}</h3><p>${c.blurb}</p><div class="meta">${cl>0?`✦ ${cl}/${sc} stage${sc>1?'s':''} cleared`:`${sc} stage${sc>1?'s':''} · ${c.questions.length} questions ›`}</div>`;
    b.onclick=()=>{SFX.click();S.profId=c.id;go('profstages');};w.appendChild(b);});
}

function screenProfStages(){const pr=PROFESSIONS.find(p=>p.id===S.profId);sub.textContent=pr.name+' · stages';
  const sc=profStageCount(pr),cl=profClearedCount(pr),ec=examStageCount(pr);
  app.innerHTML=`<div class="hero"><h1>${pr.icon} ${pr.name}</h1><p>${pr.blurb} Clear a stage (★★ or more) to unlock the next.</p>
    <div class="plvl" style="font-size:13px;margin-top:12px">Practice ✦ ${cl}/${sc} cleared<span class="xpbar" style="width:120px;height:8px"><i style="width:${sc>0?cl/sc*100:0}%"></i></span></div></div>
    <div class="stage-section-label">Practice</div>
    <div class="ladder" id="lad"></div>
    ${ec>0?'<div class="stage-section-label exam-label">Exam Prep 🎓</div><div class="ladder" id="elad"></div>':''}`;
  const w=$('lad');
  for(let i=0;i<sc;i++){const stars=stageStars(pr.id,i),open=stageUnlocked(pr,i),cleared=stageCleared(pr.id,i),current=open&&!cleared;
    const b=document.createElement('button');b.className='stage '+(open?'open ':'locked ')+(cleared?'complete lit ':'')+(current?'current':'');
    const pips=[0,1,2].map(k=>`<i class="${k<stars?'on':''}"></i>`).join('');
    const stat=cleared?`<span class="sstat done">★ ${stars}/3</span>`:open?`<span class="sstat go">${stars>0?'Improve ›':'Start ›'}</span>`:`<span class="sstat lock">Locked</span>`;
    b.innerHTML=`<div class="lnode" style="font-family:var(--disp);font-weight:700;font-size:20px;color:${open?'var(--lantern)':'#5a5183'}">${open?(cleared?'✦':(i+1)):'<span class="lock">🔒</span>'}</div>
      <div class="sbody"><div class="gr">Stage ${i+1}</div><div class="age">${open?(cleared?'Cleared — replay for 3★':'10 questions'):'Clear the stage before to open'}</div><div class="pips">${pips}</div></div>${stat}`;
    if(!open)b.setAttribute('aria-disabled','true');if(open)b.onclick=()=>{SFX.click();startStage(pr.id,i,false);};w.appendChild(b);}
  if(ec>0){const ew=$('elad');for(let i=0;i<ec;i++){const stars=examStars(pr.id,i),open=examUnlocked(pr,i),cleared=examCleared(pr.id,i),current=open&&!cleared;
    const b=document.createElement('button');b.className='stage exam-stage '+(open?'open ':'locked ')+(cleared?'complete lit ':'')+(current?'current':'');
    const pips=[0,1,2].map(k=>`<i class="${k<stars?'on':''}"></i>`).join('');
    const stat=cleared?`<span class="sstat done">★ ${stars}/3</span>`:open?`<span class="sstat go">${stars>0?'Improve ›':'Start ›'}</span>`:`<span class="sstat lock">Locked</span>`;
    b.innerHTML=`<div class="lnode" style="font-family:var(--disp);font-weight:700;font-size:20px;color:${open?'var(--berry)':'#5a5183'}">${open?(cleared?'✦':(i+1)):'<span class="lock">🔒</span>'}</div>
      <div class="sbody"><div class="gr">Exam ${i+1}</div><div class="age">${open?(cleared?'Cleared — replay for 3★':'10 exam questions'):'Complete Practice Stage 1 first'}</div><div class="pips">${pips}</div></div>${stat}`;
    if(!open)b.setAttribute('aria-disabled','true');if(open)b.onclick=()=>{SFX.click();startStage(pr.id,i,true);};ew.appendChild(b);}}
}
const lanternIcon=`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3h6v2h-1v1.5a5 5 0 0 1 2 4V17a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-5.5a5 5 0 0 1 2-4V5H9V3Z"/></svg>`;
function screenLadder(){
  sub.textContent='Children · the lantern path';
  const ts=totalStars(),done=allGradesComplete();
  const read=`<button class="daily" id="readclub" style="background:linear-gradient(110deg,rgba(180,140,255,.16),var(--night-2));border-color:rgba(180,140,255,.34)"><div class="dic" style="background:rgba(180,140,255,.2)">📖</div><div><h3>Reading Club</h3><p>Sound out words, spell, and read — every word is read aloud.</p></div><span class="go" style="color:var(--grape)">Open ›</span></button>`;
  const grad = done?`<button class="daily" id="trials" style="background:linear-gradient(110deg,rgba(255,180,61,.18),var(--night-2));border-color:rgba(255,180,61,.45)">
      <div class="dic">🎓</div><div><h3>You graduated all six grades!</h3><p>Keep your mind sharp — endless Scholar's Trials, the Arcade and the Daily await.</p></div>
      <span class="go">Trials ›</span></button>`:'';
  app.innerHTML=`<div class="hero"><h1>The lantern path</h1><p>Each grade is a stage with four subjects. Light all four to complete a grade and open the next. Chase 3 stars everywhere!</p>
      <div class="plvl" style="font-size:13px;margin-top:12px">Mastery ⭐ ${ts}/${MAX_STARS}<span class="xpbar" style="width:120px;height:8px"><i style="width:${ts/MAX_STARS*100}%"></i></span></div></div>
    ${read}
    ${grad}
    <div class="ladder" id="ladder"></div><div class="note">Light a subject (★★ or more) to fill a lantern. ${done?'Three-star every subject to become a Star Scholar!':'Everything stays open for revisiting.'}</div>`;
  const w=$('ladder');
  GRADES.forEach((g,i)=>{const unlocked=i<=P.unlocked,complete=gradeComplete(i),lit=litCount(i),current=i===P.unlocked&&!complete;
    const b=document.createElement('button');b.className='stage '+(unlocked?'open ':'locked ')+(complete?'complete lit ':(lit>0?'lit ':''))+(current?'current':'');
    const stat=complete?`<span class="sstat done">✦ Complete</span>`:unlocked?`<span class="sstat go">${lit>0?'Continue ›':'Start ›'}</span>`:`<span class="sstat lock">Locked</span>`;
    const pips=SUBJECTS.map(s=>`<i class="${subjLit(i,s.id)?'on':''}"></i>`).join('');
    b.innerHTML=`<div class="lnode">${lanternIcon}${unlocked?'':'<span class="lock">🔒</span>'}</div>
      <div class="sbody"><div class="gr">${g.name}</div><div class="age">${g.age}</div><div class="pips">${pips}</div></div>${stat}`;
    if(!unlocked)b.setAttribute('aria-disabled','true');if(unlocked)b.onclick=()=>{SFX.click();S.gradeIdx=i;go('subjects');};w.appendChild(b);});
  if(done){const tb=$('trials');if(tb)tb.onclick=()=>{SFX.click();startExpedition();};}
  const rc=$('readclub');if(rc)rc.onclick=()=>{SFX.click();go('reading');};
}

function screenSubjects(){
  const g=GRADES[S.gradeIdx];sub.textContent=g.name+' · '+g.age;
  app.innerHTML=`<div class="hero"><h1>${g.name} <span style="color:var(--muted);font-size:.6em;font-weight:500">· ${g.age}</span></h1>
    <p>Pick a subject. Light all four to complete ${g.name} and open the next grade.</p></div><div class="cards multi" id="subs"></div>`;
  const w=$('subs');SUBJECTS.forEach(s=>{const stars=subjStars(S.gradeIdx,s.id),n=g.subjects[s.id].length;
    const b=document.createElement('button');b.className='card'+(subjLit(S.gradeIdx,s.id)?' done-sub':'');b.style.setProperty('--rc',s.color);
    b.innerHTML=`<div class="ic">${s.icon}</div><h3>${s.name}</h3><p>${s.blurb}</p>
      <div class="meta">${stars>0?`${starHTML(stars)} · Replay`:`${n} questions ›`}</div>`;
    b.onclick=()=>{SFX.click();kidQuiz(S.gradeIdx,s.id);};w.appendChild(b);});
}

// ===================== QUIZ =====================
function screenQuiz(){
  const Q=S.quiz,q=Q.questions[S.qi],total=Q.questions.length;S.locked=false;
  sub.textContent=Q.title+(S.timed?' · ⏱':'');
  app.innerHTML=`
    <div class="qbar"><span class="qcount">Q ${S.qi+1}/${total}</span>
      <div class="track"><div class="fill" style="width:${(S.qi/total)*100}%"></div></div>
      <span id="comboSlot" aria-live="polite"></span></div>
    ${S.timed?`<div class="timer" id="timerWrap"><i id="timerFill"></i></div>`:''}
    <div class="qcard"><span class="qtype" style="background:${TYPE_COLOR[q.t]}">${q.t} reasoning</span>
      <p class="qtext">${q.q}</p>${q.v?`<div class="qvisual">${q.v}</div>`:''}
      <div class="opts" id="opts"></div><div id="afterwrap"></div></div>`;
  updateCombo();
  const opts=$('opts');
  q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';
    b.innerHTML=`<span class="key">${String.fromCharCode(65+i)}</span><span>${o}</span>`;b.onclick=()=>answer(i);opts.appendChild(b);});
  if(S.timed)startTimer(18000,()=>answer(-1));
}
function updateCombo(){const el=$('comboSlot');if(!el)return;
  el.innerHTML = S.streakLive>=3?`<span class="combo">🔥 ${S.streakLive} combo${S.streakLive>=5?' ×3':' ×2'}</span>`:'';
}
function startTimer(dur,onEnd){clearTimer();S.qStart=Date.now();
  timerHandle=setInterval(()=>{const el=Date.now()-S.qStart,frac=Math.max(0,1-el/dur);const bar=$('timerFill'),wrap=$('timerWrap');
    if(bar)bar.style.width=(frac*100)+'%';if(wrap)wrap.classList.toggle('warn',frac<.25);
    if(frac<=0){clearTimer();if(!S.locked)onEnd();}},120);}
function answer(i){
  if(S.locked)return;S.locked=true;clearTimer();
  const q=S.quiz.questions[S.qi],correct=i===q.a;
  let tl=null;if(S.timed){const el=Date.now()-S.qStart;tl=Math.max(0,1-el/18000);}
  S.answers.push({type:q.t,correct,tl});
  if(correct){S.streakLive++;SFX.correct();}else{S.streakLive=0;SFX.wrong();}
  updateCombo();
  [...$('opts').children].forEach((b,idx)=>{b.disabled=true;if(idx===q.a)b.classList.add('correct');if(idx===i&&!correct)b.classList.add('wrong');});
  const last=S.qi===S.quiz.questions.length-1;
  const verdict=i===-1?'⏰ Time! ':(correct?'✓ Correct':'✗ Not quite');
  $('afterwrap').innerHTML=`<div class="explain"><div class="verdict ${correct?'yes':'no'}">${verdict}</div>${q.e}</div>
    <div class="qfoot"><button class="next" id="nextBtn">${last?'See results':'Next'} ›</button></div>
    ${quizAffCard()}`;
  setTimeout(()=>{const nb=$('nextBtn');if(nb)nb.focus({preventScroll:true});},40);
  $('nextBtn').onclick=()=>{SFX.click();last?go('results'):(S.qi++,render());};
}

// ===================== EXPEDITION =====================
function startExpedition(){S.exp={n:0,lives:3,score:0,streak:0,mult:1,cur:null,lastIdx:-1,locked:false,seenRun:new Set()};go('expedition');}
function nextExp(){const pool=expPool();const E=S.exp;const cap=Math.min(6,1+Math.floor(E.n/2)),lo=Math.max(1,cap-2);
  P.seen.exp=P.seen.exp||{};
  const inWin=i=>pool[i].tier<=cap&&pool[i].tier>=lo;
  let elig=[];for(let i=0;i<pool.length;i++)if(inWin(i)&&!E.seenRun.has(i)&&!P.seen.exp[i])elig.push(i);
  if(!elig.length)for(let i=0;i<pool.length;i++)if(inWin(i)&&!E.seenRun.has(i))elig.push(i);
  if(!elig.length)for(let i=0;i<pool.length;i++)if(inWin(i))elig.push(i);
  const idx=elig[Math.floor(Math.random()*elig.length)];
  E.seenRun.add(idx);P.seen.exp[idx]=1;
  if(Object.keys(P.seen.exp).length>pool.length*0.7)P.seen.exp={};
  Store.save();E.lastIdx=idx;return {q:prepQ(pool[idx].q),tier:pool[idx].tier};}
function hearts(n){return '❤️'.repeat(n)+'🖤'.repeat(3-n);}
function screenExpedition(){
  const E=S.exp;if(!E.cur)E.cur=nextExp();E.locked=false;const q=E.cur.q;
  sub.textContent='Expedition · depth '+(E.n+1);
  app.innerHTML=`
    <div class="qbar"><span class="qcount" style="font-size:16px">${hearts(E.lives)}</span>
      <div class="track"><div class="fill" style="width:100%;background:linear-gradient(90deg,var(--sky),var(--lantern))"></div></div>
      <span class="combo" style="color:var(--sky);background:rgba(79,182,255,.14);border-color:rgba(79,182,255,.35)">★ ${E.score} ${E.mult>1?'· ×'+E.mult:''}</span></div>
    <div class="timer" id="timerWrap"><i id="timerFill"></i></div>
    <div class="qcard"><span class="qtype" style="background:${TYPE_COLOR[q.t]}">${q.t} · tier ${E.cur.tier}</span>
      <p class="qtext">${q.q}</p>${q.v?`<div class="qvisual">${q.v}</div>`:''}
      <div class="opts" id="opts"></div><div id="afterwrap"></div></div>`;
  const opts=$('opts');q.o.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';
    b.innerHTML=`<span class="key">${String.fromCharCode(65+i)}</span><span>${o}</span>`;b.onclick=()=>expAnswer(i);opts.appendChild(b);});
  startTimer(15000,()=>expAnswer(-1));
}
function expAnswer(i){
  const E=S.exp;if(E.locked)return;E.locked=true;clearTimer();
  const q=E.cur.q,correct=i===q.a;
  addMind(q.t,correct);
  if(correct){E.streak++;E.mult=E.streak>=6?3:E.streak>=3?2:1;E.score+=10*E.mult;SFX.correct();}
  else{E.lives--;E.streak=0;E.mult=1;SFX.wrong();}
  [...$('opts').children].forEach((b,idx)=>{b.disabled=true;if(idx===q.a)b.classList.add('correct');if(idx===i&&!correct)b.classList.add('wrong');});
  const dead=E.lives<=0;
  const verdict=i===-1?'⏰ Time!':(correct?`✓ +${10*E.mult}`:'✗ Lost a life');
  $('afterwrap').innerHTML=`<div class="explain"><div class="verdict ${correct?'yes':'no'}">${verdict}</div>${q.e}</div>
    <div class="qfoot"><button class="next" id="nextBtn">${dead?'See how far you got':'Keep going'} ›</button></div>`;
  $('nextBtn').onclick=()=>{SFX.click();if(dead){go('expresults');}else{E.n++;E.cur=null;render();}};
}
function screenExpResults(){
  const E=S.exp;const isBest=E.score>P.expBest;if(isBest)P.expBest=E.score;
  const xpGain=Math.floor(E.score/4);
  const prevLevel=levelFor(P.xp);P.xp+=xpGain;const newLevel=levelFor(P.xp);const leveled=newLevel>prevLevel;
  const newB=[];
  if(E.score>=100&&award('pathfinder'))newB.push('pathfinder');
  if(exploredTypes()>=6&&award('cartographer'))newB.push('cartographer');
  if(unlockedCount(newLevel)>=5&&award('collector'))newB.push('collector');
  if(P.xp>=500&&award('brainiac'))newB.push('brainiac');
  Store.save();
  sub.textContent='Expedition · results';
  app.innerHTML=`<div class="res">
    <div class="qtype" style="background:var(--sky)">Expedition</div>
    <div class="scorebig">${E.score}</div>
    <div class="restier">${isBest?'New best! 🏁':'Run complete'}</div>
    <p class="resmsg">You reached depth ${E.n+1} and built it up to ${E.score}. ${isBest?'Furthest yet!':'Best so far: '+P.expBest+'.'}</p>
    <div class="unlock" style="border-color:rgba(79,182,255,.4)">+${xpGain} XP from this run</div>
    <div class="resbtns" id="rb"></div></div>`;
  const rb=$('rb');mkBtn(rb,'🏁 Go again',true,()=>startExpedition());mkBtn(rb,'Home',false,()=>go('home'));
  setTimeout(()=>{
    if(leveled){confetti(110);SFX.level();showModal(`<div class="big">⭐</div><h2>Level ${newLevel}!</h2><p>You crossed ${newLevel*100} XP.</p><button class="btn" data-close>Nice!</button>`);}
    else if(newB.length){const b=badgeDef(newB[0]);confetti(90);SFX.star();showModal(`<div class="big">${b.ic}</div><h2>Badge unlocked!</h2><p><b>${b.n}</b> — ${b.d}</p><button class="btn" data-close>Collect</button>`);}
    else if(isBest){confetti(70);SFX.star();}
  },380);
}

// ===================== RESULTS (graded / daily) =====================
function screenResults(){
  const Q=S.quiz,total=S.answers.length,score=S.answers.filter(a=>a.correct).length,pct=Math.round(score/total*100),passed=score/total>=PASS;
  sub.textContent=Q.title+' · results';
  let base=0,streak=0,maxStreak=0,speed=0;
  S.answers.forEach(a=>{if(a.correct){base+=10;streak++;maxStreak=Math.max(maxStreak,streak);if(streak>=5)base+=10;else if(streak>=3)base+=5;if(a.tl!=null)speed+=Math.round(a.tl*8);}else streak=0;});
  let bonus=0; if(score===total)bonus+=50;
  let gradeUp=false,newStars=0,celebrateStar=false;
  const kid=S.mode==='child';
  if(kid){const key=subjKey(S.gradeIdx,S.subjId),prev=P.stars[key]||0;newStars=starsFor(score,total);
    if(newStars>prev){P.stars[key]=newStars;celebrateStar=newStars>=2;}
    if(newStars>=2&&prev<2)bonus+=20;
    if(gradeComplete(S.gradeIdx)&&S.gradeIdx===P.unlocked&&S.gradeIdx+1<GRADES.length){P.unlocked=S.gradeIdx+1;gradeUp=true;bonus+=100;}
  } else if(S.mode==='adult'){const sk=S.examMode?examKey(S.profId,S.stageIdx):(S.profId+'#'+S.stageIdx);const ns=starsFor(score,total),pv=P.prof[sk]||0;if(ns>pv)P.prof[sk]=ns;if(ns>=2&&pv<2)bonus+=30;
  } else if(S.mode==='daily'){const dk=dailyKey();if(P.daily[dk]===undefined){P.daily[dk]=score;bonus+=40;}else if(score>P.daily[dk])P.daily[dk]=score;}
  const xpGain=base+speed+bonus;
  const prevXp=P.xp;const prevLevel=levelFor(P.xp);P.xp+=xpGain;const newLevel=levelFor(P.xp);const leveled=newLevel>prevLevel;

  const byType={};S.answers.forEach(a=>{byType[a.type]=byType[a.type]||{c:0,t:0};byType[a.type].t++;if(a.correct)byType[a.type].c++;addMind(a.type,a.correct);});

  const newB=[];
  if(kid&&Object.values(P.stars).some(v=>v>=2)&&award('first_light'))newB.push('first_light');
  if(score===total&&award('perfect'))newB.push('perfect');
  if(maxStreak>=5&&award('on_fire'))newB.push('on_fire');
  if(kid&&gradeComplete(S.gradeIdx)&&award('explorer'))newB.push('explorer');
  if(kid&&allGradesComplete()&&award('graduate'))newB.push('graduate');
  if(kid&&totalStars()===MAX_STARS&&award('scholar'))newB.push('scholar');
  if(P.unlocked>=2&&award('climber'))newB.push('climber');
  if(gradeComplete(5)&&award('summit'))newB.push('summit');
  if(P.xp>=500&&award('brainiac'))newB.push('brainiac');
  if(S.mode==='adult'&&score===total&&award('pro'))newB.push('pro');
  if(exploredTypes()>=6&&award('cartographer'))newB.push('cartographer');
  if(unlockedCount(newLevel)>=5&&award('collector'))newB.push('collector');
  Store.save();
  checkXpMilestone(prevXp,P.xp);

  let tier,msg;
  if(pct===100){tier='Sharp thinking! ✦';msg=kid?'Every single one! Your brain was really paying attention.':'A clean sweep — strong, careful reasoning.';}
  else if(passed){tier='Nicely reasoned';msg=kid?'You worked out most of them. The tricky ones are how thinking grows.':'Solid reasoning. The misses below are where sharpening happens.';}
  else {tier='Good try — give it another go';msg=kid?'This one needs a little more thinking — read the explanations and try again!':'A few slipped past. The explanations above are the workout.';}

  let unlockHTML='';
  if(kid){const g=GRADES[S.gradeIdx];
    if(gradeUp)unlockHTML=`<div class="unlock">✦ ${g.name} complete — ${GRADES[S.gradeIdx+1].name} just opened!</div>`;
    else if(newStars>=2)unlockHTML=`<div class="unlock">✦ Subject lit! ${litCount(S.gradeIdx)} of ${SUBJECTS.length} done in ${g.name}.</div>`;
    else if(!passed)unlockHTML=`<div class="unlock">Get ${Math.ceil(total*PASS)} of ${total} to light this lantern.</div>`;
  } else if(S.mode==='adult'){const pr=PROFESSIONS.find(p=>p.id===S.profId);const sc=S.examMode?examStageCount(pr):profStageCount(pr);const ns=starsFor(score,total);
    const stageLabel=S.examMode?'Exam':'Stage';
    if(ns>=2&&S.stageIdx+1<sc)unlockHTML=`<div class="unlock">✦ ${stageLabel} ${S.stageIdx+1} cleared — ${stageLabel} ${S.stageIdx+2} unlocked!</div>`;
    else if(ns>=2)unlockHTML=`<div class="unlock">✦ ${pr.name} ${S.examMode?'exam':'practice'} complete!</div>`;
    else unlockHTML=`<div class="unlock">Score ${Math.ceil(total*PASS)} of ${total} to clear this ${stageLabel.toLowerCase()}.</div>`;
  }

  const recHTML = S.mode==='child' ? recBlock(S.subjId,{parent:true,heading:'Go deeper at home'})
                : S.mode==='adult' ? recBlock(S.profId,{heading:'Sharpen this skill'}) : '';
  app.innerHTML=`<div class="res">
    <div class="qtype" style="background:${Q.color||'var(--lantern)'}">${Q.title}</div>
    <div class="scorebig">${score}<small>/${total}</small></div>
    ${(kid||S.mode==='adult')?`<div style="margin:2px 0 4px">${starHTML(kid?newStars:starsFor(score,total))}</div>`:''}
    <div class="restier">${tier}</div><p class="resmsg">${msg}</p>
    <div class="unlock" style="border-color:rgba(255,180,61,.5)">+${xpGain} XP earned${speed?` · ⏱ +${speed} speed`:''}${maxStreak>=3?` · 🔥 best combo ${maxStreak}`:''}</div>
    ${unlockHTML}
    <div class="profile"><h4>Thinking profile</h4><div id="prof"></div></div>
    <div class="resnote">A fun snapshot of reasoning styles this round — see your full Mind Map on your profile.</div>
    ${recHTML}
    <div class="resbtns" id="rb"></div></div>`;
  const prof=$('prof');Object.keys(byType).forEach(t=>{const o=byType[t],p=Math.round(o.c/o.t*100);const row=document.createElement('div');row.className='prow';
    row.innerHTML=`<span class="lbl">${t}</span><div class="pbar"><i style="width:${p}%;background:${TYPE_COLOR[t]}"></i></div><span class="pct">${o.c}/${o.t}</span>`;prof.appendChild(row);});

  const rb=$('rb');
  if(kid){const g=GRADES[S.gradeIdx];const nextGradeReady=gradeComplete(S.gradeIdx)&&S.gradeIdx+1<GRADES.length&&S.gradeIdx+1<=P.unlocked;
    const nextSubj=SUBJECTS.find(s=>!subjLit(S.gradeIdx,s.id));
    if(nextGradeReady)mkBtn(rb,'Next grade ›',true,()=>{S.gradeIdx++;go('subjects');});
    else if(nextSubj)mkBtn(rb,'Next: '+nextSubj.name+' ›',true,()=>{kidQuiz(S.gradeIdx,nextSubj.id);});
    mkBtn(rb,'↺ Try again',!(nextGradeReady||nextSubj),()=>{kidQuiz(S.gradeIdx,S.subjId);});
    mkBtn(rb,g.name+' subjects',false,()=>go('subjects'));
    mkBtn(rb,'The path',false,()=>go('cats'));
  } else if(S.mode==='adult'){const pr=PROFESSIONS.find(p=>p.id===S.profId);const sc=S.examMode?examStageCount(pr):profStageCount(pr);const cleared=starsFor(score,total)>=2;const hasNext=S.stageIdx+1<sc;const ex=S.examMode;
    if(cleared&&hasNext)mkBtn(rb,(ex?'Next exam ›':'Next stage ›'),true,()=>startStage(S.profId,S.stageIdx+1,ex));
    mkBtn(rb,'↺ Retry',!(cleared&&hasNext),()=>startStage(S.profId,S.stageIdx,ex));
    mkBtn(rb,pr.name+' stages',false,()=>go('profstages'));
    mkBtn(rb,'Another profession',false,()=>go('cats'));
  } else { mkBtn(rb,'Home',true,()=>go('home')); }
  const ss=starsFor(score,total);
  const sl=S.mode==='adult'?`${Q.title} · Stage ${S.stageIdx+1}`:S.mode==='daily'?'Daily Challenge':Q.title;
  mkShareBtn(rb,`🧠 ${score}/${total} ${'⭐'.repeat(ss)} on "${sl}" — The Brain Teaser. Think you can beat it?`);

  setTimeout(()=>{
    if(leveled){confetti(110);SFX.level();showModal(`<div class="big">⭐</div><h2>Level ${newLevel}!</h2><p>You crossed ${newLevel*100} XP. Your spirit shines brighter${unlockedCount(newLevel)>unlockedCount(prevLevel)?' — a new spirit unlocked!':''}.</p><button class="btn" data-close>Nice!</button>`);}
    else if(newB.length){const b=badgeDef(newB[0]);confetti(90);SFX.star();showModal(`<div class="big">${b.ic}</div><h2>Badge unlocked!</h2><p><b>${b.n}</b> — ${b.d}${newB.length>1?`<br><span style="color:var(--muted)">+${newB.length-1} more on your shelf</span>`:''}</p><button class="btn" data-close>Collect</button>`);}
    else if(gradeUp){confetti(110);SFX.level();showModal(`<div class="big">🏮</div><h2>${GRADES[S.gradeIdx].name} complete!</h2><p>The next grade just lit up on the path.</p><button class="btn" data-close>Onward ›</button>`);}
    else if(celebrateStar){SFX.star();}
  },420);
}
const XP_RATE=2;// 1 XP = ₦2 in course credits
const xpToCredits=xp=>`₦${(xp*XP_RATE).toLocaleString()}`;
const XP_MILESTONES=[500,1000,2500,5000];
function checkXpMilestone(prevXp,newXp){
  P.milestones=P.milestones||{};
  const hit=XP_MILESTONES.find(m=>prevXp<m&&newXp>=m&&!P.milestones[m]);
  if(!hit)return;
  P.milestones[hit]=true;Store.save();
  const credits=xpToCredits(hit);
  setTimeout(()=>showModal(`<div class="big">💰</div><h2>₦ Credits Unlocked!</h2><p>Your <b>${hit.toLocaleString()} XP</b> is worth <b>${credits} in course credits</b> on Udemy!</p><p style="font-size:13px;color:var(--muted)">Redeem on our Brain Shelf — affiliate links help keep The Brain Teaser free.</p><div class="resbtns"><button class="btn" onclick="window.open('https://www.udemy.com/courses/search/?q=reasoning','_blank')">Redeem credits →</button><button class="btn ghost" data-close>Later</button></div>`),600);
}
function mkBtn(w,label,primary,fn){const b=document.createElement('button');b.className='btn'+(primary?'':' ghost');b.textContent=label;b.onclick=()=>{SFX.click();fn();};w.appendChild(b);}
function shareResult(t){if(navigator.share){navigator.share({title:'The Brain Teaser',text:t}).catch(()=>{});}else{navigator.clipboard.writeText(t).then(()=>toast('📋 Copied to clipboard!')).catch(()=>toast('Could not copy'));}}
function mkShareBtn(w,text){const b=document.createElement('button');b.className='btn ghost share-btn';b.setAttribute('aria-label','Share your result');b.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share result';b.onclick=()=>{SFX.click();shareResult(text);};w.appendChild(b);}

// ===================== BRAIN ARCADE =====================
let arcTimers=[];
function clearArc(){arcTimers.forEach(t=>{clearTimeout(t);clearInterval(t);});arcTimers=[];}
const aT=(fn,ms)=>{const id=setTimeout(fn,ms);arcTimers.push(id);return id;};
const aI=(fn,ms)=>{const id=setInterval(fn,ms);arcTimers.push(id);return id;};
const ARCADE=[
  {id:'tap',name:'Quick Tap',icon:'⚡',color:'var(--lantern)',blurb:'Spot the answer and tap fast — a 30-second blitz.'},
  {id:'match',name:'Memory Match',icon:'🃏',color:'var(--sky)',blurb:'Flip cards, find the pairs, remember where they hide.'},
  {id:'simon',name:'Echo',icon:'🎵',color:'var(--berry)',blurb:'Watch the pattern, then repeat it. It grows each round.'},
  {id:'hunt',name:'Number Hunt',icon:'🔎',color:'var(--leaf)',blurb:'Tap 1 to 9 in order, as fast as you can.'},
];
function arcHUD(label,right){return `<div class="qbar"><span class="qcount">${label}</span><div class="track"><div class="fill" id="arcFill" style="width:100%"></div></div><span class="combo" id="arcRight" style="color:var(--sky);background:rgba(79,182,255,.14);border-color:rgba(79,182,255,.35)">${right||''}</span></div>`;}
function screenArcade(){sub.textContent='Brain Arcade';
  app.innerHTML=`<div class="hero"><h1>🕹️ Brain Arcade</h1><p>Fast, playful puzzles for any age — memory, speed and focus. Beat your best score.</p></div><div class="cards multi" id="arc"></div>`;
  const w=$('arc');ARCADE.forEach(g=>{const best=P.arcade[g.id];const b=document.createElement('button');b.className='card';b.style.setProperty('--rc',g.color);
    b.innerHTML=`<div class="ic">${g.icon}</div><h3>${g.name}</h3><p>${g.blurb}</p><div class="meta">${best?('Best '+best+' ›'):'Play ›'}</div>`;
    b.onclick=()=>{SFX.click();startArc(g.id);};w.appendChild(b);});}
function startArc(id){S.arc={game:id};go('arcplay');}
function screenArcPlay(){const g=S.arc.game;if(g==='tap')playTap();else if(g==='match')playMatch();else if(g==='simon')playSimon();else if(g==='hunt')playHunt();}

// --- Quick Tap ---
function playTap(){const A=S.arc;A.score=0;A.left=30;
  app.innerHTML=arcHUD('⚡ Quick Tap','★ 0')+`<div class="qcard"><p class="qtext" id="tapPrompt" style="text-align:center"></p><div class="opts" id="tapOpts" style="margin-top:14px"></div></div>`;
  nextTap();
  A.tm=aI(()=>{A.left-=0.1;const f=Math.max(0,A.left/30);const bar=$('arcFill');if(bar)bar.style.width=(f*100)+'%';
    if(A.left<=0){clearArc();finishArc('tap','Quick Tap','var(--lantern)',Math.round(A.score),A.score+' points');}},100);}
function nextTap(){const A=S.arc;const t=['big','small','sum','odd'][Math.floor(Math.random()*4)];let prompt,opts,correct;
  if(t==='big'||t==='small'){const ns=[];while(ns.length<4){const v=1+Math.floor(Math.random()*99);if(!ns.includes(v))ns.push(v);}correct=t==='big'?Math.max(...ns):Math.min(...ns);prompt=t==='big'?'Tap the BIGGEST number':'Tap the SMALLEST number';opts=ns.map(v=>({label:String(v),val:v}));}
  else if(t==='sum'){const a=2+Math.floor(Math.random()*9),b=2+Math.floor(Math.random()*9);correct=a+b;prompt=`What is ${a} + ${b}?`;const set=new Set([correct]);while(set.size<4){const d=correct+(Math.floor(Math.random()*9)-4);if(d>0)set.add(d);}opts=shuffle([...set].map(v=>({label:String(v),val:v})));}
  else{const cols=['var(--leaf)','var(--sky)','var(--berry)','var(--lantern)','var(--grape)'];const base=cols[Math.floor(Math.random()*cols.length)];let other=base;while(other===base)other=cols[Math.floor(Math.random()*cols.length)];const odd=Math.floor(Math.random()*4);prompt='Tap the DIFFERENT colour';opts=[0,1,2,3].map(i=>({color:i===odd?other:base,val:i}));correct=odd;}
  A.round={correct};
  $('tapPrompt').textContent=prompt;const w=$('tapOpts');w.innerHTML='';
  opts.forEach(o=>{const b=document.createElement('button');b.className='opt';b.style.justifyContent='center';
    b.innerHTML=o.color!==undefined?`<span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:${o.color}"></span>`:`<span style="font-size:20px;font-weight:700">${o.label}</span>`;
    b.onclick=()=>tapAns(o.val);w.appendChild(b);});}
function tapAns(v){const A=S.arc;if(v===A.round.correct){A.score+=10;SFX.correct();const r=$('arcRight');if(r)r.textContent='★ '+A.score;}else{SFX.wrong();A.left=Math.max(0.1,A.left-2);}nextTap();}

// --- Memory Match ---
function playMatch(){const A=S.arc;const set=['🦊','🐢','🦉','🐝','🦋','🐙'];
  A.deck=shuffle(set.concat(set).map(e=>({e,flipped:false,matched:false})));A.first=null;A.moves=0;A.lock=false;A.done=0;A.start=Date.now();
  app.innerHTML=arcHUD('🃏 Memory Match','moves 0')+`<div class="qcard"><div id="matchGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px"></div></div>`;
  drawMatch();}
function drawMatch(){const A=S.arc;const g=$('matchGrid');if(!g)return;g.innerHTML='';
  A.deck.forEach((c,idx)=>{const b=document.createElement('button');b.className='matchcard'+((c.flipped||c.matched)?' up':'')+(c.matched?' done':'');
    b.textContent=(c.flipped||c.matched)?c.e:'';b.onclick=()=>flipCard(idx);g.appendChild(b);});
  const r=$('arcRight');if(r)r.textContent='moves '+A.moves;}
function flipCard(idx){const A=S.arc;const c=A.deck[idx];if(A.lock||c.matched||c.flipped)return;c.flipped=true;
  if(A.first===null){A.first=idx;drawMatch();return;}
  A.moves++;const fr=A.deck[A.first];drawMatch();
  if(fr.e===c.e){fr.matched=c.matched=true;A.first=null;A.done+=2;SFX.correct();drawMatch();
    if(A.done===A.deck.length){const sec=Math.round((Date.now()-A.start)/1000);finishArc('match','Memory Match','var(--sky)',Math.max(100,1200-A.moves*15-sec*4),A.moves+' moves · '+sec+'s');}}
  else{A.lock=true;SFX.wrong();aT(()=>{fr.flipped=false;c.flipped=false;A.first=null;A.lock=false;drawMatch();},750);}}

// --- Echo (Simon) ---
const SIMON_PADS=[{c:'var(--leaf)',f:330},{c:'var(--sky)',f:440},{c:'var(--berry)',f:550},{c:'var(--lantern)',f:660}];
function playSimon(){const A=S.arc;A.seq=[];A.input=0;A.phase='show';
  app.innerHTML=arcHUD('🎵 Echo','round 0')+`<div class="qcard"><div id="simonGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px;margin:0 auto"></div><p id="simonMsg" style="text-align:center;color:var(--muted);margin-top:14px">Watch the pattern…</p></div>`;
  const g=$('simonGrid');SIMON_PADS.forEach((p,i)=>{const b=document.createElement('button');b.className='simonpad';b.id='pad'+i;b.style.background=p.c;b.onclick=()=>simonTap(i);g.appendChild(b);});
  nextSimon();}
function flashPad(i,cb){const el=$('pad'+i);if(el){el.classList.add('lit');tone(SIMON_PADS[i].f,0,.3,'sine',.2);}aT(()=>{if(el)el.classList.remove('lit');cb&&cb();},340);}
function nextSimon(){const A=S.arc;A.seq.push(Math.floor(Math.random()*4));A.input=0;A.phase='show';
  const r=$('arcRight');if(r)r.textContent='round '+A.seq.length;const m=$('simonMsg');if(m)m.textContent='Watch the pattern…';
  let k=0;const step=()=>{if(k>=A.seq.length){A.phase='input';const mm=$('simonMsg');if(mm)mm.textContent='Your turn!';return;}flashPad(A.seq[k],()=>{k++;aT(step,170);});};aT(step,500);}
function simonTap(i){const A=S.arc;if(A.phase!=='input')return;flashPad(i);
  if(i===A.seq[A.input]){A.input++;if(A.input===A.seq.length){A.phase='wait';const m=$('simonMsg');if(m)m.textContent='Nice!';aT(nextSimon,650);}}
  else{SFX.wrong();finishArc('simon','Echo','var(--berry)',Math.max(0,(A.seq.length-1)*20),'reached round '+A.seq.length);}}

// --- Number Hunt ---
function playHunt(){const A=S.arc;A.nums=shuffle([1,2,3,4,5,6,7,8,9]);A.next=1;A.penalty=0;A.start=Date.now();
  app.innerHTML=arcHUD('🔎 Number Hunt','next: 1')+`<div class="qcard"><p style="text-align:center;color:var(--muted);margin:0 0 4px">Tap 1 → 9 in order, fast!</p><div id="huntGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:280px;margin:10px auto 0"></div></div>`;
  drawHunt();}
function drawHunt(){const A=S.arc;const g=$('huntGrid');if(!g)return;g.innerHTML='';
  A.nums.forEach(n=>{const b=document.createElement('button');b.className='huntcell'+(n<A.next?' done':'');b.textContent=n;if(n>=A.next)b.onclick=()=>huntTap(n);g.appendChild(b);});
  const r=$('arcRight');if(r)r.textContent=A.next<=9?('next: '+A.next):'done!';}
function huntTap(n){const A=S.arc;if(n===A.next){A.next++;SFX.click();if(A.next>9){const sec=Math.round((Date.now()-A.start)/1000)+A.penalty;drawHunt();finishArc('hunt','Number Hunt','var(--leaf)',Math.max(100,1000-sec*25),sec+'s');return;}drawHunt();}else{SFX.wrong();A.penalty+=2;}}

// --- shared arcade result ---
function finishArc(id,label,color,score,detail){clearArc();
  const best=P.arcade[id]||0;const isBest=score>best;if(isBest)P.arcade[id]=score;
  const xp=Math.max(5,Math.floor(score/15));const prev=levelFor(P.xp);P.xp+=xp;const nl=levelFor(P.xp);
  const newB=[];if(score>=400&&award('arcadia'))newB.push('arcadia');if(P.xp>=500&&award('brainiac'))newB.push('brainiac');
  Store.save();
  S.arcResult={id,label,color,score,detail,xp,isBest,leveled:nl>prev,newLevel:nl,newB,best:P.arcade[id]};
  go('arcresult');}
function screenArcResult(){const R=S.arcResult;sub.textContent=R.label+' · results';
  app.innerHTML=`<div class="res"><div class="qtype" style="background:${R.color}">${R.label}</div>
    <div class="scorebig">${R.score}</div><div class="restier">${R.isBest?'New best! ✦':'Nice run'}</div>
    <p class="resmsg">${R.detail}. ${R.isBest?'Your best yet!':'Best: '+R.best+'.'}</p>
    <div class="unlock" style="border-color:${R.color}">+${R.xp} XP</div>
    <div class="resbtns" id="rb"></div></div>`;
  const rb=$('rb');mkBtn(rb,'↺ Play again',true,()=>startArc(R.id));mkBtn(rb,'Brain Arcade',false,()=>go('arcade'));mkBtn(rb,'Home',false,()=>go('home'));
  setTimeout(()=>{if(R.leveled){confetti(110);SFX.level();showModal(`<div class="big">⭐</div><h2>Level ${R.newLevel}!</h2><p>You crossed ${R.newLevel*100} XP.</p><button class="btn" data-close>Nice!</button>`);}
    else if(R.newB.length){const b=badgeDef(R.newB[0]);confetti(90);SFX.star();showModal(`<div class="big">${b.ic}</div><h2>Badge unlocked!</h2><p><b>${b.n}</b> — ${b.d}</p><button class="btn" data-close>Collect</button>`);}
    else if(R.isBest){confetti(70);SFX.star();}},360);}

// ===================== READING CLUB =====================
function speak(text,rate){try{if(!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=rate||0.85;u.pitch=1.1;speechSynthesis.speak(u);}catch(e){}}
function readHUD(label,i,total){return `<div class="qbar"><span class="qcount">${label} · ${i+1}/${total}</span><div class="track"><div class="fill" style="width:${i/total*100}%"></div></div></div>`;}

let readLevel=1;
function screenReading(){sub.textContent='Reading Club';
  app.innerHTML=`<div class="hero"><h1>📖 Reading Club</h1><p>Learn to read and spell — every word is read aloud, with a picture to help. Tap 🔊 any time to hear a word again.</p>
    <div class="modes" id="lvl" style="margin-top:12px">
      <button class="${readLevel===1?'on':''}">Starter</button>
      <button class="${readLevel===2?'on':''}">Bigger</button>
      <button class="${readLevel===3?'on':''}">Challenge</button>
    </div></div>
    <div class="cards multi" id="rc"></div>`;
  const lv=$('lvl');
  [...lv.children].forEach((btn,i)=>{btn.onclick=()=>{readLevel=i+1;[...lv.children].forEach(c=>c.classList.remove('on'));btn.classList.add('on');};});
  const defs=[['spell','🔤','Spell It','See the picture, hear the word, build it letter by letter.','var(--sky)'],
    ['first','🅰️','First Sound','Which letter does the word start with?','var(--lantern)'],
    ['match','👀','Read & Find','Read the word and tap the matching picture.','var(--grape)']];
  const w=$('rc');defs.forEach(([id,ic,name,blurb,col])=>{const b=document.createElement('button');b.className='card';b.style.setProperty('--rc',col);
    b.innerHTML=`<div class="ic">${ic}</div><h3>${name}</h3><p>${blurb}</p><div class="meta">Play ›</div>`;b.onclick=()=>{SFX.click();startReading(id);};w.appendChild(b);});
  if(!('speechSynthesis'in window)){const n=document.createElement('div');n.className='note';n.textContent='Tip: turn on your device sound to hear each word.';app.appendChild(n);}
}
function startReading(mode){const pool=WORDS.filter(x=>x.lv===readLevel);const words=shuffle(pool).slice(0,6);
  S.read={mode,level:readLevel,words,i:0,score:0,slots:[],slotTile:[],tiles:[]};go('readplay');}
function screenReadPlay(){const m=S.read.mode;if(m==='spell')playSpell();else if(m==='first')playFirst();else playReadMatch();}
function nextRead(){const R=S.read;R.i++;if(R.i>=R.words.length)finishReading(R.score,R.words.length,R.mode);else screenReadPlay();}

// Spell It
function playSpell(){const R=S.read;const word=R.words[R.i];R.target=word.w.toUpperCase();
  R.slots=Array(R.target.length).fill('');R.slotTile=Array(R.target.length).fill(null);
  let letters=R.target.split('');if(R.level>1){for(let k=0;k<2;k++)letters.push(String.fromCharCode(65+Math.floor(Math.random()*26)));}
  R.tiles=shuffle(letters).map((ch,idx)=>({ch,used:false,id:idx}));
  app.innerHTML=readHUD('Spell it',R.i,R.words.length)+`<div class="qcard">
    <div class="bigemoji">${word.e}</div>
    <div style="text-align:center"><button class="spk" id="spk">🔊</button></div>
    <div class="slots" id="slots"></div><div class="tiles" id="tiles"></div>
    <div class="qfoot" style="justify-content:center"><button class="btn ghost" id="back">⌫ Undo</button></div>
    <div id="rmsg" style="text-align:center;margin-top:10px;min-height:24px;font-family:var(--disp);font-weight:700;font-size:18px"></div></div>`;
  drawSpell();speak(word.w);
  $('spk').onclick=()=>speak(word.w);
  $('back').onclick=()=>{const R=S.read;for(let i=R.slots.length-1;i>=0;i--){if(R.slots[i]){const tid=R.slotTile[i];R.slots[i]='';if(tid!=null&&R.tiles[tid])R.tiles[tid].used=false;R.slotTile[i]=null;break;}}drawSpell();};
}
function drawSpell(){const R=S.read;const sl=$('slots');if(!sl)return;sl.innerHTML='';
  R.slots.forEach(c=>{const d=document.createElement('div');d.className='slot2'+(c?' filled':'');d.textContent=c;sl.appendChild(d);});
  const tl=$('tiles');tl.innerHTML='';
  R.tiles.forEach(t=>{const b=document.createElement('button');b.className='tile2'+(t.used?' used':'');b.textContent=t.ch;b.onclick=()=>tapTile(t.id);tl.appendChild(b);});}
function tapTile(id){const R=S.read;const t=R.tiles[id];if(t.used)return;const slot=R.slots.findIndex(x=>x==='');if(slot<0)return;
  R.slots[slot]=t.ch;R.slotTile[slot]=id;t.used=true;SFX.click();drawSpell();
  if(R.slots.every(x=>x!=='')){const guess=R.slots.join(''),word=R.words[R.i];const msg=$('rmsg');
    if(guess===R.target){SFX.correct();if(msg){msg.textContent='✓ '+word.w.toUpperCase();msg.style.color='var(--leaf)';}speak(word.w);R.score++;aT(nextRead,1150);}
    else{SFX.wrong();if(msg){msg.textContent='Try again';msg.style.color='var(--bad)';}
      aT(()=>{R.slots=Array(R.target.length).fill('');R.slotTile=Array(R.target.length).fill(null);R.tiles.forEach(x=>x.used=false);if($('rmsg'))$('rmsg').textContent='';drawSpell();},900);}}
}
// First Sound
function playFirst(){const R=S.read;const word=R.words[R.i];const first=word.w[0].toUpperCase();
  const set=new Set([first]);while(set.size<4)set.add(String.fromCharCode(65+Math.floor(Math.random()*26)));
  const opts=shuffle([...set]);
  app.innerHTML=readHUD('First sound',R.i,R.words.length)+`<div class="qcard">
    <div class="bigemoji">${word.e}</div>
    <p class="qtext" style="text-align:center;font-size:18px">Which letter does it start with?</p>
    <div style="text-align:center;margin-bottom:8px"><button class="spk" id="spk">🔊</button></div>
    <div class="opts" id="opts"></div></div>`;
  const w=$('opts');opts.forEach(L=>{const b=document.createElement('button');b.className='opt letteropt';b.textContent=L;b.onclick=()=>firstAns(L,first,word,b);w.appendChild(b);});
  $('spk').onclick=()=>speak(word.w);speak(word.w);
}
function firstAns(L,first,word,btn){const R=S.read;if(L===first){SFX.correct();btn.classList.add('correct');speak(word.w);R.score++;aT(nextRead,900);}
  else{SFX.wrong();btn.classList.add('wrong');btn.disabled=true;speak(word.w);}}
// Read & Find
function playReadMatch(){const R=S.read;const word=R.words[R.i];
  const others=shuffle(WORDS.filter(x=>x.w!==word.w)).slice(0,3);const opts=shuffle([word,...others]);
  app.innerHTML=readHUD('Read & find',R.i,R.words.length)+`<div class="qcard">
    <p style="text-align:center;color:var(--muted);margin:0 0 6px">Read the word, then tap its picture</p>
    <div class="bigword">${word.w}</div>
    <div style="text-align:center;margin:10px 0"><button class="spk" id="spk">🔊</button></div>
    <div class="picopts" id="pic"></div></div>`;
  const w=$('pic');opts.forEach(o=>{const b=document.createElement('button');b.className='picopt';b.textContent=o.e;b.onclick=()=>matchAns(o,word,b);w.appendChild(b);});
  $('spk').onclick=()=>speak(word.w);
}
function matchAns(o,word,btn){const R=S.read;if(o.w===word.w){SFX.correct();speak(word.w);R.score++;aT(nextRead,800);}
  else{SFX.wrong();btn.style.opacity='.4';btn.disabled=true;}}
// result
function finishReading(score,total,mode){const xp=score*5;const prev=levelFor(P.xp);P.xp+=xp;const nl=levelFor(P.xp);
  const newB=[];if(award('reader'))newB.push('reader');if(P.xp>=500&&award('brainiac'))newB.push('brainiac');Store.save();
  S.readResult={score,total,xp,mode,leveled:nl>prev,newLevel:nl,newB};go('readresult');}
function screenReadResult(){const R=S.readResult;sub.textContent='Reading Club · results';
  const verb=R.mode==='spell'?'spelled':'read';
  app.innerHTML=`<div class="res"><div class="qtype" style="background:var(--grape)">Reading Club</div>
    <div class="scorebig">${R.score}<small>/${R.total}</small></div>
    <div class="restier">Great reading! 📖</div>
    <p class="resmsg">You ${verb} ${R.score} of ${R.total} words. Every word you sound out makes reading easier.</p>
    <div class="unlock" style="border-color:var(--grape)">+${R.xp} XP</div>
    <div class="resbtns" id="rb"></div></div>`;
  const rb=$('rb');mkBtn(rb,'↺ Play again',true,()=>startReading(R.mode));mkBtn(rb,'Reading Club',false,()=>go('reading'));mkBtn(rb,'The path',false,()=>{S.audience='child';go('cats');});
  setTimeout(()=>{if(R.leveled){confetti(110);SFX.level();showModal(`<div class="big">⭐</div><h2>Level ${R.newLevel}!</h2><p>You crossed ${R.newLevel*100} XP.</p><button class="btn" data-close>Nice!</button>`);}
    else if(R.newB.length){const b=badgeDef(R.newB[0]);confetti(90);SFX.star();showModal(`<div class="big">${b.ic}</div><h2>Badge unlocked!</h2><p><b>${b.n}</b> — ${b.d}</p><button class="btn" data-close>Collect</button>`);}
    else{confetti(60);SFX.star();}},360);
}

// ===================== BOOT =====================
(async()=>{
  const saved=await Store.load();
  if(saved)P=Object.assign(defaultProfile(),saved,{settings:Object.assign({sound:true,timed:false},saved.settings||{}),mind:saved.mind||{},seen:saved.seen||{},arcade:saved.arcade||{}});
  if(!P.name)go('welcome');else go('home');
})();
