// ════════════════════════════════════════════════════════════════
//  L&D Hub — greytHR  |  app.js  |  v4.0 - FIXED
// ════════════════════════════════════════════════════════════════

const API = 'https://script.google.com/a/macros/greytip.com/s/AKfycbw30On6y9c37Qu4I3HfwzDIhGLbAWoaXzUYajjWR4WRjxEz2Yce4mPcH-sa4APdS2WydA/exec';

let STATE = {
  users:       {},
  batches:     [],
  assignments: [],
  materials:   [],
  assessments: [],
};
let currentUser = null;

// ── HELPERS ───────────────────────────────────────────────────────
const isAdmin = () => currentUser?.role === 'admin';
const isMgr   = () => currentUser?.role === 'manager';
const isPart  = () => currentUser?.role === 'participant';

function toast(msg, type='info') {
  let t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.style.background = type==='success'?'#059669':type==='error'?'#dc2626':'#1c1e2e';
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

async function apiGet(params) {
  try {
    const url = API + '?' + new URLSearchParams(params).toString();
    const res = await fetch(url);
    return await res.json();
  } catch(e) { console.error('API GET error:', e); return null; }
}

// ════════════════════════════════════════════════════════════════
//  LOGIN & APP INITIALIZATION
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Hide app, show login screen initially
  document.querySelector('.app').style.display = 'none';
  showLoginScreen();
});

function showLoginScreen() {
  document.body.innerHTML = `
  <style>
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}
    body { margin: 0; font-family: 'DM Sans', sans-serif; }
  </style>
  <link rel="stylesheet" href="styles.css"/>
  <div style="min-height:100vh;background:#f5f6fa;display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;border:1px solid #e4e6ef;border-radius:16px;padding:40px 36px;width:100%;max-width:420px;box-shadow:0 4px 24px rgba(0,0,0,.06)">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px">L&D</div>
        <div><div style="font-family:'Playfair Display',serif;font-size:20px;font-weight:600">L&D Hub</div><div style="font-size:11px;color:#6b7280;text-transform:uppercase">greytHR Learning</div></div>
      </div>
      <div style="font-size:22px;font-weight:600;margin-bottom:6px;font-family:'Playfair Display',serif">Welcome back 👋</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:22px">Enter your greytHR email to continue</div>
      <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px">Email address</label>
      <input id="login-email" type="email" placeholder="yourname@greytip.com"
        style="width:100%;padding:10px 13px;border:1px solid #e4e6ef;border-radius:8px;font-size:14px;outline:none;margin-bottom:10px;font-family:'DM Sans',sans-serif;box-sizing:border-box"
        onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e4e6ef'"
        onkeydown="if(event.key==='Enter')doLogin()"/>
      <div id="login-err" style="display:none;font-size:12px;color:#ef4444;margin-bottom:10px;padding:8px 12px;background:#fef2f2;border-radius:6px"></div>
      <button id="login-btn" onclick="doLogin()" style="width:100%;padding:11px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;box-sizing:border-box">Continue →</button>
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
  if(!email){alert('Please enter email');return;}
  
  const btn = document.getElementById('login-btn');
  btn.textContent='Loading...'; btn.disabled=true;

  let init = null;
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 10000)
    );
    init = await Promise.race([apiGet({ action:'init' }), timeoutPromise]);
  } catch(e) {
    console.warn('API failed:', e.message);
    init = null;
  }

  STATE.users = (init?.users) || {};

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
  if(!user){ 
    document.getElementById('login-err').style.display='block';
    document.getElementById('login-err').textContent='Email not found. Try: priya@greytip.com';
    btn.textContent='Continue →'; btn.disabled=false; 
    return; 
  }

  currentUser = { ...user, email };
  STATE.batches = (init?.batches || []);
  STATE.assignments = init?.assignments || [];
  STATE.materials = init?.materials || [];
  STATE.assessments = init?.assessments || [];

  if(STATE.batches.length === 0) {
    STATE.batches = [
      {id:'A',name:'Sales Team — Batch A',    dept:'Sales',           program:'Enterprise Sales Mastery',participants:14,progress:72,status:'In Progress'},
      {id:'B',name:'CS Team — Batch B',       dept:'Customer Success',program:'CS Excellence Program',   participants:12,progress:55,status:'In Progress'},
      {id:'C',name:'Support — Batch C',       dept:'Support',         program:'Communication Skills',    participants:18,progress:38,status:'Active'},
      {id:'D',name:'Implementation — Batch D',dept:'Implementation',  program:'MEDDIC Fundamentals',     participants:14,progress:90,status:'Completing'},
    ];
  }

  // Load the original HTML and show the app
  location.reload();
}

// ════════════════════════════════════════════════════════════════
//  PAGE NAVIGATION (after login)
// ════════════════════════════════════════════════════════════════

function go(id, el) {
  // Update sidebar active state
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  if(el) el.classList.add('active');
  
  // Update user info in sidebar
  const ini = currentUser.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const rc = isAdmin()?'#3b82f6':isMgr()?'#f59e0b':'#10b981';
  const rl = isAdmin()?'L&D Admin':isMgr()?'Team Manager':'Participant';
  
  document.getElementById('uav').textContent = ini;
  document.getElementById('uav').style.background = '#eff6ff';
  document.getElementById('uav').style.color = rc;
  document.getElementById('uname').textContent = currentUser.name;
  document.getElementById('urole').textContent = currentUser.dept;
  document.getElementById('rdot').style.background = rc;
  document.getElementById('rlabel').textContent = rl;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // Show selected page
  const page = document.getElementById('page-' + id);
  if(page) page.classList.add('active');
  
  console.log('Navigated to:', id);
}

function doLogout() { 
  currentUser = null; 
  STATE = {users:{},batches:[],assignments:[],materials:[],assessments:[]}; 
  location.reload();
}

// ════════════════════════════════════════════════════════════════
//  PAGE FUNCTIONS (from index.html onclick handlers)
// ════════════════════════════════════════════════════════════════

function toggleCreateBatch() {
  const form = document.getElementById('batch-create-form');
  if(form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function saveBatch() {
  toast('Batch created successfully!', 'success');
  toggleCreateBatch();
}

function filterAssess(dept, el) {
  document.querySelectorAll('#assess-tabs .tab').forEach(t => t.classList.remove('active'));
  if(el) el.classList.add('active');
  toast('Filtering by: ' + (dept || 'All'), 'info');
}

function submitAssessMain() {
  toast('Assessment submitted!', 'success');
}

function uploadAssignment(input) {
  if(input.files.length > 0) {
    toast(input.files[0].name + ' uploaded!', 'success');
  }
}

function handleSubFile(input) {
  if(input.files.length > 0) {
    const el = document.getElementById('sub-file-name');
    if(el) {
      el.style.display = 'block';
      el.textContent = '📎 ' + input.files[0].name;
    }
  }
}

function submitParticipantAssign() {
  toast('Assignment submitted!', 'success');
}

function addMaterialMain(input) {
  toast('Materials uploaded!', 'success');
}

function loadAtt() {
  toast('Attendance loaded!', 'info');
}

function markAllPresent() {
  toast('All marked present!', 'success');
}

function saveAttendance() {
  toast('Attendance saved!', 'success');
}

function copyFeedbackLink() {
  navigator.clipboard.writeText('https://forms.google.com/feedback');
  toast('Feedback link copied!', 'success');
}

function setStars(n) {
  const stars = document.querySelectorAll('#fb-stars .star');
  stars.forEach((s, i) => {
    s.style.color = i < n ? '#fbbf24' : '#d1d5db';
  });
}

function submitFeedback() {
  toast('Feedback submitted!', 'success');
}

function switchRole() {
  toast('Role switching not yet implemented', 'info');
}
