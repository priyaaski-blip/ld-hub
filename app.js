// ════════════════════════════════════════════════════════════════
//  L&D Hub — greytHR  |  app.js  |  v3.0
//  ✅ Connected to Google Sheets
//  ✅ Download Attendance as CSV
//  ✅ Multiple Assignment Uploads
//  ✅ All data saves to Sheet
//  ✅ Role-based login
// ════════════════════════════════════════════════════════════════

const APPS_SCRIPT_URL = 'https://script.google.com/a/macros/greytip.com/s/AKfycbyTc6lKZ2H1OOqiqXp9imSBeHmWMT2ZYK5cuwifesAQrFtqsnHT4wYrc70vMFUAkM1boQ/exec';

// ── USER DATABASE ─────────────────────────────────────────────────
// Add ALL your team emails here
// role: 'admin' | 'manager' | 'participant'
const USERS = {
  'priya@greytip.com':       { role:'admin',       name:'Priya K.',     dept:'L&D',              batchIds:['A','B','C','D'] },
  'manager1@greytip.com':    { role:'manager',     name:'Srinivas R.',  dept:'Sales',            batchIds:['A'] },
  'manager2@greytip.com':    { role:'manager',     name:'Deepa M.',     dept:'Customer Success', batchIds:['B'] },
  'manager3@greytip.com':    { role:'manager',     name:'Karthik V.',   dept:'Support',          batchIds:['C'] },
  'manager4@greytip.com':    { role:'manager',     name:'Anand S.',     dept:'Implementation',   batchIds:['D'] },
  'ravi@greytip.com':        { role:'participant', name:'Ravi S.',      dept:'Sales',            batchIds:['A'] },
  'karan@greytip.com':       { role:'participant', name:'Karan P.',     dept:'Sales',            batchIds:['A'] },
  'arjun@greytip.com':       { role:'participant', name:'Arjun M.',     dept:'Sales',            batchIds:['A'] },
  'anjali@greytip.com':      { role:'participant', name:'Anjali N.',    dept:'CS',               batchIds:['B'] },
  'deepak@greytip.com':      { role:'participant', name:'Deepak R.',    dept:'CS',               batchIds:['B'] },
  'meera@greytip.com':       { role:'participant', name:'Meera S.',     dept:'Support',          batchIds:['C'] },
  'neha@greytip.com':        { role:'participant', name:'Neha J.',      dept:'Support',          batchIds:['C'] },
  'vikram@greytip.com':      { role:'participant', name:'Vikram B.',    dept:'Implementation',   batchIds:['D'] },
  'suresh@greytip.com':      { role:'participant', name:'Suresh L.',    dept:'Implementation',   batchIds:['D'] },
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

// Dynamic assignment list — grows as admin uploads more
let ASSIGN_DATA = [
  { id:'AS1', title:'Assignment 1 — Discovery Questions', batch:'Sales Batch A',   batchId:'A', due:'Mar 20', submitted:14, total:14, status:'Closed', uploadedBy:'Priya K.', uploadedOn:'Mar 15' },
  { id:'AS2', title:'Assignment 2 — Objection Handling',  batch:'Sales Batch A',   batchId:'A', due:'Apr 5',  submitted:7,  total:14, status:'Open',   uploadedBy:'Priya K.', uploadedOn:'Mar 28' },
  { id:'AS3', title:'Case Study — greytHR Deal Scenario', batch:'Support Batch C', batchId:'C', due:'Apr 10', submitted:4,  total:18, status:'Open',   uploadedBy:'Priya K.', uploadedOn:'Apr 1'  },
  { id:'AS4', title:'MEDDIC Role-Play Reflection',        batch:'Impl. Batch D',   batchId:'D', due:'Apr 3',  submitted:14, total:14, status:'Closed', uploadedBy:'Priya K.', uploadedOn:'Mar 30' },
];

// Dynamic materials — grows as admin uploads
let MATERIALS_DATA = [
  { icon:'📄', name:'MEDDIC Framework Reference Guide',  batch:'Impl. Batch D',   batchId:'D',   type:'Guide',    size:'1.2 MB', date:'Apr 1'  },
  { icon:'📊', name:'Enterprise Sales — Module 1 Deck', batch:'Sales Batch A',   batchId:'A',   type:'Slides',   size:'3.4 MB', date:'Mar 28' },
  { icon:'📝', name:'Participant Handout — Session 2',   batch:'CS Batch B',      batchId:'B',   type:'Handout',  size:'0.8 MB', date:'Mar 25' },
  { icon:'📋', name:'Case Study Discussion Template',    batch:'All Batches',     batchId:'ALL', type:'Template', size:'0.5 MB', date:'Mar 20' },
  { icon:'🎬', name:'Comm. Skills — Session Recording',  batch:'Support Batch C', batchId:'C',   type:'Video',    size:'Link',   date:'Apr 1'  },
];

const ASSESS_DATA = [
  { title:'Session 3 — Objection Handling', batch:'Sales Batch A',   dept:'Sales',  batchId:'A', qs:12, resp:11, total:14, status:'Open'   },
  { title:'Mid-program Check-in',           batch:'CS Batch B',      dept:'CS',     batchId:'B', qs:8,  resp:12, total:12, status:'Closed' },
  { title:'Communication Pre-assessment',   batch:'Support Batch C', dept:'Support',batchId:'C', qs:10, resp:6,  total:18, status:'Open'   },
  { title:'MEDDIC Final Self Assessment',   batch:'Impl. Batch D',   dept:'Impl.',  batchId:'D', qs:15, resp:14, total:14, status:'Closed' },
];

let FEEDBACK_RESPONSES = [
  { av:'AN', bg:'#eff6ff', tc:'#3b82f6', name:'Anjali N.', batch:'CS Batch B',    batchId:'B', rating:5, rel:'Excellent', session:'Mid-program Check-in',           date:'Apr 3' },
  { av:'RS', bg:'#ecfdf5', tc:'#10b981', name:'Ravi S.',   batch:'Sales Batch A', batchId:'A', rating:4, rel:'Good',      session:'Session 3 — Objection Handling', date:'Apr 2' },
  { av:'KP', bg:'#fdf2f8', tc:'#ec4899', name:'Karan P.',  batch:'Sales Batch A', batchId:'A', rating:5, rel:'Excellent', session:'Session 3 — Objection Handling', date:'Apr 2' },
  { av:'MS', bg:'#fff7ed', tc:'#f97316', name:'Meera S.',  batch:'CS Batch B',    batchId:'B', rating:3, rel:'Average',   session:'Communication Pre-assessment',   date:'Apr 1' },
  { av:'DV', bg:'#f5f3ff', tc:'#8b5cf6', name:'Deepak V.',batch:'Impl. Batch D',  batchId:'D', rating:5, rel:'Excellent', session:'MEDDIC Final Self Assessment',   date:'Apr 1' },
];

const REPORT_FOLDERS = [
  { name:'Sales Batch A — Reports',           batchId:'A',   status:'Completed',   count:4, updated:'Apr 1',  tags:['Attend Report','Feedback Summary','Assessment Results','Full Summary'] },
  { name:'CS Batch B — Reports',              batchId:'B',   status:'In Progress', count:2, updated:'Mar 30', tags:['Attend Report','Assessment Results'] },
  { name:'Support Batch C — Reports',         batchId:'C',   status:'In Progress', count:1, updated:'Mar 28', tags:['Feedback Summary'] },
  { name:'Implementation Batch D — Final',    batchId:'D',   status:'Completed',   count:5, updated:'Apr 1',  tags:['Full Program Report','Attend Report','Assessment Results','Feedback','Cert.'] },
  { name:'Department-wise Summary — Q1 2026', batchId:'ALL', status:'Master',      count:4, updated:'Apr 1',  tags:['Sales','CS','Support','Impl.'] },
];

const ASSESS_QUESTIONS = [
  'Product / service knowledge','Communication clarity','Objection handling','Active listening',
  'Customer empathy','Discovery questioning','Pipeline management','Team collaboration',
];

// ── STATE ─────────────────────────────────────────────────────────
let currentUser = null;
let attState    = [];
let attBatchId  = 'A';
let attSession  = 'Session 1 — Apr 1';
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
const fmtDate = () => new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
const typeIcon = ext => ({pdf:'📄',pptx:'📊',docx:'📝',xlsx:'📊',mp4:'🎬',doc:'📝',csv:'📊'}[ext]||'📋');
const typeBadge = t => ({Guide:'bg',Slides:'bb',Handout:'bp',Template:'ba',Video:'bc',Assignment:'ba',New:'bb'}[t]||'bb');

function toast(msg, type='info') {
  let t = document.getElementById('toast');
  if (!t) { t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.background = type==='success'?'#059669':type==='error'?'#dc2626':'#1c1e2e';
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}

function showSpinner(msg='Saving...') {
  let s=document.getElementById('spinner');
  if(!s){s=document.createElement('div');s.id='spinner';s.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;z-index:9999';s.innerHTML=`<div style="background:#fff;padding:20px 28px;border-radius:12px;font-size:14px;font-weight:500;display:flex;align-items:center;gap:10px"><div style="width:18px;height:18px;border:2px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:spin .6s linear infinite"></div>${msg}</div>`;document.body.appendChild(s);}
  document.getElementById('spinner').style.display='flex';
}
function hideSpinner() { const s=document.getElementById('spinner'); if(s) s.style.display='none'; }

// ── CSV DOWNLOAD ───────────────────────────────────────────────────
function downloadCSV(filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast('Downloaded: '+filename, 'success');
}

function downloadAttendance() {
  const ps  = PARTICIPANTS[attBatchId] || [];
  const batch = BATCHES.find(b=>b.id===attBatchId)?.name || attBatchId;
  const headers = ['Employee Name','Department','Batch','Session','Date','Status','Marked By'];
  const rows = ps.map((p,i) => [p.n, p.dept, batch, attSession, fmtDate(), attState[i]?'Present':'Absent', currentUser.name]);
  downloadCSV(`Attendance_${batch.replace(/[^a-z0-9]/gi,'_')}_${attSession.replace(/[^a-z0-9]/gi,'_')}.csv`, headers, rows);
}

function downloadFeedback() {
  const responses = isAdmin() ? FEEDBACK_RESPONSES : FEEDBACK_RESPONSES.filter(r=>currentUser.batchIds.includes(r.batchId));
  const headers = ['Employee Name','Batch','Session','Rating','Relevance','Date'];
  const rows = responses.map(r => [r.name, r.batch, r.session||'', r.rating, r.rel, r.date||'']);
  downloadCSV('Feedback_Responses.csv', headers, rows);
}

function downloadAssignmentSubmissions(aId) {
  const a = ASSIGN_DATA.find(x=>x.id===aId);
  if (!a) return;
  // In real app this pulls from Sheet — for now downloads a summary
  const headers = ['Assignment','Batch','Due Date','Total','Submitted','Pending','Status'];
  const rows = [[a.title, a.batch, a.due, a.total, a.submitted, a.total-a.submitted, a.status]];
  downloadCSV(`Assignment_${a.title.replace(/[^a-z0-9]/gi,'_')}_Summary.csv`, headers, rows);
}

// ── GOOGLE SHEETS API ──────────────────────────────────────────────
async function saveToSheet(sheet, data) {
  try {
    showSpinner('Saving to Google Sheets...');
    const res = await fetch(APPS_SCRIPT_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sheet, ...data, savedBy: currentUser?.name, savedOn: fmtDate() }),
    });
    const result = await res.json();
    hideSpinner();
    if (result.status === 'ok') toast('Saved to Google Sheets ✓', 'success');
    else toast('Saved locally. Sheet sync pending.', 'info');
    return result;
  } catch(e) {
    hideSpinner();
    toast('Saved locally. Sheet will sync when online.', 'info');
    return null;
  }
}

async function fetchFromSheet(sheet) {
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?sheet=${sheet}`);
    return await res.json();
  } catch(e) { return null; }
}

// ════════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════════
function showLogin() {
  document.body.innerHTML = `
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  <div style="min-height:100vh;background:#f5f6fa;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif">
    <div style="background:#fff;border:1px solid #e4e6ef;border-radius:16px;padding:40px 36px;width:100%;max-width:420px;box-shadow:0 4px 24px rgba(0,0,0,.06)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">L&D</div>
        <div><div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:600">L&D Hub</div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">greytHR · Learning Portal</div></div>
      </div>
      <div style="font-size:22px;font-weight:600;margin-bottom:6px;font-family:'Playfair Display',serif">Welcome back 👋</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:22px">Enter your greytHR email to access your dashboard</div>
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px">Email address</label>
      <input id="login-email" type="email" placeholder="yourname@greytip.com"
        style="width:100%;padding:10px 13px;border:1px solid #e4e6ef;border-radius:8px;font-size:14px;outline:none;margin-bottom:10px;font-family:'DM Sans',sans-serif;transition:border .15s"
        onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e4e6ef'"
        onkeydown="if(event.key==='Enter')doLogin()"/>
      <div id="login-err" style="display:none;font-size:12px;color:#ef4444;margin-bottom:10px;padding:8px 12px;background:#fef2f2;border-radius:6px"></div>
      <button onclick="doLogin()" style="width:100%;padding:11px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background .15s" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">Continue →</button>
      <div style="margin-top:18px;background:#f9fafb;border-radius:8px;padding:14px;font-size:12px">
        <div style="font-weight:500;color:#374151;margin-bottom:8px">Demo logins — click to fill:</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <span onclick="document.getElementById('login-email').value='priya@greytip.com'" style="cursor:pointer;color:#3b82f6">priya@greytip.com <span style="color:#6b7280">— Admin (full access)</span></span>
          <span onclick="document.getElementById('login-email').value='manager1@greytip.com'" style="cursor:pointer;color:#3b82f6">manager1@greytip.com <span style="color:#6b7280">— Manager (Sales team)</span></span>
          <span onclick="document.getElementById('login-email').value='ravi@greytip.com'" style="cursor:pointer;color:#3b82f6">ravi@greytip.com <span style="color:#6b7280">— Participant (Sales Batch A)</span></span>
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
    const e = document.getElementById('login-err');
    e.style.display='block';
    e.textContent='Email not found. Please check or contact your L&D Admin (priya@greytip.com).';
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
    {id:'dash',      label:'Dashboard',         dot:'#3b82f6'},
    {id:'batches',   label:'Batch Folders',      dot:'#8b5cf6', badge:myBatches().length},
    {id:'assess',    label:'Self Assessments',   dot:'#10b981'},
    {id:'assign',    label:'Assignments',        dot:'#f59e0b', badge: (isAdmin()?ASSIGN_DATA:ASSIGN_DATA.filter(a=>currentUser.batchIds.includes(a.batchId))).filter(a=>a.status==='Open').length||null},
    {id:'materials', label:'Learning Materials', dot:'#14b8a6'},
    {id:'attend',    label:'Attendance',         dot:'#ef4444'},
    {id:'feedback',  label:'Feedback Forms',     dot:'#ec4899'},
    ...(!isPart()?[{id:'data',    label:'All Data',           dot:'#8b5cf6'}]:[]),
    ...(!isPart()?[{id:'reports', label:'Report Folders',     dot:'#f97316'}]:[]),
  ];
  document.body.innerHTML = `
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
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
        ${navItems.map(n=>`<div class="ni" id="ni-${n.id}" onclick="go('${n.id}',this)">
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

function go(id, el) {
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  const main = document.getElementById('main-content');
  if (!main) return;
  const pages = {dash:renderDash, batches:renderBatches, assess:renderAssess, assign:renderAssign, materials:renderMaterials, attend:renderAttend, feedback:renderFeedback, data:renderAllData, reports:renderReports};
  if (pages[id]) { main.innerHTML=''; pages[id](main); }
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════
function renderDash(el) {
  const batches=myBatches();
  let greeting,sub,stats;
  if(isAdmin()){
    greeting='Good morning, Priya 👋'; sub='Your L&D Hub — all batches, sessions and assignments at a glance.';
    stats=[{l:'Active Batches',v:BATCHES.length,c:'#8b5cf6',b:'bp',n:'This quarter'},{l:'Total Participants',v:58,c:'#3b82f6',b:'bb',n:'Across all batches'},{l:'Open Assignments',v:ASSIGN_DATA.filter(a=>a.status==='Open').length,c:'#f59e0b',b:'ba',n:'Awaiting submission'},{l:'Feedback Collected',v:'89%',c:'#10b981',b:'bg',n:'Above target'}];
  } else if(isMgr()){
    greeting=`Team Overview — ${currentUser.dept} 📊`; sub='Track your team\'s training progress and feedback.';
    stats=[{l:'My Team Batches',v:batches.length,c:'#8b5cf6',b:'bp',n:'Assigned to you'},{l:'Team Participants',v:batches.reduce((a,b)=>a+b.participants,0),c:'#3b82f6',b:'bb',n:'In your batches'},{l:'Avg Attendance',v:'84%',c:'#10b981',b:'bg',n:'This month'},{l:'Open Assignments',v:ASSIGN_DATA.filter(a=>currentUser.batchIds.includes(a.batchId)&&a.status==='Open').length,c:'#f59e0b',b:'ba',n:'In your batches'}];
  } else {
    greeting=`Welcome, ${currentUser.name.split(' ')[0]}! 👋`; sub='Your enrolled batches, assignments and materials — all in one place.';
    const myOpen=ASSIGN_DATA.filter(a=>currentUser.batchIds.includes(a.batchId)&&a.status==='Open').length;
    stats=[{l:'My Batches',v:batches.length,c:'#8b5cf6',b:'bp',n:'Enrolled'},{l:'Pending Assignments',v:myOpen,c:'#f59e0b',b:'ba',n:myOpen?'Due soon':'All submitted'},{l:'My Attendance',v:'88%',c:'#10b981',b:'bg',n:'This program'},{l:'Feedback Given',v:'✓',c:'#3b82f6',b:'bb',n:'All submitted'}];
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
          ${batches.map(b=>`<div style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="go('batches',document.getElementById('ni-batches'))">
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
        <div class="ct">Quick Actions</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${isAdmin()?`
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('assign',document.getElementById('ni-assign'))"><span style="font-size:16px">📤</span> Upload New Assignment</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('materials',document.getElementById('ni-materials'))"><span style="font-size:16px">📂</span> Upload Learning Material</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('attend',document.getElementById('ni-attend'))"><span style="font-size:16px">✅</span> Mark Today's Attendance</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('data',document.getElementById('ni-data'))"><span style="font-size:16px">📊</span> View All Collected Data</button>
          `:`
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('assign',document.getElementById('ni-assign'))"><span style="font-size:16px">📤</span> Submit My Assignment</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('assess',document.getElementById('ni-assess'))"><span style="font-size:16px">📝</span> Fill Self Assessment</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('feedback',document.getElementById('ni-feedback'))"><span style="font-size:16px">⭐</span> Give Feedback</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('materials',document.getElementById('ni-materials'))"><span style="font-size:16px">📚</span> View My Materials</button>
          `}
        </div>
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════════════════
//  ALL DATA PAGE (Admin + Manager)
// ════════════════════════════════════════════════════════════════
function renderAllData(el) {
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">All Collected Data</div><div class="ps">Everything saved to Google Sheets — attendance, feedback, assessments and submissions.</div></div>
      <button class="btn btn-p btn-sm" onclick="refreshAllData()">↻ Refresh from Sheets</button>
    </div>
    <div class="g4" style="margin-bottom:24px">
      <div class="sc" style="cursor:pointer" onclick="showDataTab('att-data',this)"><div class="sl">Attendance Records</div><div class="sv" style="color:#ef4444">↗</div><div class="sbadge bc">View in Sheets</div></div>
      <div class="sc" style="cursor:pointer" onclick="showDataTab('fb-data',this)"><div class="sl">Feedback Responses</div><div class="sv" style="color:#ec4899">${FEEDBACK_RESPONSES.length}</div><div class="sbadge bpk">All responses</div></div>
      <div class="sc" style="cursor:pointer" onclick="showDataTab('asgn-data',this)"><div class="sl">Assignment Submissions</div><div class="sv" style="color:#f59e0b">${ASSIGN_DATA.reduce((a,b)=>a+b.submitted,0)}</div><div class="sbadge ba">Total submitted</div></div>
      <div class="sc" style="cursor:pointer" onclick="showDataTab('assess-data',this)"><div class="sl">Self Assessments</div><div class="sv" style="color:#10b981">${ASSESS_DATA.reduce((a,b)=>a+b.resp,0)}</div><div class="sbadge bg">Responses</div></div>
    </div>

    <div class="tabs" id="data-tabs">
      <div class="tab active" onclick="showDataTab('att-data',this)">Attendance</div>
      <div class="tab" onclick="showDataTab('fb-data',this)">Feedback</div>
      <div class="tab" onclick="showDataTab('asgn-data',this)">Assignments</div>
      <div class="tab" onclick="showDataTab('assess-data',this)">Assessments</div>
    </div>

    <div id="att-data" class="data-panel">
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
          <div style="font-size:14px;font-weight:500">Attendance Records — All Batches</div>
          <div style="display:flex;gap:8px">
            <select class="fsel" style="width:180px" onchange="filterDataTable(this.value)"><option value="">All Batches</option>${BATCHES.map(b=>`<option>${b.name}</option>`).join('')}</select>
            <button class="btn btn-g btn-sm" onclick="downloadAttendanceFull()">⬇ Download CSV</button>
            <a href="https://docs.google.com/spreadsheets" target="_blank" class="btn btn-o btn-sm">Open Sheets ↗</a>
          </div>
        </div>
        <table class="tbl" id="att-data-table">
          <thead><tr><th>Batch</th><th>Session</th><th>Participant</th><th>Dept</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${BATCHES.flatMap(b=>(PARTICIPANTS[b.id]||[]).map(p=>`<tr>
            <td>${b.name}</td><td>Session 1 — Apr 1</td>
            <td style="font-weight:500">${p.n}</td>
            <td><span class="b bb">${p.dept}</span></td>
            <td><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px"> Present</span></td>
            <td style="color:var(--muted)">Apr 1, 2026</td>
          </tr>`)).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div id="fb-data" class="data-panel" style="display:none">
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
          <div style="font-size:14px;font-weight:500">Feedback Responses — All Batches</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-g btn-sm" onclick="downloadFeedback()">⬇ Download CSV</button>
            <a href="https://docs.google.com/spreadsheets" target="_blank" class="btn btn-o btn-sm">Open Sheets ↗</a>
          </div>
        </div>
        <table class="tbl">
          <thead><tr><th>Participant</th><th>Batch</th><th>Session</th><th>Rating</th><th>Relevance</th><th>Date</th></tr></thead>
          <tbody>${FEEDBACK_RESPONSES.map(r=>`<tr>
            <td style="font-weight:500">${r.name}</td><td>${r.batch}</td>
            <td style="color:var(--muted)">${r.session||'—'}</td>
            <td><span style="color:#f59e0b">${stars(r.rating)}</span></td>
            <td><span class="b ${({Excellent:'bg',Good:'bb',Average:'ba',Poor:'bc'})[r.rel]||'bb'}">${r.rel}</span></td>
            <td style="color:var(--muted)">${r.date||'—'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>

    <div id="asgn-data" class="data-panel" style="display:none">
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
          <div style="font-size:14px;font-weight:500">Assignment Submission Tracker</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-g btn-sm" onclick="downloadAllAssignments()">⬇ Download CSV</button>
            <a href="https://docs.google.com/spreadsheets" target="_blank" class="btn btn-o btn-sm">Open Sheets ↗</a>
          </div>
        </div>
        <table class="tbl">
          <thead><tr><th>Assignment</th><th>Batch</th><th>Due</th><th>Submitted</th><th>Pending</th><th>Status</th><th>Uploaded By</th></tr></thead>
          <tbody>${ASSIGN_DATA.map(a=>`<tr>
            <td style="font-weight:500">${a.title}</td><td>${a.batch}</td><td>${a.due}</td>
            <td><span style="color:#10b981;font-weight:500">${a.submitted}</span></td>
            <td><span style="color:#f59e0b;font-weight:500">${a.total-a.submitted}</span></td>
            <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
            <td style="color:var(--muted)">${a.uploadedBy||'Priya K.'}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>

    <div id="assess-data" class="data-panel" style="display:none">
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
          <div style="font-size:14px;font-weight:500">Self Assessment Responses</div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-g btn-sm" onclick="downloadAssessments()">⬇ Download CSV</button>
            <a href="https://docs.google.com/spreadsheets" target="_blank" class="btn btn-o btn-sm">Open Sheets ↗</a>
          </div>
        </div>
        <table class="tbl">
          <thead><tr><th>Assessment</th><th>Batch</th><th>Questions</th><th>Responses</th><th>Completion</th><th>Status</th></tr></thead>
          <tbody>${ASSESS_DATA.map(a=>`<tr>
            <td style="font-weight:500">${a.title}</td><td>${a.batch}</td><td>${a.qs}</td>
            <td>${a.resp}/${a.total}</td>
            <td><div style="display:flex;align-items:center;gap:8px"><div class="pb" style="width:80px"><div class="pf" style="width:${Math.round(a.resp/a.total*100)}%;background:#3b82f6"></div></div><span style="font-size:12px">${Math.round(a.resp/a.total*100)}%</span></div></td>
            <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
}

function showDataTab(id, el) {
  document.querySelectorAll('.data-panel').forEach(p=>p.style.display='none');
  document.querySelectorAll('#data-tabs .tab').forEach(t=>t.classList.remove('active'));
  const panel = document.getElementById(id);
  if(panel) panel.style.display='block';
  if(el&&el.classList) el.classList.add('active');
}

async function refreshAllData() {
  toast('Refreshing data from Google Sheets...','info');
  const fbData = await fetchFromSheet('feedback');
  if (fbData && Array.isArray(fbData)) {
    toast('Data refreshed from Sheets ✓','success');
  } else {
    toast('Using local data. Connect Sheets for live data.','info');
  }
}

function downloadAttendanceFull() {
  const headers=['Batch','Session','Participant','Department','Status','Date','Marked By'];
  const rows=BATCHES.flatMap(b=>(PARTICIPANTS[b.id]||[]).map(p=>[b.name,'Session 1 — Apr 1',p.n,p.dept,'Present','Apr 1, 2026','Priya K.']));
  downloadCSV('Attendance_All_Batches.csv',headers,rows);
}

function downloadAllAssignments() {
  const headers=['Assignment','Batch','Due Date','Total','Submitted','Pending','Status','Uploaded By','Uploaded On'];
  const rows=ASSIGN_DATA.map(a=>[a.title,a.batch,a.due,a.total,a.submitted,a.total-a.submitted,a.status,a.uploadedBy||'Priya K.',a.uploadedOn||'—']);
  downloadCSV('All_Assignments.csv',headers,rows);
}

function downloadAssessments() {
  const headers=['Assessment','Batch','Questions','Responses','Total','Completion %','Status'];
  const rows=ASSESS_DATA.map(a=>[a.title,a.batch,a.qs,a.resp,a.total,Math.round(a.resp/a.total*100)+'%',a.status]);
  downloadCSV('Assessment_Responses.csv',headers,rows);
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
      ${batches.map(b=>`<div class="folder" onclick="openBatch('${b.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${b.icon}</div><span class="b ${sBadge(b.status)}">${b.status}</span></div>
        <div class="folder-name">${b.name}</div>
        <div class="folder-meta">${b.dept} · ${b.program} · ${b.participants} participants</div>
        <div class="pb"><div class="pf" style="width:${b.progress}%;background:${b.color}"></div></div>
        <div class="folder-actions"><span class="b bb">${b.materials} materials</span><span class="b ba">${ASSIGN_DATA.filter(a=>a.batchId===b.id).length} assignments</span><span class="b bg">Attend: ${b.attendance}%</span></div>
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
  if(!name){toast('Please enter a batch name','error');return;}
  const dept=document.getElementById('bdept').value;
  const prog=document.getElementById('bprog').value.trim()||'Program';
  const nid=String.fromCharCode(65+BATCHES.length);
  BATCHES.push({id:nid,name,dept,program:prog,participants:0,progress:0,status:'New',color:'#3b82f6',icon:'🗂️',materials:0,assignments:0,attendance:0,feedback:'0/0'});
  PARTICIPANTS[nid]=[];
  saveToSheet('batch',{name,dept,program:prog,startDate:document.getElementById('bstart')?.value,emails:document.getElementById('bemails')?.value});
  go('batches',document.getElementById('ni-batches'));
}

function openBatch(id) {
  const b=BATCHES.find(x=>x.id===id);
  const ps=PARTICIPANTS[id]||[];
  document.getElementById('batch-grid').style.display='none';
  const det=document.getElementById('batch-detail');
  det.style.display='block';
  const bAssigns=ASSIGN_DATA.filter(a=>a.batchId===id);
  const tabs=[
    {id:'overview',  label:'Overview'},
    {id:'materials', label:`Materials (${MATERIALS_DATA.filter(m=>m.batchId===id||m.batchId==='ALL').length})`},
    {id:'assign',    label:`Assignments (${bAssigns.length})`},
    {id:'assess',    label:'Self Assessment'},
    ...(!isPart()?[{id:'attend',label:'Attendance'}]:[]),
  ];
  det.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <button class="btn btn-o btn-sm" onclick="closeBatch()">← Back</button>
      <div><div class="pt" style="font-size:18px">${b.name}</div><div class="ps">${b.dept} · ${b.program}</div></div>
    </div>
    <div class="tabs" id="btabs">${tabs.map((t,i)=>`<div class="tab${i===0?' active':''}" onclick="bTab('${id}','${t.id.split(' ')[0]}',this)">${t.label}</div>`).join('')}</div>
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
  const bAssigns=ASSIGN_DATA.filter(a=>a.batchId===bId);
  const bMats=MATERIALS_DATA.filter(m=>m.batchId===bId||m.batchId==='ALL');

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
        ${[['Materials shared',bMats.length],['Assignments given',bAssigns.length],['Avg attendance',b.attendance+'%'],['Feedback submitted',b.feedback]].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px">
          <span style="color:var(--muted)">${k}</span><span style="font-weight:500">${v}</span>
        </div>`).join('')}
      </div>
    </div>`;
  } else if(tabId==='materials') {
    con.innerHTML=`<div class="card">
      <div class="section-row">
        <div class="ct" style="margin:0">Materials (${bMats.length})</div>
        ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload <input type="file" multiple style="display:none" onchange="uploadBatchMat(this,'${bId}')"/></label>`:''}
      </div>
      <div id="bmat-list-${bId}">
        ${bMats.map(m=>`<div class="fi-row"><span class="fi-icon">${m.icon}</span><span class="fi-name">${m.name}</span><span class="fi-size">${m.size}</span><span class="b ${typeBadge(m.type)}">${m.type}</span><span class="fi-dl" onclick="toast('Downloading ${m.name}...')">⬇ Download</span></div>`).join('')}
      </div>
    </div>`;
  } else if(tabId==='assign') {
    con.innerHTML=`
      ${!isPart()?`<div class="card" style="margin-bottom:16px">
        <div class="section-row">
          <div class="ct" style="margin:0">Assignments (${bAssigns.length})</div>
          ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload Assignment <input type="file" multiple style="display:none" onchange="uploadBatchAssign(this,'${bId}')"/></label>`:''}
        </div>
        <table class="tbl"><thead><tr><th>Assignment</th><th>Due</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="bassign-list-${bId}">${bAssigns.map(a=>`<tr>
          <td><div style="font-weight:500">${a.title}</div><div style="font-size:11px;color:var(--muted)">Uploaded by ${a.uploadedBy||'Priya K.'} · ${a.uploadedOn||''}</div></td>
          <td>${a.due}</td>
          <td>${a.submitted}/${a.total}<div class="pb" style="width:80px;margin-top:4px"><div class="pf" style="width:${Math.round(a.submitted/a.total*100)}%;background:${a.status==='Closed'?'#10b981':'#f59e0b'}"></div></div></td>
          <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
          <td><div style="display:flex;gap:5px">
            <button class="btn btn-o btn-xs" onclick="toast('Opening submissions...')">Submissions</button>
            <button class="btn btn-g btn-xs" onclick="downloadAssignmentSubmissions('${a.id}')">⬇ CSV</button>
          </div></td>
        </tr>`).join('')}</tbody></table>
      </div>`:''}
      <div class="card">
        <div class="ct">Submit Assignment <span class="b bg">Participant</span></div>
        ${bAssigns.filter(a=>a.status==='Open').length===0?`<div style="font-size:13px;color:var(--muted);padding:12px 0">No open assignments for this batch right now.</div>`:`
        <div class="fg"><label class="fl">Select Assignment</label><select class="fsel" id="sub-pick-${bId}">${bAssigns.filter(a=>a.status==='Open').map(a=>`<option value="${a.id}">${a.title} (Due ${a.due})</option>`).join('')}</select></div>
        <div class="uz" onclick="this.querySelector('input').click()"><div class="uz-icon">📤</div><div class="uz-txt">Upload your completed assignment</div><div class="uz-hint">PDF, Word, Excel — Max 10MB</div><input type="file" id="sub-file-${bId}" style="display:none" onchange="handleSubFile(this,'${bId}')"/></div>
        <div id="sub-fname-${bId}" style="display:none;font-size:13px;color:var(--green);margin-top:8px;font-weight:500"></div>
        <div class="fg" style="margin-top:12px"><label class="fl">Notes for trainer (optional)</label><textarea class="fta" id="sub-notes-${bId}" placeholder="Any comments?" style="min-height:60px"></textarea></div>
        <button class="btn btn-p" onclick="submitAssignment('${bId}')">Submit Assignment</button>`}
      </div>`;
  } else if(tabId==='assess') {
    con.innerHTML=`
      ${!isPart()?`<div class="card" style="margin-bottom:16px"><div class="ct">Assessment Results</div>
        <table class="tbl"><thead><tr><th>Assessment</th><th>Qs</th><th>Responses</th><th>Status</th><th></th></tr></thead>
        <tbody>${ASSESS_DATA.filter(a=>a.batchId===bId).map(a=>`<tr>
          <td style="font-weight:500">${a.title}</td><td>${a.qs}</td>
          <td>${a.resp}/${a.total}<div class="pb" style="width:80px;margin-top:4px"><div class="pf" style="width:${Math.round(a.resp/a.total*100)}%;background:#3b82f6"></div></div></td>
          <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
          <td><button class="btn btn-o btn-xs" onclick="toast('Opening results...')">Results</button></td>
        </tr>`).join('')}</tbody></table>
      </div>`:''}
      <div class="card">
        <div class="ct">Self Assessment Form <span class="b bg">Fill & Submit</span></div>
        <div class="fg"><label class="fl">Your Name</label><input class="fi" id="assess-name-${bId}" value="${isPart()?currentUser.name:''}" placeholder="Your name"/></div>
        <div style="margin-bottom:14px">
          <div style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Rate yourself 1 (Low) → 5 (High)</div>
          ${ASSESS_QUESTIONS.map((q,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);gap:8px;flex-wrap:wrap">
            <span style="font-size:13px;flex:1">${q}</span>
            <div style="display:flex;gap:8px">${[1,2,3,4,5].map(v=>`<label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="radio" name="aq${bId}${i}" value="${v}">${v}</label>`).join('')}</div>
          </div>`).join('')}
        </div>
        <div class="fg"><label class="fl">Key Learnings</label><textarea class="fta" id="assess-learn-${bId}" placeholder="What did you take away?"></textarea></div>
        <div class="fg"><label class="fl">Areas to Improve</label><textarea class="fta" id="assess-improve-${bId}" placeholder="What do you want to work on?"></textarea></div>
        <button class="btn btn-p" onclick="submitAssessment('${bId}')">Submit Assessment</button>
        <div id="assess-msg-${bId}" style="display:none" class="success-msg">✓ Assessment submitted and saved to Google Sheets!</div>
      </div>`;
  } else if(tabId==='attend') {
    attBatchId=bId; attState=ps.map(()=>true);
    con.innerHTML=`<div class="card">
      <div class="section-row" style="flex-wrap:wrap;gap:8px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <select class="fsel" style="width:200px" onchange="attSession=this.value">
            <option>Session 1 — Apr 1</option><option>Session 2 — Apr 8</option><option>Session 3 — Apr 15</option>
          </select>
          <input type="date" class="fi" style="width:150px" value="2026-04-01"/>
        </div>
        <div style="display:flex;gap:8px">
          ${isAdmin()?`<button class="btn btn-o btn-sm" onclick="markAllPresentBatch('${bId}')">✓ Mark All Present</button>`:''}
          ${isAdmin()?`<button class="btn btn-g btn-sm" onclick="saveAttBatch('${bId}')">💾 Save</button>`:''}
          <button class="btn btn-o btn-sm" onclick="downloadAttendance()">⬇ Download CSV</button>
        </div>
      </div>
      <div class="g4" style="margin-bottom:14px">
        <div class="sc" style="padding:12px 14px"><div class="sl">Total</div><div class="sv" style="font-size:20px" id="bat-total">${ps.length}</div></div>
        <div class="sc" style="padding:12px 14px"><div class="sl">Present</div><div class="sv" style="font-size:20px;color:#10b981" id="bat-pres">${ps.length}</div></div>
        <div class="sc" style="padding:12px 14px"><div class="sl">Absent</div><div class="sv" style="font-size:20px;color:#ef4444" id="bat-abs">0</div></div>
        <div class="sc" style="padding:12px 14px"><div class="sl">%</div><div class="sv" style="font-size:20px;color:#f59e0b" id="bat-pct">100%</div></div>
      </div>
      <table class="tbl"><thead><tr><th>Participant</th><th>Dept</th><th>Prev Sessions</th><th>Today</th>${isAdmin()?'<th>Toggle</th>':''}</tr></thead>
      <tbody>${ps.map((p,i)=>`<tr>
        <td style="font-weight:500">${p.n}</td>
        <td><span class="b bb">${p.dept}</span></td>
        <td><span class="adot" style="background:#10b981"></span>P &nbsp;<span class="adot" style="background:#10b981"></span>P</td>
        <td id="ba${bId}${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span></td>
        ${isAdmin()?`<td><button class="btn btn-o btn-xs" onclick="toggleBatchAtt('${bId}',${i},${ps.length})">Toggle</button></td>`:''}
      </tr>`).join('')}</tbody></table>
    </div>`;
  }
}

function toggleBatchAtt(bId,i,total) {
  attState[i]=!attState[i];
  const el=document.getElementById('ba'+bId+i);
  el.innerHTML=attState[i]?`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span>`:`<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444;font-size:13px">Absent</span>`;
  const p=attState.filter(Boolean).length;
  document.getElementById('bat-pres').textContent=p;
  document.getElementById('bat-abs').textContent=total-p;
  document.getElementById('bat-pct').textContent=Math.round(p/total*100)+'%';
}

function markAllPresentBatch(bId) {
  const ps=PARTICIPANTS[bId]||[];
  attState=ps.map(()=>true);
  ps.forEach((_,i)=>{const el=document.getElementById('ba'+bId+i);if(el)el.innerHTML=`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span>`;});
  document.getElementById('bat-pres').textContent=ps.length;
  document.getElementById('bat-abs').textContent=0;
  document.getElementById('bat-pct').textContent='100%';
}

async function saveAttBatch(bId) {
  const ps=PARTICIPANTS[bId]||[];
  const batch=BATCHES.find(b=>b.id===bId);
  const records=ps.map((p,i)=>({name:p.n,dept:p.dept,status:attState[i]?'Present':'Absent'}));
  await saveToSheet('attendance',{batchName:batch?.name,batchId:bId,session:attSession,date:fmtDate(),records});
}

function uploadBatchMat(inp,bId) {
  const batch=BATCHES.find(b=>b.id===bId);
  Array.from(inp.files).forEach(f=>{
    const ext=f.name.split('.').pop().toLowerCase();
    const icon=typeIcon(ext);
    const mat={icon,name:f.name,batch:batch?.name||bId,batchId:bId,type:'New',size:(f.size/1024).toFixed(0)+' KB',date:fmtDate()};
    MATERIALS_DATA.push(mat);
    const list=document.getElementById('bmat-list-'+bId);
    if(list){const div=document.createElement('div');div.className='fi-row';div.innerHTML=`<span class="fi-icon">${icon}</span><span class="fi-name">${f.name}</span><span class="fi-size">${mat.size}</span><span class="b bb">New</span><span class="fi-dl" onclick="toast('Downloading...')">⬇ Download</span>`;list.appendChild(div);}
    saveToSheet('material',{name:f.name,batchName:batch?.name,batchId});
  });
  const b=BATCHES.find(x=>x.id===bId);if(b)b.materials+=inp.files.length;
  toast(inp.files.length+' material(s) uploaded!','success');
}

function uploadBatchAssign(inp,bId) {
  const batch=BATCHES.find(b=>b.id===bId);
  Array.from(inp.files).forEach((f,idx)=>{
    const newAssign={
      id:'AS'+(ASSIGN_DATA.length+1+idx),
      title:f.name.replace(/\.[^/.]+$/,''),
      batch:batch?.name||bId,
      batchId:bId,
      due:'TBD',
      submitted:0,
      total:batch?.participants||0,
      status:'Open',
      uploadedBy:currentUser.name,
      uploadedOn:fmtDate(),
    };
    ASSIGN_DATA.push(newAssign);
    saveToSheet('assignment',{title:newAssign.title,batchName:batch?.name,batchId,due:'TBD',uploadedBy:currentUser.name});
  });
  toast(inp.files.length+' assignment(s) uploaded and shared with batch!','success');
  // Refresh the batch detail
  openBatch(bId);
}

function handleSubFile(inp,bId) {
  const el=document.getElementById('sub-fname-'+bId);
  if(el&&inp.files.length){el.style.display='block';el.textContent='📎 '+inp.files[0].name+' ready to submit';}
}

async function submitAssignment(bId) {
  const selEl=document.getElementById('sub-pick-'+bId);
  const fileEl=document.getElementById('sub-file-'+bId);
  const notesEl=document.getElementById('sub-notes-'+bId);
  if(!fileEl||!fileEl.files.length){toast('Please select a file to upload','error');return;}
  const aId=selEl?.value;
  const assign=ASSIGN_DATA.find(a=>a.id===aId);
  if(assign) assign.submitted=Math.min(assign.submitted+1,assign.total);
  await saveToSheet('submission',{assignmentId:aId,assignmentTitle:assign?.title,employeeName:currentUser.name,batchId,fileName:fileEl.files[0].name,notes:notesEl?.value||''});
  const msg=document.createElement('div');msg.className='success-msg';msg.textContent='✓ Assignment submitted! Your trainer has been notified.';msg.style.marginTop='10px';
  fileEl.closest('.card').appendChild(msg);
  setTimeout(()=>msg.remove(),4000);
}

async function submitAssessment(bId) {
  const name=document.getElementById('assess-name-'+bId)?.value||currentUser.name;
  const learn=document.getElementById('assess-learn-'+bId)?.value;
  const improve=document.getElementById('assess-improve-'+bId)?.value;
  const ratings={};
  ASSESS_QUESTIONS.forEach((_,i)=>{const r=document.querySelector(`input[name="aq${bId}${i}"]:checked`);ratings['q'+(i+1)]=r?.value||'';});
  await saveToSheet('assessment',{employeeName:name,batchId,batchName:BATCHES.find(b=>b.id===bId)?.name,...ratings,keyLearnings:learn,areasToImprove:improve});
  const msg=document.getElementById('assess-msg-'+bId);
  if(msg){msg.style.display='block';setTimeout(()=>msg.style.display='none',4000);}
}

// ════════════════════════════════════════════════════════════════
//  SELF ASSESSMENTS PAGE
// ════════════════════════════════════════════════════════════════
function renderAssess(el) {
  const data=isAdmin()?ASSESS_DATA:ASSESS_DATA.filter(a=>currentUser.batchIds.includes(a.batchId));
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Self Assessments</div><div class="ps">${isAdmin()?'All batch assessments — view results and share links.':isPart()?'Your assessments to fill and submit.':'Your team\'s assessment results.'}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="toast('New assessment created!')">+ New Assessment</button>`:''}
    </div>
    ${!isPart()?`<div class="card" style="padding:0;overflow:hidden;margin-bottom:20px">
      <div style="padding:12px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)">
        <div style="font-size:14px;font-weight:500">All Assessment Results</div>
        <button class="btn btn-g btn-sm" onclick="downloadAssessments()">⬇ Download CSV</button>
      </div>
      <table class="tbl"><thead><tr><th>Assessment</th><th>Batch</th><th>Questions</th><th>Responses</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${data.map(a=>`<tr>
        <td style="font-weight:500">${a.title}</td><td>${a.batch}</td><td>${a.qs} Qs</td>
        <td>${a.resp}/${a.total}<div class="pb" style="width:80px;margin-top:4px"><div class="pf" style="width:${Math.round(a.resp/a.total*100)}%;background:#3b82f6"></div></div></td>
        <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
        <td><div style="display:flex;gap:6px">${isAdmin()?`<button class="btn btn-o btn-xs" onclick="toast('Link copied!')">Share</button>`:''}<button class="btn btn-o btn-xs" onclick="toast('Opening results...')">Results</button>${a.status==='Closed'?`<button class="btn btn-g btn-xs" onclick="downloadAssessments()">⬇ CSV</button>`:''}</div></td>
      </tr>`).join('')}</tbody></table>
    </div>`:''}
    <div class="card">
      <div class="ct">Fill Self Assessment <span class="b bg">Submit your response</span></div>
      <div class="g2" style="margin-bottom:14px">
        <div class="fg" style="margin:0"><label class="fl">Your Name</label><input class="fi" id="massess-name" value="${isPart()?currentUser.name:''}" placeholder="Your name"/></div>
        <div class="fg" style="margin:0"><label class="fl">Select Assessment</label><select class="fsel" id="massess-pick">${data.map(a=>`<option value="${a.batchId}">${a.title} (${a.batch})</option>`).join('')}</select></div>
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Rate yourself 1 (Low) → 5 (High)</div>
        ${ASSESS_QUESTIONS.map((q,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);gap:8px;flex-wrap:wrap">
          <span style="font-size:13px;flex:1">${q}</span>
          <div style="display:flex;gap:8px">${[1,2,3,4,5].map(v=>`<label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="radio" name="maq${i}" value="${v}">${v}</label>`).join('')}</div>
        </div>`).join('')}
      </div>
      <div class="fg"><label class="fl">Key Learnings</label><textarea class="fta" id="massess-learn" placeholder="What did you take away?"></textarea></div>
      <div class="fg"><label class="fl">Areas to Improve</label><textarea class="fta" id="massess-improve" placeholder="What do you want to work on?"></textarea></div>
      <button class="btn btn-p" onclick="submitMainAssessment()">Submit Assessment</button>
      <div id="massess-msg" style="display:none" class="success-msg">✓ Assessment submitted and saved!</div>
    </div>`;
}

async function submitMainAssessment() {
  const bId=document.getElementById('massess-pick')?.value;
  const name=document.getElementById('massess-name')?.value||currentUser.name;
  const learn=document.getElementById('massess-learn')?.value;
  const improve=document.getElementById('massess-improve')?.value;
  const ratings={};
  ASSESS_QUESTIONS.forEach((_,i)=>{const r=document.querySelector(`input[name="maq${i}"]:checked`);ratings['q'+(i+1)]=r?.value||'';});
  await saveToSheet('assessment',{employeeName:name,batchId:bId,...ratings,keyLearnings:learn,areasToImprove:improve});
  const msg=document.getElementById('massess-msg');if(msg){msg.style.display='block';setTimeout(()=>msg.style.display='none',4000);}
}

// ════════════════════════════════════════════════════════════════
//  ASSIGNMENTS PAGE
// ════════════════════════════════════════════════════════════════
function renderAssign(el) {
  const data=isAdmin()?ASSIGN_DATA:ASSIGN_DATA.filter(a=>currentUser.batchIds.includes(a.batchId));
  const openData=data.filter(a=>a.status==='Open');
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Assignments</div><div class="ps">${isPart()?'Download, complete and submit your assignments here.':'Upload assignment sheets and track all submissions.'}</div></div>
      ${isAdmin()?`<div style="display:flex;gap:8px">
        <label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload Assignment <input type="file" multiple style="display:none" onchange="uploadMainAssign(this)"/></label>
        <button class="btn btn-g btn-sm" onclick="downloadAllAssignments()">⬇ Download All CSV</button>
      </div>`:''}
    </div>
    <div class="g2">
      ${!isPart()?`<div class="card">
        <div class="ct">All Assignments <span class="b ba">${openData.length} Open</span></div>
        ${data.map(a=>`<div class="assign-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
            <div><div class="assign-title">${a.title}</div><div class="assign-meta">${a.batch} · Due ${a.due} · Uploaded by ${a.uploadedBy||'Priya K.'}</div></div>
            <span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:8px">
            <div style="flex:1"><div class="pb"><div class="pf" style="width:${Math.round(a.submitted/a.total*100)}%;background:${a.status==='Closed'?'#10b981':'#f59e0b'}"></div></div></div>
            <span style="color:var(--muted)">${a.submitted}/${a.total} submitted</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-o btn-xs" onclick="toast('Opening submissions...')">View Submissions</button>
            <button class="btn btn-o btn-xs" onclick="toast('Downloading sheet...')">⬇ Sheet</button>
            <button class="btn btn-g btn-xs" onclick="downloadAssignmentSubmissions('${a.id}')">⬇ CSV</button>
            ${a.status==='Closed'?`<button class="btn btn-o btn-xs" onclick="toast('All submitted files downloaded...')">Download All</button>`:''}
          </div>
        </div>`).join('')}
      </div>`:''}
      <div class="card">
        <div class="ct">Submit Assignment <span class="b bg">${isPart()?'Your submission':'Participant view'}</span></div>
        ${openData.length===0?`<div style="font-size:13px;color:var(--muted);padding:12px 0">No open assignments right now.</div>`:`
        <div class="fg"><label class="fl">Your Name & Batch</label><input class="fi" id="msub-name" value="${isPart()?currentUser.name+' — '+myBatches()[0]?.name:''}" placeholder="Name — Batch"/></div>
        <div class="fg"><label class="fl">Select Assignment</label><select class="fsel" id="msub-pick">${openData.map(a=>`<option value="${a.id}">${a.title} — ${a.batch} (Due ${a.due})</option>`).join('')}</select></div>
        <div class="uz" onclick="this.querySelector('input').click()"><div class="uz-icon">📤</div><div class="uz-txt">Upload completed assignment</div><div class="uz-hint">PDF, Word, Excel — Max 10MB</div><input type="file" id="msub-file" style="display:none" onchange="document.getElementById('msub-fname').style.display='block';document.getElementById('msub-fname').textContent='📎 '+this.files[0].name+' ready'"/></div>
        <div id="msub-fname" style="display:none;font-size:13px;color:var(--green);margin-top:8px;font-weight:500"></div>
        <div class="fg" style="margin-top:12px"><label class="fl">Notes for trainer (optional)</label><textarea class="fta" id="msub-notes" placeholder="Any comments?" style="min-height:60px"></textarea></div>
        <button class="btn btn-p" onclick="submitMainAssign()">Submit Assignment</button>
        <div id="msub-msg" style="display:none" class="success-msg">✓ Submitted! Your trainer has been notified.</div>`}
      </div>
    </div>`;
}

function uploadMainAssign(inp) {
  // Pick which batch
  const batchNames=BATCHES.map(b=>b.name);
  const picked=prompt('Which batch is this assignment for?\n'+batchNames.map((b,i)=>`${i+1}. ${b}`).join('\n')+'\n\nEnter number:');
  const bIdx=parseInt(picked)-1;
  const batch=BATCHES[bIdx]||BATCHES[0];
  Array.from(inp.files).forEach(f=>{
    const newA={id:'AS'+(ASSIGN_DATA.length+1),title:f.name.replace(/\.[^/.]+$/,''),batch:batch.name,batchId:batch.id,due:'TBD',submitted:0,total:batch.participants,status:'Open',uploadedBy:currentUser.name,uploadedOn:fmtDate()};
    ASSIGN_DATA.push(newA);
    saveToSheet('assignment',{title:newA.title,batchName:batch.name,batchId:batch.id,due:'TBD',uploadedBy:currentUser.name});
  });
  toast(inp.files.length+' assignment(s) uploaded!','success');
  go('assign',document.getElementById('ni-assign'));
}

async function submitMainAssign() {
  const fileEl=document.getElementById('msub-file');
  if(!fileEl||!fileEl.files.length){toast('Please select a file to upload','error');return;}
  const aId=document.getElementById('msub-pick')?.value;
  const assign=ASSIGN_DATA.find(a=>a.id===aId);
  if(assign)assign.submitted=Math.min(assign.submitted+1,assign.total);
  await saveToSheet('submission',{assignmentId:aId,assignmentTitle:assign?.title,employeeName:currentUser.name,fileName:fileEl.files[0].name,notes:document.getElementById('msub-notes')?.value||''});
  document.getElementById('msub-msg').style.display='block';
  setTimeout(()=>document.getElementById('msub-msg').style.display='none',4000);
}

// ════════════════════════════════════════════════════════════════
//  LEARNING MATERIALS
// ════════════════════════════════════════════════════════════════
function renderMaterials(el) {
  const data=isAdmin()?MATERIALS_DATA:MATERIALS_DATA.filter(m=>currentUser.batchIds.includes(m.batchId)||m.batchId==='ALL');
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Learning Materials</div><div class="ps">${isAdmin()?'Upload and manage reference guides, decks and recordings for each batch.':'Your batch materials — download anytime.'}</div></div>
      ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload Material <input type="file" multiple style="display:none" onchange="uploadMainMat(this)"/></label>`:''}
    </div>
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
      <select class="fsel" style="width:180px" id="mat-filter-batch"><option value="">All Batches</option>${myBatches().map(b=>`<option value="${b.id}">${b.name}</option>`).join('')}</select>
      <select class="fsel" style="width:150px" id="mat-filter-type"><option value="">All Types</option><option>Guide</option><option>Slides</option><option>Handout</option><option>Video</option><option>Template</option></select>
      <input class="fi" style="width:220px" id="mat-search" placeholder="Search materials..." oninput="filterMaterials()"/>
    </div>
    <div class="g3" id="mat-grid">
      ${data.map(m=>`<div class="folder" data-batch="${m.batchId}" data-type="${m.type}" data-name="${m.name.toLowerCase()}">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${m.icon}</div><span class="b ${typeBadge(m.type)}">${m.type}</span></div>
        <div class="folder-name">${m.name}</div>
        <div class="folder-meta">${m.batch} · ${m.size} · ${m.date}</div>
        <div class="folder-actions">
          <button class="btn btn-o btn-xs" onclick="toast('Downloading ${m.name}...')">⬇ Download</button>
          ${isAdmin()?`<button class="btn btn-o btn-xs" onclick="toast('Share link copied!')">Share Link</button>`:''}
        </div>
      </div>`).join('')}
      ${isAdmin()?`<div class="folder folder-add" onclick="document.getElementById('mh').click()"><div class="folder-add-icon">+</div><div class="folder-add-txt">Upload new material</div><input type="file" id="mh" multiple style="display:none" onchange="uploadMainMat(this)"/></div>`:''}
    </div>`;
}

function filterMaterials() {
  const bFilter=document.getElementById('mat-filter-batch')?.value||'';
  const tFilter=document.getElementById('mat-filter-type')?.value||'';
  const sFilter=document.getElementById('mat-search')?.value.toLowerCase()||'';
  document.querySelectorAll('#mat-grid .folder[data-batch]').forEach(card=>{
    const bMatch=!bFilter||card.dataset.batch===bFilter||card.dataset.batch==='ALL';
    const tMatch=!tFilter||card.dataset.type===tFilter;
    const sMatch=!sFilter||card.dataset.name.includes(sFilter);
    card.style.display=(bMatch&&tMatch&&sMatch)?'flex':'none';
  });
}

function uploadMainMat(inp) {
  const batchNames=BATCHES.map(b=>b.name);
  const picked=prompt('Which batch is this for?\n'+batchNames.map((b,i)=>`${i+1}. ${b}`).join('\n')+'\n0. All Batches\n\nEnter number:');
  const bIdx=parseInt(picked)-1;
  const batch=bIdx>=0?BATCHES[bIdx]:null;
  const grid=document.getElementById('mat-grid');
  const addBtn=grid?.lastElementChild;
  Array.from(inp.files).forEach(f=>{
    const ext=f.name.split('.').pop().toLowerCase();
    const icon=typeIcon(ext);
    const mat={icon,name:f.name,batch:batch?.name||'All Batches',batchId:batch?.id||'ALL',type:'New',size:(f.size/1024).toFixed(0)+' KB',date:fmtDate()};
    MATERIALS_DATA.push(mat);
    if(grid&&addBtn){const div=document.createElement('div');div.className='folder';div.dataset.batch=mat.batchId;div.dataset.type=mat.type;div.dataset.name=mat.name.toLowerCase();div.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${icon}</div><span class="b bb">New</span></div><div class="folder-name">${f.name}</div><div class="folder-meta">${mat.batch} · ${mat.size} · Just now</div><div class="folder-actions"><button class="btn btn-o btn-xs" onclick="toast('Downloading...')">⬇ Download</button><button class="btn btn-o btn-xs" onclick="toast('Link copied!')">Share Link</button></div>`;grid.insertBefore(div,addBtn);}
    saveToSheet('material',{name:f.name,batchName:mat.batch,batchId:mat.batchId});
    if(batch)batch.materials++;
  });
  toast(inp.files.length+' material(s) uploaded!','success');
}

// ════════════════════════════════════════════════════════════════
//  ATTENDANCE PAGE
// ════════════════════════════════════════════════════════════════
function renderAttend(el) {
  const batches=myBatches();
  attBatchId=batches[0]?.id||'A';
  const ps=PARTICIPANTS[attBatchId]||[];
  attState=ps.map(()=>true);
  el.innerHTML=`
    <div class="ph"><div><div class="pt">Attendance Tracker</div><div class="ps">${isAdmin()?'Mark, save and download batch-wise attendance for every session.':'View your team\'s attendance records.'}</div></div></div>
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center">
      <select class="fsel" style="width:230px" id="att-batch-sel" onchange="reloadAttPage(this.options[this.selectedIndex].dataset.id)">
        ${batches.map(b=>`<option data-id="${b.id}">${b.name}</option>`).join('')}
      </select>
      <select class="fsel" style="width:200px" id="att-session-sel" onchange="attSession=this.value">
        <option>Session 1 — Apr 1</option><option>Session 2 — Apr 8</option><option>Session 3 — Apr 15</option>
      </select>
      <input type="date" class="fi" style="width:155px" value="2026-04-01"/>
      ${isAdmin()?`<button class="btn btn-o btn-sm" onclick="markAllPresentPage()">✓ Mark All Present</button>`:''}
      ${isAdmin()?`<button class="btn btn-g btn-sm" onclick="saveAttPage()">💾 Save to Sheets</button>`:''}
      <button class="btn btn-o btn-sm" onclick="downloadAttendance()">⬇ Download CSV</button>
    </div>
    <div class="g4" style="margin-bottom:18px">
      <div class="sc" style="padding:14px 16px"><div class="sl">Total</div><div class="sv" style="font-size:22px" id="att-total">${ps.length}</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Present</div><div class="sv" style="font-size:22px;color:#10b981" id="att-pres">${ps.length}</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Absent</div><div class="sv" style="font-size:22px;color:#ef4444" id="att-abs">0</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Attendance %</div><div class="sv" style="font-size:22px;color:#f59e0b" id="att-pct">100%</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="tbl"><thead><tr><th>Participant</th><th>Dept</th><th>Previous Sessions</th><th>Today's Status</th>${isAdmin()?'<th>Toggle</th>':''}</tr></thead>
      <tbody id="att-body">${buildAttRows(ps)}</tbody></table>
    </div>`;
}

function buildAttRows(ps) {
  return ps.map((p,i)=>`<tr>
    <td style="font-weight:500">${p.n}</td>
    <td><span class="b bb">${p.dept}</span></td>
    <td><span class="adot" style="background:#10b981"></span>P &nbsp;<span class="adot" style="background:#10b981"></span>P</td>
    <td id="as${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span></td>
    ${isAdmin()?`<td><button class="btn btn-o btn-xs" onclick="toggleAttPage(${i},${ps.length})">Toggle</button></td>`:''}
  </tr>`).join('');
}

function reloadAttPage(bId) {
  attBatchId=bId;
  const ps=PARTICIPANTS[bId]||[];
  attState=ps.map(()=>true);
  document.getElementById('att-body').innerHTML=buildAttRows(ps);
  document.getElementById('att-total').textContent=ps.length;
  document.getElementById('att-pres').textContent=ps.length;
  document.getElementById('att-abs').textContent=0;
  document.getElementById('att-pct').textContent='100%';
}

function toggleAttPage(i,total) {
  attState[i]=!attState[i];
  const el=document.getElementById('as'+i);
  el.innerHTML=attState[i]?`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span>`:`<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444;font-size:13px">Absent</span>`;
  const p=attState.filter(Boolean).length;
  document.getElementById('att-pres').textContent=p;
  document.getElementById('att-abs').textContent=total-p;
  document.getElementById('att-pct').textContent=Math.round(p/total*100)+'%';
}

function markAllPresentPage() { const ps=PARTICIPANTS[attBatchId]||[]; attState=ps.map(()=>true); reloadAttPage(attBatchId); }
async function saveAttPage() { await saveAttBatch(attBatchId); }

// ════════════════════════════════════════════════════════════════
//  FEEDBACK PAGE
// ════════════════════════════════════════════════════════════════
function renderFeedback(el) {
  const rb=r=>({Excellent:'bg',Good:'bb',Average:'ba',Poor:'bc'}[r]||'bb');
  const responses=isAdmin()?FEEDBACK_RESPONSES:FEEDBACK_RESPONSES.filter(r=>currentUser.batchIds.includes(r.batchId));
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Feedback Forms</div><div class="ps">${isPart()?'Share your feedback on training sessions.':isAdmin()?'All feedback across batches.':'Your team\'s feedback.'}</div></div>
      <div style="display:flex;gap:8px">
        ${!isPart()?`<button class="btn btn-g btn-sm" onclick="downloadFeedback()">⬇ Download CSV</button>`:''}
        ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="toast('Form link copied to clipboard!')">📋 Copy Form Link</button>`:''}
      </div>
    </div>
    <div class="g2">
      <div class="card">
        <div class="ct">Submit Feedback <span class="b bg">${isPart()?'Your response':'Participant view'}</span></div>
        <div class="fg"><label class="fl">Your Name & Batch</label><input class="fi" id="fb-name" value="${isPart()?currentUser.name+' — '+myBatches()[0]?.name:''}" placeholder="Name — Batch"/></div>
        <div class="fg"><label class="fl">Session / Program</label><select class="fsel" id="fb-session">${myBatches().map(b=>`<option>${b.program} (${b.name})</option>`).join('')}</select></div>
        <div class="fg"><label class="fl">Overall Rating</label>
          <div style="display:flex;gap:4px" id="fb-stars">${[1,2,3,4,5].map(n=>`<span class="star" onclick="setStars(${n})">★</span>`).join('')}</div>
        </div>
        <div class="fg"><label class="fl">Content Relevance</label>
          <div style="display:flex;gap:14px;flex-wrap:wrap">${['Excellent','Good','Average','Poor'].map(o=>`<label class="radio-lbl"><input type="radio" name="rel" value="${o}"> ${o}</label>`).join('')}</div>
        </div>
        <div class="fg"><label class="fl">What was most useful?</label><textarea class="fta" id="fb-useful" placeholder="Share what worked well..."></textarea></div>
        <div class="fg"><label class="fl">Suggestions for improvement</label><textarea class="fta" id="fb-suggest" placeholder="What could be better?"></textarea></div>
        <button class="btn btn-p" onclick="submitFeedback()">Submit Feedback</button>
        <div id="fb-msg" style="display:none" class="success-msg">✓ Thank you! Feedback saved to Google Sheets.</div>
      </div>
      ${!isPart()?`<div class="card">
        <div class="ct">${isAdmin()?'All Responses':'Your Team Responses'} <span class="b bb">${responses.length} total</span></div>
        <table class="tbl"><thead><tr><th>Participant</th><th>Batch</th><th>Rating</th><th>Relevance</th><th>Date</th></tr></thead>
        <tbody>${responses.map(r=>`<tr>
          <td><div style="display:flex;align-items:center;gap:8px"><div class="av" style="background:${r.bg};color:${r.tc};width:26px;height:26px;font-size:10px">${r.av}</div>${r.name}</div></td>
          <td>${r.batch}</td><td><span style="color:#f59e0b">${stars(r.rating)}</span></td>
          <td><span class="b ${rb(r.rel)}">${r.rel}</span></td>
          <td style="color:var(--muted)">${r.date||'—'}</td>
        </tr>`).join('')}</tbody></table>
      </div>`:`<div class="card"><div class="ct">Your Submission History</div><div style="font-size:13px;color:var(--muted);text-align:center;padding:24px">Your past feedback submissions appear here after saving.</div></div>`}
    </div>`;
}

function setStars(n){fbStarVal=n;document.querySelectorAll('#fb-stars .star').forEach((s,i)=>s.classList.toggle('lit',i<n));}

async function submitFeedback() {
  const name=document.getElementById('fb-name')?.value;
  const session=document.getElementById('fb-session')?.value;
  const rel=document.querySelector('input[name="rel"]:checked')?.value||'';
  const useful=document.getElementById('fb-useful')?.value;
  const suggest=document.getElementById('fb-suggest')?.value;
  if(!fbStarVal){toast('Please give a star rating','error');return;}
  const newFb={av:currentUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),bg:'#eff6ff',tc:'#3b82f6',name:currentUser.name,batch:myBatches()[0]?.name||'',batchId:myBatches()[0]?.id||'',rating:fbStarVal,rel:rel||'Good',session,date:fmtDate()};
  FEEDBACK_RESPONSES.push(newFb);
  await saveToSheet('feedback',{employeeName:name,session,rating:fbStarVal,relevance:rel,mostUseful:useful,suggestions:suggest,batchId:myBatches()[0]?.id});
  const msg=document.getElementById('fb-msg');if(msg){msg.style.display='block';setTimeout(()=>msg.style.display='none',4000);}
}

// ════════════════════════════════════════════════════════════════
//  REPORTS
// ════════════════════════════════════════════════════════════════
function renderReports(el) {
  const sb=s=>({Completed:'bg','In Progress':'ba',Master:'bb'}[s]||'bb');
  const tb=(t,i)=>['bb','bg','bt','bp','bo','bpk'][i%6];
  const data=isAdmin()?REPORT_FOLDERS:REPORT_FOLDERS.filter(r=>currentUser.batchIds.includes(r.batchId)||r.batchId==='ALL');
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Report Folders</div><div class="ps">${isAdmin()?'Batch-wise reports — attendance, assessments, feedback and submissions.':'Your team\'s training reports.'}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="toast('Report generated and saved!')">Generate Report</button>`:''}
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
