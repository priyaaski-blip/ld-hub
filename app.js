// ════════════════════════════════════════════════════════════════
//  L&D Hub — greytHR  |  app.js  |  v4.0
//  ✅ Loads ALL data from Google Sheets on startup
//  ✅ Real file uploads to Google Drive (base64)
//  ✅ greytRISE skill assessment integration
//  ✅ Auto-progress calculation from real data
//  ✅ Email notifications via Apps Script
//  ✅ Certificate issuance
// ════════════════════════════════════════════════════════════════

const API = 'https://script.googleusercontent.com/a/macros/greytip.com/echo?user_content_key=AWDtjMUEYfv0-YCJfmG_tAlFd-LMAdCOw_otus8XjdO3Pc2aQIH81Yl13H1ABTxzFwdK4N_8RbKbQdtkqrjt11TxMWzYTl34nYK4tSovxIv-oFEfIwm-0DCMYG7zuPdnbbzAgzpH62XVF-iWP8ujxgE1W75wVpKGXI7XCGcohmx5I3BKvAdY_KdrgbYRkxRC9Xf4hu-UZqCe10L0k9O_5S7q7qcAQuFXeS3A977W7ajPZ5ESM6lk5tdGZGvdah3KOzdqndU7C0TMvYllrIyqo_FxrDXEp9udFclEe-Ei47ktFRMzaz2n_1E&lib=MegbckXIXlXbWo6FHJLYjBSnJ-3BPHXIn/exec';

// ── ASSESS QUESTIONS (fixed, not from Sheet) ──────────────────────
const ASSESS_QUESTIONS = [
  'Product / service knowledge','Communication clarity','Objection handling',
  'Active listening','Customer empathy','Discovery questioning',
  'Pipeline management','Team collaboration',
];

// ── APP STATE (all loaded from Sheets) ────────────────────────────
let STATE = {
  users:       {},   // email → user object
  batches:     [],   // from Sheets
  assignments: [],   // from Sheets
  materials:   [],   // from Sheets
  assessments: [],   // from Sheets
};
let currentUser = null;
let attState    = [];
let attBatchId  = '';
let attSession  = 'Session 1';
let fbStarVal   = 0;

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', showLogin);

// ── HELPERS ───────────────────────────────────────────────────────
const isAdmin = () => currentUser?.role === 'admin';
const isMgr   = () => currentUser?.role === 'manager';
const isPart  = () => currentUser?.role === 'participant';
const myBatches = () => {
  if (isAdmin()) return STATE.batches;
  return STATE.batches.filter(b => currentUser.batchIds.includes(b.id));
};
const fmtDate = () => new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
const stars   = n => '★'.repeat(n)+'☆'.repeat(5-n);
const typeIcon = ext => ({pdf:'📄',pptx:'📊',docx:'📝',xlsx:'📊',mp4:'🎬',doc:'📝'}[ext]||'📋');
const typeBadge= t => ({Guide:'bg',Slides:'bb',Handout:'bp',Template:'ba',Video:'bc'}[t]||'bb');
const sBadge  = s => s==='Completing'?'bg':s==='In Progress'?'bp':'bb';

function toast(msg, type='info') {
  let t = document.getElementById('toast');
  if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg;
  t.style.background=type==='success'?'#059669':type==='error'?'#dc2626':'#1c1e2e';
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

function spinner(show, msg='Loading...') {
  let s=document.getElementById('spinner');
  if(!s&&show){
    s=document.createElement('div');s.id='spinner';
    s.style.cssText='position:fixed;inset:0;background:rgba(255,255,255,.85);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:12px';
    s.innerHTML=`<div style="width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:spin .7s linear infinite"></div><div style="font-size:13px;font-weight:500;color:#374151">${msg}</div>`;
    document.body.appendChild(s);
  }
  if(s) s.style.display=show?'flex':'none';
}

// ── API CALLS ──────────────────────────────────────────────────────
async function apiGet(params) {
  try {
    const url = API + '?' + new URLSearchParams(params).toString();
    const res = await fetch(url);
    return await res.json();
  } catch(e) { console.error('API GET error:', e); return null; }
}

async function apiPost(data) {
  try {
    const res = await fetch(API, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...data, savedBy: currentUser?.name, savedOn: fmtDate() }),
    });
    return await res.json();
  } catch(e) { console.error('API POST error:', e); return null; }
}

// Convert file to base64 for Drive upload
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result.split(',')[1]);
    reader.onerror = () => rej(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

// CSV download
function downloadCSV(filename, headers, rows) {
  const csv=[headers.join(','),...rows.map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=filename; a.click();
  toast('Downloaded: '+filename,'success');
}

// ════════════════════════════════════════════════════════════════
//  LOGIN + STARTUP DATA LOAD
// ════════════════════════════════════════════════════════════════
function showLogin() {
  document.body.innerHTML=`
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  <link rel="stylesheet" href="styles.css"/>
  <div style="min-height:100vh;background:#f5f6fa;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif">
    <div style="background:#fff;border:1px solid #e4e6ef;border-radius:16px;padding:40px 36px;width:100%;max-width:420px;box-shadow:0 4px 24px rgba(0,0,0,.06)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">L&D</div>
        <div><div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:600">L&D Hub</div><div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">greytHR · Learning Portal</div></div>
      </div>
      <div style="font-size:22px;font-weight:600;margin-bottom:6px;font-family:'Playfair Display',serif">Welcome back 👋</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:22px">Enter your greytHR email to continue</div>
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px">Email address</label>
      <input id="login-email" type="email" placeholder="yourname@greytip.com"
        style="width:100%;padding:10px 13px;border:1px solid #e4e6ef;border-radius:8px;font-size:14px;outline:none;margin-bottom:10px;font-family:'DM Sans',sans-serif;transition:border .15s"
        onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e4e6ef'"
        onkeydown="if(event.key==='Enter')doLogin()"/>
      <div id="login-err" style="display:none;font-size:12px;color:#ef4444;margin-bottom:10px;padding:8px 12px;background:#fef2f2;border-radius:6px"></div>
      <button id="login-btn" onclick="doLogin()" style="width:100%;padding:11px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif">Continue →</button>
      <div style="margin-top:16px;background:#f9fafb;border-radius:8px;padding:14px;font-size:12px">
        <div style="font-weight:500;color:#374151;margin-bottom:8px">Demo logins — click to fill:</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <span onclick="document.getElementById('login-email').value='priya@greytip.com'" style="cursor:pointer;color:#3b82f6">priya@greytip.com <span style="color:#6b7280">— Admin</span></span>
          <span onclick="document.getElementById('login-email').value='manager1@greytip.com'" style="cursor:pointer;color:#3b82f6">manager1@greytip.com <span style="color:#6b7280">— Manager</span></span>
          <span onclick="document.getElementById('login-email').value='ravi@greytip.com'" style="cursor:pointer;color:#3b82f6">ravi@greytip.com <span style="color:#6b7280">— Participant</span></span>
        </div>
      </div>
    </div>
  </div>
  <div class="toast" id="toast"></div>`;
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  if(!email){toast('Please enter your email','error');return;}
  const btn = document.getElementById('login-btn');
  btn.textContent='Loading...'; btn.disabled=true;

  // Load all data from Sheets
  spinner(true,'Loading your L&D Hub...');
  const init = await apiGet({ action:'init' });
  spinner(false);

  if(!init){ showLoginError('Could not connect to server. Please try again.'); btn.textContent='Continue →'; btn.disabled=false; return; }

  // Merge Sheet users with any hardcoded fallback
  STATE.users = init.users || {};

  // Fallback users if Sheet is empty (remove after first real user is added)
  if (Object.keys(STATE.users).length === 0) {
    STATE.users = {
      'priya@greytip.com':    {role:'admin',       name:'Priya K.',    dept:'L&D',              batchIds:['A','B','C','D']},
      'manager1@greytip.com': {role:'manager',     name:'Srinivas R.', dept:'Sales',            batchIds:['A']},
      'manager2@greytip.com': {role:'manager',     name:'Deepa M.',    dept:'Customer Success', batchIds:['B']},
      'ravi@greytip.com':     {role:'participant', name:'Ravi S.',     dept:'Sales',            batchIds:['A']},
      'anjali@greytip.com':   {role:'participant', name:'Anjali N.',   dept:'CS',               batchIds:['B']},
      'meera@greytip.com':    {role:'participant', name:'Meera S.',    dept:'Support',          batchIds:['C']},
      'vikram@greytip.com':   {role:'participant', name:'Vikram B.',   dept:'Implementation',   batchIds:['D']},
    };
  }

  const user = STATE.users[email];
  if(!user){ showLoginError('Email not found. Please check or contact priya@greytip.com'); btn.textContent='Continue →'; btn.disabled=false; return; }

  currentUser = { ...user, email };

  // Load state from Sheets data
  STATE.batches     = (init.batches     || []).map(normaliseBatch);
  STATE.assignments = init.assignments  || [];
  STATE.materials   = init.materials    || [];
  STATE.assessments = init.assessments  || [];

  // If Sheet is empty, seed with demo data so app isn't blank
  if(STATE.batches.length === 0) STATE.batches = DEMO_BATCHES;

  loadApp();
}

function showLoginError(msg) {
  const e=document.getElementById('login-err');
  if(e){e.style.display='block';e.textContent=msg;}
}

// Normalise a batch row from Sheet into app format
function normaliseBatch(b) {
  return {
    id:           b.BatchID || b.id,
    name:         b.Name    || b.name,
    dept:         b.Dept    || b.dept,
    program:      b.Program || b.program,
    participants: parseInt(b.Participants||b.participants)||0,
    progress:     parseInt(b.Progress   ||b.progress)   ||0,
    status:       b.Status  || b.status || 'Active',
    color:        b.Color   || b.color  || '#3b82f6',
    icon:         b.Icon    || b.icon   || '🗂️',
    materials:    parseInt(b.materials)||0,
    assignments:  parseInt(b.assignments)||0,
    attendance:   parseInt(b.attendance)||0,
    feedback:     b.feedback || '0/0',
    driveFolder:  b.DriveFolder || b.driveFolder || '',
  };
}

// Demo data — used only when Sheet has no batches yet
const DEMO_BATCHES = [
  {id:'A',name:'Sales Team — Batch A',    dept:'Sales',           program:'Enterprise Sales Mastery',participants:14,progress:72,status:'In Progress',color:'#8b5cf6',icon:'🎯',materials:4,assignments:2,attendance:88,feedback:'12/14'},
  {id:'B',name:'CS Team — Batch B',       dept:'Customer Success',program:'CS Excellence Program',   participants:12,progress:55,status:'In Progress',color:'#10b981',icon:'🤝',materials:3,assignments:1,attendance:83,feedback:'12/12'},
  {id:'C',name:'Support — Batch C',       dept:'Support',         program:'Communication Skills',    participants:18,progress:38,status:'Active',      color:'#3b82f6',icon:'📞',materials:2,assignments:3,attendance:76,feedback:'8/18'},
  {id:'D',name:'Implementation — Batch D',dept:'Implementation',  program:'MEDDIC Fundamentals',     participants:14,progress:90,status:'Completing',  color:'#f97316',icon:'⚙️',materials:5,assignments:2,attendance:95,feedback:'14/14'},
];

function doLogout() { currentUser=null; STATE={users:{},batches:[],assignments:[],materials:[],assessments:[]}; showLogin(); }

// ════════════════════════════════════════════════════════════════
//  APP SHELL
// ════════════════════════════════════════════════════════════════
function loadApp() {
  const rc = isAdmin()?'#3b82f6':isMgr()?'#f59e0b':'#10b981';
  const rl = isAdmin()?'L&D Admin':isMgr()?'Team Manager':'Participant';
  const ini= currentUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const openAssignCount = STATE.assignments.filter(a=>(a.Status||a.status)==='Open'&&(isAdmin()||currentUser.batchIds.includes(a.BatchID||a.batchId))).length;

  const navItems=[
    {id:'dash',      label:'Dashboard',         dot:'#3b82f6'},
    {id:'batches',   label:'Batch Folders',      dot:'#8b5cf6', badge:myBatches().length},
    {id:'assess',    label:'Self Assessments',   dot:'#10b981'},
    {id:'assign',    label:'Assignments',        dot:'#f59e0b', badge:openAssignCount||null},
    {id:'materials', label:'Learning Materials', dot:'#14b8a6'},
    {id:'attend',    label:'Attendance',         dot:'#ef4444'},
    {id:'feedback',  label:'Feedback Forms',     dot:'#ec4899'},
    {id:'greytrise', label:'Skill Assessment',   dot:'#8b5cf6'},
    ...(!isPart()?[{id:'alldata', label:'All Data',       dot:'#3b82f6'}]:[]),
    ...(!isPart()?[{id:'reports', label:'Report Folders', dot:'#f97316'}]:[]),
  ];

  document.body.innerHTML=`
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  <link rel="stylesheet" href="styles.css"/>
  <div class="app">
    <div class="sidebar">
      <div class="logo"><div class="logo-icon">L&D</div><div><div class="logo-name">L&D Hub</div><div class="logo-tag">greytHR · Learning</div></div></div>
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

function go(id, el) {
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  const main=document.getElementById('main-content');
  if(!main) return;
  const pages={dash:renderDash,batches:renderBatches,assess:renderAssess,assign:renderAssign,materials:renderMaterials,attend:renderAttend,feedback:renderFeedback,greytrise:renderGreytRISE,alldata:renderAllData,reports:renderReports};
  if(pages[id]){main.innerHTML='';pages[id](main);}
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════════
function renderDash(el) {
  const batches=myBatches();
  const openAssigns=STATE.assignments.filter(a=>(a.Status||a.status)==='Open'&&(isAdmin()||currentUser.batchIds.includes(a.BatchID||a.batchId))).length;
  let greeting,sub,stats;
  if(isAdmin()){
    greeting='Good morning, Priya 👋'; sub='Your L&D Hub — all batches, sessions and assignments at a glance.';
    stats=[{l:'Active Batches',v:STATE.batches.length,c:'#8b5cf6',b:'bp',n:'This quarter'},{l:'Total Participants',v:STATE.batches.reduce((s,b)=>s+(b.participants||0),0),c:'#3b82f6',b:'bb',n:'All batches'},{l:'Open Assignments',v:openAssigns,c:'#f59e0b',b:'ba',n:'Awaiting submission'},{l:'Total Materials',v:STATE.materials.length,c:'#10b981',b:'bg',n:'Shared with batches'}];
  } else if(isMgr()){
    greeting=`Team Overview — ${currentUser.dept} 📊`; sub='Track your team\'s progress, attendance and feedback.';
    stats=[{l:'My Team Batches',v:batches.length,c:'#8b5cf6',b:'bp',n:'Assigned to you'},{l:'Team Participants',v:batches.reduce((s,b)=>s+(b.participants||0),0),c:'#3b82f6',b:'bb',n:'In your batches'},{l:'Open Assignments',v:openAssigns,c:'#f59e0b',b:'ba',n:'Pending submission'},{l:'Materials Shared',v:STATE.materials.filter(m=>currentUser.batchIds.includes(m.BatchID||m.batchId)||m.BatchID==='ALL').length,c:'#10b981',b:'bg',n:'For your team'}];
  } else {
    greeting=`Welcome, ${currentUser.name.split(' ')[0]}! 👋`; sub='Your enrolled batches, assignments and materials.';
    stats=[{l:'My Batches',v:batches.length,c:'#8b5cf6',b:'bp',n:'Enrolled'},{l:'Open Assignments',v:openAssigns,c:'#f59e0b',b:'ba',n:openAssigns?'Due soon':'All done ✓'},{l:'My Materials',v:STATE.materials.filter(m=>currentUser.batchIds.includes(m.BatchID||m.batchId)||m.BatchID==='ALL').length,c:'#14b8a6',b:'bt',n:'Available'},{l:'Feedback',v:'✓',c:'#3b82f6',b:'bb',n:'All submitted'}];
  }

  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">${greeting}</div><div class="ps">${sub}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="go('batches',document.getElementById('ni-batches'))">+ New Batch</button>`:''}
    </div>
    <div class="g4">${stats.map(s=>`<div class="sc"><div class="sl">${s.l}</div><div class="sv" style="color:${s.c}">${s.v}</div><div class="sbadge ${s.b}">${s.n}</div></div>`).join('')}</div>
    <div class="g2">
      <div class="card">
        <div class="ct">${isAdmin()?'All Batches':isMgr()?'Your Team Batches':'My Enrolled Batches'} <span class="b bb">${batches.length}</span></div>
        <div style="display:flex;flex-direction:column;gap:14px">
          ${batches.length===0?`<div style="font-size:13px;color:var(--muted);text-align:center;padding:20px">No batches yet. Create your first batch!</div>`:''}
          ${batches.map(b=>`<div style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="go('batches',document.getElementById('ni-batches'))">
            <div style="width:36px;height:36px;border-radius:8px;background:${b.color}22;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${b.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:500">${b.name}</div>
              <div style="font-size:12px;color:var(--muted)">${b.participants} participants · ${b.program}</div>
              <div class="pb" style="margin-top:4px"><div class="pf" style="width:${b.progress||0}%;background:${b.color}"></div></div>
            </div>
            <span class="b" style="background:${b.color}22;color:${b.color}">${b.progress||0}%</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="ct">Quick Actions</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${isAdmin()?`
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('assign',document.getElementById('ni-assign'))"><span style="font-size:16px">📤</span> Upload New Assignment</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('materials',document.getElementById('ni-materials'))"><span style="font-size:16px">📂</span> Upload Learning Material</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('attend',document.getElementById('ni-attend'))"><span style="font-size:16px">✅</span> Mark Today's Attendance</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('greytrise',document.getElementById('ni-greytrise'))"><span style="font-size:16px">📊</span> View greytRISE Skill Gaps</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('alldata',document.getElementById('ni-alldata'))"><span style="font-size:16px">🗄️</span> View All Collected Data</button>
          `:`
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('assign',document.getElementById('ni-assign'))"><span style="font-size:16px">📤</span> Submit My Assignment</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('assess',document.getElementById('ni-assess'))"><span style="font-size:16px">📝</span> Fill Self Assessment</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('feedback',document.getElementById('ni-feedback'))"><span style="font-size:16px">⭐</span> Give Feedback</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('greytrise',document.getElementById('ni-greytrise'))"><span style="font-size:16px">📊</span> My Skill Assessment</button>
          <button class="btn btn-o" style="justify-content:flex-start;gap:10px" onclick="go('materials',document.getElementById('ni-materials'))"><span style="font-size:16px">📚</span> View My Materials</button>
          `}
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
      <div><div class="pt">Batch Folders</div><div class="ps">${isAdmin()?'Create and manage all training batches — data syncs to Google Sheets.':isMgr()?'Your team\'s training batches.':'Your enrolled training batches.'}</div></div>
      ${isAdmin()?`<button class="btn btn-p btn-sm" onclick="showCreateBatch()">+ Create Batch</button>`:''}
    </div>
    <div id="bcf"></div>
    <div class="g3" id="batch-grid">
      ${batches.map(b=>`<div class="folder" onclick="openBatch('${b.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${b.icon}</div><span class="b ${sBadge(b.status)}">${b.status}</span></div>
        <div class="folder-name">${b.name}</div>
        <div class="folder-meta">${b.dept} · ${b.program} · ${b.participants} participants</div>
        <div class="pb"><div class="pf" style="width:${b.progress||0}%;background:${b.color}"></div></div>
        <div class="folder-actions">
          <span class="b bb">${b.materials} materials</span>
          <span class="b ba">${STATE.assignments.filter(a=>(a.BatchID||a.batchId)===b.id).length} assignments</span>
          <span class="b bg">Attend: ${b.attendance||0}%</span>
        </div>
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
    <div class="fg"><label class="fl">Participant Emails <span style="font-weight:400;color:var(--muted)">(comma-separated — they'll get a welcome email)</span></label>
      <textarea class="fta" id="bemails" placeholder="ravi@greytip.com, anjali@greytip.com, ..."></textarea>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-p btn-sm" onclick="saveBatch()">Create Batch + Send Welcome Emails</button>
      <button class="btn btn-o btn-sm" onclick="document.getElementById('bcf').innerHTML=''">Cancel</button>
    </div>
    <div id="batch-save-msg" style="display:none;margin-top:10px" class="success-msg">✓ Batch created! Drive folders created and welcome emails sent.</div>
  </div>`;
}

async function saveBatch() {
  const name=document.getElementById('bn').value.trim();
  if(!name){toast('Please enter a batch name','error');return;}
  const dept  =document.getElementById('bdept').value;
  const prog  =document.getElementById('bprog').value.trim()||'Program';
  const start =document.getElementById('bstart').value;
  const emails=document.getElementById('bemails').value;

  spinner(true,'Creating batch + Drive folders + sending welcome emails...');
  const result = await apiPost({action:'createBatch',name,dept,program:prog,startDate:start,emails,color:'#3b82f6'});
  spinner(false);

  if(result?.status==='ok'){
    const newBatch={id:result.batchId,name,dept,program:prog,participants:emails?emails.split(',').filter(Boolean).length:0,progress:0,status:'Active',color:'#3b82f6',icon:'🗂️',materials:0,assignments:0,attendance:0,feedback:'0/0',driveFolder:result.driveFolderId};
    STATE.batches.push(newBatch);

    // Add users to STATE
    if(emails){
      emails.split(',').map(e=>e.trim()).filter(Boolean).forEach(email=>{
        if(!STATE.users[email.toLowerCase()]){
          STATE.users[email.toLowerCase()]={role:'participant',name:email.split('@')[0],dept,batchIds:[result.batchId],email:email.toLowerCase()};
        } else {
          if(!STATE.users[email.toLowerCase()].batchIds.includes(result.batchId))
            STATE.users[email.toLowerCase()].batchIds.push(result.batchId);
        }
      });
    }

    document.getElementById('batch-save-msg').style.display='block';
    setTimeout(()=>{document.getElementById('bcf').innerHTML='';renderBatches(document.getElementById('main-content'));},2000);
    toast('Batch created! Drive folders ready + welcome emails sent.','success');
  } else {
    toast('Error creating batch. Check your Apps Script.','error');
  }
}

function openBatch(bId) {
  const b=STATE.batches.find(x=>x.id===bId);
  if(!b) return;
  document.getElementById('batch-grid').style.display='none';
  const det=document.getElementById('batch-detail');
  det.style.display='block';
  const tabs=[
    {id:'overview', label:'Overview'},
    {id:'mats',     label:`Materials`},
    {id:'assigns',  label:`Assignments`},
    {id:'assess',   label:'Self Assessment'},
    ...(!isPart()?[{id:'attend',label:'Attendance'}]:[]),
  ];
  det.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <button class="btn btn-o btn-sm" onclick="closeBatch()">← Back</button>
      <div><div class="pt" style="font-size:18px">${b.name}</div><div class="ps">${b.dept} · ${b.program} ${b.driveFolder?`· <a href="https://drive.google.com/drive/folders/${b.driveFolder}" target="_blank" style="color:var(--blue);font-size:12px">Open in Drive ↗</a>`:''}</div></div>
    </div>
    <div class="tabs" id="btabs">${tabs.map((t,i)=>`<div class="tab${i===0?' active':''}" onclick="bTab('${bId}','${t.id}',this)">${t.label}</div>`).join('')}</div>
    <div id="bt-content"></div>`;
  bTab(bId,'overview',det.querySelector('.tab'));
}

function closeBatch(){document.getElementById('batch-grid').style.display='grid';document.getElementById('batch-detail').style.display='none';}

async function bTab(bId,tabId,el) {
  document.querySelectorAll('#btabs .tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  const b=STATE.batches.find(x=>x.id===bId)||STATE.batches[0];
  const con=document.getElementById('bt-content');
  const bAssigns=STATE.assignments.filter(a=>(a.BatchID||a.batchId)===bId);
  const bMats=STATE.materials.filter(m=>(m.BatchID||m.batchId)===bId||(m.BatchID||m.batchId)==='ALL');

  // Load participants from Sheet
  spinner(true,'Loading...');
  const ps = await apiGet({action:'participants',batchId:bId});
  spinner(false);
  const participants = Array.isArray(ps)?ps:[];

  if(tabId==='overview'){
    con.innerHTML=`<div class="g2">
      <div class="card"><div class="ct">Participants (${participants.length})</div>
        ${participants.length===0?`<div style="font-size:13px;color:var(--muted);padding:12px 0">No participants added yet. Add emails when creating the batch.</div>`:''}
        <table class="tbl"><thead><tr><th>Name</th><th>Dept</th><th>Email</th><th>Added</th></tr></thead>
        <tbody>${participants.map(p=>`<tr>
          <td style="font-weight:500">${p.Name||p.name}</td>
          <td><span class="b bb">${p.Dept||p.dept||''}</span></td>
          <td style="color:var(--muted);font-size:12px">${p.Email||p.email||''}</td>
          <td style="color:var(--muted);font-size:11px">${p.AddedOn||''}</td>
        </tr>`).join('')}</tbody></table>
      </div>
      <div class="card"><div class="ct">Batch Summary</div>
        ${[['Materials shared',bMats.length],['Assignments',bAssigns.length],['Avg attendance',b.attendance+'%'],['Drive folder',b.driveFolder?'✓ Created':'Not linked']].map(([k,v])=>`
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px">
          <span style="color:var(--muted)">${k}</span><span style="font-weight:500">${v}</span>
        </div>`).join('')}
        ${b.driveFolder?`<a href="https://drive.google.com/drive/folders/${b.driveFolder}" target="_blank" class="btn btn-o btn-sm" style="margin-top:12px;width:100%;justify-content:center">Open Batch Drive Folder ↗</a>`:''}
      </div>
    </div>`;
  } else if(tabId==='mats'){
    con.innerHTML=`<div class="card">
      <div class="section-row">
        <div class="ct" style="margin:0">Materials (${bMats.length})</div>
        ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload to Drive <input type="file" multiple style="display:none" onchange="uploadBatchMat(this,'${bId}')"/></label>`:''}
      </div>
      ${bMats.length===0?`<div style="font-size:13px;color:var(--muted);padding:12px 0">No materials uploaded yet.</div>`:''}
      <div id="bmat-list">${bMats.map(m=>`<div class="fi-row">
        <span class="fi-icon">${typeIcon((m.FileName||m.name||'').split('.').pop())}</span>
        <span class="fi-name">${m.Name||m.name}</span>
        <span class="fi-size">${m.Size||m.size||''}</span>
        <span class="b ${typeBadge(m.Type||m.type||'Guide')}">${m.Type||m.type||'Guide'}</span>
        ${(m.DriveLink||m.driveLink)?`<a href="${m.DriveLink||m.driveLink}" target="_blank" class="fi-dl">⬇ Open</a>`:`<span class="fi-dl" style="color:var(--muted)">No link</span>`}
      </div>`).join('')}</div>
    </div>`;
  } else if(tabId==='assigns'){
    con.innerHTML=`
      ${!isPart()?`<div class="card" style="margin-bottom:16px">
        <div class="section-row">
          <div class="ct" style="margin:0">Assignments (${bAssigns.length})</div>
          ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload to Drive <input type="file" multiple style="display:none" onchange="uploadBatchAssign(this,'${bId}')"/></label>`:''}
        </div>
        ${bAssigns.length===0?`<div style="font-size:13px;color:var(--muted);padding:12px 0">No assignments uploaded yet.</div>`:''}
        <table class="tbl"><thead><tr><th>Assignment</th><th>Due</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${bAssigns.map(a=>`<tr>
          <td><div style="font-weight:500">${a.Title||a.title}</div><div style="font-size:11px;color:var(--muted)">Uploaded by ${a.UploadedBy||a.uploadedBy||''} · ${a.UploadedOn||a.uploadedOn||''}</div></td>
          <td>${a.DueDate||a.dueDate||'TBD'}</td>
          <td>${a.Submitted||0}/${a.TotalParticipants||a.totalParticipants||b.participants}</td>
          <td><span class="pill ${(a.Status||a.status)==='Closed'?'bg':'ba'}">${a.Status||a.status||'Open'}</span></td>
          <td><div style="display:flex;gap:5px">
            ${(a.DriveLink||a.driveLink)?`<a href="${a.DriveLink||a.driveLink}" target="_blank" class="btn btn-o btn-xs">⬇ Sheet</a>`:''}
            <button class="btn btn-g btn-xs" onclick="downloadAssignCSV('${a.AssignID||a.id}')">⬇ CSV</button>
          </div></td>
        </tr>`).join('')}</tbody></table>
      </div>`:''}
      <div class="card">
        <div class="ct">Submit Assignment <span class="b bg">Participant</span></div>
        ${bAssigns.filter(a=>(a.Status||a.status)==='Open').length===0?`<div style="font-size:13px;color:var(--muted)">No open assignments right now.</div>`:`
        <div class="fg"><label class="fl">Select Assignment</label><select class="fsel" id="sub-pick">${bAssigns.filter(a=>(a.Status||a.status)==='Open').map(a=>`<option value="${a.AssignID||a.id}">${a.Title||a.title} (Due ${a.DueDate||a.dueDate||'TBD'})</option>`).join('')}</select></div>
        <div class="uz" onclick="this.querySelector('input').click()">
          <div class="uz-icon">📤</div><div class="uz-txt">Upload completed assignment</div><div class="uz-hint">PDF, Word, Excel — file will be saved to Google Drive</div>
          <input type="file" id="sub-file" style="display:none" onchange="document.getElementById('sub-fname').style.display='block';document.getElementById('sub-fname').textContent='📎 '+this.files[0].name"/>
        </div>
        <div id="sub-fname" style="display:none;font-size:13px;color:var(--green);margin-top:8px;font-weight:500"></div>
        <div class="fg" style="margin-top:12px"><label class="fl">Notes for trainer (optional)</label><textarea class="fta" id="sub-notes" placeholder="Any comments?" style="min-height:60px"></textarea></div>
        <button class="btn btn-p" onclick="submitAssignment('${bId}')">Submit to Drive + Notify Trainer</button>
        <div id="sub-msg" style="display:none;margin-top:10px" class="success-msg">✓ Submitted to Drive! Trainer has been notified by email.</div>`}
      </div>`;
  } else if(tabId==='assess'){
    con.innerHTML=`<div class="card">
      <div class="ct">Self Assessment <span class="b bg">Fill & Submit</span></div>
      <div class="fg"><label class="fl">Your Name</label><input class="fi" id="assess-name" value="${isPart()?currentUser.name:''}" placeholder="Your name"/></div>
      <div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Rate yourself 1 (Low) → 5 (High)</div>
        ${ASSESS_QUESTIONS.map((q,i)=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);gap:8px;flex-wrap:wrap">
          <span style="font-size:13px;flex:1">${q}</span>
          <div style="display:flex;gap:8px">${[1,2,3,4,5].map(v=>`<label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="radio" name="aq${bId}${i}" value="${v}">${v}</label>`).join('')}</div>
        </div>`).join('')}
      </div>
      <div class="fg"><label class="fl">Key Learnings</label><textarea class="fta" id="assess-learn" placeholder="What did you take away?"></textarea></div>
      <div class="fg"><label class="fl">Areas to Improve</label><textarea class="fta" id="assess-improve" placeholder="What do you want to work on?"></textarea></div>
      <button class="btn btn-p" onclick="submitAssessment('${bId}')">Submit Assessment to Sheets</button>
      <div id="assess-msg" style="display:none;margin-top:10px" class="success-msg">✓ Assessment saved to Google Sheets!</div>
    </div>`;
  } else if(tabId==='attend'){
    attBatchId=bId;
    attState=participants.map(()=>true);
    con.innerHTML=`<div class="card">
      <div class="section-row" style="flex-wrap:wrap;gap:8px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <select class="fsel" style="width:200px" id="att-session" onchange="attSession=this.value"><option>Session 1 — Apr 1</option><option>Session 2 — Apr 8</option><option>Session 3 — Apr 15</option></select>
          <input type="date" class="fi" style="width:150px" value="${new Date().toISOString().slice(0,10)}"/>
        </div>
        <div style="display:flex;gap:8px">
          ${isAdmin()?`<button class="btn btn-o btn-sm" onclick="markAllP('${bId}')">✓ All Present</button>`:''}
          ${isAdmin()?`<button class="btn btn-g btn-sm" onclick="saveAtt('${bId}')">💾 Save to Sheets</button>`:''}
          <button class="btn btn-o btn-sm" onclick="dlAttCSV('${bId}')">⬇ Download CSV</button>
        </div>
      </div>
      <div class="g4" style="margin-bottom:14px">
        <div class="sc" style="padding:12px 14px"><div class="sl">Total</div><div class="sv" style="font-size:20px" id="bat-tot">${participants.length}</div></div>
        <div class="sc" style="padding:12px 14px"><div class="sl">Present</div><div class="sv" style="font-size:20px;color:#10b981" id="bat-pre">${participants.length}</div></div>
        <div class="sc" style="padding:12px 14px"><div class="sl">Absent</div><div class="sv" style="font-size:20px;color:#ef4444" id="bat-abs">0</div></div>
        <div class="sc" style="padding:12px 14px"><div class="sl">%</div><div class="sv" style="font-size:20px;color:#f59e0b" id="bat-pct">100%</div></div>
      </div>
      ${participants.length===0?`<div style="font-size:13px;color:var(--muted);padding:12px">No participants found. Add participants when creating the batch.</div>`:''}
      <table class="tbl"><thead><tr><th>Participant</th><th>Dept</th><th>Status</th>${isAdmin()?'<th>Toggle</th>':''}</tr></thead>
      <tbody>${participants.map((p,i)=>`<tr>
        <td style="font-weight:500">${p.Name||p.name}</td>
        <td><span class="b bb">${p.Dept||p.dept||''}</span></td>
        <td id="bta${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px"> Present</span></td>
        ${isAdmin()?`<td><button class="btn btn-o btn-xs" onclick="toggleBA(${i},${participants.length})">Toggle</button></td>`:''}
      </tr>`).join('')}</tbody></table>
    </div>`;
    window._attParticipants=participants;
  }
}

function toggleBA(i,total){attState[i]=!attState[i];const el=document.getElementById('bta'+i);el.innerHTML=attState[i]?`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px"> Present</span>`:`<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444;font-size:13px"> Absent</span>`;const p=attState.filter(Boolean).length;document.getElementById('bat-pre').textContent=p;document.getElementById('bat-abs').textContent=total-p;document.getElementById('bat-pct').textContent=Math.round(p/total*100)+'%';}
function markAllP(bId){attState=attState.map(()=>true);(window._attParticipants||[]).forEach((_,i)=>{const el=document.getElementById('bta'+i);if(el)el.innerHTML=`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px"> Present</span>`;});const t=(window._attParticipants||[]).length;document.getElementById('bat-pre').textContent=t;document.getElementById('bat-abs').textContent=0;document.getElementById('bat-pct').textContent='100%';}
async function saveAtt(bId){const ps=window._attParticipants||[];const b=STATE.batches.find(x=>x.id===bId);const records=ps.map((p,i)=>({name:p.Name||p.name,dept:p.Dept||p.dept||'',status:attState[i]?'Present':'Absent'}));spinner(true,'Saving attendance to Sheets...');const r=await apiPost({action:'saveAttendance',batchId:bId,batchName:b?.name,session:attSession,date:fmtDate(),records,markedBy:currentUser.name});spinner(false);if(r?.status==='ok')toast('Attendance saved to Google Sheets ✓','success');else toast('Save failed. Check Apps Script.','error');}
function dlAttCSV(bId){const ps=window._attParticipants||[];const b=STATE.batches.find(x=>x.id===bId);downloadCSV(`Attendance_${(b?.name||bId).replace(/[^a-z0-9]/gi,'_')}.csv`,['Name','Dept','Batch','Session','Status','Date'],ps.map((p,i)=>[p.Name||p.name,p.Dept||p.dept||'',b?.name,attSession,attState[i]?'Present':'Absent',fmtDate()]));}

async function uploadBatchMat(inp,bId){
  const b=STATE.batches.find(x=>x.id===bId);
  for(const f of inp.files){
    spinner(true,'Uploading '+f.name+' to Drive...');
    const base64=await fileToBase64(f);
    const r=await apiPost({action:'uploadMaterial',name:f.name,fileName:f.name,batchId:bId,batchName:b?.name,fileData:base64,size:(f.size/1024).toFixed(0)+' KB',uploadedBy:currentUser.name});
    spinner(false);
    if(r?.status==='ok'){
      STATE.materials.push({Name:f.name,BatchID:bId,BatchName:b?.name,Type:'Guide',DriveLink:r.driveLink,Size:(f.size/1024).toFixed(0)+' KB',UploadedOn:fmtDate()});
      const list=document.getElementById('bmat-list');
      if(list){const div=document.createElement('div');div.className='fi-row';div.innerHTML=`<span class="fi-icon">${typeIcon(f.name.split('.').pop())}</span><span class="fi-name">${f.name}</span><span class="fi-size">${(f.size/1024).toFixed(0)} KB</span><span class="b bb">New</span>${r.driveLink?`<a href="${r.driveLink}" target="_blank" class="fi-dl">⬇ Open</a>`:''}`;list.appendChild(div);}
      toast(f.name+' uploaded to Drive ✓','success');
    } else toast('Upload failed for '+f.name,'error');
  }
}

async function uploadBatchAssign(inp,bId){
  const b=STATE.batches.find(x=>x.id===bId);
  for(const f of inp.files){
    const due=prompt(`Due date for "${f.name.replace(/\.[^/.]+$/,'')}"?\n(e.g. Apr 15 or leave blank for TBD)`)||'TBD';
    spinner(true,'Uploading '+f.name+' to Drive + notifying participants...');
    const base64=await fileToBase64(f);
    const r=await apiPost({action:'uploadAssignment',title:f.name.replace(/\.[^/.]+$/,''),fileName:f.name,batchId:bId,batchName:b?.name,dueDate:due,totalParticipants:b?.participants||0,fileData:base64,uploadedBy:currentUser.name});
    spinner(false);
    if(r?.status==='ok'){
      STATE.assignments.push({AssignID:r.assignId,Title:f.name.replace(/\.[^/.]+$/,''),BatchID:bId,BatchName:b?.name,DueDate:due,Status:'Open',DriveLink:r.driveLink,UploadedBy:currentUser.name,UploadedOn:fmtDate()});
      toast(f.name+' uploaded! Participants notified by email ✓','success');
    } else toast('Upload failed for '+f.name,'error');
  }
  openBatch(bId);
}

async function submitAssignment(bId){
  const fileEl=document.getElementById('sub-file');
  if(!fileEl?.files?.length){toast('Please select a file','error');return;}
  const f=fileEl.files[0];
  const aId=document.getElementById('sub-pick')?.value;
  const assign=STATE.assignments.find(a=>(a.AssignID||a.id)===aId);
  const b=STATE.batches.find(x=>x.id===bId);
  spinner(true,'Uploading to Drive + notifying trainer...');
  const base64=await fileToBase64(f);
  const r=await apiPost({action:'submitAssignment',assignmentId:aId,assignmentTitle:assign?.Title||assign?.title,batchId:bId,batchName:b?.name,employeeName:currentUser.name,employeeEmail:currentUser.email,fileName:f.name,fileData:base64,notes:document.getElementById('sub-notes')?.value||''});
  spinner(false);
  if(r?.status==='ok'){document.getElementById('sub-msg').style.display='block';toast('Submitted to Drive! Trainer notified ✓','success');}
  else toast('Submission failed. Try again.','error');
}

async function submitAssessment(bId){
  const b=STATE.batches.find(x=>x.id===bId);
  const ratings={};
  ASSESS_QUESTIONS.forEach((_,i)=>{const r=document.querySelector(`input[name="aq${bId}${i}"]:checked`);ratings['q'+(i+1)]=r?.value||'';});
  spinner(true,'Saving assessment to Sheets...');
  const r=await apiPost({action:'saveAssessment',employeeName:document.getElementById('assess-name')?.value||currentUser.name,employeeEmail:currentUser.email,batchId:bId,batchName:b?.name,...ratings,keyLearnings:document.getElementById('assess-learn')?.value||'',areasToImprove:document.getElementById('assess-improve')?.value||''});
  spinner(false);
  if(r?.status==='ok'){document.getElementById('assess-msg').style.display='block';toast('Assessment saved to Sheets ✓','success');}
  else toast('Save failed','error');
}

function downloadAssignCSV(aId){const a=STATE.assignments.find(x=>(x.AssignID||x.id)===aId);if(!a)return;downloadCSV(`${(a.Title||'Assignment').replace(/[^a-z0-9]/gi,'_')}.csv`,['Assignment','Batch','Due','Total','Submitted','Status'],[[a.Title||'',a.BatchName||'',a.DueDate||'',a.TotalParticipants||0,a.Submitted||0,a.Status||'Open']]);}

// ════════════════════════════════════════════════════════════════
//  SELF ASSESSMENTS
// ════════════════════════════════════════════════════════════════
function renderAssess(el){
  const batches=myBatches();
  el.innerHTML=`
    <div class="ph"><div><div class="pt">Self Assessments</div><div class="ps">Submit your self-assessment — responses save directly to Google Sheets.</div></div></div>
    <div class="card">
      <div class="ct">Fill Self Assessment <span class="b bg">Submit your response</span></div>
      <div class="g2" style="margin-bottom:14px">
        <div class="fg" style="margin:0"><label class="fl">Your Name</label><input class="fi" id="massess-name" value="${isPart()?currentUser.name:''}" placeholder="Your name"/></div>
        <div class="fg" style="margin:0"><label class="fl">Select Batch</label><select class="fsel" id="massess-batch">${batches.map(b=>`<option value="${b.id}">${b.name}</option>`).join('')}</select></div>
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
      <button class="btn btn-p" onclick="submitMainAssess()">Submit Assessment to Sheets</button>
      <div id="massess-msg" style="display:none;margin-top:10px" class="success-msg">✓ Assessment submitted and saved to Google Sheets!</div>
    </div>`;
}

async function submitMainAssess(){
  const bId=document.getElementById('massess-batch')?.value;
  const b=STATE.batches.find(x=>x.id===bId);
  const ratings={};
  ASSESS_QUESTIONS.forEach((_,i)=>{const r=document.querySelector(`input[name="maq${i}"]:checked`);ratings['q'+(i+1)]=r?.value||'';});
  spinner(true,'Saving to Sheets...');
  const r=await apiPost({action:'saveAssessment',employeeName:document.getElementById('massess-name')?.value||currentUser.name,employeeEmail:currentUser.email,batchId:bId,batchName:b?.name,...ratings,keyLearnings:document.getElementById('massess-learn')?.value||'',areasToImprove:document.getElementById('massess-improve')?.value||''});
  spinner(false);
  if(r?.status==='ok'){document.getElementById('massess-msg').style.display='block';toast('Assessment saved ✓','success');}
  else toast('Save failed','error');
}

// ════════════════════════════════════════════════════════════════
//  ASSIGNMENTS PAGE
// ════════════════════════════════════════════════════════════════
function renderAssign(el){
  const data=isAdmin()?STATE.assignments:STATE.assignments.filter(a=>currentUser.batchIds.includes(a.BatchID||a.batchId));
  const open=data.filter(a=>(a.Status||a.status)==='Open');
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Assignments</div><div class="ps">${isPart()?'Download and submit your assignments — files stored in Google Drive.':'All assignments across batches — files stored in Drive.'}</div></div>
      ${isAdmin()?`<div style="display:flex;gap:8px"><label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload Assignment <input type="file" multiple style="display:none" onchange="uploadMainAssign(this)"/></label><button class="btn btn-g btn-sm" onclick="dlAllAssignsCSV()">⬇ CSV</button></div>`:''}
    </div>
    <div class="${isPart()?'':'g2'}">
      ${!isPart()?`<div class="card">
        <div class="ct">All Assignments <span class="b ba">${open.length} Open</span></div>
        ${data.length===0?`<div style="font-size:13px;color:var(--muted);padding:12px">No assignments uploaded yet.</div>`:''}
        ${data.map(a=>`<div class="assign-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
            <div><div class="assign-title">${a.Title||a.title}</div><div class="assign-meta">${a.BatchName||a.batchName||''} · Due ${a.DueDate||a.dueDate||'TBD'}</div></div>
            <span class="pill ${(a.Status||a.status)==='Closed'?'bg':'ba'}">${a.Status||a.status||'Open'}</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
            ${(a.DriveLink||a.driveLink)?`<a href="${a.DriveLink||a.driveLink}" target="_blank" class="btn btn-o btn-xs">⬇ Open Sheet</a>`:''}
            <button class="btn btn-g btn-xs" onclick="downloadAssignCSV('${a.AssignID||a.id}')">⬇ CSV</button>
          </div>
        </div>`).join('')}
      </div>`:''}
      <div class="card">
        <div class="ct">Submit Assignment <span class="b bg">${isPart()?'Your submission':'Participant view'}</span></div>
        ${open.length===0?`<div style="font-size:13px;color:var(--muted)">No open assignments right now.</div>`:`
        <div class="fg"><label class="fl">Select Assignment</label><select class="fsel" id="msub-pick">${open.map(a=>`<option value="${a.AssignID||a.id}" data-bid="${a.BatchID||a.batchId}">${a.Title||a.title} — ${a.BatchName||a.batchName||''} (Due ${a.DueDate||a.dueDate||'TBD'})</option>`).join('')}</select></div>
        <div class="uz" onclick="this.querySelector('input').click()"><div class="uz-icon">📤</div><div class="uz-txt">Upload completed assignment</div><div class="uz-hint">Saves to Google Drive · Trainer gets email notification</div><input type="file" id="msub-file" style="display:none" onchange="document.getElementById('msub-fname').style.display='block';document.getElementById('msub-fname').textContent='📎 '+this.files[0].name"/></div>
        <div id="msub-fname" style="display:none;font-size:13px;color:var(--green);margin-top:8px;font-weight:500"></div>
        <div class="fg" style="margin-top:12px"><label class="fl">Notes for trainer</label><textarea class="fta" id="msub-notes" placeholder="Any comments?" style="min-height:60px"></textarea></div>
        <button class="btn btn-p" onclick="submitMainAssign()">Submit to Drive + Notify Trainer</button>
        <div id="msub-msg" style="display:none;margin-top:10px" class="success-msg">✓ Submitted to Drive! Trainer notified by email.</div>`}
      </div>
    </div>`;
}

async function uploadMainAssign(inp){
  const batchNames=STATE.batches.map(b=>b.name);
  const picked=prompt('Which batch is this assignment for?\n'+batchNames.map((b,i)=>`${i+1}. ${b}`).join('\n')+'\n\nEnter number:');
  const bIdx=parseInt(picked)-1;
  const batch=STATE.batches[bIdx]||STATE.batches[0];
  if(!batch){toast('Invalid batch selection','error');return;}
  for(const f of inp.files){
    const due=prompt(`Due date for "${f.name.replace(/\.[^/.]+$/,'')}"?\n(e.g. Apr 15)`)||'TBD';
    spinner(true,'Uploading to Drive + notifying participants...');
    const base64=await fileToBase64(f);
    const r=await apiPost({action:'uploadAssignment',title:f.name.replace(/\.[^/.]+$/,''),fileName:f.name,batchId:batch.id,batchName:batch.name,dueDate:due,totalParticipants:batch.participants,fileData:base64,uploadedBy:currentUser.name});
    spinner(false);
    if(r?.status==='ok'){STATE.assignments.push({AssignID:r.assignId,Title:f.name.replace(/\.[^/.]+$/,''),BatchID:batch.id,BatchName:batch.name,DueDate:due,Status:'Open',DriveLink:r.driveLink,UploadedBy:currentUser.name,UploadedOn:fmtDate()});toast(f.name+' uploaded! Participants notified ✓','success');}
    else toast('Upload failed','error');
  }
  go('assign',document.getElementById('ni-assign'));
}

async function submitMainAssign(){
  const fileEl=document.getElementById('msub-file');
  if(!fileEl?.files?.length){toast('Please select a file','error');return;}
  const f=fileEl.files[0];
  const sel=document.getElementById('msub-pick');
  const aId=sel?.value;
  const bId=sel?.options[sel.selectedIndex]?.dataset?.bid;
  const assign=STATE.assignments.find(a=>(a.AssignID||a.id)===aId);
  const b=STATE.batches.find(x=>x.id===bId);
  spinner(true,'Uploading to Drive + notifying trainer...');
  const base64=await fileToBase64(f);
  const r=await apiPost({action:'submitAssignment',assignmentId:aId,assignmentTitle:assign?.Title,batchId:bId,batchName:b?.name,employeeName:currentUser.name,employeeEmail:currentUser.email,fileName:f.name,fileData:base64,notes:document.getElementById('msub-notes')?.value||''});
  spinner(false);
  if(r?.status==='ok'){document.getElementById('msub-msg').style.display='block';toast('Submitted to Drive! Trainer notified ✓','success');}
  else toast('Submission failed','error');
}

function dlAllAssignsCSV(){downloadCSV('All_Assignments.csv',['Assignment','Batch','Due','Status','Uploaded By','Date'],STATE.assignments.map(a=>[a.Title||'',a.BatchName||'',a.DueDate||'',a.Status||'Open',a.UploadedBy||'',a.UploadedOn||'']));}

// ════════════════════════════════════════════════════════════════
//  LEARNING MATERIALS
// ════════════════════════════════════════════════════════════════
function renderMaterials(el){
  const data=isAdmin()?STATE.materials:STATE.materials.filter(m=>currentUser.batchIds.includes(m.BatchID||m.batchId)||(m.BatchID||m.batchId)==='ALL');
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Learning Materials</div><div class="ps">${isAdmin()?'Upload materials — saved to Google Drive, participants get email notification.':'Download your batch materials.'}</div></div>
      ${isAdmin()?`<label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload to Drive <input type="file" multiple style="display:none" onchange="uploadMainMat(this)"/></label>`:''}
    </div>
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
      <select class="fsel" style="width:180px"><option>All Batches</option>${myBatches().map(b=>`<option>${b.name}</option>`).join('')}</select>
      <select class="fsel" style="width:150px"><option>All Types</option><option>Guide</option><option>Slides</option><option>Handout</option><option>Video</option></select>
      <input class="fi" style="width:200px" placeholder="Search..."/>
    </div>
    <div class="g3" id="mat-grid">
      ${data.length===0?`<div style="font-size:13px;color:var(--muted);padding:12px">No materials uploaded yet.</div>`:''}
      ${data.map(m=>`<div class="folder">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${typeIcon((m.FileName||m.Name||m.name||'').split('.').pop())}</div><span class="b ${typeBadge(m.Type||m.type||'Guide')}">${m.Type||m.type||'Guide'}</span></div>
        <div class="folder-name">${m.Name||m.name}</div>
        <div class="folder-meta">${m.BatchName||m.batchName||'All Batches'} · ${m.Size||m.size||''} · ${m.UploadedOn||m.uploadedOn||''}</div>
        <div class="folder-actions">
          ${(m.DriveLink||m.driveLink)?`<a href="${m.DriveLink||m.driveLink}" target="_blank" class="btn btn-o btn-xs">⬇ Open in Drive</a>`:`<span style="font-size:12px;color:var(--muted)">No Drive link</span>`}
        </div>
      </div>`).join('')}
      ${isAdmin()?`<div class="folder folder-add" onclick="document.getElementById('mh').click()"><div class="folder-add-icon">+</div><div class="folder-add-txt">Upload to Drive</div><input type="file" id="mh" multiple style="display:none" onchange="uploadMainMat(this)"/></div>`:''}
    </div>`;
}

async function uploadMainMat(inp){
  const batchNames=STATE.batches.map(b=>b.name);
  const picked=prompt('Which batch?\n'+batchNames.map((b,i)=>`${i+1}. ${b}`).join('\n')+'\n0. All Batches\n\nEnter number:');
  const bIdx=parseInt(picked)-1;
  const batch=bIdx>=0?STATE.batches[bIdx]:null;
  const grid=document.getElementById('mat-grid');
  const addBtn=grid?.lastElementChild;
  for(const f of inp.files){
    spinner(true,'Uploading '+f.name+' to Drive...');
    const base64=await fileToBase64(f);
    const r=await apiPost({action:'uploadMaterial',name:f.name,fileName:f.name,batchId:batch?.id||'ALL',batchName:batch?.name||'All Batches',fileData:base64,size:(f.size/1024).toFixed(0)+' KB',uploadedBy:currentUser.name});
    spinner(false);
    if(r?.status==='ok'){
      const mat={Name:f.name,BatchID:batch?.id||'ALL',BatchName:batch?.name||'All Batches',Type:'Guide',DriveLink:r.driveLink,Size:(f.size/1024).toFixed(0)+' KB',UploadedOn:fmtDate()};
      STATE.materials.push(mat);
      if(grid&&addBtn){const div=document.createElement('div');div.className='folder';div.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${typeIcon(f.name.split('.').pop())}</div><span class="b bb">New</span></div><div class="folder-name">${f.name}</div><div class="folder-meta">${mat.BatchName} · ${mat.Size} · Just now</div><div class="folder-actions">${r.driveLink?`<a href="${r.driveLink}" target="_blank" class="btn btn-o btn-xs">⬇ Open in Drive</a>`:''}</div>`;grid.insertBefore(div,addBtn);}
      toast(f.name+' uploaded to Drive ✓','success');
    } else toast('Upload failed for '+f.name,'error');
  }
}

// ════════════════════════════════════════════════════════════════
//  ATTENDANCE PAGE
// ════════════════════════════════════════════════════════════════
function renderAttend(el){
  const batches=myBatches();
  el.innerHTML=`
    <div class="ph"><div><div class="pt">Attendance Tracker</div><div class="ps">Mark attendance → saves to Google Sheets → download as CSV.</div></div></div>
    <div style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center">
      <select class="fsel" style="width:230px" id="att-batch-main" onchange="loadAttMain()">
        ${batches.map(b=>`<option value="${b.id}">${b.name}</option>`).join('')}
      </select>
      <select class="fsel" style="width:200px" id="att-sess-main" onchange="attSession=this.value"><option>Session 1 — Apr 1</option><option>Session 2 — Apr 8</option><option>Session 3 — Apr 15</option></select>
      <input type="date" class="fi" style="width:155px" value="${new Date().toISOString().slice(0,10)}"/>
      ${isAdmin()?`<button class="btn btn-o btn-sm" onclick="markAllAttMain()">✓ All Present</button>`:''}
      ${isAdmin()?`<button class="btn btn-g btn-sm" onclick="saveAttMain()">💾 Save to Sheets</button>`:''}
      <button class="btn btn-o btn-sm" onclick="dlAttMain()">⬇ Download CSV</button>
    </div>
    <div class="g4" style="margin-bottom:18px">
      <div class="sc" style="padding:14px 16px"><div class="sl">Total</div><div class="sv" style="font-size:22px" id="att-tot">0</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Present</div><div class="sv" style="font-size:22px;color:#10b981" id="att-pre">0</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Absent</div><div class="sv" style="font-size:22px;color:#ef4444" id="att-abs">0</div></div>
      <div class="sc" style="padding:14px 16px"><div class="sl">Attendance %</div><div class="sv" style="font-size:22px;color:#f59e0b" id="att-pct">0%</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="tbl"><thead><tr><th>Participant</th><th>Dept</th><th>Status</th>${isAdmin()?'<th>Toggle</th>':''}</tr></thead>
      <tbody id="att-main-body"><tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px">Loading participants...</td></tr></tbody></table>
    </div>`;
  loadAttMain();
}

async function loadAttMain(){
  const bId=document.getElementById('att-batch-main')?.value;
  if(!bId)return;
  attBatchId=bId;
  spinner(true,'Loading participants...');
  const ps=await apiGet({action:'participants',batchId:bId});
  spinner(false);
  window._mainAttPs=Array.isArray(ps)?ps:[];
  attState=window._mainAttPs.map(()=>true);
  const total=window._mainAttPs.length;
  document.getElementById('att-tot').textContent=total;
  document.getElementById('att-pre').textContent=total;
  document.getElementById('att-abs').textContent=0;
  document.getElementById('att-pct').textContent=total?'100%':'0%';
  document.getElementById('att-main-body').innerHTML=total===0?`<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px">No participants in this batch yet.</td></tr>`:
  window._mainAttPs.map((p,i)=>`<tr>
    <td style="font-weight:500">${p.Name||p.name}</td>
    <td><span class="b bb">${p.Dept||p.dept||''}</span></td>
    <td id="att-s${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px"> Present</span></td>
    ${isAdmin()?`<td><button class="btn btn-o btn-xs" onclick="toggleAttMain(${i},${total})">Toggle</button></td>`:''}
  </tr>`).join('');
}

function toggleAttMain(i,total){attState[i]=!attState[i];const el=document.getElementById('att-s'+i);el.innerHTML=attState[i]?`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px"> Present</span>`:`<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444;font-size:13px"> Absent</span>`;const p=attState.filter(Boolean).length;document.getElementById('att-pre').textContent=p;document.getElementById('att-abs').textContent=total-p;document.getElementById('att-pct').textContent=Math.round(p/total*100)+'%';}
function markAllAttMain(){attState=attState.map(()=>true);(window._mainAttPs||[]).forEach((_,i)=>{const el=document.getElementById('att-s'+i);if(el)el.innerHTML=`<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px"> Present</span>`;});const t=(window._mainAttPs||[]).length;document.getElementById('att-pre').textContent=t;document.getElementById('att-abs').textContent=0;document.getElementById('att-pct').textContent='100%';}
async function saveAttMain(){const ps=window._mainAttPs||[];const b=STATE.batches.find(x=>x.id===attBatchId);const records=ps.map((p,i)=>({name:p.Name||p.name,dept:p.Dept||p.dept||'',status:attState[i]?'Present':'Absent'}));spinner(true,'Saving to Sheets...');const r=await apiPost({action:'saveAttendance',batchId:attBatchId,batchName:b?.name,session:document.getElementById('att-sess-main')?.value||attSession,date:fmtDate(),records,markedBy:currentUser.name});spinner(false);if(r?.status==='ok')toast('Attendance saved to Google Sheets ✓','success');else toast('Save failed','error');}
function dlAttMain(){const ps=window._mainAttPs||[];const b=STATE.batches.find(x=>x.id===attBatchId);downloadCSV(`Attendance_${(b?.name||'').replace(/[^a-z0-9]/gi,'_')}_${attSession.replace(/[^a-z0-9]/gi,'_')}.csv`,['Name','Dept','Batch','Session','Status','Date'],ps.map((p,i)=>[p.Name||p.name,p.Dept||p.dept||'',b?.name||'',attSession,attState[i]?'Present':'Absent',fmtDate()]));}

// ════════════════════════════════════════════════════════════════
//  FEEDBACK
// ════════════════════════════════════════════════════════════════
function renderFeedback(el){
  el.innerHTML=`
    <div class="ph">
      <div><div class="pt">Feedback Forms</div><div class="ps">${isPart()?'Share your feedback — saved to Google Sheets.':'Collect and download feedback from all batches.'}</div></div>
      ${!isPart()?`<button class="btn btn-g btn-sm" onclick="dlFeedbackCSV()">⬇ Download CSV</button>`:''}
    </div>
    <div class="g2">
      <div class="card">
        <div class="ct">Submit Feedback <span class="b bg">${isPart()?'Your response':'Participant view'}</span></div>
        <div class="fg"><label class="fl">Your Name & Batch</label><input class="fi" id="fb-name" value="${isPart()?currentUser.name+' — '+myBatches()[0]?.name:''}" placeholder="Name — Batch"/></div>
        <div class="fg"><label class="fl">Session / Program</label><select class="fsel" id="fb-sess">${myBatches().map(b=>`<option value="${b.id}">${b.program} (${b.name})</option>`).join('')}</select></div>
        <div class="fg"><label class="fl">Overall Rating</label><div style="display:flex;gap:4px" id="fb-stars">${[1,2,3,4,5].map(n=>`<span class="star" onclick="setStars(${n})">★</span>`).join('')}</div></div>
        <div class="fg"><label class="fl">Content Relevance</label><div style="display:flex;gap:14px;flex-wrap:wrap">${['Excellent','Good','Average','Poor'].map(o=>`<label class="radio-lbl"><input type="radio" name="rel" value="${o}"> ${o}</label>`).join('')}</div></div>
        <div class="fg"><label class="fl">What was most useful?</label><textarea class="fta" id="fb-useful" placeholder="Share what worked..."></textarea></div>
        <div class="fg"><label class="fl">Suggestions</label><textarea class="fta" id="fb-suggest" placeholder="What could be better?"></textarea></div>
        <button class="btn btn-p" onclick="submitFeedback()">Submit to Google Sheets</button>
        <div id="fb-msg" style="display:none;margin-top:10px" class="success-msg">✓ Feedback saved to Google Sheets!</div>
      </div>
      <div class="card">
        <div class="ct">${isAdmin()?'All Feedback':'Team Feedback'} <span class="b bb">From Sheets</span></div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:12px">Live data loads from Google Sheets.</div>
        <button class="btn btn-o btn-sm" onclick="loadFeedbackData()">↻ Load from Sheets</button>
        <div id="fb-table-wrap" style="margin-top:14px"></div>
      </div>
    </div>`;
}

function setStars(n){fbStarVal=n;document.querySelectorAll('#fb-stars .star').forEach((s,i)=>s.classList.toggle('lit',i<n));}
async function submitFeedback(){
  if(!fbStarVal){toast('Please give a star rating','error');return;}
  const bId=document.getElementById('fb-sess')?.value;
  const b=STATE.batches.find(x=>x.id===bId);
  spinner(true,'Saving to Sheets...');
  const r=await apiPost({action:'saveFeedback',employeeName:document.getElementById('fb-name')?.value,employeeEmail:currentUser.email,batchId:bId,batchName:b?.name,session:b?.program,rating:fbStarVal,relevance:document.querySelector('input[name="rel"]:checked')?.value||'',mostUseful:document.getElementById('fb-useful')?.value,suggestions:document.getElementById('fb-suggest')?.value});
  spinner(false);
  if(r?.status==='ok'){document.getElementById('fb-msg').style.display='block';toast('Feedback saved ✓','success');}
  else toast('Save failed','error');
}

async function loadFeedbackData(){
  spinner(true,'Loading feedback from Sheets...');
  const data=await apiGet({action:'feedback'});
  spinner(false);
  const wrap=document.getElementById('fb-table-wrap');
  if(!wrap)return;
  const rows=Array.isArray(data)?data:[];
  if(rows.length===0){wrap.innerHTML='<div style="font-size:13px;color:var(--muted)">No feedback recorded yet.</div>';return;}
  wrap.innerHTML=`<table class="tbl"><thead><tr><th>Name</th><th>Batch</th><th>Rating</th><th>Relevance</th><th>Date</th></tr></thead><tbody>${rows.map(r=>`<tr><td style="font-weight:500">${r.EmployeeName||''}</td><td>${r.BatchName||''}</td><td style="color:#f59e0b">${stars(parseInt(r.Rating)||0)}</td><td><span class="b ${({Excellent:'bg',Good:'bb',Average:'ba',Poor:'bc'})[r.Relevance]||'bb'}">${r.Relevance||''}</span></td><td style="color:var(--muted)">${r.SubmittedOn||''}</td></tr>`).join('')}</tbody></table>`;
}

async function dlFeedbackCSV(){
  spinner(true,'Loading feedback from Sheets...');
  const data=await apiGet({action:'feedback'});
  spinner(false);
  const rows=Array.isArray(data)?data:[];
  downloadCSV('Feedback_All.csv',['Name','Email','Batch','Session','Rating','Relevance','Most Useful','Suggestions','Date'],rows.map(r=>[r.EmployeeName||'',r.EmployeeEmail||'',r.BatchName||'',r.Session||'',r.Rating||'',r.Relevance||'',r.MostUseful||'',r.Suggestions||'',r.SubmittedOn||'']));
}

// ════════════════════════════════════════════════════════════════
//  greytRISE SKILL ASSESSMENT (NEW PAGE)
// ════════════════════════════════════════════════════════════════
async function renderGreytRISE(el){
  el.innerHTML=`<div class="ph"><div><div class="pt">Skill Assessment — greytRISE</div><div class="ps">Live skill gap data from your greytRISE master sheet — 12 competencies across all teams.</div></div><button class="btn btn-p btn-sm" onclick="loadGreytRISE()">↻ Load from greytRISE</button></div><div id="gr-content"><div style="font-size:13px;color:var(--muted);padding:20px">Click "Load from greytRISE" to fetch the latest skill gap data.</div></div>`;
}

async function loadGreytRISE(){
  const el=document.getElementById('gr-content');
  el.innerHTML='<div style="font-size:13px;color:var(--muted);padding:12px">Loading skill gap data from greytRISE...</div>';
  const data=await apiGet({action:'greytrise',email:currentUser.email});
  if(!data||data.status==='error'){
    el.innerHTML=`<div class="card"><div style="font-size:13px;color:var(--coral)">Could not connect to greytRISE sheet. Make sure GREYTRISE_SHEET_ID is set in your Apps Script.</div><div style="font-size:12px;color:var(--muted);margin-top:8px">Error: ${data?.message||'Connection failed'}</div></div>`;
    return;
  }
  if(data.status==='empty'){el.innerHTML=`<div class="card"><div style="font-size:13px;color:var(--muted)">greytRISE sheet is empty. Add employee data first.</div></div>`;return;}

  const emp=data.employee;
  const gaps=data.gaps||[];
  const all=data.allEmployees||[];
  const competencies=data.competencies||[];

  el.innerHTML=`
    ${emp?`<div class="card" style="margin-bottom:20px">
      <div class="ct">Your Skill Profile — ${emp.name} <span class="b ${gaps.length?'bc':'bg'}">${gaps.length?gaps.length+' gaps identified':'No gaps — great work!'}</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:16px">
        ${(emp.scores||[]).map(s=>`<div style="background:var(--faint);border-radius:var(--rs);padding:10px 12px">
          <div style="font-size:11px;color:var(--muted);margin-bottom:4px">${s.name}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="pb" style="flex:1"><div class="pf" style="width:${(s.score||0)/5*100}%;background:${s.score>=4?'#10b981':s.score>=3?'#3b82f6':'#ef4444'}"></div></div>
            <span style="font-size:13px;font-weight:500;color:${s.score>=4?'#10b981':s.score>=3?'#3b82f6':'#ef4444'}">${s.score||0}/5</span>
          </div>
        </div>`).join('')}
      </div>
      ${gaps.length?`
      <div style="background:#fef2f2;border-radius:var(--rs);padding:12px;margin-bottom:12px">
        <div style="font-size:13px;font-weight:500;color:#991b1b;margin-bottom:6px">Identified Skill Gaps</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${gaps.map(g=>`<span class="b bc">${g}</span>`).join('')}</div>
      </div>
      <div style="background:#eff6ff;border-radius:var(--rs);padding:12px">
        <div style="font-size:13px;font-weight:500;color:#1e40af;margin-bottom:6px">Recommended Training</div>
        <div style="font-size:12px;color:#1e40af">${myBatches().filter(b=>gaps.some(g=>b.program.toLowerCase().includes(g.toLowerCase().split(' ')[0]))).map(b=>`<div>• ${b.name} — ${b.program}</div>`).join('')||'Contact your L&D Admin for a personalised recommendation.'}</div>
      </div>`:''}
    </div>`:''}
    ${(!isPart()&&all.length)?`<div class="card">
      <div class="ct">${isAdmin()?'All Employees — Skill Gaps':'Your Team — Skill Gaps'} <span class="b bb">${all.length} employees</span></div>
      <table class="tbl"><thead><tr><th>Employee</th>${competencies.slice(0,6).map(c=>`<th style="font-size:10px">${c.slice(0,12)}</th>`).join('')}<th>Status</th></tr></thead>
      <tbody>${all.slice(0,20).map(emp=>{
        const scores=competencies.slice(0,6).map(c=>parseFloat(emp[c])||0);
        const hasGap=scores.some(s=>s<3);
        return`<tr>
          <td style="font-weight:500">${emp.name||emp.email||''}</td>
          ${scores.map(s=>`<td><span style="font-weight:500;color:${s>=4?'#10b981':s>=3?'#3b82f6':'#ef4444'}">${s||'—'}</span></td>`).join('')}
          <td><span class="pill ${hasGap?'ba':'bg'}">${hasGap?'Has gaps':'On track'}</span></td>
        </tr>`;
      }).join('')}</tbody></table>
      <button class="btn btn-g btn-sm" style="margin-top:12px" onclick="dlGreytRISECSV()">⬇ Download Gap Report CSV</button>
    </div>`:''}`;
}

async function dlGreytRISECSV(){
  const data=await apiGet({action:'greytrise'});
  if(!data?.allEmployees)return;
  const comps=data.competencies||[];
  downloadCSV('greytRISE_Skill_Gaps.csv',['Email','Name',...comps],data.allEmployees.map(e=>[e.email||'',e.name||'',...comps.map(c=>e[c]||0)]));
}

// ════════════════════════════════════════════════════════════════
//  ALL DATA PAGE
// ════════════════════════════════════════════════════════════════
async function renderAllData(el){
  el.innerHTML=`
    <div class="ph"><div><div class="pt">All Collected Data</div><div class="ps">Live data from Google Sheets — attendance, feedback, assessments and submissions.</div></div>
    <button class="btn btn-p btn-sm" onclick="renderAllData(document.getElementById('main-content'))">↻ Refresh</button></div>
    <div class="tabs" id="data-tabs">
      <div class="tab active" onclick="loadDataTab('attendance',this)">Attendance</div>
      <div class="tab" onclick="loadDataTab('feedback',this)">Feedback</div>
      <div class="tab" onclick="loadDataTab('assignments',this)">Assignments</div>
      <div class="tab" onclick="loadDataTab('assessments',this)">Assessments</div>
      <div class="tab" onclick="loadDataTab('submissions',this)">Submissions</div>
    </div>
    <div id="data-panel"></div>`;
  loadDataTab('attendance', document.querySelector('#data-tabs .tab'));
}

async function loadDataTab(sheet, el){
  document.querySelectorAll('#data-tabs .tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  const panel=document.getElementById('data-panel');
  panel.innerHTML='<div style="font-size:13px;color:var(--muted);padding:12px">Loading from Sheets...</div>';
  spinner(true,'Loading '+sheet+'...');
  const data=await apiGet({action:sheet});
  spinner(false);
  const rows=Array.isArray(data)?data:[];

  const colMaps={
    attendance: {h:['Employee','Dept','Batch','Session','Date','Status','Marked By'],k:['EmployeeName','Department','BatchName','Session','SessionDate','Status','MarkedBy']},
    feedback:   {h:['Employee','Batch','Session','Rating','Relevance','Date'],k:['EmployeeName','BatchName','Session','Rating','Relevance','SubmittedOn']},
    assignments:{h:['Title','Batch','Due Date','Status','Uploaded By','Date'],k:['Title','BatchName','DueDate','Status','UploadedBy','UploadedOn']},
    assessments:{h:['Employee','Batch','Q1','Q2','Q3','Q4','Q5','Key Learnings','Date'],k:['EmployeeName','BatchName','Q1','Q2','Q3','Q4','Q5','KeyLearnings','SubmittedOn']},
    submissions:{h:['Employee','Assignment','Batch','File','Drive Link','Date'],k:['EmployeeName','AssignTitle','BatchID','FileName','DriveLink','SubmittedOn']},
  };

  const cfg=colMaps[sheet];
  panel.innerHTML=`
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px">
        <div style="font-size:14px;font-weight:500;text-transform:capitalize">${sheet} (${rows.length} records)</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-g btn-sm" onclick="dlDataCSV('${sheet}')">⬇ Download CSV</button>
          <a href="https://docs.google.com/spreadsheets/d/${'YOUR_SHEET_ID'}" target="_blank" class="btn btn-o btn-sm">Open in Sheets ↗</a>
        </div>
      </div>
      ${rows.length===0?`<div style="font-size:13px;color:var(--muted);padding:20px;text-align:center">No data yet. Start using the app and data will appear here.</div>`:`
      <div style="overflow-x:auto">
      <table class="tbl"><thead><tr>${cfg.h.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.slice(0,50).map(r=>`<tr>${cfg.k.map(k=>{const v=r[k]||'';return`<td>${k==='DriveLink'&&v?`<a href="${v}" target="_blank" style="color:var(--blue)">Open ↗</a>`:v}</td>`;}).join('')}</tr>`).join('')}</tbody></table>
      </div>${rows.length>50?`<div style="padding:10px 16px;font-size:12px;color:var(--muted)">Showing 50 of ${rows.length} records. Download CSV for full data.</div>`:''}`}
    </div>`;
  window._lastDataTab={sheet,rows,cfg};
}

async function dlDataCSV(sheet){
  if(window._lastDataTab?.sheet===sheet){const {rows,cfg}=window._lastDataTab;downloadCSV(`${sheet}_data.csv`,cfg.h,rows.map(r=>cfg.k.map(k=>r[k]||'')));return;}
  spinner(true,'Loading data...');const data=await apiGet({action:sheet});spinner(false);
  const rows=Array.isArray(data)?data:[];const cfg={attendance:{h:['Employee','Dept','Batch','Session','Date','Status'],k:['EmployeeName','Department','BatchName','Session','SessionDate','Status']},feedback:{h:['Employee','Batch','Rating','Relevance'],k:['EmployeeName','BatchName','Rating','Relevance']},assignments:{h:['Title','Batch','Due'],k:['Title','BatchName','DueDate']},assessments:{h:['Employee','Batch','Date'],k:['EmployeeName','BatchName','SubmittedOn']},submissions:{h:['Employee','Assignment','File'],k:['EmployeeName','AssignTitle','FileName']}}[sheet]||{h:['Data'],k:['Data']};
  downloadCSV(`${sheet}_data.csv`,cfg.h,rows.map(r=>cfg.k.map(k=>r[k]||'')));
}

// ════════════════════════════════════════════════════════════════
//  REPORTS
// ════════════════════════════════════════════════════════════════
function renderReports(el){
  const batches=myBatches();
  el.innerHTML=`
    <div class="ph"><div><div class="pt">Report Folders</div><div class="ps">Generate and download batch reports — all data pulled live from Google Sheets.</div></div></div>
    <div class="g3">
      ${batches.map(b=>`<div class="folder">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">📁</div><span class="b ${sBadge(b.status)}">${b.status}</span></div>
        <div class="folder-name">${b.name} — Reports</div>
        <div class="folder-meta">${b.dept} · ${b.program}</div>
        <div class="folder-actions" style="flex-direction:column;gap:6px;align-items:flex-start">
          <button class="btn btn-o btn-sm" style="width:100%" onclick="generateReport('${b.id}','attendance')">⬇ Attendance Report</button>
          <button class="btn btn-o btn-sm" style="width:100%" onclick="generateReport('${b.id}','feedback')">⬇ Feedback Report</button>
          <button class="btn btn-o btn-sm" style="width:100%" onclick="generateReport('${b.id}','assessments')">⬇ Assessment Report</button>
          ${b.driveFolder?`<a href="https://drive.google.com/drive/folders/${b.driveFolder}" target="_blank" class="btn btn-o btn-sm" style="width:100%;text-align:center">Open Drive Folder ↗</a>`:''}
        </div>
      </div>`).join('')}
      ${isAdmin()?`<div class="folder">
        <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">📊</div><span class="b bb">Master</span></div>
        <div class="folder-name">Department-wise Summary</div>
        <div class="folder-meta">All batches · All departments · Q1 2026</div>
        <div class="folder-actions" style="flex-direction:column;gap:6px;align-items:flex-start">
          <button class="btn btn-p btn-sm" style="width:100%" onclick="dlAllData()">⬇ Download All Data</button>
        </div>
      </div>`:''}
    </div>`;
}

async function generateReport(bId,type){
  spinner(true,'Generating report from Sheets...');
  const data=await apiGet({action:type,batchId:bId});
  spinner(false);
  const b=STATE.batches.find(x=>x.id===bId);
  const rows=Array.isArray(data)?data:[];
  const cfgMap={
    attendance:{h:['Employee','Dept','Session','Date','Status'],k:['EmployeeName','Department','Session','SessionDate','Status']},
    feedback:  {h:['Employee','Session','Rating','Relevance','Most Useful','Suggestions'],k:['EmployeeName','Session','Rating','Relevance','MostUseful','Suggestions']},
    assessments:{h:['Employee','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Key Learnings'],k:['EmployeeName','Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','KeyLearnings']},
  };
  const cfg=cfgMap[type]||{h:['Data'],k:['Data']};
  downloadCSV(`${(b?.name||bId).replace(/[^a-z0-9]/gi,'_')}_${type}_Report.csv`,cfg.h,rows.map(r=>cfg.k.map(k=>r[k]||'')));
}

async function dlAllData(){
  toast('Downloading all data — this may take a moment...','info');
  for(const type of['attendance','feedback','assessments','submissions']){
    spinner(true,'Downloading '+type+'...');
    const data=await apiGet({action:type});
    spinner(false);
    const rows=Array.isArray(data)?data:[];
    if(rows.length>0) downloadCSV(`All_${type}.csv`,Object.keys(rows[0]),rows.map(r=>Object.values(r)));
    await new Promise(r=>setTimeout(r,500));
  }
  toast('All reports downloaded ✓','success');
}
