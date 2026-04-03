// ════════════════════════════════════════════════════════════════
//  L&D Hub — greytHR  |  app.js  |  v2.0
//  Role-based login · Proper role views · Dynamic data
// ════════════════════════════════════════════════════════════════

const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

// ── USER DATABASE ─────────────────────────────────────────────────
// Add your real team emails below.
// role: 'admin' | 'manager' | 'participant'
// batchIds: which batches they can see
const USERS = {
  'priya@greytip.com':    { role:'admin',       name:'Priya K.',    dept:'L&D',              batchIds:['A','B','C','D'] },
  'manager1@greytip.com': { role:'manager',     name:'Srinivas R.', dept:'Sales',            batchIds:['A'] },
  'manager2@greytip.com': { role:'manager',     name:'Deepa M.',    dept:'Customer Success', batchIds:['B'] },
  'manager3@greytip.com': { role:'manager',     name:'Karthik V.',  dept:'Support',          batchIds:['C'] },
  'manager4@greytip.com': { role:'manager',     name:'Anand S.',    dept:'Implementation',   batchIds:['D'] },
  'ravi@greytip.com':     { role:'participant', name:'Ravi S.',     dept:'Sales',            batchIds:['A'] },
  'karan@greytip.com':    { role:'participant', name:'Karan P.',    dept:'Sales',            batchIds:['A'] },
  'anjali@greytip.com':   { role:'participant', name:'Anjali N.',   dept:'CS',               batchIds:['B'] },
  'deepak@greytip.com':   { role:'participant', name:'Deepak R.',   dept:'CS',               batchIds:['B'] },
  'meera@greytip.com':    { role:'participant', name:'Meera S.',    dept:'Support',          batchIds:['C'] },
  'vikram@greytip.com':   { role:'participant', name:'Vikram B.',   dept:'Implementation',   batchIds:['D'] },
};

// ── MASTER DATA ───────────────────────────────────────────────────
const BATCHES = [
  { id:'A', name:'Sales Team — Batch A',     dept:'Sales',            program:'Enterprise Sales Mastery', participants:14, progress:72, status:'In Progress', color:'#8b5cf6', icon:'🎯', materials:4, assignments:2, attendance:88, feedback:'12/14' },
  { id:'B', name:'CS Team — Batch B',        dept:'Customer Success', program:'CS Excellence Program',    participants:12, progress:55, status:'In Progress', color:'#10b981', icon:'🤝', materials:3, assignments:1, attendance:83, feedback:'12/12' },
  { id:'C', name:'Support — Batch C',        dept:'Support',          program:'Communication Skills',     participants:18, progress:38, status:'Active',      color:'#3b82f6', icon:'📞', materials:2, assignments:3, attendance:76, feedback:'8/18'  },
  { id:'D', name:'Implementation — Batch D', dept:'Implementation',   program:'MEDDIC Fundamentals',      participants:14, progress:90, status:'Completing',  color:'#f97316', icon:'⚙️', materials:5, assignments:2, attendance:95, feedback:'14/14' },
];

const PARTICIPANTS = {
  A: [{n:'Ravi S.',dept:'Sales'},{n:'Karan P.',dept:'Sales'},{n:'Arjun M.',dept:'Sales'},{n:'Preethi V.',dept:'Sales'},{n:'Vikram T.',dept:'Sales'},{n:'Neha R.',dept:'Sales'}],
  B: [{n:'Anjali N.',dept:'CS'},{n:'Deepak R.',dept:'CS'},{n:'Shalini K.',dept:'CS'},{n:'Divya P.',dept:'CS'}],
  C: [{n:'Meera S.',dept:'Support'},{n:'Neha J.',dept:'Support'},{n:'Kavitha R.',dept:'Support'},{n:'Rohit T.',dept:'Support'},{n:'Aditya S.',dept:'Support'},{n:'Pooja M.',dept:'Support'}],
  D: [{n:'Vikram B.',dept:'Impl.'},{n:'Suresh L.',dept:'Impl.'},{n:'Harish G.',dept:'Impl.'},{n:'Lakshmi N.',dept:'Impl.'}],
};

const ASSESS_DATA = [
  { title:'Session 3 — Objection Handling', batch:'Sales Batch A',   dept:'Sales',  batchId:'A', qs:12, resp:11, total:14, status:'Open'   },
  { title:'Mid-program Check-in',           batch:'CS Batch B',      dept:'CS',     batchId:'B', qs:8,  resp:12, total:12, status:'Closed' },
  { title:'Communication Pre-assessment',   batch:'Support Batch C', dept:'Support',batchId:'C', qs:10, resp:6,  total:18, status:'Open'   },
  { title:'MEDDIC Final Self Assessment',   batch:'Impl. Batch D',   dept:'Impl.',  batchId:'D', qs:15, resp:14, total:14, status:'Closed' },
];

const MATERIALS_DATA = [
  { icon:'📄', name:'MEDDIC Framework Reference Guide',  batch:'Impl. Batch D',   batchId:'D',   type:'Guide',    size:'1.2 MB', date:'Apr 1'  },
  { icon:'📊', name:'Enterprise Sales — Module 1 Deck', batch:'Sales Batch A',   batchId:'A',   type:'Slides',   size:'3.4 MB', date:'Mar 28' },
  { icon:'📝', name:'Participant Handout — Session 2',   batch:'CS Batch B',      batchId:'B',   type:'Handout',  size:'0.8 MB', date:'Mar 25' },
  { icon:'📋', name:'Case Study Discussion Template',    batch:'All Batches',     batchId:'ALL', type:'Template', size:'0.5 MB', date:'Mar 20' },
  { icon:'🎬', name:'Comm. Skills — Session Recording',  batch:'Support Batch C', batchId:'C',   type:'Video',    size:'Link',   date:'Apr 1'  },
];

const ASSIGN_DATA = [
  { id:'AS1', title:'Assignment 1 — Discovery Questions', batch:'Sales Batch A',   batchId:'A', due:'Mar 20', submitted:14, total:14, status:'Closed' },
  { id:'AS2', title:'Assignment 2 — Objection Handling',  batch:'Sales Batch A',   batchId:'A', due:'Apr 5',  submitted:7,  total:14, status:'Open'   },
  { id:'AS3', title:'Case Study — greytHR Deal Scenario', batch:'Support Batch C', batchId:'C', due:'Apr 10', submitted:4,  total:18, status:'Open'   },
  { id:'AS4', title:'MEDDIC Role-Play Reflection',        batch:'Impl. Batch D',   batchId:'D', due:'Apr 3',  submitted:14, total:14, status:'Closed' },
];

const FEEDBACK_RESPONSES = [
  { av:'AN', bg:'#eff6ff', tc:'#3b82f6', name:'Anjali N.', batch:'CS Batch B',    batchId:'B', rating:5, rel:'Excellent' },
  { av:'RS', bg:'#ecfdf5', tc:'#10b981', name:'Ravi S.',   batch:'Sales Batch A', batchId:'A', rating:4, rel:'Good'      },
  { av:'KP', bg:'#fdf2f8', tc:'#ec4899', name:'Karan P.',  batch:'Sales Batch A', batchId:'A', rating:5, rel:'Excellent' },
  { av:'MS', bg:'#fff7ed', tc:'#f97316', name:'Meera S.',  batch:'CS Batch B',    batchId:'B', rating:3, rel:'Average'   },
  { av:'DV', bg:'#f5f3ff', tc:'#8b5cf6', name:'Deepak V.',batch:'Impl. Batch D',  batchId:'D', rating:5, rel:'Excellent' },
];

const REPORT_FOLDERS = [
  { name:'Sales Batch A — Reports',           batchId:'A',   status:'Completed',   count:4, updated:'Apr 1',  tags:['Attend Report','Feedback Summary','Assessment Results','Full Summary'] },
  { name:'CS Batch B — Reports',              batchId:'B',   status:'In Progress', count:2, updated:'Mar 30', tags:['Attend Report','Assessment Results'] },
  { name:'Support Batch C — Reports',         batchId:'C',   status:'In Progress', count:1, updated:'Mar 28', tags:['Feedback Summary'] },
  { name:'Implementation Batch D — Final',    batchId:'D',   status:'Completed',   count:5, updated:'Apr 1',  tags:['Full Program Report','Attend Report','Assessment Results','Feedback','Certification'] },
  { name:'Department-wise Summary — Q1 2026', batchId:'ALL', status:'Master',      count:4, updated:'Apr 1',  tags:['Sales','CS','Support','Impl.'] },
];

const ASSESS_QUESTIONS = [
  'Product / service knowledge','Communication clarity','Objection handling','Active listening',
  'Customer empathy','Discovery questioning','Pipeline management','Team collaboration',
];

// ── STATE ─────────────────────────────────────────────────────────
let currentUser = null;
let attState    = [];
let fbStarVal   = 0;

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', showLogin);

// ── HELPERS ───────────────────────────────────────────────────────
const isAdmin = () => currentUser?.role === 'admin';
const isMgr   = () => currentUser?.role === 'manager';
const isPart  = () => currentUser?.role === 'participant';
const myBatches = () => isAdmin() ? BATCHES : BATCHES.filter(b => currentUser.batchIds.includes(b.id));
const sBadge  = s => s==='Completing'?'bg':s==='In Progress'?'bp':s==='Active'?'bb':'bg';
const stars   = n => '★'.repeat(n)+'☆'.repeat(5-n);

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2600);
}

// ════════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════════
function showLogin() {
  document.body.innerHTML = `
  <div style="min-height:100vh;background:#f5f6fa;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif">
    <div style="background:#fff;border:1px solid #e4e6ef;border-radius:16px;padding:40px 36px;width:100%;max-width:420px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
        <div style="width:42px;height:42px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px">L&D</div>
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:600">L&D Hub</div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">greytHR · Learning Portal</div>
        </div>
      </div>
      <div style="font-size:22px;font-weight:600;margin-bottom:6px;font-family:'Playfair Display',serif">Welcome back 👋</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:24px">Enter your greytHR email to continue</div>
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px">Email address</label>
      <input id="login-email" type="email" placeholder="yourname@greytip.com"
        style="width:100%;padding:10px 13px;border:1px solid #e4e6ef;border-radius:8px;font-size:14px;outline:none;margin-bottom:12px;font-family:'DM Sans',sans-serif"
        onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e4e6ef'"
        onkeydown="if(event.key==='Enter')doLogin()"/>
      <div id="login-err" style="display:none;font-size:12px;color:#ef4444;margin-bottom:12px;padding:8px 12px;background:#fef2f2;border-radius:6px"></div>
      <button onclick="doLogin()" style="width:100%;padding:11px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif">Continue →</button>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e4e6ef;font-size:12px;color:#6b7280;background:#f9fafb;border-radius:8px;padding:14px;margin-top:16px">
        <div style="font-weight:500;color:#374151;margin-bottom:8px">Try these demo emails:</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <span onclick="document.getElementById('login-email').value='priya@greytip.com'" style="cursor:pointer;color:#3b82f6">priya@greytip.com <span style="color:#6b7280">— Admin (sees everything)</span></span>
          <span onclick="document.getElementById('login-email').value='manager1@greytip.com'" style="cursor:pointer;color:#3b82f6">manager1@greytip.com <span style="color:#6b7280">— Manager (Sales team only)</span></span>
          <span onclick="document.getElementById('login-email').value='ravi@greytip.com'" style="cursor:pointer;color:#3b82f6">ravi@greytip.com <span style="color:#6b7280">— Participant (own batch only)</span></span>
        </div>
      </div>
    </div>
  </div>
  <div class="toast" id="toast"></div>`;
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const user  = USERS[email];
  if (!user) {
    const err = document.getElementById('login-err');
    err.style.display='block';
    err.textContent='Email not found. Please check your email or contact your L&D Admin.';
    return;
  }
  currentUser = { ...user, email };
  loadApp();
}

// ════════════════════════════════════════════════════════════════
//  APP SHELL
// ════════════════════════════════════════════════════════════════
function loadApp() {
  const rc = isAdmin()?'#3b82f6':isMgr()?'#f59e0b':'#10b981';
  const rl = isAdmin()?'L&D Admin':isMgr()?'Team Manager':'Participant';
  const ini= currentUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  const navItems = [
    { id:'dash',      label:'Dashboard',         dot:'#3b82f6' },
    { id:'batches',   label:'Batch Folders',      dot:'#8b5cf6', badge:myBatches().length },
    { id:'assess',    label:'Self Assessments',   dot:'#10b981' },
    { id:'assign',    label:'Assignments',        dot:'#f59e0b' },
    { id:'materials', label:'Learning Materials', dot:'#14b8a6' },
    { id:'attend',    label:'Attendance',         dot:'#ef4444' },
    { id:'feedback',  label:'Feedback Forms',     dot:'#ec4899' },
    ...(!isPart() ? [{ id:'reports', label:'Report Folders', dot:'#f97316' }] : []),
  ];

  document.body.innerHTML = `
  <link rel="stylesheet" href="styles.css"/>
  <div class="app">
    <div class="sidebar">
      <div class="logo">
        <div class="logo-icon">L&D</div>
        <div><div class="logo-name">L&D Hub</div><div class="logo-tag">greytHR · Learning</div></div>
      </div>
      <div class="role-bar">
        <div class="role-dot" style="background:${rc}"></div>
        <div class="role-label">${rl}</div>
        <div class="role-switch" onclick="doLogout()">Logout</div>
      </div>
      <nav class="nav">
        <div class="nav-sec">Menu</div>
        ${navItems.map(n=>`
          <div class="ni" id="ni-${n.id}" onclick="go('${n.id}',this)">
            <span class="dot" style="background:${n.dot}"></span>${n.label}
            ${n.badge?`<span class="cnt bb" style="margin-left:auto">${n.badge}</span>`:''}
          </div>`).join('')}
      </nav>
      <div class="user-footer">
        <div class="av" style="background:#eff6ff;color:${rc}">${ini}</div>
        <div><div class="uname">${currentUser.name}</div><div class="urole">${currentUser.dept} · ${rl}</div></div>
      </div>
    </div>
    <main class="main" id="main-content"></main>
  </div>
  <div class="toast" id="toast"></div>`;

  go('dash', document.getElementById('ni-dash'));
}

function doLogout() { currentUser=null; showLogin(); }

// ── NAVIGATION ────────────────────────────────────────────────────
function go(id, el) {
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  const main = document.getElementById('main-content');
  if (!main) return;
  const pages = { dash:renderDash, batches:renderBatches, assess:renderAssess, assign:renderAssign, materials:renderMaterials, attend:renderAttend, feedback:renderFeedback, reports:renderReports };
  if (pages[id]) { main.innerHTML=''; pages[id](main); }
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════
function renderDash(el) {
  const batches = myBatches();
  let greeting, sub, stats;
  if (isAdmin()) {
    greeting='Good morning, Priya 👋'; sub='Your L&D Hub — all batches, sessions and assignments at a glance.';
    stats=[{l:'Active Batches',v:BATCHES.length,c:'#8b5cf6',b:'bp',n:'This quarter'},{l:'Total Participants',v:58,c:'#3b82f6',b:'bb',n:'Across all batches'},{l:'Pending Assignments',v:12,c:'#f59e0b',b:'ba',n:'Awaiting submission'},{l:'Feedback Collected',v:'89%',c:'#10b981',b:'bg',n:'Above target'}];
  } else if (isMgr()) {
    greeting=`Team Overview — ${currentUser.dept} 📊`; sub='Track your team\'s training progress, attendance and feedback.';
    stats=[{l:'My Team Batches',v:batches.length,c:'#8b5cf6',b:'bp',n:'Assigned to you'},{l:'Team Participants',v:batches.reduce((a,b)=>a+b.participants,0),c:'#3b82f6',b:'bb',n:'In your batches'},{l:'Avg Attendance',v:'84%',c:'#10b981',b:'bg',n:'This month'},{l:'Team Feedback',v:'91%',c:'#ec4899',b:'bpk',n:'Response rate'}];
  } else {
    greeting=`Welcome, ${currentUser.name.split(' ')[0]}! 👋`; sub='Your enrolled batches, assignments and materials — all in one place.';
    stats=[{l:'My Batches',v:batches.length,c:'#8b5cf6',b:'bp',n:'Enrolled'},{l:'Pending Assignment',v:1,c:'#f59e0b',b:'ba',n:'Due Apr 5'},{l:'My Attendance',v:'88%',c:'#10b981',b:'bg',n:'This program'},{l:'Feedback Given',v:'✓',c:'#3b82f6',b:'bb',n:'All submitted'}];
  }
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">${greeting}</div><div class="ps">${sub}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="go('batches',document.getElementById('ni-batches'))">+ New Batch</button>`:''}
    </div>
    <div class="g4">${stats.map(s=>`<div class="sc"><div class="sl">${s.l}</div><div class="sv" style="color:${s.c}">${s.v}</div><div class="sbadge ${s.b}">${s.n}</div></div>`).join('')}</div>
    <div class="g2">
      <div class="card">
        <div class="ct">${isAdmin()?'All Batches':isMgr()?'Your Team Batches':'My Enrolled Batches'} <span class="b bb">${batches.length} active</span></div>
        <div style="display:flex;flex-direction:column;gap:14px">
          ${batches.map(b=>`
          <div style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="go('batches',document.getElementById('ni-batches'))">
            <div style="width:36px;height:36px;border-radius:8px;background:${b.color}22;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${b.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:500">${b.name}</div>
              <div style="font-size:12px;color:var(--muted)">${b.participants} participants · ${b.program}</div>
              <div class="pb" style="margin-top:4px"><div class="pf" style="width:${b.progress}%;background:${b.color}"></div></div>
            </div>
            <span class="b" style="background:${b.color}22;color:${b.color}">${b.progress}%</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="ct">Recent Activity</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[
            {av:'RS',bg:'#ecfdf5',c:'#10b981',msg:'<b>Ravi S.</b> submitted Assignment 2',batch:'Sales Batch A',time:'2h ago',bId:'A'},
            {av:'AN',bg:'#f5f3ff',c:'#8b5cf6',msg:'<b>Anjali N.</b> completed self-assessment',batch:'CS Batch B',time:'4h ago',bId:'B'},
            {av:'KP',bg:'#fdf2f8',c:'#ec4899',msg:'<b>Karan P.</b> downloaded reference guide',batch:'Sales Batch A',time:'Yesterday',bId:'A'},
            {av:'MS',bg:'#eff6ff',c:'#3b82f6',msg:'<b>Meera S.</b> submitted feedback',batch:'Support Batch C',time:'Yesterday',bId:'C'},
          ].filter(a=>isAdmin()||currentUser.batchIds.includes(a.bId))
           .map(a=>`<div style="display:flex;gap:10px;align-items:flex-start;font-size:13px">
            <div class="av" style="background:${a.bg};color:${a.c};width:28px;height:28px;font-size:10px;flex-shrink:0">${a.av}</div>
            <div>${a.msg} <span style="color:var(--muted)">· ${a.batch}</span><div style="font-size:11px;color:var(--muted);margin-top:2px">${a.time}</div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════════════════
//  BATCH FOLDERS
// ════════════════════════════════════════════════════════════════
function renderBatches(el) {
  const batches=myBatches();
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Batch Folders</div><div class="ps">${isAdmin()?'Create and manage all training batches.':isMgr()?'Your team\'s training batches.':'Your enrolled training batches.'}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="showCreateBatch()">+ Create Batch</button>`:''}
    </div>
    <div id="bcf"></div>
    <div class="g3" id="batch-grid">
      ${batches.map(b=>`
      <div class="folder" onclick="openBatch('${b.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${b.icon}</div><span class="b ${sBadge(b.status)}">${b.status}</span></div>
        <div class="folder-name">${b.name}</div>
        <div class="folder-meta">${b.dept} · ${b.program} · ${b.participants} participants</div>
        <div class="pb"><div class="pf" style="width:${b.progress}%;background:${b.color}"></div></div>
        <div class="folder-actions"><span class="b bb">${b.materials} materials</span><span class="b ba">${b.assignments} assignments</span><span class="b bg">Attend: ${b.attendance}%</span></div>
      </div>`).join('')}
      ${isAdmin()?`<div class="folder folder-add" onclick="showCreateBatch()"><div class="folder-add-icon">+</div><div class="folder-add-txt">Create new batch</div></div>`:''}
    </div>
    <div id="batch-detail" style="display:none"></div>`;
}

function showCreateBatch() {
  const w=document.getElementById('bcf');
  if(w.innerHTML){w.innerHTML='';return;}
  w.innerHTML=`<div class="card" style="margin-bottom:20px">
    <div class="ct">Create New Batch</div>
    <div class="g2">
      <div class="fg"><label class="fl">Batch Name</label><input class="fi" id="bn" placeholder="e.g. Sales Batch E — Q2 2026"/></div>
      <div class="fg"><label class="fl">Department</label><select class="fsel" id="bdept"><option>Sales</option><option>Customer Success</option><option>Support</option><option>Implementation</option><option>Cross-functional</option></select></div>
    </div>
    <div class="g2">
      <div class="fg"><label class="fl">Program / Course</label><input class="fi" id="bprog" placeholder="e.g. Enterprise Sales Mastery"/></div>
      <div class="fg"><label class="fl">Start Date</label><input class="fi" type="date" id="bstart"/></div>
    </div>
    <div class="fg"><label class="fl">Participant Emails <span style="font-weight:400;color:var(--muted)">(comma-separated)</span></label><textarea class="fta" id="bemails" placeholder="ravi@greytip.com, anjali@greytip.com, ..."></textarea></div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-p btn-sm" onclick="saveBatch()">Create & Save</button>
      <button class="btn btn-o btn-sm" onclick="document.getElementById('bcf').innerHTML=''">Cancel</button>
    </div>
  </div>`;
}

function saveBatch() {
  const name=document.getElementById('bn').value.trim();
  if(!name){toast('Please enter a batch name');return;}
  const dept=document.getElementById('bdept').value;
  const prog=document.getElementById('bprog').value.trim()||'Program';
  const nid=String.fromCharCode(65+BATCHES.length);
  BATCHES.push({id:nid,name,dept,program:prog,participants:0,progress:0,status:'New',color:'#3b82f6',icon:'🗂️',materials:0,assignments:0,attendance:0,feedback:'0/0'});
  PARTICIPANTS[nid]=[];
  saveToSheet('batch',{name,dept,program:prog});
  toast('Batch "'+name+'" created!');
  go('batches',document.getElementById('ni-batches'));
}

function openBatch(id) {
  const b=BATCHES.find(x=>x.id===id);
  const ps=PARTICIPANTS[id]||[];
  document.getElementById('batch-grid').style.display='none';
  const det=document.getElementById('batch-detail');
  det.style.display='block';
  const tabs=[
    {id:'overview',  label:'Overview'},
    {id:'materials', label:'Materials'},
    {id:'assign',    label:'Assignments'},
    {id:'assess',    label:'Self Assessment'},
    ...(!isPart()?[{id:'attend',label:'Attendance'}]:[]),
  ];
  det.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <button class="btn btn-o btn-sm" onclick="closeBatch()">← Back</button>
      <div><div class="pt" style="font-size:18px">${b.name}</div><div class="ps">${b.dept} · ${b.program}</div></div>
    </div>
    <div class="tabs" id="btabs">${tabs.map((t,i)=>`<div class="tab${i===0?' active':''}" onclick="bTab('${id}','${t.id}',this)">${t.label}</div>`).join('')}</div>
    <div id="bt-content"></div>`;
  bTab(id,'overview',det.querySelector('.tab'));
}

function closeBatch() {
  document.getElementById('batch-grid').style.display='grid';
  document.getElementById('batch-detail').style.display='none';
}

function bTab(bId,tabId,el) {
  document.querySelectorAll('#btabs .tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  const b=BATCHES.find(x=>x.id===bId)||BATCHES[0];
  const ps=PARTICIPANTS[bId]||[];
  const con=document.getElementById('bt-content');

  if(tabId==='overview') {
    con.innerHTML=`<div class="g2">
      <div class="card"><div class="ct">Participants (${ps.length})</div>
        <table class="tbl"><thead><tr><th>Name</th><th>Dept</th><th>Progress</th><th>Status</th></tr></thead>
        <tbody>${ps.map((p,i)=>{const pct=40+((i*17)%50);return`<tr>
          <td style="font-weight:500">${p.n}${isPart()&&i===0?' <span class="b bg" style="font-size:10px">You</span>':''}</td>
          <td><span class="b bb">${p.dept}</span></td>
          <td><div style="display:flex;align-items:center;gap:8px"><div class="pb" style="width:70px"><div class="pf" style="width:${pct}%;background:${b.color}"></div></div><span style="font-size:12px">${pct}%</span></div></td>
          <td><span class="pill ${pct>60?'bg':'ba'}">${pct>60?'On track':'Needs push'}</span></td>
        </tr>`;}).join('')}</tbody></table>
      </div>
      <div class="card"><div class="ct">Batch Summary</div>
        ${[['Materials shared',b.materials],['Assignments given',b.assignments],['Avg attendance',b.attendance+'%'],['Feedback submitted',b.feedback]].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px">
          <span style="color:var(--muted)">${k}</span><span style="font-weight:500">${v}</span>
        </div>`).join('')}
      </div>
    </div>`;
  } else if(tabId==='materials') {
    const mats=MATERIALS_DATA.filter(m=>m.batchId===bId||m.batchId==='ALL');
    con.innerHTML=`<div class="card">
      <div class="section-row">
        <div class="ct" style="margin:0">Materials (${mats.length})</div>
        ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload <input type="file" multiple style="display:none" onchange="toast(this.files.length+' file(s) uploaded!')"/></label>`:''}
      </div>
      ${mats.map(m=>`<div class="fi-row"><span class="fi-icon">${m.icon}</span><span class="fi-name">${m.name}</span><span class="fi-size">${m.size}</span><span class="b bb">${m.type}</span><span class="fi-dl" onclick="toast('Downloading...')">⬇ Download</span></div>`).join('')}
    </div>`;
  } else if(tabId==='assign') {
    const asgns=ASSIGN_DATA.filter(a=>a.batchId===bId);
    con.innerHTML=`
      ${!isPart()?`<div class="card" style="margin-bottom:16px">
        <div class="section-row"><div class="ct" style="margin:0">Assignments</div>${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload <input type="file" style="display:none" onchange="toast('Assignment uploaded!')"/></label>`:''}</div>
        <table class="tbl"><thead><tr><th>Assignment</th><th>Due</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
        <tbody>${asgns.map(a=>`<tr>
          <td style="font-weight:500">${a.title}</td><td>${a.due}</td>
          <td>${a.submitted}/${a.total}<div class="pb" style="width:80px;margin-top:4px"><div class="pf" style="width:${Math.round(a.submitted/a.total*100)}%;background:${a.status==='Closed'?'#10b981':'#f59e0b'}"></div></div></td>
          <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
          <td><button class="btn btn-o btn-xs" onclick="toast('Opening submissions...')">View</button></td>
        </tr>`).join('')}</tbody></table>
      </div>`:''}
      <div class="card">
        <div class="ct">Submit Assignment <span class="b bg">Participant</span></div>
        <div class="fg"><label class="fl">Select Assignment</label><select class="fsel">${asgns.filter(a=>a.status==='Open').map(a=>`<option>${a.title} (Due ${a.due})</option>`).join('')}</select></div>
        <div class="uz" onclick="this.querySelector('input').click()"><div class="uz-icon">📤</div><div class="uz-txt">Upload completed assignment</div><div class="uz-hint">PDF, Word, Excel — Max 10MB</div><input type="file" style="display:none" onchange="toast('Assignment submitted! Trainer notified.')"/></div>
        <div class="fg" style="margin-top:12px"><label class="fl">Notes (optional)</label><textarea class="fta" placeholder="Any comments?" style="min-height:60px"></textarea></div>
        <button class="btn btn-p" onclick="toast('Assignment submitted! Trainer notified.')">Submit Assignment</button>
      </div>`;
  } else if(tabId==='assess') {
    con.innerHTML=`
      ${!isPart()?`<div class="card" style="margin-bottom:16px">
        <div class="ct">Assessment Results</div>
        <table class="tbl"><thead><tr><th>Assessment</th><th>Questions</th><th>Responses</th><th>Status</th><th></th></tr></thead>
        <tbody>${ASSESS_DATA.filter(a=>a.batchId===bId).map(a=>`<tr>
          <td style="font-weight:500">${a.title}</td><td>${a.qs} Qs</td>
          <td>${a.resp}/${a.total}<div class="pb" style="width:80px;margin-top:4px"><div class="pf" style="width:${Math.round(a.resp/a.total*100)}%;background:#3b82f6"></div></div></td>
          <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
          <td><button class="btn btn-o btn-xs" onclick="toast('Opening results...')">Results</button></td>
        </tr>`).join('')}</tbody></table>
      </div>`:''}
      <div class="card">
        <div class="ct">Self Assessment Form <span class="b bg">Fill & Submit</span></div>
        <div class="fg"><label class="fl">Your Name</label><input class="fi" value="${isPart()?currentUser.name:''}" placeholder="Your name"/></div>
        <div style="margin-bottom:14px">
          <div style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Rate yourself 1 (Low) → 5 (High)</div>
          ${ASSESS_QUESTIONS.map((q,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);gap:8px;flex-wrap:wrap">
            <span style="font-size:13px;flex:1">${q}</span>
            <div style="display:flex;gap:8px">${[1,2,3,4,5].map(v=>`<label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="radio" name="aq${i}" value="${v}">${v}</label>`).join('')}</div>
          </div>`).join('')}
        </div>
        <div class="fg"><label class="fl">Key Learnings</label><textarea class="fta" placeholder="What did you take away?"></textarea></div>
        <div class="fg"><label class="fl">Areas to Improve</label><textarea class="fta" placeholder="What do you want to work on?"></textarea></div>
        <button class="btn btn-p" onclick="toast('Assessment submitted!')">Submit Assessment</button>
      </div>`;
  } else if(tabId==='attend') {
    con.innerHTML=`<div class="card">
      <div class="section-row">
        <select class="fsel" style="width:200px"><option>Session 1 — Apr 1</option><option>Session 2 — Apr 8</option><option>Session 3 — Apr 15</option></select>
        <div style="display:flex;gap:8px">${isAdmin()?`<button class="btn btn-o btn-sm" onclick="maBatch()">✓ Mark All Present</button><button class="btn btn-g btn-sm" onclick="toast('Attendance saved!')">Save</button>`:'<span class="b bb">View only</span>'}</div>
      </div>
      <table class="tbl"><thead><tr><th>Participant</th><th>Status</th>${isAdmin()?'<th>Toggle</th>':''}</tr></thead>
      <tbody>${ps.map((p,i)=>`<tr><td style="font-weight:500">${p.n}</td><td id="bta${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981">Present</span></td>${isAdmin()?`<td><button class="btn btn-o btn-xs" onclick="tgBat(${i})">Toggle</button></td>`:''}</tr>`).join('')}</tbody></table>
    </div>`;
  }
}

function tgBat(i){const el=document.getElementById('bta'+i);const p=el.innerHTML.includes('10b981');el.innerHTML=p?`<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444">Absent</span>`:`<span class="adot" style="background:#10b981"></span><span style="color:#10b981">Present</span>`;}
function maBatch(){document.querySelectorAll('[id^=bta]').forEach(el=>{el.innerHTML=`<span class="adot" style="background:#10b981"></span><span style="color:#10b981">Present</span>`;});}

// ════════════════════════════════════════════════════════════════
//  SELF ASSESSMENTS
// ════════════════════════════════════════════════════════════════
function renderAssess(el) {
  const data=isAdmin()?ASSESS_DATA:ASSESS_DATA.filter(a=>currentUser.batchIds.includes(a.batchId));
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Self Assessments</div><div class="ps">${isAdmin()?'All batch assessments — view results and share links.':isPart()?'Your assessments to fill and submit.':'Your team\'s assessment results.'}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="toast('New assessment created!')">+ New Assessment</button>`:''}
    </div>
    ${!isPart()?`<div class="card" style="padding:0;overflow:hidden;margin-bottom:20px">
      <table class="tbl"><thead><tr><th>Assessment</th><th>Batch</th><th>Questions</th><th>Responses</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${data.map(a=>`<tr>
        <td style="font-weight:500">${a.title}</td><td>${a.batch}</td><td>${a.qs} Qs</td>
        <td>${a.resp}/${a.total}<div class="pb" style="width:80px;margin-top:4px"><div class="pf" style="width:${Math.round(a.resp/a.total*100)}%;background:#3b82f6"></div></div></td>
        <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
        <td><div style="display:flex;gap:6px">${isAdmin()?`<button class="btn btn-o btn-xs" onclick="toast('Link copied!')">Share</button>`:''}<button class="btn btn-o btn-xs" onclick="toast('Opening results...')">Results</button>${a.status==='Closed'?`<button class="btn btn-o btn-xs" onclick="toast('Downloading...')">Download</button>`:''}</div></td>
      </tr>`).join('')}</tbody></table>
    </div>`:''}
    <div class="card">
      <div class="ct">Fill Self Assessment <span class="b bg">Submit your response</span></div>
      <div class="g2" style="margin-bottom:14px">
        <div class="fg" style="margin:0"><label class="fl">Your Name</label><input class="fi" value="${isPart()?currentUser.name:''}" placeholder="Your name"/></div>
        <div class="fg" style="margin:0"><label class="fl">Select Assessment</label><select class="fsel">${data.map(a=>`<option>${a.title} (${a.batch})</option>`).join('')}</select></div>
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Rate yourself 1 (Low) → 5 (High)</div>
        ${ASSESS_QUESTIONS.map((q,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);gap:8px;flex-wrap:wrap">
          <span style="font-size:13px;flex:1">${q}</span>
          <div style="display:flex;gap:8px">${[1,2,3,4,5].map(v=>`<label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="radio" name="maq${i}" value="${v}">${v}</label>`).join('')}</div>
        </div>`).join('')}
      </div>
      <div class="fg"><label class="fl">Key Learnings</label><textarea class="fta" placeholder="What did you take away?"></textarea></div>
      <div class="fg"><label class="fl">Areas to Improve</label><textarea class="fta" placeholder="What do you want to work on?"></textarea></div>
      <button class="btn btn-p" onclick="toast('Assessment submitted successfully!')">Submit Assessment</button>
    </div>`;
}

// ════════════════════════════════════════════════════════════════
//  ASSIGNMENTS
// ════════════════════════════════════════════════════════════════
function renderAssign(el) {
  const data=isAdmin()?ASSIGN_DATA:ASSIGN_DATA.filter(a=>currentUser.batchIds.includes(a.batchId));
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Assignments</div><div class="ps">${isPart()?'Download, complete and submit your assignments here.':'Manage assignment sheets and track submissions.'}</div></div>
      ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload Assignment <input type="file" style="display:none" onchange="toast('Assignment uploaded and shared!')"/></label>`:''}
    </div>
    <div class="g2">
      ${!isPart()?`<div class="card">
        <div class="ct">Assignment Tracker <span class="b ba">${data.filter(a=>a.status==='Open').length} Active</span></div>
        ${data.map(a=>`<div class="assign-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
            <div><div class="assign-title">${a.title}</div><div class="assign-meta">${a.batch} · Due ${a.due}</div></div>
            <span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:8px">
            <div style="flex:1"><div class="pb"><div class="pf" style="width:${Math.round(a.submitted/a.total*100)}%;background:${a.status==='Closed'?'#10b981':'#f59e0b'}"></div></div></div>
            <span style="color:var(--muted)">${a.submitted}/${a.total} submitted</span>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-o btn-xs" onclick="toast('Opening submissions...')">View Submissions</button>
            <button class="btn btn-o btn-xs" onclick="toast('Downloading sheet...')">⬇ Sheet</button>
            ${a.status==='Closed'?`<button class="btn btn-o btn-xs" onclick="toast('Downloading all...')">Download All</button>`:''}
          </div>
        </div>`).join('')}
      </div>`:''}
      <div class="card">
        <div class="ct">Submit Assignment <span class="b bg">${isPart()?'Your submission':'Participant view'}</span></div>
        <div class="fg"><label class="fl">Your Name & Batch</label><input class="fi" value="${isPart()?currentUser.name+' — '+myBatches()[0]?.name:''}" placeholder="Name — Batch"/></div>
        <div class="fg"><label class="fl">Select Assignment</label><select class="fsel">${data.filter(a=>a.status==='Open').map(a=>`<option>${a.title} (Due ${a.due})</option>`).join('')}</select></div>
        <div class="uz" onclick="this.querySelector('input').click()"><div class="uz-icon">📤</div><div class="uz-txt">Upload completed assignment</div><div class="uz-hint">PDF, Word, Excel — Max 10MB</div><input type="file" style="display:none" onchange="toast('File ready: '+this.files[0].name)"/></div>
        <div class="fg" style="margin-top:12px"><label class="fl">Notes (optional)</label><textarea class="fta" placeholder="Any comments?" style="min-height:60px"></textarea></div>
        <button class="btn btn-p" onclick="toast('Assignment submitted! Trainer has been notified.')">Submit Assignment</button>
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════════════════
//  LEARNING MATERIALS
// ════════════════════════════════════════════════════════════════
function renderMaterials(el) {
  const tb=t=>({Guide:'bg',Slides:'bb',Handout:'bp',Template:'ba',Video:'bc'}[t]||'bb');
  const data=isAdmin()?MATERIALS_DATA:MATERIALS_DATA.filter(m=>currentUser.batchIds.includes(m.batchId)||m.batchId==='ALL');
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Learning Materials</div><div class="ps">${isAdmin()?'Upload and manage all reference guides, decks and recordings.':'Download your batch materials and reference guides.'}</div></div>
      ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload Material <input type="file" multiple style="display:none" onchange="addMat(this)"/></label>`:''}
    </div>
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
      <select class="fsel" style="width:180px"><option>All Batches</option>${myBatches().map(b=>`<option>${b.name}</option>`).join('')}</select>
      <select class="fsel" style="width:150px"><option>All Types</option><option>Guide</option><option>Slides</option><option>Handout</option><option>Video</option><option>Template</option></select>
      <input class="fi" style="width:220px" placeholder="Search materials..."/>
    </div>
    <div class="g3" id="mat-grid">
      ${data.map(m=>`<div class="folder">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${m.icon}</div><span class="b ${tb(m.type)}">${m.type}</span></div>
        <div class="folder-name">${m.name}</div>
        <div class="folder-meta">${m.batch} · ${m.size} · ${m.date}</div>
        <div class="folder-actions">
          <button class="btn btn-o btn-xs" onclick="toast('Downloading...')">⬇ Download</button>
          ${isAdmin()?`<button class="btn btn-o btn-xs" onclick="toast('Link copied!')">Share</button>`:''}
        </div>
      </div>`).join('')}
      ${isAdmin()?`<div class="folder folder-add" onclick="document.getElementById('mh').click()"><div class="folder-add-icon">+</div><div class="folder-add-txt">Upload new material</div><input type="file" id="mh" multiple style="display:none" onchange="addMat(this)"/></div>`:''}
    </div>`;
}

function addMat(inp) {
  const grid=document.getElementById('mat-grid'),add=grid.lastElementChild;
  Array.from(inp.files).forEach(f=>{
    const ext=f.name.split('.').pop().toLowerCase();
    const icon={pdf:'📄',pptx:'📊',docx:'📝',xlsx:'📊',mp4:'🎬'}[ext]||'📋';
    const div=document.createElement('div');div.className='folder';
    div.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${icon}</div><span class="b bb">New</span></div><div class="folder-name">${f.name}</div><div class="folder-meta">All Batches · ${(f.size/1024).toFixed(0)} KB · Just now</div><div class="folder-actions"><button class="btn btn-o btn-xs" onclick="toast('Downloading...')">⬇ Download</button><button class="btn btn-o btn-xs" onclick="toast('Link copied!')">Share</button></div>`;
    grid.insertBefore(div,add);
  });
  toast(inp.files.length+' material(s) uploaded!');
}

// ════════════════════════════════════════════════════════════════
//  ATTENDANCE
// ════════════════════════════════════════════════════════════════
function renderAttend(el) {
  const batches=myBatches();
  const fb=batches[0]||BATCHES[0];
  const ps=PARTICIPANTS[fb.id]||[];
  attState=ps.map(()=>true);
  el.innerHTML=`
    <div class="ph"><div><div class="pt">Attendance Tracker</div><div class="ps">${isAdmin()?'Mark and save batch-wise attendance for every session.':'View your team\'s attendance records.'}</div></div></div>
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center">
      <select class="fsel" style="width:230px" id="att-batch-sel" onchange="reloadAtt(this.options[this.selectedIndex].dataset.id)">${batches.map(b=>`<option data-id="${b.id}">${b.name}</option>`).join('')}</select>
      <select class="fsel" style="width:200px"><option>Session 1 — Apr 1</option><option>Session 2 — Apr 8</option><option>Session 3 — Apr 15</option></select>
      <input type="date" class="fi" style="width:155px" value="2026-04-01"/>
      ${isAdmin()?`<button class="btn btn-o btn-sm" onclick="markAllPresent()">✓ Mark All Present</button><button class="btn btn-g btn-sm" onclick="saveAttendance()">Save Attendance</button>`:''}
    </div>
    <div class="g4" style="margin-bottom:18px">
      <div class="sc" style="padding:14px 16px"><div class="sl">Total</div><div class="sv" style="font-size:22px" id="att-total">${ps.length}</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Present</div><div class="sv" style="font-size:22px;color:#10b981" id="att-pres">${ps.length}</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Absent</div><div class="sv" style="font-size:22px;color:#ef4444" id="att-abs">0</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Attendance %</div><div class="sv" style="font-size:22px;color:#f59e0b" id="att-pct">100%</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="tbl"><thead><tr><th>Participant</th><th>Dept</th><th>Previous</th><th>Today</th>${isAdmin()?'<th>Toggle</th>':''}</tr></thead>
      <tbody id="att-body">${ps.map((p,i)=>`<tr>
        <td style="font-weight:500">${p.n}</td>
        <td><span class="b bb">${p.dept}</span></td>
        <td><span class="adot" style="background:#10b981"></span>P &nbsp;<span class="adot" style="background:#10b981"></span>P</td>
        <td id="as${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span></td>
        ${isAdmin()?`<td><button class="btn btn-o btn-xs" onclick="toggleAtt(${i},${ps.length})">Toggle</button></td>`:''}
      </tr>`).join('')}</tbody></table>
    </div>`;
}

function reloadAtt(bId) {
  const ps=PARTICIPANTS[bId]||[];attState=ps.map(()=>true);
  document.getElementById('att-body').innerHTML=ps.map((p,i)=>`<tr>
    <td style="font-weight:500">${p.n}</td><td><span class="b bb">${p.dept}</span></td>
    <td><span class="adot" style="background:#10b981"></span>P &nbsp;<span class="adot" style="background:#10b981"></span>P</td>
    <td id="as${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span></td>
    ${isAdmin()?`<td><button class="btn btn-o btn-xs" onclick="toggleAtt(${i},${ps.length})">Toggle</button></td>`:''}
  </tr>`).join('');
  document.getElementById('att-total').textContent=ps.length;
  document.getElementById('att-pres').textContent=ps.length;
  document.getElementById('att-abs').textContent=0;
  document.getElementById('att-pct').textContent='100%';
}

function toggleAtt(i,total) {
  attState[i]=!attState[i];
  const el=document.getElementById('as'+i);
  el.innerHTML=attState[i]?`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span>`:`<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444;font-size:13px">Absent</span>`;
  const p=attState.filter(Boolean).length;
  document.getElementById('att-pres').textContent=p;
  document.getElementById('att-abs').textContent=total-p;
  document.getElementById('att-pct').textContent=Math.round(p/total*100)+'%';
}

function markAllPresent(){attState=attState.map(()=>true);const sel=document.getElementById('att-batch-sel');reloadAtt(sel?.options[sel.selectedIndex]?.dataset?.id||'A');}
function saveAttendance(){toast('Attendance saved! ('+attState.filter(Boolean).length+'/'+attState.length+' present)');}

// ════════════════════════════════════════════════════════════════
//  FEEDBACK
// ════════════════════════════════════════════════════════════════
function renderFeedback(el) {
  const rb=r=>({Excellent:'bg',Good:'bb',Average:'ba',Poor:'bc'}[r]||'bb');
  const responses=isAdmin()?FEEDBACK_RESPONSES:FEEDBACK_RESPONSES.filter(r=>currentUser.batchIds.includes(r.batchId));
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Feedback Forms</div><div class="ps">${isPart()?'Share your feedback on the training sessions.':isAdmin()?'All feedback responses across batches.':'Your team\'s feedback responses.'}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="toast('Form link copied!')">📋 Copy Form Link</button>`:''}
    </div>
    <div class="g2">
      <div class="card">
        <div class="ct">Submit Feedback <span class="b bg">${isPart()?'Your response':'Participant view'}</span></div>
        <div class="fg"><label class="fl">Your Name & Batch</label><input class="fi" value="${isPart()?currentUser.name+' — '+myBatches()[0]?.name:''}" placeholder="Name — Batch"/></div>
        <div class="fg"><label class="fl">Session / Program</label><select class="fsel">${myBatches().map(b=>`<option>${b.program} (${b.name})</option>`).join('')}</select></div>
        <div class="fg"><label class="fl">Overall Rating</label>
          <div style="display:flex;gap:4px" id="fb-stars">${[1,2,3,4,5].map(n=>`<span class="star" onclick="setStars(${n})">★</span>`).join('')}</div>
        </div>
        <div class="fg"><label class="fl">Content Relevance</label>
          <div style="display:flex;gap:14px;flex-wrap:wrap">${['Excellent','Good','Average','Poor'].map(o=>`<label class="radio-lbl"><input type="radio" name="rel"> ${o}</label>`).join('')}</div>
        </div>
        <div class="fg"><label class="fl">What was most useful?</label><textarea class="fta" placeholder="Share what worked well..."></textarea></div>
        <div class="fg"><label class="fl">Suggestions for improvement</label><textarea class="fta" placeholder="What could be better?"></textarea></div>
        <button class="btn btn-p" onclick="submitFb()">Submit Feedback</button>
        <div id="fb-msg" style="display:none" class="success-msg">✓ Thank you! Feedback recorded.</div>
      </div>
      ${!isPart()?`<div class="card">
        <div class="ct">${isAdmin()?'All Responses':'Your Team Responses'} <span class="b bb">${responses.length} total</span></div>
        <table class="tbl"><thead><tr><th>Participant</th><th>Batch</th><th>Rating</th><th>Relevance</th></tr></thead>
        <tbody>${responses.map(r=>`<tr>
          <td><div style="display:flex;align-items:center;gap:8px"><div class="av" style="background:${r.bg};color:${r.tc};width:26px;height:26px;font-size:10px">${r.av}</div>${r.name}</div></td>
          <td>${r.batch}</td><td><span style="color:#f59e0b">${stars(r.rating)}</span></td>
          <td><span class="b ${rb(r.rel)}">${r.rel}</span></td>
        </tr>`).join('')}</tbody></table>
      </div>`:`<div class="card"><div class="ct">Your Submission History</div><div style="font-size:13px;color:var(--muted);text-align:center;padding:24px">Your past feedback submissions will appear here.</div></div>`}
    </div>`;
}

function setStars(n){fbStarVal=n;document.querySelectorAll('#fb-stars .star').forEach((s,i)=>s.classList.toggle('lit',i<n));}
function submitFb(){const m=document.getElementById('fb-msg');m.style.display='block';setTimeout(()=>m.style.display='none',3000);saveToSheet('feedback',{rating:fbStarVal,name:currentUser.name});}

// ════════════════════════════════════════════════════════════════
//  REPORTS
// ════════════════════════════════════════════════════════════════
function renderReports(el) {
  const sb=s=>({Completed:'bg','In Progress':'ba',Master:'bb'}[s]||'bb');
  const tb=(t,i)=>['bb','bg','bt','bp','bo','bpk'][i%6];
  const data=isAdmin()?REPORT_FOLDERS:REPORT_FOLDERS.filter(r=>currentUser.batchIds.includes(r.batchId)||r.batchId==='ALL');
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Report Folders</div><div class="ps">${isAdmin()?'All batch reports — attendance, assessments and feedback analysis.':'Your team\'s training reports.'}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="toast('Report generated!')">Generate Report</button>`:''}
    </div>
    <div class="g3">
      ${data.map(r=>`<div class="folder" onclick="toast('Opening ${r.name}...')">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">📁</div><span class="b ${sb(r.status)}">${r.status}</span></div>
        <div class="folder-name">${r.name}</div>
        <div class="folder-meta">${r.count} reports · Updated ${r.updated}</div>
        <div class="folder-actions">${r.tags.map((t,i)=>`<span class="b ${tb(t,i)}">${t}</span>`).join('')}</div>
      </div>`).join('')}
      ${isAdmin()?`<div class="folder folder-add" onclick="toast('Report generated!')"><div class="folder-add-icon">+</div><div class="folder-add-txt">Generate new report</div></div>`:''}
    </div>`;
}

// ════════════════════════════════════════════════════════════════
//  APPS SCRIPT BRIDGE
// ════════════════════════════════════════════════════════════════
async function saveToSheet(sheet,data) {
  if(!APPS_SCRIPT_URL||APPS_SCRIPT_URL.includes('YOUR_'))return;
  try { await fetch(APPS_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sheet,...data})}); }
  catch(e){console.error(e);}
}
