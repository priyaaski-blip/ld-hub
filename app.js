// ── CONFIG ──────────────────────────────────────────────────────────────
// Replace this URL after deploying your Apps Script Web App
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

// ── DATA ─────────────────────────────────────────────────────────────────
const BATCHES = [
  { id:'A', name:'Sales Team — Batch A', dept:'Sales', program:'Enterprise Sales Mastery', participants:14, progress:72, status:'In Progress', color:'#8b5cf6', icon:'🎯', materials:4, assignments:2, attendance:88, feedback:'12/14' },
  { id:'B', name:'CS Team — Batch B',   dept:'Customer Success', program:'CS Excellence',     participants:12, progress:55, status:'In Progress', color:'#10b981', icon:'🤝', materials:3, assignments:1, attendance:83, feedback:'12/12' },
  { id:'C', name:'Support — Batch C',   dept:'Support',          program:'Communication Skills', participants:18, progress:38, status:'Active',      color:'#3b82f6', icon:'📞', materials:2, assignments:3, attendance:76, feedback:'8/18'  },
  { id:'D', name:'Implementation — Batch D', dept:'Implementation', program:'MEDDIC Fundamentals', participants:14, progress:90, status:'Completing', color:'#f97316', icon:'⚙️', materials:5, assignments:2, attendance:95, feedback:'14/14' },
];

const PARTICIPANTS = {
  A: [{n:'Ravi S.',dept:'Sales'},{n:'Karan P.',dept:'Sales'},{n:'Arjun M.',dept:'Sales'},{n:'Preethi V.',dept:'Sales'},{n:'Vikram B.',dept:'Sales'},{n:'Neha J.',dept:'Sales'}],
  B: [{n:'Anjali N.',dept:'CS'},{n:'Deepak R.',dept:'CS'},{n:'Shalini K.',dept:'CS'},{n:'Divya P.',dept:'CS'}],
  C: [{n:'Meera S.',dept:'Support'},{n:'Neha J.',dept:'Support'},{n:'Kavitha R.',dept:'Support'},{n:'Rohit T.',dept:'Support'},{n:'Aditya S.',dept:'Support'},{n:'Pooja M.',dept:'Support'}],
  D: [{n:'Vikram B.',dept:'Impl.'},{n:'Suresh L.',dept:'Impl.'},{n:'Harish G.',dept:'Impl.'},{n:'Lakshmi N.',dept:'Impl.'}],
};

const ASSESS_DATA = [
  { title:'Session 3 — Objection Handling', batch:'Sales Batch A', dept:'Sales', qs:12, resp:'11/14', total:14, status:'Open' },
  { title:'Mid-program Check-in',           batch:'CS Batch B',    dept:'CS',    qs:8,  resp:'12/12', total:12, status:'Closed' },
  { title:'Communication Pre-assessment',   batch:'Support Batch C',dept:'Support',qs:10,resp:'6/18', total:18, status:'Open' },
  { title:'MEDDIC Final Self Assessment',   batch:'Impl. Batch D', dept:'Impl.', qs:15, resp:'14/14',total:14, status:'Closed' },
];

const MATERIALS_DATA = [
  { icon:'📄', name:'MEDDIC Framework Reference Guide',   batch:'Impl. Batch D',  type:'Guide',    size:'1.2 MB', date:'Apr 1' },
  { icon:'📊', name:'Enterprise Sales — Module 1 Deck',  batch:'Sales Batch A',  type:'Slides',   size:'3.4 MB', date:'Mar 28' },
  { icon:'📝', name:'Participant Handout — Session 2',    batch:'CS Batch B',     type:'Handout',  size:'0.8 MB', date:'Mar 25' },
  { icon:'📋', name:'Case Study Discussion Template',     batch:'All Batches',    type:'Template', size:'0.5 MB', date:'Mar 20' },
  { icon:'🎬', name:'Comm. Skills — Session Recording',   batch:'Support Batch C',type:'Video',    size:'Link',   date:'Apr 1' },
];

const FEEDBACK_RESPONSES = [
  { av:'AN', color:'#eff6ff', txtcolor:'#3b82f6', name:'Anjali N.', batch:'CS Batch B',    rating:5, rel:'Excellent' },
  { av:'RS', color:'#ecfdf5', txtcolor:'#10b981', name:'Ravi S.',   batch:'Sales Batch A', rating:4, rel:'Good' },
  { av:'KP', color:'#fdf2f8', txtcolor:'#ec4899', name:'Karan P.',  batch:'Sales Batch A', rating:5, rel:'Excellent' },
  { av:'MS', color:'#fff7ed', txtcolor:'#f97316', name:'Meera S.',  batch:'CS Batch B',    rating:3, rel:'Average' },
  { av:'DV', color:'#f5f3ff', txtcolor:'#8b5cf6', name:'Deepak V.',batch:'Impl. Batch D',  rating:5, rel:'Excellent' },
];

const REPORT_FOLDERS = [
  { name:'Sales Batch A — Reports',        status:'Completed', color:'#8b5cf6', count:4, updated:'Apr 1',  tags:['Attend Report','Feedback Summary','Assessment Results','Full Summary'] },
  { name:'CS Batch B — Reports',           status:'In Progress',color:'#f59e0b',count:2, updated:'Mar 30', tags:['Attend Report','Assessment Results'] },
  { name:'Support Batch C — Reports',      status:'In Progress',color:'#f59e0b',count:1, updated:'Mar 28', tags:['Feedback Summary'] },
  { name:'Implementation Batch D — Final', status:'Completed', color:'#10b981', count:5, updated:'Apr 1',  tags:['Full Program Report','Attend Report','Assessment Results','Feedback','Certification'] },
  { name:'Department-wise Summary — Q1 2026', status:'Master', color:'#3b82f6',count:4, updated:'Apr 1',  tags:['Sales','CS','Support','Impl.'] },
];

const ASSIGN_DATA = [
  { title:'Assignment 1 — Discovery Questions', batch:'Sales Batch A', due:'Mar 20', submitted:14, total:14, status:'Closed' },
  { title:'Assignment 2 — Objection Handling',  batch:'Sales Batch A', due:'Apr 5',  submitted:7,  total:14, status:'Open' },
  { title:'Case Study — greytHR Deal Scenario', batch:'Support Batch C',due:'Apr 10',submitted:4, total:18, status:'Open' },
  { title:'MEDDIC Role-Play Reflection',        batch:'Impl. Batch D', due:'Apr 3',  submitted:14, total:14, status:'Closed' },
];

const ASSESS_QUESTIONS = [
  'Product / service knowledge','Communication clarity','Objection handling','Active listening',
  'Customer empathy','Discovery questioning','Pipeline management','Team collaboration',
];

// ── STATE ─────────────────────────────────────────────────────────────────
let attState = [];
let currentBatch = null;
let fbStarVal = 0;
let roles = ['Admin (You)','Participant','Manager'];
let roleColors = ['#3b82f6','#10b981','#f59e0b'];
let roleAvatars = ['PK','You','Mgr'];
let roleNames = ['Priya K.','Participant','Manager'];
let roleTitles = ['L&D Admin','Employee','Team Manager'];
let roleIndex = 0;

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBatchGrid();
  renderAssessTable();
  renderMaterials();
  renderFeedback();
  renderReports();
  renderAssignTracker();
  renderAssessQs('assess-qs-main');
  loadAtt();
  setRoleUI();
});

// ── NAVIGATION ────────────────────────────────────────────────────────────
function go(id, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (el) el.classList.add('active');
}

// ── ROLE SWITCHER ─────────────────────────────────────────────────────────
function switchRole() {
  roleIndex = (roleIndex + 1) % roles.length;
  setRoleUI();
  toast('Viewing as: ' + roles[roleIndex]);
}
function setRoleUI() {
  document.getElementById('rdot').style.background = roleColors[roleIndex];
  document.getElementById('rlabel').textContent = roles[roleIndex];
  document.getElementById('uav').textContent = roleAvatars[roleIndex];
  document.getElementById('uname').textContent = roleNames[roleIndex];
  document.getElementById('urole').textContent = roleTitles[roleIndex];
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// ── BATCH GRID ────────────────────────────────────────────────────────────
function renderBatchGrid() {
  const grid = document.getElementById('batch-grid');
  const statusBadge = s => s === 'Completing' ? 'bg' : s === 'In Progress' ? 'bp' : 'bb';
  grid.innerHTML = BATCHES.map(b => `
    <div class="folder" onclick="openBatch('${b.id}')">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="folder-icon">${b.icon}</div>
        <span class="b ${statusBadge(b.status)}">${b.status}</span>
      </div>
      <div class="folder-name">${b.name}</div>
      <div class="folder-meta">${b.dept} · ${b.program} · ${b.participants} participants</div>
      <div class="pb"><div class="pf" style="width:${b.progress}%;background:${b.color}"></div></div>
      <div class="folder-actions">
        <span class="b bb">${b.materials} materials</span>
        <span class="b ba">${b.assignments} assignments</span>
        <span class="b bg">Attend: ${b.attendance}%</span>
      </div>
    </div>
  `).join('') + `
    <div class="folder folder-add" onclick="toggleCreateBatch()">
      <div class="folder-add-icon">+</div>
      <div class="folder-add-txt">Create new batch</div>
    </div>`;
}

function toggleCreateBatch() {
  const f = document.getElementById('batch-create-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function saveBatch() {
  const name = document.getElementById('bn').value.trim() || 'New Batch';
  const dept = document.getElementById('bdept').value;
  const prog = document.getElementById('bprog').value.trim() || 'Program';
  BATCHES.push({ id: String.fromCharCode(65 + BATCHES.length), name, dept, program: prog, participants: 0, progress: 0, status: 'New', color: '#3b82f6', icon: '🗂️', materials: 0, assignments: 0, attendance: 0, feedback: '0/0' });
  PARTICIPANTS[String.fromCharCode(65 + BATCHES.length - 1)] = [];
  renderBatchGrid();
  document.getElementById('batch-count').textContent = BATCHES.length;
  toggleCreateBatch();
  toast('Batch created: ' + name);
}

// ── BATCH DETAIL ──────────────────────────────────────────────────────────
function openBatch(id) {
  currentBatch = BATCHES.find(b => b.id === id);
  const ps = PARTICIPANTS[id] || [];
  document.getElementById('batch-grid').style.display = 'none';
  const det = document.getElementById('batch-detail');
  det.style.display = 'block';
  det.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
      <button class="btn btn-o btn-sm" onclick="closeBatch()">← Back to Batches</button>
      <div>
        <div class="pt" style="font-size:18px">${currentBatch.name}</div>
        <div class="ps">${currentBatch.dept} · ${currentBatch.program}</div>
      </div>
    </div>
    <div class="tabs">
      <div class="tab active" onclick="bTab('overview',this)">Overview</div>
      <div class="tab" onclick="bTab('materials',this)">Materials</div>
      <div class="tab" onclick="bTab('assignments',this)">Assignments</div>
      <div class="tab" onclick="bTab('assessment',this)">Self Assessment</div>
      <div class="tab" onclick="bTab('attendance',this)">Attendance</div>
    </div>
    <div id="bt-overview" class="inner-tab-content active">
      <div class="g2">
        <div class="card">
          <div class="ct">Participants (${ps.length})</div>
          <table class="tbl"><thead><tr><th>Name</th><th>Dept</th><th>Progress</th><th>Status</th></tr></thead>
          <tbody>${ps.map((p,i) => {
            const pct = 40 + Math.floor(Math.random()*50);
            return `<tr><td style="font-weight:500">${p.n}</td><td><span class="b bb">${p.dept}</span></td>
            <td><div style="display:flex;align-items:center;gap:8px"><div class="pb" style="width:70px"><div class="pf" style="width:${pct}%;background:${currentBatch.color}"></div></div><span style="font-size:12px">${pct}%</span></div></td>
            <td><span class="pill ${pct>60?'bg':'ba'}">${pct>60?'On track':'Needs push'}</span></td></tr>`;
          }).join('')}</tbody></table>
        </div>
        <div class="card">
          <div class="ct">Batch Summary</div>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
            ${[['Materials shared', currentBatch.materials],['Assignments given', currentBatch.assignments],['Avg attendance', currentBatch.attendance+'%'],['Feedback submitted', currentBatch.feedback]].map(([k,v]) => `
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border)">
              <span style="color:var(--muted)">${k}</span><span style="font-weight:500">${v}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div id="bt-materials" class="inner-tab-content">
      <div class="card">
        <div class="section-row">
          <div class="ct" style="margin:0">Shared Materials</div>
          <label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload <input type="file" multiple style="display:none" onchange="batchUploadMat(this)"/></label>
        </div>
        <div id="bt-mat-list">
          ${MATERIALS_DATA.filter(m => m.batch.includes(id) || m.batch === 'All Batches').map(m => `
          <div class="fi-row">
            <span class="fi-icon">${m.icon}</span>
            <span class="fi-name">${m.name}</span>
            <span class="fi-size">${m.size}</span>
            <span class="b bb">${m.type}</span>
            <span class="fi-dl">⬇ Download</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div id="bt-assignments" class="inner-tab-content">
      <div class="card" style="margin-bottom:16px">
        <div class="section-row">
          <div class="ct" style="margin:0">Assignment Sheets</div>
          <label class="btn btn-p btn-sm" style="cursor:pointer">+ Upload Sheet <input type="file" style="display:none" onchange="toast('Assignment uploaded and shared with batch!')"/></label>
        </div>
        <table class="tbl"><thead><tr><th>Assignment</th><th>Due</th><th>Submitted</th><th>Status</th><th></th></tr></thead>
        <tbody>${ASSIGN_DATA.slice(0,2).map(a => `<tr>
          <td><div style="font-weight:500">${a.title}</div></td>
          <td>${a.due}</td><td>${a.submitted}/${a.total}</td>
          <td><span class="pill ${a.status==='Closed'?'bg':'ba'}">${a.status}</span></td>
          <td><button class="btn btn-o btn-xs" onclick="toast('Opening submissions...')">View</button></td>
        </tr>`).join('')}</tbody></table>
      </div>
      <div class="card">
        <div class="ct">Submit Assignment <span class="b bg">Participant</span></div>
        <div class="fg"><label class="fl">Select Assignment</label>
          <select class="fsel"><option>Assignment 2 — Objection Handling (Due Apr 5)</option></select>
        </div>
        <div class="uz" onclick="this.querySelector('input').click()">
          <div class="uz-icon">📤</div><div class="uz-txt">Upload completed assignment</div>
          <div class="uz-hint">PDF, Word, Excel — Max 10MB</div>
          <input type="file" style="display:none" onchange="toast('Assignment submitted successfully!')"/>
        </div>
      </div>
    </div>
    <div id="bt-assessment" class="inner-tab-content">
      <div class="card">
        <div class="ct">Self Assessment <span class="b bg">Participant</span></div>
        <div class="fg"><label class="fl">Your Name</label><input class="fi" placeholder="Enter your name"/></div>
        <div id="bt-assess-qs"></div>
        <div class="fg" style="margin-top:12px"><label class="fl">Key Learnings</label><textarea class="fta" placeholder="What did you take away?"></textarea></div>
        <div class="fg"><label class="fl">Areas to Improve</label><textarea class="fta" placeholder="What do you want to work on?"></textarea></div>
        <button class="btn btn-p" onclick="toast('Self assessment submitted!')">Submit Assessment</button>
      </div>
    </div>
    <div id="bt-attendance" class="inner-tab-content">
      <div class="card">
        <div class="section-row">
          <select class="fsel" style="width:200px"><option>Session 1 — Apr 1</option><option>Session 2 — Apr 8</option></select>
          <div style="display:flex;gap:8px">
            <button class="btn btn-o btn-sm" onclick="markAllBatch()">✓ Mark All Present</button>
            <button class="btn btn-g btn-sm" onclick="toast('Attendance saved!')">Save</button>
          </div>
        </div>
        <table class="tbl"><thead><tr><th>Participant</th><th>Status</th><th>Toggle</th></tr></thead>
        <tbody id="bt-att-body">${ps.map((p,i) => `<tr>
          <td style="font-weight:500">${p.n}</td>
          <td id="bta${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981">Present</span></td>
          <td><button class="btn btn-o btn-xs" onclick="toggleBatchAtt(${i})">Toggle</button></td>
        </tr>`).join('')}</tbody></table>
      </div>
    </div>`;
  renderAssessQs('bt-assess-qs');
}

function closeBatch() {
  document.getElementById('batch-grid').style.display = 'grid';
  document.getElementById('batch-detail').style.display = 'none';
  currentBatch = null;
}

function bTab(id, el) {
  document.querySelectorAll('.inner-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#batch-detail .tab').forEach(t => t.classList.remove('active'));
  const el2 = document.getElementById('bt-' + id);
  if (el2) el2.classList.add('active');
  if (el) el.classList.add('active');
}

function toggleBatchAtt(i) {
  const el = document.getElementById('bta' + i);
  const present = el.innerHTML.includes('10b981');
  el.innerHTML = present
    ? `<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444">Absent</span>`
    : `<span class="adot" style="background:#10b981"></span><span style="color:#10b981">Present</span>`;
}

function markAllBatch() {
  document.querySelectorAll('[id^=bta]').forEach(el => {
    el.innerHTML = `<span class="adot" style="background:#10b981"></span><span style="color:#10b981">Present</span>`;
  });
}

function batchUploadMat(inp) {
  Array.from(inp.files).forEach(f => {
    const div = document.createElement('div');
    div.className = 'fi-row';
    div.innerHTML = `<span class="fi-icon">📄</span><span class="fi-name">${f.name}</span><span class="fi-size">${(f.size/1024).toFixed(0)} KB</span><span class="b bb">New</span><span class="fi-dl">⬇ Download</span>`;
    document.getElementById('bt-mat-list').appendChild(div);
  });
  toast(inp.files.length + ' file(s) uploaded to batch!');
}

// ── ASSESSMENTS ───────────────────────────────────────────────────────────
function renderAssessTable(filter) {
  const data = filter ? ASSESS_DATA.filter(a => a.dept.toLowerCase().includes(filter.toLowerCase())) : ASSESS_DATA;
  const relBadge = s => s === 'Closed' ? 'bg' : 'ba';
  document.getElementById('assess-body').innerHTML = data.map(a => {
    const pct = Math.round(parseInt(a.resp) / a.total * 100);
    return `<tr>
      <td><div style="font-weight:500">${a.title}</div></td>
      <td>${a.batch}</td>
      <td><span class="b bb">${a.dept}</span></td>
      <td>${a.qs} Qs</td>
      <td>
        <div style="font-size:12px;margin-bottom:4px">${a.resp}</div>
        <div class="pb" style="width:80px"><div class="pf" style="width:${pct}%;background:var(--blue)"></div></div>
      </td>
      <td><span class="pill ${relBadge(a.status)}">${a.status}</span></td>
      <td><div style="display:flex;gap:6px">
        <button class="btn btn-o btn-xs" onclick="toast('Link copied! Share with participants.')">Share</button>
        <button class="btn btn-o btn-xs" onclick="toast('Opening results...')">Results</button>
        ${a.status === 'Closed' ? `<button class="btn btn-o btn-xs" onclick="toast('Downloading report...')">Download</button>` : ''}
      </div></td>
    </tr>`;
  }).join('');
}

function filterAssess(dept, el) {
  document.querySelectorAll('#assess-tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderAssessTable(dept);
}

function renderAssessQs(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div style="font-size:11px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px">Rate yourself 1 (Low) → 5 (High)</div>` +
    ASSESS_QUESTIONS.map((q, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);gap:8px">
      <span style="font-size:13px;flex:1">${q}</span>
      <div style="display:flex;gap:8px">${[1,2,3,4,5].map(v =>
        `<label style="display:flex;align-items:center;gap:3px;font-size:12px;cursor:pointer"><input type="radio" name="aq${containerId}${i}" value="${v}">${v}</label>`
      ).join('')}</div>
    </div>`).join('');
}

function submitAssessMain() {
  document.getElementById('assess-main-msg').style.display = 'block';
  setTimeout(() => document.getElementById('assess-main-msg').style.display = 'none', 3000);
}

// ── ASSIGNMENTS ───────────────────────────────────────────────────────────
function renderAssignTracker() {
  document.getElementById('assign-tracker').innerHTML = ASSIGN_DATA.map(a => {
    const pct = Math.round(a.submitted / a.total * 100);
    return `<div class="assign-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div>
          <div class="assign-title">${a.title}</div>
          <div class="assign-meta">${a.batch} · Due ${a.due}</div>
        </div>
        <span class="pill ${a.status === 'Closed' ? 'bg' : 'ba'}">${a.status}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:8px">
        <div style="flex:1"><div class="pb"><div class="pf" style="width:${pct}%;background:${a.status==='Closed'?'#10b981':'#f59e0b'}"></div></div></div>
        <span style="color:var(--muted)">${a.submitted}/${a.total} submitted</span>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-o btn-xs" onclick="toast('Opening submissions...')">View Submissions</button>
        <button class="btn btn-o btn-xs" onclick="toast('Downloading assignment sheet...')">⬇ Sheet</button>
        ${a.status === 'Closed' ? `<button class="btn btn-o btn-xs" onclick="toast('Downloading all...')">Download All</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function uploadAssignment(inp) {
  if (inp.files.length) toast('Assignment sheet uploaded and shared with batch!');
}

function handleSubFile(inp) {
  if (inp.files.length) {
    const el = document.getElementById('sub-file-name');
    el.style.display = 'block';
    el.textContent = '📎 ' + inp.files[0].name + ' ready to submit';
  }
}

function submitParticipantAssign() {
  const msg = document.getElementById('assign-sub-msg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
  // TODO: POST to Apps Script
  // saveToSheet('assignments', { name: document.getElementById('sub-name').value, file: '...' });
}

// ── MATERIALS ─────────────────────────────────────────────────────────────
function renderMaterials() {
  const typeBadge = t => ({ Guide:'bg', Slides:'bb', Handout:'bp', Template:'ba', Video:'bc' }[t] || 'bb');
  const grid = document.getElementById('materials-grid');
  grid.innerHTML = MATERIALS_DATA.map(m => `
    <div class="folder">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="folder-icon">${m.icon}</div>
        <span class="b ${typeBadge(m.type)}">${m.type}</span>
      </div>
      <div class="folder-name">${m.name}</div>
      <div class="folder-meta">${m.batch} · ${m.size} · ${m.date}</div>
      <div class="folder-actions">
        <button class="btn btn-o btn-xs" onclick="toast('Downloading ${m.name}...')">⬇ Download</button>
        <button class="btn btn-o btn-xs" onclick="toast('Share link copied!')">Share</button>
      </div>
    </div>`).join('') + `
    <div class="folder folder-add" onclick="document.getElementById('mat-add-inp').click()">
      <div class="folder-add-icon">+</div>
      <div class="folder-add-txt">Upload new material</div>
      <input type="file" id="mat-add-inp" multiple style="display:none" onchange="addMaterialMain(this)"/>
    </div>`;
}

function addMaterialMain(inp) {
  const grid = document.getElementById('materials-grid');
  const addBtn = grid.lastElementChild;
  Array.from(inp.files).forEach(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    const icon = {pdf:'📄',pptx:'📊',docx:'📝',xlsx:'📊',mp4:'🎬'}[ext] || '📋';
    const div = document.createElement('div');
    div.className = 'folder';
    div.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between"><div class="folder-icon">${icon}</div><span class="b bb">New</span></div>
      <div class="folder-name">${f.name}</div>
      <div class="folder-meta">All Batches · ${(f.size/1024).toFixed(0)} KB · Just now</div>
      <div class="folder-actions">
        <button class="btn btn-o btn-xs" onclick="toast('Downloading...')">⬇ Download</button>
        <button class="btn btn-o btn-xs" onclick="toast('Link copied!')">Share</button>
      </div>`;
    grid.insertBefore(div, addBtn);
  });
  toast(inp.files.length + ' material(s) uploaded!');
}

// ── ATTENDANCE ────────────────────────────────────────────────────────────
function loadAtt() {
  const bname = document.getElementById('att-batch-sel').value;
  const batch = BATCHES.find(b => b.name === bname) || BATCHES[0];
  const ps = PARTICIPANTS[batch.id] || [];
  attState = ps.map(() => true);
  updateAttStats(ps.length);
  document.getElementById('att-body').innerHTML = ps.map((p, i) => `
    <tr>
      <td style="font-weight:500">${p.n}</td>
      <td><span class="b bb">${p.dept}</span></td>
      <td><span class="adot" style="background:#10b981"></span>P &nbsp;<span class="adot" style="background:#10b981"></span>P</td>
      <td id="as${i}"><span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span></td>
      <td><button class="btn btn-o btn-xs" onclick="toggleAtt(${i},${ps.length})">Toggle</button></td>
    </tr>`).join('');
}

function toggleAtt(i, total) {
  attState[i] = !attState[i];
  const el = document.getElementById('as' + i);
  el.innerHTML = attState[i]
    ? `<span class="adot" style="background:#10b981"></span><span style="color:#10b981;font-size:13px">Present</span>`
    : `<span class="adot" style="background:#ef4444"></span><span style="color:#ef4444;font-size:13px">Absent</span>`;
  updateAttStats(total);
}

function updateAttStats(total) {
  const pres = attState.filter(Boolean).length;
  document.getElementById('att-total').textContent = total;
  document.getElementById('att-pres').textContent = pres;
  document.getElementById('att-abs').textContent = total - pres;
  document.getElementById('att-pct').textContent = total ? Math.round(pres / total * 100) + '%' : '0%';
}

function markAllPresent() {
  attState = attState.map(() => true);
  loadAtt();
}

function saveAttendance() {
  toast('Attendance saved! (' + attState.filter(Boolean).length + '/' + attState.length + ' present)');
  // TODO: saveToSheet('attendance', { batch: ..., session: ..., data: attState });
}

// ── FEEDBACK ──────────────────────────────────────────────────────────────
function renderFeedback() {
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const relBadge = r => ({ Excellent:'bg', Good:'bb', Average:'ba', Poor:'bc' }[r] || 'bb');
  document.getElementById('fb-body').innerHTML = FEEDBACK_RESPONSES.map(r => `
    <tr>
      <td><div style="display:flex;align-items:center;gap:8px">
        <div class="av" style="background:${r.color};color:${r.txtcolor};width:26px;height:26px;font-size:10px">${r.av}</div>
        ${r.name}
      </div></td>
      <td>${r.batch}</td>
      <td><span style="color:#f59e0b">${stars(r.rating)}</span></td>
      <td><span class="b ${relBadge(r.rel)}">${r.rel}</span></td>
    </tr>`).join('');
}

function setStars(n) {
  fbStarVal = n;
  document.querySelectorAll('#fb-stars .star').forEach((s, i) => s.classList.toggle('lit', i < n));
}

function submitFeedback() {
  const msg = document.getElementById('fb-msg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
  // TODO: saveToSheet('feedback', { rating: fbStarVal, ... });
}

function copyFeedbackLink() {
  navigator.clipboard?.writeText(window.location.href + '#feedback').catch(() => {});
  toast('Feedback form link copied to clipboard!');
}

// ── REPORTS ───────────────────────────────────────────────────────────────
function renderReports() {
  const statusBadge = s => ({ Completed:'bg', 'In Progress':'ba', Master:'bb' }[s] || 'bb');
  const tagBadge = (t, i) => ['bb','bg','bt','bp','bo','bpk'][i % 6];
  document.getElementById('reports-grid').innerHTML = REPORT_FOLDERS.map(r => `
    <div class="folder" onclick="toast('Opening ${r.name}...')">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="folder-icon">📁</div>
        <span class="b ${statusBadge(r.status)}">${r.status}</span>
      </div>
      <div class="folder-name">${r.name}</div>
      <div class="folder-meta">${r.count} reports · Updated ${r.updated}</div>
      <div class="folder-actions">${r.tags.map((t,i) => `<span class="b ${tagBadge(t,i)}">${t}</span>`).join('')}</div>
    </div>`).join('') + `
    <div class="folder folder-add" onclick="toast('Report generated and saved!')">
      <div class="folder-add-icon">+</div>
      <div class="folder-add-txt">Generate new report</div>
    </div>`;
}

// ── APPS SCRIPT INTEGRATION (ready to activate) ───────────────────────────
async function saveToSheet(sheetName, data) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_')) {
    console.log('Apps Script not connected yet. Data:', sheetName, data);
    return;
  }
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet: sheetName, ...data }),
    });
  } catch (e) {
    console.error('Sheet save error:', e);
  }
}

async function fetchFromSheet(sheetName) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_')) return null;
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?sheet=${sheetName}`);
    return await res.json();
  } catch (e) {
    console.error('Sheet fetch error:', e);
    return null;
  }
}
